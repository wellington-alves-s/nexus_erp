import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import {
  Prisma,
  StatusConferencia,
  TipoMovimentacaoEstoque,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bloquearPedido } from './bloqueio.js';
import { somar, statusDoPedido } from './quantidades.js';

const INCLUIR = {
  pedido: { select: { id: true, numero: true, status: true } },
  conferencia: { select: { id: true, numero: true } },
  itens: {
    include: { produto: { select: { id: true, codigo: true, nome: true, unidade: true } } },
    orderBy: { produto: { codigo: 'asc' } },
  },
  movimentacoes: true,
} satisfies Prisma.EntradaMercadoriaInclude;

type EntradaCompleta = Prisma.EntradaMercadoriaGetPayload<{ include: typeof INCLUIR }>;

function paraResposta(entrada: EntradaCompleta) {
  return {
    ...entrada,
    itens: entrada.itens.map((item) => ({ ...item, quantidade: item.quantidade.toFixed(3) })),
    movimentacoes: entrada.movimentacoes.map((movimentacao) => ({
      ...movimentacao,
      quantidade: movimentacao.quantidade.toFixed(3),
    })),
  };
}

export type EntradaResposta = ReturnType<typeof paraResposta>;

function violaUnicidade(erro: unknown): boolean {
  return erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002';
}

@Injectable()
export class EntradasService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<EntradaResposta> {
    const entrada = await this.prisma.entradaMercadoria.findFirst({
      where: { id, empresaId: EMPRESA_PADRAO_ID },
      include: INCLUIR,
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de mercadoria não encontrada');
    }
    return paraResposta(entrada);
  }

  /**
   * Única operação que altera o estoque. Tudo ocorre em uma transação: a entrada
   * (única por conferência), as movimentações, os saldos e o status do pedido.
   */
  async efetivar(conferenciaId: string): Promise<EntradaResposta> {
    const conferenciaInicial = await this.prisma.conferenciaRecebimento.findFirst({
      where: { id: conferenciaId, empresaId: EMPRESA_PADRAO_ID },
      select: { pedidoId: true },
    });
    if (!conferenciaInicial) {
      throw new NotFoundException('Conferência não encontrada');
    }
    const { pedidoId } = conferenciaInicial;

    try {
      const entradaId = await this.prisma.$transaction(async (tx) => {
        await bloquearPedido(tx, pedidoId);
        const conferencia = await tx.conferenciaRecebimento.findUniqueOrThrow({
          where: { id: conferenciaId },
          include: {
            itens: { include: { itemPedido: { select: { produtoId: true } } } },
            entrada: { select: { id: true } },
            pedido: { select: { depositoId: true } },
          },
        });
        if (conferencia.status !== StatusConferencia.ENCERRADA) {
          throw new ConflictException('Encerre a conferência antes de efetivar a entrada');
        }
        if (conferencia.entrada) {
          throw new ConflictException('A entrada desta conferência já foi efetivada');
        }

        const { depositoId } = conferencia.pedido;
        const entrada = await tx.entradaMercadoria.create({
          data: {
            empresaId: EMPRESA_PADRAO_ID,
            pedidoId,
            conferenciaId,
            itens: {
              create: conferencia.itens.map((item) => ({
                itemPedidoId: item.itemPedidoId,
                produtoId: item.itemPedido.produtoId,
                quantidade: item.quantidadeConferida,
              })),
            },
          },
          include: { itens: true },
        });

        for (const item of entrada.itens) {
          // Incremento atômico no banco: duas primeiras entradas concorrentes do
          // mesmo produto e depósito não disputam a criação do saldo.
          await tx.$executeRaw`
            INSERT INTO saldos_estoque (id, "empresaId", "produtoId", "depositoId", quantidade, "updatedAt")
            VALUES (gen_random_uuid(), ${EMPRESA_PADRAO_ID}::uuid, ${item.produtoId}::uuid,
                    ${depositoId}::uuid, ${item.quantidade.toString()}::numeric, now())
            ON CONFLICT ("produtoId", "depositoId")
            DO UPDATE SET quantidade = saldos_estoque.quantidade + EXCLUDED.quantidade,
                          "updatedAt" = now()`;
          await tx.movimentacaoEstoque.create({
            data: {
              empresaId: EMPRESA_PADRAO_ID,
              produtoId: item.produtoId,
              depositoId,
              tipo: TipoMovimentacaoEstoque.ENTRADA_MERCADORIA,
              quantidade: item.quantidade,
              entradaId: entrada.id,
              itemEntradaId: item.id,
            },
          });
        }

        const itensPedido = await tx.itemPedidoCompra.findMany({
          where: { pedidoId },
          include: { itensEntrada: { select: { quantidade: true } } },
        });
        await tx.pedidoCompra.update({
          where: { id: pedidoId },
          data: {
            status: statusDoPedido(
              itensPedido.map((item) => ({
                pedida: item.quantidade,
                recebida: somar(item.itensEntrada.map((registro) => registro.quantidade)),
              })),
            ),
          },
        });
        return entrada.id;
      });
      return await this.buscarPorId(entradaId);
    } catch (erro) {
      if (violaUnicidade(erro)) {
        throw new ConflictException('A entrada desta conferência já foi efetivada');
      }
      throw erro;
    }
  }
}

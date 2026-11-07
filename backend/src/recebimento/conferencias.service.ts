import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { Prisma, StatusConferencia, StatusPedidoCompra } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bloquearPedido } from './bloqueio.js';
import { calcularPendente, somar } from './quantidades.js';
import { SalvarItensConferenciaDto } from './recebimento.dto.js';

const INCLUIR = {
  pedido: {
    include: {
      itens: {
        include: {
          produto: { select: { id: true, codigo: true, nome: true, unidade: true } },
          itensEntrada: { select: { quantidade: true } },
        },
        orderBy: { produto: { codigo: 'asc' } },
      },
    },
  },
  itens: true,
  entrada: { select: { id: true, numero: true, createdAt: true } },
} satisfies Prisma.ConferenciaRecebimentoInclude;

type ConferenciaCompleta = Prisma.ConferenciaRecebimentoGetPayload<{ include: typeof INCLUIR }>;

// Quantidades saem como texto para não perder precisão no JSON.
function paraResposta(conferencia: ConferenciaCompleta) {
  const { pedido, itens, ...cabecalho } = conferencia;
  return {
    ...cabecalho,
    pedido: { id: pedido.id, numero: pedido.numero, status: pedido.status },
    itensPedido: pedido.itens.map((item) => {
      const recebida = somar(item.itensEntrada.map((entrada) => entrada.quantidade));
      return {
        id: item.id,
        produto: item.produto,
        quantidade: item.quantidade.toFixed(3),
        recebida: recebida.toFixed(3),
        pendente: calcularPendente(item.quantidade, recebida).toFixed(3),
      };
    }),
    itens: itens.map((item) => ({
      itemPedidoId: item.itemPedidoId,
      quantidadeConferida: item.quantidadeConferida.toFixed(3),
      justificativaExcesso: item.justificativaExcesso,
    })),
  };
}

export type ConferenciaResposta = ReturnType<typeof paraResposta>;

@Injectable()
export class ConferenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<ConferenciaResposta> {
    const conferencia = await this.prisma.conferenciaRecebimento.findFirst({
      where: { id, empresaId: EMPRESA_PADRAO_ID },
      include: INCLUIR,
    });
    if (!conferencia) {
      throw new NotFoundException('Conferência não encontrada');
    }
    return paraResposta(conferencia);
  }

  async abrir(pedidoId: string): Promise<ConferenciaResposta> {
    const id = await this.prisma.$transaction(async (tx) => {
      await bloquearPedido(tx, pedidoId);
      const pedido = await tx.pedidoCompra.findFirst({
        where: { id: pedidoId, empresaId: EMPRESA_PADRAO_ID },
      });
      if (!pedido) {
        throw new NotFoundException('Pedido de compra não encontrado');
      }
      if (pedido.status === StatusPedidoCompra.RECEBIDO) {
        throw new BadRequestException('O pedido já foi recebido integralmente');
      }
      const pendente = await tx.conferenciaRecebimento.findFirst({
        where: { pedidoId, entrada: null },
      });
      if (pendente) {
        throw new ConflictException(
          `Já existe a conferência ${pendente.numero} ainda não efetivada para este pedido`,
        );
      }
      const conferencia = await tx.conferenciaRecebimento.create({
        data: { empresaId: EMPRESA_PADRAO_ID, pedidoId },
      });
      return conferencia.id;
    });
    return this.buscarPorId(id);
  }

  async salvarItens(id: string, dto: SalvarItensConferenciaDto): Promise<ConferenciaResposta> {
    const { pedido } = await this.buscarPorId(id);
    const pedidoId = pedido.id;
    await this.prisma.$transaction(async (tx) => {
      await bloquearPedido(tx, pedidoId);
      const conferencia = await tx.conferenciaRecebimento.findUniqueOrThrow({ where: { id } });
      if (conferencia.status !== StatusConferencia.EM_CONFERENCIA) {
        throw new ConflictException('Conferência encerrada não pode ser alterada');
      }

      const idsInformados = dto.itens.map((item) => item.itemPedidoId);
      if (new Set(idsInformados).size !== idsInformados.length) {
        throw new BadRequestException('O mesmo item do pedido não pode ser conferido duas vezes');
      }
      const itensDoPedido = await tx.itemPedidoCompra.findMany({
        where: { pedidoId, id: { in: idsInformados } },
        select: { id: true },
      });
      if (itensDoPedido.length !== idsInformados.length) {
        throw new BadRequestException('Há itens que não pertencem ao pedido');
      }

      await tx.itemConferencia.deleteMany({ where: { conferenciaId: id } });
      await tx.itemConferencia.createMany({
        data: dto.itens.map((item) => ({ ...item, conferenciaId: id })),
      });
    });
    return this.buscarPorId(id);
  }

  async encerrar(id: string): Promise<ConferenciaResposta> {
    const { pedido } = await this.buscarPorId(id);
    const pedidoId = pedido.id;
    await this.prisma.$transaction(async (tx) => {
      await bloquearPedido(tx, pedidoId);
      const conferencia = await tx.conferenciaRecebimento.findUniqueOrThrow({
        where: { id },
        include: { itens: true },
      });
      if (conferencia.status !== StatusConferencia.EM_CONFERENCIA) {
        throw new ConflictException('Conferência já encerrada');
      }
      if (conferencia.itens.length === 0) {
        throw new BadRequestException('Informe a quantidade conferida de ao menos um item');
      }

      const itensDoPedido = await tx.itemPedidoCompra.findMany({
        where: { pedidoId },
        include: {
          produto: { select: { codigo: true, nome: true } },
          itensEntrada: { select: { quantidade: true } },
        },
      });
      const porId = new Map(itensDoPedido.map((item) => [item.id, item]));
      const erros: string[] = [];
      for (const conferido of conferencia.itens) {
        const itemPedido = porId.get(conferido.itemPedidoId);
        if (!itemPedido) continue;
        const recebida = somar(itemPedido.itensEntrada.map((entrada) => entrada.quantidade));
        const excedente = conferido.quantidadeConferida.gt(calcularPendente(itemPedido.quantidade, recebida));
        if (excedente && !conferido.justificativaExcesso) {
          erros.push(
            `Produto ${itemPedido.produto.codigo} (${itemPedido.produto.nome}): informe a justificativa do excedente`,
          );
        }
      }
      if (erros.length > 0) {
        throw new BadRequestException(erros);
      }

      const { count } = await tx.conferenciaRecebimento.updateMany({
        where: { id, status: StatusConferencia.EM_CONFERENCIA },
        data: { status: StatusConferencia.ENCERRADA, encerradaEm: new Date() },
      });
      if (count !== 1) {
        throw new ConflictException('Conferência já encerrada');
      }
    });
    return this.buscarPorId(id);
  }
}

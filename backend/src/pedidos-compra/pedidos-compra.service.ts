import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { Pagina, PaginacaoQueryDto, paraSkipTake } from '../common/paginacao.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calcularPendente, somar } from '../recebimento/quantidades.js';
import { CriarPedidoCompraDto } from './pedidos-compra.dto.js';

const INCLUIR = {
  fornecedor: { select: { id: true, razaoSocial: true, cnpj: true } },
  deposito: { select: { id: true, nome: true } },
  itens: {
    include: {
      produto: { select: { id: true, codigo: true, nome: true, unidade: true } },
      itensEntrada: { select: { quantidade: true } },
    },
    orderBy: { produto: { codigo: 'asc' } },
  },
  conferencias: {
    select: {
      id: true,
      numero: true,
      status: true,
      createdAt: true,
      entrada: { select: { id: true, numero: true } },
    },
    orderBy: { numero: 'asc' },
  },
} satisfies Prisma.PedidoCompraInclude;

type PedidoCompleto = Prisma.PedidoCompraGetPayload<{ include: typeof INCLUIR }>;

// Valores monetários e quantidades saem como texto para não perder precisão no JSON.
// O subtotal de cada item é arredondado a 2 casas e o total é a soma dos subtotais.
export function paraResposta(pedido: PedidoCompleto) {
  const subtotais = pedido.itens.map((item) =>
    item.quantidade.mul(item.precoUnitario).toDecimalPlaces(2),
  );
  const total = subtotais.reduce((soma, subtotal) => soma.plus(subtotal), new Prisma.Decimal(0));
  return {
    ...pedido,
    itens: pedido.itens.map(({ itensEntrada, ...item }, indice) => {
      const recebida = somar(itensEntrada.map((entrada) => entrada.quantidade));
      return {
        ...item,
        quantidade: item.quantidade.toFixed(3),
        precoUnitario: item.precoUnitario.toFixed(2),
        subtotal: subtotais[indice].toFixed(2),
        recebida: recebida.toFixed(3),
        pendente: calcularPendente(item.quantidade, recebida).toFixed(3),
      };
    }),
    total: total.toFixed(2),
  };
}

export type PedidoCompraResposta = ReturnType<typeof paraResposta>;

@Injectable()
export class PedidosCompraService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: PaginacaoQueryDto): Promise<Pagina<PedidoCompraResposta>> {
    const where = { empresaId: EMPRESA_PADRAO_ID };
    const [pedidos, total] = await this.prisma.$transaction([
      this.prisma.pedidoCompra.findMany({
        where,
        include: INCLUIR,
        orderBy: { numero: 'desc' },
        ...paraSkipTake(query),
      }),
      this.prisma.pedidoCompra.count({ where }),
    ]);
    return { data: pedidos.map(paraResposta), total, page: query.page, pageSize: query.pageSize };
  }

  async buscarPorId(id: string): Promise<PedidoCompraResposta> {
    const pedido = await this.prisma.pedidoCompra.findFirst({
      where: { id, empresaId: EMPRESA_PADRAO_ID },
      include: INCLUIR,
    });
    if (!pedido) {
      throw new NotFoundException('Pedido de compra não encontrado');
    }
    return paraResposta(pedido);
  }

  async criar(dto: CriarPedidoCompraDto): Promise<PedidoCompraResposta> {
    await this.validarReferencias(dto);
    const pedido = await this.prisma.pedidoCompra.create({
      data: {
        empresaId: EMPRESA_PADRAO_ID,
        fornecedorId: dto.fornecedorId,
        depositoId: dto.depositoId,
        itens: { create: dto.itens },
      },
      include: INCLUIR,
    });
    return paraResposta(pedido);
  }

  private async validarReferencias(dto: CriarPedidoCompraDto): Promise<void> {
    const erros: string[] = [];
    const idsProdutos = dto.itens.map((item) => item.produtoId);
    const idsUnicos = [...new Set(idsProdutos)];
    if (idsUnicos.length !== idsProdutos.length) {
      erros.push('O mesmo produto não pode aparecer mais de uma vez no pedido');
    }

    const empresaId = EMPRESA_PADRAO_ID;
    const [fornecedor, deposito, produtos] = await Promise.all([
      this.prisma.fornecedor.findFirst({ where: { id: dto.fornecedorId, empresaId } }),
      this.prisma.deposito.findFirst({ where: { id: dto.depositoId, empresaId } }),
      this.prisma.produto.findMany({ where: { id: { in: idsUnicos }, empresaId } }),
    ]);

    if (!fornecedor) erros.push('Fornecedor não encontrado');
    else if (!fornecedor.ativo) erros.push('Fornecedor inativo');

    if (!deposito) erros.push('Depósito não encontrado');
    else if (!deposito.ativo) erros.push('Depósito inativo');

    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    for (const id of idsUnicos) {
      const produto = produtosPorId.get(id);
      if (!produto) erros.push(`Produto ${id} não encontrado`);
      else if (!produto.ativo) erros.push(`Produto ${produto.codigo} (${produto.nome}) está inativo`);
    }

    if (erros.length > 0) {
      throw new BadRequestException(erros);
    }
  }
}

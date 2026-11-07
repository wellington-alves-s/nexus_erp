import { BadRequestException, ConflictException } from '@nestjs/common';
import { PedidosCompraService } from '../pedidos-compra/pedidos-compra.service.js';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstoqueService } from '../estoque/estoque.service.js';
import { ConferenciasService } from './conferencias.service.js';
import { EntradasService } from './entradas.service.js';

const prisma = new PrismaService();
const pedidos = new PedidosCompraService(prisma);
const conferencias = new ConferenciasService(prisma);
const entradas = new EntradasService(prisma);
const estoque = new EstoqueService(prisma);

let depositoId: string;
let fornecedorId: string;

beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('Os testes de integração exigem um banco cujo nome termine em _test');
  }
  await prisma.$connect();
  depositoId = (await prisma.deposito.findFirstOrThrow({ where: { empresaId: EMPRESA_PADRAO_ID } })).id;
});

afterAll(() => prisma.$disconnect());

beforeEach(async () => {
  // empresas e depositos permanecem: são criados pelas migrations.
  await prisma.$executeRawUnsafe(
    `TRUNCATE movimentacoes_estoque, saldos_estoque, itens_entrada, entradas_mercadoria,
              itens_conferencia, conferencias_recebimento, itens_pedido_compra, pedidos_compra,
              produtos, fornecedores RESTART IDENTITY CASCADE`,
  );
  fornecedorId = (
    await prisma.fornecedor.create({
      data: { empresaId: EMPRESA_PADRAO_ID, razaoSocial: 'ACME', cnpj: '11222333000181' },
    })
  ).id;
});

async function criarProduto(nome: string): Promise<string> {
  const produto = await prisma.produto.create({
    data: { empresaId: EMPRESA_PADRAO_ID, nome, unidade: 'UN' },
  });
  return produto.id;
}

async function criarPedido(itens: { produtoId: string; quantidade: number }[]) {
  const pedido = await pedidos.criar({
    fornecedorId,
    depositoId,
    itens: itens.map((item) => ({ ...item, precoUnitario: 1 })),
  });
  return pedido;
}

/** Abre a conferência, informa as quantidades (por produto) e a encerra. */
async function conferirEEncerrar(
  pedido: Awaited<ReturnType<typeof criarPedido>>,
  quantidades: Record<string, number>,
  justificativa?: string,
) {
  const conferencia = await conferencias.abrir(pedido.id);
  await conferencias.salvarItens(conferencia.id, {
    itens: pedido.itens
      .filter((item) => quantidades[item.produtoId] !== undefined)
      .map((item) => ({
        itemPedidoId: item.id,
        quantidadeConferida: quantidades[item.produtoId],
        justificativaExcesso: justificativa,
      })),
  });
  await conferencias.encerrar(conferencia.id);
  return conferencia.id;
}

async function saldoDe(produtoId: string): Promise<string> {
  const saldos = await prisma.saldoEstoque.findMany({ where: { produtoId, depositoId } });
  return saldos.length === 0 ? '0.000' : saldos[0].quantidade.toFixed(3);
}

/** O saldo deve ser sempre a soma das movimentações que o originaram. */
async function verificarSaldoIgualAMovimentacoes() {
  const saldos = await prisma.saldoEstoque.findMany();
  for (const saldo of saldos) {
    const { _sum } = await prisma.movimentacaoEstoque.aggregate({
      where: { produtoId: saldo.produtoId, depositoId: saldo.depositoId },
      _sum: { quantidade: true },
    });
    expect(saldo.quantidade.toFixed(3)).toBe(_sum.quantidade?.toFixed(3));
  }
}

async function statusDoPedido(id: string) {
  return (await prisma.pedidoCompra.findUniqueOrThrow({ where: { id } })).status;
}

describe('recebimento e estoque (banco real)', () => {
  it('conferir e encerrar não altera o estoque', async () => {
    const produto = await criarProduto('Parafuso');
    const pedido = await criarPedido([{ produtoId: produto, quantidade: 10 }]);
    await conferirEEncerrar(pedido, { [produto]: 4 });

    expect(await prisma.saldoEstoque.count()).toBe(0);
    expect(await prisma.movimentacaoEstoque.count()).toBe(0);
    expect(await statusDoPedido(pedido.id)).toBe('ABERTO');
  });

  it('recebe em duas etapas e o pedido passa por ABERTO, PARCIALMENTE_RECEBIDO e RECEBIDO', async () => {
    const produto = await criarProduto('Parafuso');
    const pedido = await criarPedido([{ produtoId: produto, quantidade: 10 }]);

    const primeira = await conferirEEncerrar(pedido, { [produto]: 4 });
    await entradas.efetivar(primeira);
    expect(await saldoDe(produto)).toBe('4.000');
    expect(await statusDoPedido(pedido.id)).toBe('PARCIALMENTE_RECEBIDO');

    const segunda = await conferirEEncerrar(pedido, { [produto]: 6 });
    const entrada = await entradas.efetivar(segunda);
    expect(await saldoDe(produto)).toBe('10.000');
    expect(await statusDoPedido(pedido.id)).toBe('RECEBIDO');
    expect(entrada.movimentacoes).toHaveLength(1);

    const detalhe = await pedidos.buscarPorId(pedido.id);
    expect(detalhe.itens[0]).toMatchObject({ recebida: '10.000', pendente: '0.000' });
    await verificarSaldoIgualAMovimentacoes();

    const lista = await estoque.listar({ page: 1, pageSize: 20 });
    expect(lista.data.map((s) => [s.produto.nome, s.quantidade])).toEqual([['Parafuso', '10.000']]);
  });

  it('efetivar a mesma conferência duas vezes em paralelo altera o estoque uma única vez', async () => {
    const produto = await criarProduto('Parafuso');
    const pedido = await criarPedido([{ produtoId: produto, quantidade: 10 }]);
    const conferenciaId = await conferirEEncerrar(pedido, { [produto]: 5 });

    const resultados = await Promise.allSettled([
      entradas.efetivar(conferenciaId),
      entradas.efetivar(conferenciaId),
    ]);

    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejeitado = resultados.find((r) => r.status === 'rejected');
    expect(rejeitado?.status === 'rejected' && rejeitado.reason).toBeInstanceOf(ConflictException);
    expect(await prisma.entradaMercadoria.count()).toBe(1);
    expect(await saldoDe(produto)).toBe('5.000');
    await verificarSaldoIgualAMovimentacoes();
  });

  it('primeiras entradas concorrentes do mesmo produto e depósito somam no saldo', async () => {
    const produto = await criarProduto('Parafuso');
    const pedidoA = await criarPedido([{ produtoId: produto, quantidade: 10 }]);
    const pedidoB = await criarPedido([{ produtoId: produto, quantidade: 10 }]);
    const confA = await conferirEEncerrar(pedidoA, { [produto]: 3 });
    const confB = await conferirEEncerrar(pedidoB, { [produto]: 7 });

    await Promise.all([entradas.efetivar(confA), entradas.efetivar(confB)]);

    expect(await saldoDe(produto)).toBe('10.000');
    expect(await prisma.saldoEstoque.count()).toBe(1);
    await verificarSaldoIgualAMovimentacoes();
  });

  it('exige justificativa para excedente ao encerrar e aceita o excedente justificado', async () => {
    const produto = await criarProduto('Parafuso');
    const pedido = await criarPedido([{ produtoId: produto, quantidade: 10 }]);

    const conferencia = await conferencias.abrir(pedido.id);
    await conferencias.salvarItens(conferencia.id, {
      itens: [{ itemPedidoId: pedido.itens[0].id, quantidadeConferida: 12 }],
    });
    await expect(conferencias.encerrar(conferencia.id)).rejects.toBeInstanceOf(BadRequestException);

    await conferencias.salvarItens(conferencia.id, {
      itens: [
        { itemPedidoId: pedido.itens[0].id, quantidadeConferida: 12, justificativaExcesso: 'Bonificação do fornecedor' },
      ],
    });
    await conferencias.encerrar(conferencia.id);
    await entradas.efetivar(conferencia.id);

    expect(await saldoDe(produto)).toBe('12.000');
    expect(await statusDoPedido(pedido.id)).toBe('RECEBIDO');
    const detalhe = await pedidos.buscarPorId(pedido.id);
    expect(detalhe.itens[0]).toMatchObject({ recebida: '12.000', pendente: '0.000' });
  });

  it('aplica as regras de estado da conferência e do pedido', async () => {
    const produto = await criarProduto('Parafuso');
    const pedido = await criarPedido([{ produtoId: produto, quantidade: 2 }]);

    const conferencia = await conferencias.abrir(pedido.id);
    await expect(conferencias.abrir(pedido.id)).rejects.toBeInstanceOf(ConflictException);
    await expect(entradas.efetivar(conferencia.id)).rejects.toBeInstanceOf(ConflictException);
    await expect(conferencias.encerrar(conferencia.id)).rejects.toBeInstanceOf(BadRequestException);

    await conferencias.salvarItens(conferencia.id, {
      itens: [{ itemPedidoId: pedido.itens[0].id, quantidadeConferida: 2 }],
    });
    await conferencias.encerrar(conferencia.id);
    await expect(
      conferencias.salvarItens(conferencia.id, { itens: [] }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(conferencias.abrir(pedido.id)).rejects.toBeInstanceOf(ConflictException);

    await entradas.efetivar(conferencia.id);
    await expect(conferencias.abrir(pedido.id)).rejects.toBeInstanceOf(BadRequestException);
  });
});

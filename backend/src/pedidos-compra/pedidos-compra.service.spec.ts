import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CriarPedidoCompraDto } from './pedidos-compra.dto.js';
import { PedidosCompraService, paraResposta } from './pedidos-compra.service.js';

const FORNECEDOR = '11111111-1111-4111-8111-111111111111';
const DEPOSITO = '22222222-2222-4222-8222-222222222222';
const PRODUTO_A = '33333333-3333-4333-8333-333333333333';
const PRODUTO_B = '44444444-4444-4444-8444-444444444444';

function criarServico(sobrescritas: { fornecedor?: unknown; deposito?: unknown; produtos?: unknown[] } = {}) {
  const prisma = {
    fornecedor: { findFirst: vi.fn().mockResolvedValue('fornecedor' in sobrescritas ? sobrescritas.fornecedor : { ativo: true }) },
    deposito: { findFirst: vi.fn().mockResolvedValue('deposito' in sobrescritas ? sobrescritas.deposito : { ativo: true }) },
    produto: {
      findMany: vi.fn().mockResolvedValue(
        sobrescritas.produtos ?? [
          { id: PRODUTO_A, codigo: 1, nome: 'Parafuso', ativo: true },
          { id: PRODUTO_B, codigo: 2, nome: 'Tinta', ativo: true },
        ],
      ),
    },
    pedidoCompra: { create: vi.fn().mockResolvedValue({ itens: [] }) },
  };
  return { servico: new PedidosCompraService(prisma as unknown as PrismaService), prisma };
}

function pedido(itens: { produtoId: string; quantidade?: number; precoUnitario?: number }[]) {
  return {
    fornecedorId: FORNECEDOR,
    depositoId: DEPOSITO,
    itens: itens.map((item) => ({ quantidade: 1, precoUnitario: 1, ...item })),
  };
}

async function mensagensDeErro(promessa: Promise<unknown>): Promise<string[]> {
  const erro = await promessa.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(erro).toBeInstanceOf(BadRequestException);
  return (erro as BadRequestException).getResponse()['message'];
}

describe('PedidosCompraService.criar', () => {
  it('cria o pedido com os itens quando as referências são válidas', async () => {
    const { servico, prisma } = criarServico();
    await servico.criar(pedido([{ produtoId: PRODUTO_A }, { produtoId: PRODUTO_B }]));
    const { data } = prisma.pedidoCompra.create.mock.calls[0][0];
    expect(data).toMatchObject({ fornecedorId: FORNECEDOR, depositoId: DEPOSITO });
    expect(data.itens.create).toHaveLength(2);
  });

  it('rejeita produto repetido', async () => {
    const { servico, prisma } = criarServico();
    const mensagens = await mensagensDeErro(
      servico.criar(pedido([{ produtoId: PRODUTO_A }, { produtoId: PRODUTO_A }])),
    );
    expect(mensagens).toContain('O mesmo produto não pode aparecer mais de uma vez no pedido');
    expect(prisma.pedidoCompra.create).not.toHaveBeenCalled();
  });

  it('rejeita fornecedor, depósito e produtos inativos', async () => {
    const { servico } = criarServico({
      fornecedor: { ativo: false },
      deposito: { ativo: false },
      produtos: [{ id: PRODUTO_A, codigo: 7, nome: 'Parafuso', ativo: false }],
    });
    const mensagens = await mensagensDeErro(servico.criar(pedido([{ produtoId: PRODUTO_A }])));
    expect(mensagens).toEqual([
      'Fornecedor inativo',
      'Depósito inativo',
      'Produto 7 (Parafuso) está inativo',
    ]);
  });

  it('rejeita fornecedor, depósito e produto inexistentes', async () => {
    const { servico } = criarServico({ fornecedor: null, deposito: null, produtos: [] });
    const mensagens = await mensagensDeErro(servico.criar(pedido([{ produtoId: PRODUTO_A }])));
    expect(mensagens).toEqual([
      'Fornecedor não encontrado',
      'Depósito não encontrado',
      `Produto ${PRODUTO_A} não encontrado`,
    ]);
  });
});

describe('paraResposta', () => {
  it('arredonda o subtotal de cada item e soma os subtotais no total', () => {
    const decimal = (valor: string) => new Prisma.Decimal(valor);
    const resposta = paraResposta({
      itens: [
        { quantidade: decimal('0.333'), precoUnitario: decimal('10.00') },
        { quantidade: decimal('2.000'), precoUnitario: decimal('1.25') },
      ],
    } as Parameters<typeof paraResposta>[0]);
    expect(resposta.itens.map((item) => item.subtotal)).toEqual(['3.33', '2.50']);
    expect(resposta.total).toBe('5.83');
    expect(resposta.itens[0].quantidade).toBe('0.333');
  });
});

describe('CriarPedidoCompraDto', () => {
  async function erros(dados: object) {
    const dto = plainToInstance(CriarPedidoCompraDto, dados);
    return (await validate(dto)).map((e) => e.property);
  }

  it('aceita um pedido válido', async () => {
    expect(await erros(pedido([{ produtoId: PRODUTO_A, quantidade: 2.5, precoUnitario: 10.9 }]))).toEqual([]);
  });

  it('rejeita pedido sem itens', async () => {
    expect(await erros({ ...pedido([]) })).toEqual(['itens']);
  });

  it('rejeita quantidade e preço inválidos nos itens', async () => {
    const dados = pedido([
      { produtoId: PRODUTO_A, quantidade: 0 },
      { produtoId: PRODUTO_B, precoUnitario: 1.234 },
    ]);
    expect(await erros(dados)).toEqual(['itens']);
  });
});

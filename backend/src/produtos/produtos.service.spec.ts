import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProdutosService } from './produtos.service.js';

function criarServico() {
  const produto = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const prisma = {
    produto,
    $transaction: (consultas: Promise<unknown>[]) => Promise.all(consultas),
  } as unknown as PrismaService;
  return { servico: new ProdutosService(prisma), produto };
}

const consulta = { page: 2, pageSize: 10 };

describe('ProdutosService', () => {
  it('pagina a listagem', async () => {
    const { servico, produto } = criarServico();
    await servico.listar(consulta);
    expect(produto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('busca texto apenas pelo nome', async () => {
    const { servico, produto } = criarServico();
    await servico.listar({ ...consulta, busca: 'parafuso' });
    const { where } = produto.findMany.mock.calls[0][0];
    expect(where.OR).toHaveLength(1);
  });

  it('busca termo numérico também pelo código', async () => {
    const { servico, produto } = criarServico();
    await servico.listar({ ...consulta, busca: '12' });
    const { where } = produto.findMany.mock.calls[0][0];
    expect(where.OR).toContainEqual({ codigo: 12 });
  });

  it('não busca por código quando o número excede o inteiro do banco', async () => {
    const { servico, produto } = criarServico();
    await servico.listar({ ...consulta, busca: '12345678901' });
    const { where } = produto.findMany.mock.calls[0][0];
    expect(where.OR).toHaveLength(1);
  });

  it('retorna 404 ao atualizar produto inexistente', async () => {
    const { servico, produto } = criarServico();
    produto.findFirst.mockResolvedValue(null);
    await expect(servico.atualizar('id', { ativo: false })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(produto.update).not.toHaveBeenCalled();
  });
});

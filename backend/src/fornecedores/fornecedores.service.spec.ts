import { ConflictException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CriarFornecedorDto } from './fornecedores.dto.js';
import { FornecedoresService } from './fornecedores.service.js';

function criarServico() {
  const fornecedor = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const prisma = {
    fornecedor,
    $transaction: (consultas: Promise<unknown>[]) => Promise.all(consultas),
  } as unknown as PrismaService;
  return { servico: new FornecedoresService(prisma), fornecedor };
}

function erroDeUnicidade() {
  return new Prisma.PrismaClientKnownRequestError('duplicado', {
    code: 'P2002',
    clientVersion: 'teste',
  });
}

describe('FornecedoresService', () => {
  it('busca pela razão social e pelo CNPJ sem pontuação', async () => {
    const { servico, fornecedor } = criarServico();
    await servico.listar({ page: 1, pageSize: 20, busca: '11.222' });
    const { where } = fornecedor.findMany.mock.calls[0][0];
    expect(where.OR).toContainEqual({ cnpj: { contains: '11222' } });
    expect(where.OR[0]).toHaveProperty('razaoSocial');
  });

  it('retorna conflito ao criar com CNPJ já cadastrado', async () => {
    const { servico, fornecedor } = criarServico();
    fornecedor.create.mockRejectedValue(erroDeUnicidade());
    await expect(
      servico.criar({ razaoSocial: 'ACME', cnpj: '11222333000181' } as CriarFornecedorDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('retorna conflito ao atualizar para CNPJ já cadastrado', async () => {
    const { servico, fornecedor } = criarServico();
    fornecedor.findFirst.mockResolvedValue({ id: 'id' });
    fornecedor.update.mockRejectedValue(erroDeUnicidade());
    await expect(
      servico.atualizar('id', { cnpj: '11222333000181' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('propaga erros inesperados', async () => {
    const { servico, fornecedor } = criarServico();
    const erro = new Error('falha');
    fornecedor.create.mockRejectedValue(erro);
    await expect(
      servico.criar({ razaoSocial: 'ACME', cnpj: '11222333000181' } as CriarFornecedorDto),
    ).rejects.toBe(erro);
  });
});

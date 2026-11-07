import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { normalizarCnpj } from '../common/cnpj.js';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { Pagina, PaginacaoQueryDto, paraSkipTake } from '../common/paginacao.js';
import { Fornecedor, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AtualizarFornecedorDto, CriarFornecedorDto } from './fornecedores.dto.js';

const CNPJ_DUPLICADO = 'Já existe um fornecedor com este CNPJ';

function violaUnicidade(erro: unknown): boolean {
  return erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002';
}

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: PaginacaoQueryDto): Promise<Pagina<Fornecedor>> {
    const where: Prisma.FornecedorWhereInput = { empresaId: EMPRESA_PADRAO_ID };
    if (query.busca) {
      where.OR = [{ razaoSocial: { contains: query.busca, mode: 'insensitive' } }];
      const cnpj = normalizarCnpj(query.busca);
      if (cnpj) {
        where.OR.push({ cnpj: { contains: cnpj } });
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.fornecedor.findMany({
        where,
        orderBy: { razaoSocial: 'asc' },
        ...paraSkipTake(query),
      }),
      this.prisma.fornecedor.count({ where }),
    ]);
    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async buscarPorId(id: string): Promise<Fornecedor> {
    const fornecedor = await this.prisma.fornecedor.findFirst({
      where: { id, empresaId: EMPRESA_PADRAO_ID },
    });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    return fornecedor;
  }

  async criar(dto: CriarFornecedorDto): Promise<Fornecedor> {
    try {
      return await this.prisma.fornecedor.create({
        data: { ...dto, empresaId: EMPRESA_PADRAO_ID },
      });
    } catch (erro) {
      throw violaUnicidade(erro) ? new ConflictException(CNPJ_DUPLICADO) : erro;
    }
  }

  async atualizar(id: string, dto: AtualizarFornecedorDto): Promise<Fornecedor> {
    await this.buscarPorId(id);
    try {
      return await this.prisma.fornecedor.update({ where: { id }, data: dto });
    } catch (erro) {
      throw violaUnicidade(erro) ? new ConflictException(CNPJ_DUPLICADO) : erro;
    }
  }
}

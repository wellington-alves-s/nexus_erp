import { Injectable, NotFoundException } from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { BuscaQueryDto, Pagina, paraSkipTake } from '../common/paginacao.js';
import { Prisma, Produto } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AtualizarProdutoDto, CriarProdutoDto } from './produtos.dto.js';

// Limite de dígitos que cabe no tipo inteiro do código.
const BUSCA_CODIGO = /^\d{1,9}$/;

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: BuscaQueryDto): Promise<Pagina<Produto>> {
    const where: Prisma.ProdutoWhereInput = { empresaId: EMPRESA_PADRAO_ID, ativo: query.ativo };
    if (query.busca) {
      where.OR = [{ nome: { contains: query.busca, mode: 'insensitive' } }];
      if (BUSCA_CODIGO.test(query.busca)) {
        where.OR.push({ codigo: Number(query.busca) });
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.produto.findMany({
        where,
        orderBy: { codigo: 'asc' },
        ...paraSkipTake(query),
      }),
      this.prisma.produto.count({ where }),
    ]);
    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async buscarPorId(id: string): Promise<Produto> {
    const produto = await this.prisma.produto.findFirst({
      where: { id, empresaId: EMPRESA_PADRAO_ID },
    });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return produto;
  }

  criar(dto: CriarProdutoDto): Promise<Produto> {
    return this.prisma.produto.create({
      data: { ...dto, empresaId: EMPRESA_PADRAO_ID },
    });
  }

  async atualizar(id: string, dto: AtualizarProdutoDto): Promise<Produto> {
    await this.buscarPorId(id);
    return this.prisma.produto.update({ where: { id }, data: dto });
  }
}

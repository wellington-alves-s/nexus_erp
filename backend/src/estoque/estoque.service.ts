import { Injectable } from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { Pagina, paraSkipTake } from '../common/paginacao.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstoqueQueryDto } from './estoque.dto.js';

const BUSCA_CODIGO = /^\d{1,9}$/;

const INCLUIR = {
  produto: { select: { id: true, codigo: true, nome: true, unidade: true } },
  deposito: { select: { id: true, nome: true } },
} satisfies Prisma.SaldoEstoqueInclude;

type SaldoCompleto = Prisma.SaldoEstoqueGetPayload<{ include: typeof INCLUIR }>;

function paraResposta(saldo: SaldoCompleto) {
  return { ...saldo, quantidade: saldo.quantidade.toFixed(3) };
}

export type SaldoResposta = ReturnType<typeof paraResposta>;

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: EstoqueQueryDto): Promise<Pagina<SaldoResposta>> {
    const where: Prisma.SaldoEstoqueWhereInput = {
      empresaId: EMPRESA_PADRAO_ID,
      depositoId: query.depositoId,
    };
    if (query.busca) {
      const filtros: Prisma.ProdutoWhereInput[] = [
        { nome: { contains: query.busca, mode: 'insensitive' } },
      ];
      if (BUSCA_CODIGO.test(query.busca)) {
        filtros.push({ codigo: Number(query.busca) });
      }
      where.produto = { OR: filtros };
    }

    const [saldos, total] = await this.prisma.$transaction([
      this.prisma.saldoEstoque.findMany({
        where,
        include: INCLUIR,
        orderBy: [{ produto: { codigo: 'asc' } }, { deposito: { nome: 'asc' } }],
        ...paraSkipTake(query),
      }),
      this.prisma.saldoEstoque.count({ where }),
    ]);
    return { data: saldos.map(paraResposta), total, page: query.page, pageSize: query.pageSize };
  }
}

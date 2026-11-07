import { Injectable } from '@nestjs/common';
import { EMPRESA_PADRAO_ID } from '../common/empresa-padrao.js';
import { Deposito } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DepositosService {
  constructor(private readonly prisma: PrismaService) {}

  listarAtivos(): Promise<Deposito[]> {
    return this.prisma.deposito.findMany({
      where: { empresaId: EMPRESA_PADRAO_ID, ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
}

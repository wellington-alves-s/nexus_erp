import { Module } from '@nestjs/common';
import { FornecedoresModule } from './fornecedores/fornecedores.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';

@Module({
  imports: [PrismaModule, ProdutosModule, FornecedoresModule],
  controllers: [HealthController],
})
export class AppModule {}

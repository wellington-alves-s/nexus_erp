import { Module } from '@nestjs/common';
import { DepositosModule } from './depositos/depositos.module.js';
import { EstoqueModule } from './estoque/estoque.module.js';
import { FornecedoresModule } from './fornecedores/fornecedores.module.js';
import { HealthController } from './health/health.controller.js';
import { PedidosCompraModule } from './pedidos-compra/pedidos-compra.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { RecebimentoModule } from './recebimento/recebimento.module.js';

@Module({
  imports: [
    PrismaModule,
    ProdutosModule,
    FornecedoresModule,
    DepositosModule,
    PedidosCompraModule,
    RecebimentoModule,
    EstoqueModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

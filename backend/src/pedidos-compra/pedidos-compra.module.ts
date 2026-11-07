import { Module } from '@nestjs/common';
import { PedidosCompraController } from './pedidos-compra.controller.js';
import { PedidosCompraService } from './pedidos-compra.service.js';

@Module({
  controllers: [PedidosCompraController],
  providers: [PedidosCompraService],
})
export class PedidosCompraModule {}

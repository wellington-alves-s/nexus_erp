import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Pagina, PaginacaoQueryDto } from '../common/paginacao.js';
import { CriarPedidoCompraDto } from './pedidos-compra.dto.js';
import { PedidoCompraResposta, PedidosCompraService } from './pedidos-compra.service.js';

@Controller('pedidos-compra')
export class PedidosCompraController {
  constructor(private readonly pedidos: PedidosCompraService) {}

  @Get()
  listar(@Query() query: PaginacaoQueryDto): Promise<Pagina<PedidoCompraResposta>> {
    return this.pedidos.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseUUIDPipe) id: string): Promise<PedidoCompraResposta> {
    return this.pedidos.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarPedidoCompraDto): Promise<PedidoCompraResposta> {
    return this.pedidos.criar(dto);
  }
}

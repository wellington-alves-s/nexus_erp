import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ConferenciaResposta, ConferenciasService } from './conferencias.service.js';
import { EntradaResposta, EntradasService } from './entradas.service.js';
import { EfetivarEntradaDto, SalvarItensConferenciaDto } from './recebimento.dto.js';

@Controller()
export class RecebimentoController {
  constructor(
    private readonly conferencias: ConferenciasService,
    private readonly entradas: EntradasService,
  ) {}

  @Post('pedidos-compra/:pedidoId/conferencias')
  abrirConferencia(
    @Param('pedidoId', ParseUUIDPipe) pedidoId: string,
  ): Promise<ConferenciaResposta> {
    return this.conferencias.abrir(pedidoId);
  }

  @Get('conferencias/:id')
  buscarConferencia(@Param('id', ParseUUIDPipe) id: string): Promise<ConferenciaResposta> {
    return this.conferencias.buscarPorId(id);
  }

  @Put('conferencias/:id/itens')
  salvarItens(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SalvarItensConferenciaDto,
  ): Promise<ConferenciaResposta> {
    return this.conferencias.salvarItens(id, dto);
  }

  @Post('conferencias/:id/encerrar')
  @HttpCode(HttpStatus.OK)
  encerrarConferencia(@Param('id', ParseUUIDPipe) id: string): Promise<ConferenciaResposta> {
    return this.conferencias.encerrar(id);
  }

  @Post('entradas-mercadoria')
  efetivarEntrada(@Body() dto: EfetivarEntradaDto): Promise<EntradaResposta> {
    return this.entradas.efetivar(dto.conferenciaId);
  }

  @Get('entradas-mercadoria/:id')
  buscarEntrada(@Param('id', ParseUUIDPipe) id: string): Promise<EntradaResposta> {
    return this.entradas.buscarPorId(id);
  }
}

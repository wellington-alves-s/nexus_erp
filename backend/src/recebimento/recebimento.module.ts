import { Module } from '@nestjs/common';
import { ConferenciasService } from './conferencias.service.js';
import { EntradasService } from './entradas.service.js';
import { RecebimentoController } from './recebimento.controller.js';

@Module({
  controllers: [RecebimentoController],
  providers: [ConferenciasService, EntradasService],
})
export class RecebimentoModule {}

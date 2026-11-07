import { Module } from '@nestjs/common';
import { DepositosController } from './depositos.controller.js';
import { DepositosService } from './depositos.service.js';

@Module({
  controllers: [DepositosController],
  providers: [DepositosService],
})
export class DepositosModule {}

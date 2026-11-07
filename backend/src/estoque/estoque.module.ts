import { Module } from '@nestjs/common';
import { EstoqueController } from './estoque.controller.js';
import { EstoqueService } from './estoque.service.js';

@Module({
  controllers: [EstoqueController],
  providers: [EstoqueService],
})
export class EstoqueModule {}

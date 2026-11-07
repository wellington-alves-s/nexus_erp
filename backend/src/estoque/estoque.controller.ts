import { Controller, Get, Query } from '@nestjs/common';
import { Pagina } from '../common/paginacao.js';
import { EstoqueQueryDto } from './estoque.dto.js';
import { EstoqueService, SaldoResposta } from './estoque.service.js';

@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}

  @Get()
  listar(@Query() query: EstoqueQueryDto): Promise<Pagina<SaldoResposta>> {
    return this.estoque.listar(query);
  }
}

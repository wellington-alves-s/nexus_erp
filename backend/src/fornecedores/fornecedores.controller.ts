import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BuscaQueryDto, Pagina } from '../common/paginacao.js';
import { Fornecedor } from '../generated/prisma/client.js';
import { AtualizarFornecedorDto, CriarFornecedorDto } from './fornecedores.dto.js';
import { FornecedoresService } from './fornecedores.service.js';

@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedores: FornecedoresService) {}

  @Get()
  listar(@Query() query: BuscaQueryDto): Promise<Pagina<Fornecedor>> {
    return this.fornecedores.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseUUIDPipe) id: string): Promise<Fornecedor> {
    return this.fornecedores.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarFornecedorDto): Promise<Fornecedor> {
    return this.fornecedores.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarFornecedorDto,
  ): Promise<Fornecedor> {
    return this.fornecedores.atualizar(id, dto);
  }
}

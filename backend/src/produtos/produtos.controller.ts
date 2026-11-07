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
import { Produto } from '../generated/prisma/client.js';
import { AtualizarProdutoDto, CriarProdutoDto } from './produtos.dto.js';
import { ProdutosService } from './produtos.service.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtos: ProdutosService) {}

  @Get()
  listar(@Query() query: BuscaQueryDto): Promise<Pagina<Produto>> {
    return this.produtos.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseUUIDPipe) id: string): Promise<Produto> {
    return this.produtos.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarProdutoDto): Promise<Produto> {
    return this.produtos.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarProdutoDto,
  ): Promise<Produto> {
    return this.produtos.atualizar(id, dto);
  }
}

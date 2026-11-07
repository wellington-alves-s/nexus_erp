import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Aparar } from './transformers.js';

export const TAMANHO_PAGINA_PADRAO = 20;
export const TAMANHO_PAGINA_MAXIMO = 100;

export class PaginacaoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TAMANHO_PAGINA_MAXIMO)
  pageSize: number = TAMANHO_PAGINA_PADRAO;

  @IsOptional()
  @Aparar()
  @IsString()
  @MaxLength(100)
  busca?: string;
}

export interface Pagina<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paraSkipTake({ page, pageSize }: PaginacaoQueryDto) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

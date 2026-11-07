import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
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
}

/** Listagem paginada com busca textual. */
export class PesquisaQueryDto extends PaginacaoQueryDto {
  @IsOptional()
  @Aparar()
  @IsString()
  @MaxLength(100)
  busca?: string;
}

/** Listagem de cadastros: busca textual e filtro por situação. */
export class BuscaQueryDto extends PesquisaQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  ativo?: boolean;
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

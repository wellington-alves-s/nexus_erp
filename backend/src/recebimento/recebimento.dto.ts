import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { VazioParaNulo } from '../common/transformers.js';

// Limite da coluna Decimal(12,3).
const QUANTIDADE_MAXIMA = 999_999_999;

export class ItemConferenciaDto {
  @IsUUID()
  itemPedidoId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  @Max(QUANTIDADE_MAXIMA)
  quantidadeConferida!: number;

  @IsOptional()
  @VazioParaNulo()
  @IsString()
  @MaxLength(500)
  justificativaExcesso?: string | null;
}

export class SalvarItensConferenciaDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ItemConferenciaDto)
  itens!: ItemConferenciaDto[];
}

export class EfetivarEntradaDto {
  @IsUUID()
  conferenciaId!: string;
}

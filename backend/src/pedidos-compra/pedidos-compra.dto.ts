import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  Max,
  ValidateNested,
} from 'class-validator';

// Limites das colunas Decimal(12,3) e Decimal(12,2).
const QUANTIDADE_MAXIMA = 999_999_999;
const PRECO_MAXIMO = 9_999_999_999;

export class ItemPedidoCompraDto {
  @IsUUID()
  produtoId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  @Max(QUANTIDADE_MAXIMA)
  quantidade!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(PRECO_MAXIMO)
  precoUnitario!: number;
}

export class CriarPedidoCompraDto {
  @IsUUID()
  fornecedorId!: string;

  @IsUUID()
  depositoId!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'O pedido deve ter ao menos um item' })
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoCompraDto)
  itens!: ItemPedidoCompraDto[];
}

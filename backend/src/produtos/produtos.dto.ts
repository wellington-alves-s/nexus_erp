import { IsBoolean, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Aparar } from '../common/transformers.js';
import { OpcionalNaoNulo } from '../common/opcional-nao-nulo.js';
import { UnidadeMedida } from '../generated/prisma/enums.js';

export class CriarProdutoDto {
  @Aparar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome!: string;

  @IsEnum(UnidadeMedida)
  unidade!: UnidadeMedida;
}

export class AtualizarProdutoDto {
  @OpcionalNaoNulo()
  @Aparar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome?: string;

  @OpcionalNaoNulo()
  @IsEnum(UnidadeMedida)
  unidade?: UnidadeMedida;

  @OpcionalNaoNulo()
  @IsBoolean()
  ativo?: boolean;
}

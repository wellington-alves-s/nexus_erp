import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { normalizarCnpj } from '../common/cnpj.js';
import { IsCnpj } from '../common/is-cnpj.decorator.js';
import { OpcionalNaoNulo } from '../common/opcional-nao-nulo.js';
import { Aparar, SomenteDigitos, VazioParaNulo } from '../common/transformers.js';

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

const MSG_TELEFONE = 'Telefone deve ter 10 ou 11 dígitos (DDD + número)';

const NormalizarCnpj = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizarCnpj(value) : value,
  );

const UfMaiuscula = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );

/** Campos opcionais, que podem ser limpos enviando null ou texto vazio. */
class DadosOpcionaisFornecedorDto {
  @IsOptional()
  @VazioParaNulo()
  @IsString()
  @MaxLength(200)
  nomeFantasia?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @IsOptional()
  @SomenteDigitos()
  @Matches(/^\d{10,11}$/, { message: MSG_TELEFONE })
  telefone?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @IsString()
  @MaxLength(200)
  logradouro?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @IsString()
  @MaxLength(100)
  cidade?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @UfMaiuscula()
  @IsIn(UFS, { message: 'UF inválida' })
  uf?: string | null;

  @IsOptional()
  @SomenteDigitos()
  @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos' })
  cep?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @IsString()
  @MaxLength(200)
  contatoNome?: string | null;

  @IsOptional()
  @VazioParaNulo()
  @IsEmail()
  @MaxLength(254)
  contatoEmail?: string | null;

  @IsOptional()
  @SomenteDigitos()
  @Matches(/^\d{10,11}$/, { message: MSG_TELEFONE })
  contatoTelefone?: string | null;
}

export class CriarFornecedorDto extends DadosOpcionaisFornecedorDto {
  @Aparar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  razaoSocial!: string;

  @NormalizarCnpj()
  @IsCnpj()
  cnpj!: string;
}

export class AtualizarFornecedorDto extends DadosOpcionaisFornecedorDto {
  @OpcionalNaoNulo()
  @Aparar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  razaoSocial?: string;

  @OpcionalNaoNulo()
  @NormalizarCnpj()
  @IsCnpj()
  cnpj?: string;

  @OpcionalNaoNulo()
  @IsBoolean()
  ativo?: boolean;
}

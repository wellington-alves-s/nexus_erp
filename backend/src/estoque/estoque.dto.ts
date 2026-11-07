import { IsOptional, IsUUID } from 'class-validator';
import { PesquisaQueryDto } from '../common/paginacao.js';

export class EstoqueQueryDto extends PesquisaQueryDto {
  @IsOptional()
  @IsUUID()
  depositoId?: string;
}

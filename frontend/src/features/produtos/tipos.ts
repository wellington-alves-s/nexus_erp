export const UNIDADES = ["UN", "CX", "BR", "PCT", "M2"] as const;

export type UnidadeMedida = (typeof UNIDADES)[number];

export interface Produto {
  id: string;
  codigo: number;
  nome: string;
  unidade: UnidadeMedida;
  ativo: boolean;
}

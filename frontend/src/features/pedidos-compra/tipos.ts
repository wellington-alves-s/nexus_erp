import type { UnidadeMedida } from "@/features/produtos/tipos";

export interface Deposito {
  id: string;
  nome: string;
}

export interface ItemPedidoCompra {
  id: string;
  quantidade: string;
  precoUnitario: string;
  subtotal: string;
  produto: { id: string; codigo: number; nome: string; unidade: UnidadeMedida };
}

export interface PedidoCompra {
  id: string;
  numero: number;
  status: "ABERTO";
  createdAt: string;
  total: string;
  fornecedor: { id: string; razaoSocial: string; cnpj: string };
  deposito: Deposito;
  itens: ItemPedidoCompra[];
}

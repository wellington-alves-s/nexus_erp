import type { StatusConferencia, StatusPedido } from "@/features/pedidos-compra/tipos";
import type { UnidadeMedida } from "@/features/produtos/tipos";

export interface ItemPedidoConferencia {
  id: string;
  quantidade: string;
  recebida: string;
  pendente: string;
  produto: { id: string; codigo: number; nome: string; unidade: UnidadeMedida };
}

export interface Conferencia {
  id: string;
  numero: number;
  status: StatusConferencia;
  createdAt: string;
  encerradaEm: string | null;
  pedido: { id: string; numero: number; status: StatusPedido };
  entrada: { id: string; numero: number; createdAt: string } | null;
  itensPedido: ItemPedidoConferencia[];
  itens: { itemPedidoId: string; quantidadeConferida: string; justificativaExcesso: string | null }[];
}

export interface SaldoEstoque {
  id: string;
  quantidade: string;
  produto: { id: string; codigo: number; nome: string; unidade: UnidadeMedida };
  deposito: { id: string; nome: string };
}

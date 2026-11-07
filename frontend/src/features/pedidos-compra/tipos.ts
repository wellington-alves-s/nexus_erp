import type { UnidadeMedida } from "@/features/produtos/tipos";

export interface Deposito {
  id: string;
  nome: string;
}

export type StatusPedido = "ABERTO" | "PARCIALMENTE_RECEBIDO" | "RECEBIDO";
export type StatusConferencia = "EM_CONFERENCIA" | "ENCERRADA";

export const ROTULO_STATUS_PEDIDO: Record<StatusPedido, string> = {
  ABERTO: "Aberto",
  PARCIALMENTE_RECEBIDO: "Parcialmente recebido",
  RECEBIDO: "Recebido",
};

export const TOM_STATUS_PEDIDO: Record<StatusPedido, "info" | "warning" | "success"> = {
  ABERTO: "info",
  PARCIALMENTE_RECEBIDO: "warning",
  RECEBIDO: "success",
};

export const ROTULO_STATUS_CONFERENCIA: Record<StatusConferencia, string> = {
  EM_CONFERENCIA: "Em conferência",
  ENCERRADA: "Encerrada",
};

export const TOM_STATUS_CONFERENCIA: Record<StatusConferencia, "warning" | "neutral"> = {
  EM_CONFERENCIA: "warning",
  ENCERRADA: "neutral",
};

export interface ItemPedidoCompra {
  id: string;
  quantidade: string;
  precoUnitario: string;
  subtotal: string;
  recebida: string;
  pendente: string;
  produto: { id: string; codigo: number; nome: string; unidade: UnidadeMedida };
}

export interface ConferenciaResumo {
  id: string;
  numero: number;
  status: StatusConferencia;
  createdAt: string;
  entrada: { id: string; numero: number } | null;
}

export interface PedidoCompra {
  id: string;
  numero: number;
  status: StatusPedido;
  createdAt: string;
  total: string;
  fornecedor: { id: string; razaoSocial: string; cnpj: string };
  deposito: Deposito;
  itens: ItemPedidoCompra[];
  conferencias: ConferenciaResumo[];
}

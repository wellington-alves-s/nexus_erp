import type { Metadata } from "next";
import { PedidosLista } from "@/features/pedidos-compra/pedidos-lista";

export const metadata: Metadata = { title: "Pedidos de compra" };

export default function PedidosCompraPage() {
  return <PedidosLista />;
}

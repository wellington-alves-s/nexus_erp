import type { Metadata } from "next";
import { PedidoFormulario } from "@/features/pedidos-compra/pedido-formulario";

export const metadata: Metadata = { title: "Novo pedido de compra" };

export default function NovoPedidoCompraPage() {
  return <PedidoFormulario />;
}

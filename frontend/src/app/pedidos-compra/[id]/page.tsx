import type { Metadata } from "next";
import { Suspense } from "react";
import { PedidoDetalhe } from "@/features/pedidos-compra/pedido-detalhe";

export const metadata: Metadata = { title: "Pedido de compra" };

export default function PedidoCompraPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
      <PedidoDetalhe />
    </Suspense>
  );
}

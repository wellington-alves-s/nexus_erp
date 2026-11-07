"use client";

import Link from "next/link";
import { Listagem } from "@/components/listagem";
import { Badge } from "@/components/ui/badge";
import { formatarData, formatarMoeda } from "@/lib/formatadores";
import { ROTULO_STATUS_PEDIDO, type PedidoCompra } from "./tipos";

export function PedidosLista() {
  return (
    <Listagem<PedidoCompra>
      recurso="pedidos-compra"
      titulo="Pedidos de compra"
      hrefNovo="/pedidos-compra/novo"
      cabecalhos={["Número", "Data", "Fornecedor", "Depósito", "Total", "Situação", ""]}
      chave={(pedido) => pedido.id}
      renderLinha={(pedido) => [
        pedido.numero,
        formatarData(pedido.createdAt),
        pedido.fornecedor.razaoSocial,
        pedido.deposito.nome,
        formatarMoeda(pedido.total),
        <Badge key="situacao" variant="secondary">
          {ROTULO_STATUS_PEDIDO[pedido.status]}
        </Badge>,
        <Link
          key="ver"
          href={`/pedidos-compra/${pedido.id}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Ver
        </Link>,
      ]}
    />
  );
}

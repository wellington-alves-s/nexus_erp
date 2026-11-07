"use client";

import Link from "next/link";
import { Listagem } from "@/components/listagem";
import { EtiquetaStatus } from "@/components/status-badge";
import { formatarData, formatarMoeda } from "@/lib/formatadores";
import { ROTULO_STATUS_PEDIDO, TOM_STATUS_PEDIDO, type PedidoCompra } from "./tipos";

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
        <EtiquetaStatus key="situacao" tom={TOM_STATUS_PEDIDO[pedido.status]}>
          {ROTULO_STATUS_PEDIDO[pedido.status]}
        </EtiquetaStatus>,
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

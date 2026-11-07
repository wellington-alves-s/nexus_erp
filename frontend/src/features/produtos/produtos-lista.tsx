"use client";

import Link from "next/link";
import { Listagem } from "@/components/listagem";
import { StatusBadge } from "@/components/status-badge";
import type { Produto } from "./tipos";

export function ProdutosLista() {
  return (
    <Listagem<Produto>
      recurso="produtos"
      titulo="Produtos"
      hrefNovo="/produtos/novo"
      placeholderBusca="Buscar por código ou nome"
      cabecalhos={["Código", "Nome", "Unidade", "Situação", ""]}
      chave={(produto) => produto.id}
      renderLinha={(produto) => [
        produto.codigo,
        produto.nome,
        produto.unidade,
        <StatusBadge key="situacao" ativo={produto.ativo} />,
        <Link
          key="editar"
          href={`/produtos/${produto.id}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Editar
        </Link>,
      ]}
    />
  );
}

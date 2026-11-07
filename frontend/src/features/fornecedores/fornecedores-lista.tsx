"use client";

import Link from "next/link";
import { Listagem } from "@/components/listagem";
import { StatusBadge } from "@/components/status-badge";
import { formatarCnpj } from "@/lib/formatadores";
import type { Fornecedor } from "./tipos";

export function FornecedoresLista() {
  return (
    <Listagem<Fornecedor>
      recurso="fornecedores"
      titulo="Fornecedores"
      hrefNovo="/fornecedores/novo"
      placeholderBusca="Buscar por razão social ou CNPJ"
      cabecalhos={["Razão social", "CNPJ", "Cidade/UF", "Situação", ""]}
      chave={(fornecedor) => fornecedor.id}
      renderLinha={(fornecedor) => [
        fornecedor.razaoSocial,
        formatarCnpj(fornecedor.cnpj),
        [fornecedor.cidade, fornecedor.uf].filter(Boolean).join("/") || "-",
        <StatusBadge key="situacao" ativo={fornecedor.ativo} />,
        <Link
          key="editar"
          href={`/fornecedores/${fornecedor.id}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Editar
        </Link>,
      ]}
    />
  );
}

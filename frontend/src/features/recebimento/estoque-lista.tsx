"use client";

import { Listagem } from "@/components/listagem";
import { formatarQuantidade } from "@/lib/formatadores";
import type { SaldoEstoque } from "./tipos";

export function EstoqueLista() {
  return (
    <Listagem<SaldoEstoque>
      recurso="estoque"
      titulo="Saldo de estoque"
      placeholderBusca="Buscar por código ou nome do produto"
      cabecalhos={["Código", "Produto", "Depósito", "Saldo"]}
      chave={(saldo) => saldo.id}
      renderLinha={(saldo) => [
        saldo.produto.codigo,
        saldo.produto.nome,
        saldo.deposito.nome,
        `${formatarQuantidade(saldo.quantidade)} ${saldo.produto.unidade}`,
      ]}
    />
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MensagensErro } from "@/components/mensagens-erro";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatarCnpj,
  formatarData,
  formatarMoeda,
  formatarQuantidade,
} from "@/lib/formatadores";
import { useRegistro } from "@/lib/use-registro";
import type { PedidoCompra } from "./tipos";

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { registro: pedido, erros, carregando } = useRegistro<PedidoCompra>(`pedidos-compra/${id}`);

  if (carregando) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!pedido) return <MensagensErro mensagens={erros} />;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pedido {pedido.numero}</h1>
        <Link href="/pedidos-compra" className={buttonVariants({ variant: "outline" })}>
          Voltar
        </Link>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Fornecedor</dt>
          <dd>
            {pedido.fornecedor.razaoSocial} ({formatarCnpj(pedido.fornecedor.cnpj)})
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Depósito</dt>
          <dd>{pedido.deposito.nome}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Data</dt>
          <dd>{formatarData(pedido.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Situação</dt>
          <dd>
            <Badge variant="secondary">Aberto</Badge>
          </dd>
        </div>
      </dl>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Preço unitário</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedido.itens.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.produto.codigo}</TableCell>
              <TableCell>{item.produto.nome}</TableCell>
              <TableCell className="text-right">
                {formatarQuantidade(item.quantidade)} {item.produto.unidade}
              </TableCell>
              <TableCell className="text-right">{formatarMoeda(item.precoUnitario)}</TableCell>
              <TableCell className="text-right">{formatarMoeda(item.subtotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-right text-lg font-semibold">Total: {formatarMoeda(pedido.total)}</p>
    </section>
  );
}

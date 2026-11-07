"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Informacao } from "@/components/informacao";
import { MensagensErro } from "@/components/mensagens-erro";
import { Secao } from "@/components/secao";
import { EtiquetaStatus } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, mensagensDoErro } from "@/lib/api";
import { formatarCnpj, formatarData, formatarMoeda, formatarQuantidade } from "@/lib/formatadores";
import { cn } from "@/lib/utils";
import { useRegistro } from "@/lib/use-registro";
import {
  ROTULO_STATUS_CONFERENCIA,
  ROTULO_STATUS_PEDIDO,
  TOM_STATUS_CONFERENCIA,
  TOM_STATUS_PEDIDO,
  type PedidoCompra,
} from "./tipos";

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { registro: pedido, erros, carregando } = useRegistro<PedidoCompra>(`pedidos-compra/${id}`);
  const [errosAcao, setErrosAcao] = useState<string[]>([]);
  const [abrindo, setAbrindo] = useState(false);

  if (carregando) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!pedido) return <MensagensErro mensagens={erros} />;

  const conferenciaEmAberto = pedido.conferencias.find((conferencia) => !conferencia.entrada);

  async function abrirConferencia() {
    setAbrindo(true);
    setErrosAcao([]);
    try {
      const conferencia = await api<{ id: string }>(`/pedidos-compra/${id}/conferencias`, {
        method: "POST",
      });
      router.push(`/conferencias/${conferencia.id}`);
    } catch (erro) {
      setErrosAcao(mensagensDoErro(erro));
      setAbrindo(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <CabecalhoPagina titulo={`Pedido ${pedido.numero}`}>
        <Link href="/pedidos-compra" className={cn(buttonVariants({ variant: "outline" }))}>
          Voltar
        </Link>
      </CabecalhoPagina>

      <Secao titulo="Dados do pedido" className="sm:grid-cols-4">
        <Informacao rotulo="Fornecedor">
          {pedido.fornecedor.razaoSocial}
          <span className="block text-muted-foreground">
            {formatarCnpj(pedido.fornecedor.cnpj)}
          </span>
        </Informacao>
        <Informacao rotulo="Depósito">{pedido.deposito.nome}</Informacao>
        <Informacao rotulo="Data">{formatarData(pedido.createdAt)}</Informacao>
        <Informacao rotulo="Situação">
          <EtiquetaStatus tom={TOM_STATUS_PEDIDO[pedido.status]}>
            {ROTULO_STATUS_PEDIDO[pedido.status]}
          </EtiquetaStatus>
        </Informacao>
      </Secao>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Itens</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Recebido</TableHead>
              <TableHead className="text-right">Pendente</TableHead>
              <TableHead className="text-right">Preço unitário</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedido.itens.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.produto.codigo}</TableCell>
                <TableCell className="whitespace-normal">{item.produto.nome}</TableCell>
                <TableCell className="text-right">
                  {formatarQuantidade(item.quantidade)} {item.produto.unidade}
                </TableCell>
                <TableCell className="text-right">{formatarQuantidade(item.recebida)}</TableCell>
                <TableCell className="text-right">{formatarQuantidade(item.pendente)}</TableCell>
                <TableCell className="text-right">{formatarMoeda(item.precoUnitario)}</TableCell>
                <TableCell className="text-right">{formatarMoeda(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-right text-base font-semibold">Total: {formatarMoeda(pedido.total)}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Conferências de recebimento</h2>
          {conferenciaEmAberto ? (
            <Link
              href={`/conferencias/${conferenciaEmAberto.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Continuar conferência {conferenciaEmAberto.numero}
            </Link>
          ) : (
            pedido.status !== "RECEBIDO" && (
              <Button onClick={abrirConferencia} disabled={abrindo}>
                {abrindo ? "Abrindo..." : "Nova conferência"}
              </Button>
            )
          )}
        </div>

        <MensagensErro mensagens={errosAcao} />

        {pedido.conferencias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conferência registrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedido.conferencias.map((conferencia) => (
                <TableRow key={conferencia.id}>
                  <TableCell>{conferencia.numero}</TableCell>
                  <TableCell>{formatarData(conferencia.createdAt)}</TableCell>
                  <TableCell>
                    <EtiquetaStatus tom={TOM_STATUS_CONFERENCIA[conferencia.status]}>
                      {ROTULO_STATUS_CONFERENCIA[conferencia.status]}
                    </EtiquetaStatus>
                  </TableCell>
                  <TableCell>
                    {conferencia.entrada
                      ? `Entrada ${conferencia.entrada.numero}`
                      : "Não efetivada"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/conferencias/${conferencia.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MensagensErro } from "@/components/mensagens-erro";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROTULO_STATUS_CONFERENCIA } from "@/features/pedidos-compra/tipos";
import { api, mensagensDoErro } from "@/lib/api";
import { formatarData, formatarQuantidade } from "@/lib/formatadores";
import { useRegistro } from "@/lib/use-registro";
import type { Conferencia } from "./tipos";

export function ConferenciaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { registro, erros, carregando } = useRegistro<Conferencia>(`conferencias/${id}`);

  if (carregando) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!registro) return <MensagensErro mensagens={erros} />;
  return <ConferenciaPainel inicial={registro} />;
}

function ConferenciaPainel({ inicial }: { inicial: Conferencia }) {
  const router = useRouter();
  const [conferencia, setConferencia] = useState(inicial);
  const [quantidades, setQuantidades] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      inicial.itens.map((item) => [item.itemPedidoId, String(Number(item.quantidadeConferida))]),
    ),
  );
  const [justificativas, setJustificativas] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      inicial.itens.map((item) => [item.itemPedidoId, item.justificativaExcesso ?? ""]),
    ),
  );
  const [erros, setErros] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);

  const editavel = conferencia.status === "EM_CONFERENCIA";
  const conferidoPorItem = new Map(conferencia.itens.map((item) => [item.itemPedidoId, item]));

  async function executar(acao: () => Promise<void>) {
    setOcupado(true);
    setErros([]);
    try {
      await acao();
    } catch (erro) {
      setErros(mensagensDoErro(erro));
    } finally {
      setOcupado(false);
    }
  }

  async function salvar(): Promise<Conferencia> {
    const itens = conferencia.itensPedido
      .filter((item) => Number(quantidades[item.id]) > 0)
      .map((item) => ({
        itemPedidoId: item.id,
        quantidadeConferida: Number(quantidades[item.id]),
        justificativaExcesso: justificativas[item.id] ?? "",
      }));
    const atualizada = await api<Conferencia>(`/conferencias/${conferencia.id}/itens`, {
      method: "PUT",
      body: JSON.stringify({ itens }),
    });
    setConferencia(atualizada);
    return atualizada;
  }

  const aoSalvar = () => executar(async () => void (await salvar()));

  const aoEncerrar = () =>
    executar(async () => {
      await salvar();
      setConferencia(await api<Conferencia>(`/conferencias/${conferencia.id}/encerrar`, { method: "POST" }));
    });

  const aoEfetivar = () =>
    executar(async () => {
      await api("/entradas-mercadoria", {
        method: "POST",
        body: JSON.stringify({ conferenciaId: conferencia.id }),
      });
      router.push(`/pedidos-compra/${conferencia.pedido.id}`);
    });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Conferência {conferencia.numero} do pedido {conferencia.pedido.numero}
        </h1>
        <Link
          href={`/pedidos-compra/${conferencia.pedido.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Voltar ao pedido
        </Link>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Situação</dt>
          <dd>
            <Badge variant="secondary">{ROTULO_STATUS_CONFERENCIA[conferencia.status]}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Abertura</dt>
          <dd>{formatarData(conferencia.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Entrada</dt>
          <dd>
            {conferencia.entrada
              ? `Entrada ${conferencia.entrada.numero} efetivada em ${formatarData(conferencia.entrada.createdAt)}`
              : "Não efetivada"}
          </dd>
        </div>
      </dl>

      {editavel && (
        <p className="text-sm text-muted-foreground">
          Informe a quantidade que chegou de cada item. A conferência não altera o estoque; somente a
          entrada efetivada altera. Quantidade acima do pendente exige justificativa.
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Pedido</TableHead>
            <TableHead className="text-right">Recebido</TableHead>
            <TableHead className="text-right">Pendente</TableHead>
            <TableHead className="text-right">Conferido</TableHead>
            <TableHead>Justificativa do excedente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conferencia.itensPedido.map((item) => {
            const conferido = conferidoPorItem.get(item.id);
            const digitado = Number(quantidades[item.id] ?? 0);
            const excedente = digitado > Number(item.pendente);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {item.produto.codigo} - {item.produto.nome}
                </TableCell>
                <TableCell className="text-right">
                  {formatarQuantidade(item.quantidade)} {item.produto.unidade}
                </TableCell>
                <TableCell className="text-right">{formatarQuantidade(item.recebida)}</TableCell>
                <TableCell className="text-right">{formatarQuantidade(item.pendente)}</TableCell>
                <TableCell className="text-right">
                  {editavel ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      aria-label={`Quantidade conferida de ${item.produto.nome}`}
                      className="ml-auto w-28 text-right"
                      value={quantidades[item.id] ?? ""}
                      onChange={(evento) =>
                        setQuantidades((atuais) => ({ ...atuais, [item.id]: evento.target.value }))
                      }
                    />
                  ) : (
                    formatarQuantidade(conferido?.quantidadeConferida ?? "0")
                  )}
                </TableCell>
                <TableCell>
                  {editavel ? (
                    excedente && (
                      <Input
                        aria-label={`Justificativa do excedente de ${item.produto.nome}`}
                        maxLength={500}
                        value={justificativas[item.id] ?? ""}
                        onChange={(evento) =>
                          setJustificativas((atuais) => ({ ...atuais, [item.id]: evento.target.value }))
                        }
                      />
                    )
                  ) : (
                    (conferido?.justificativaExcesso ?? "")
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <MensagensErro mensagens={erros} />

      <div className="flex gap-2">
        {editavel && (
          <>
            <Button variant="outline" onClick={aoSalvar} disabled={ocupado}>
              Salvar
            </Button>
            <Button onClick={aoEncerrar} disabled={ocupado}>
              Encerrar conferência
            </Button>
          </>
        )}
        {conferencia.status === "ENCERRADA" && !conferencia.entrada && (
          <Button onClick={aoEfetivar} disabled={ocupado}>
            Efetivar entrada no estoque
          </Button>
        )}
      </div>
    </section>
  );
}

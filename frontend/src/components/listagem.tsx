"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { MensagensErro } from "@/components/mensagens-erro";
import { Paginacao } from "@/components/paginacao";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListagem } from "@/lib/use-listagem";

interface ListagemProps<T> {
  recurso: string;
  titulo: string;
  hrefNovo?: string;
  placeholderBusca?: string;
  cabecalhos: string[];
  chave: (item: T) => string;
  renderLinha: (item: T) => ReactNode[];
}

export function Listagem<T>({
  recurso,
  titulo,
  hrefNovo,
  placeholderBusca,
  cabecalhos,
  chave,
  renderLinha,
}: ListagemProps<T>) {
  const listagem = useListagem<T>(recurso);

  return (
    <section className="flex flex-col gap-5">
      <CabecalhoPagina titulo={titulo}>
        {hrefNovo && (
          <Link href={hrefNovo} className={buttonVariants()}>
            Novo
          </Link>
        )}
      </CabecalhoPagina>

      {placeholderBusca && (
        <Input
          type="search"
          aria-label="Buscar"
          placeholder={placeholderBusca}
          value={listagem.busca}
          onChange={(evento) => listagem.setBusca(evento.target.value)}
          className="max-w-sm"
        />
      )}

      {listagem.erro && <MensagensErro mensagens={[listagem.erro]} />}

      <Table>
        <TableHeader>
          <TableRow>
            {cabecalhos.map((cabecalho) => (
              <TableHead key={cabecalho}>{cabecalho}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {listagem.itens.map((item) => (
            <TableRow key={chave(item)}>
              {renderLinha(item).map((celula, indice) => (
                <TableCell key={cabecalhos[indice]} className="whitespace-normal">
                  {celula}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!listagem.carregando && !listagem.erro && listagem.itens.length === 0 && (
            <TableRow>
              <TableCell colSpan={cabecalhos.length} className="text-center text-muted-foreground">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {listagem.carregando && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Carregando...
        </p>
      )}

      <Paginacao
        page={listagem.page}
        totalPaginas={listagem.totalPaginas}
        total={listagem.total}
        onChange={listagem.setPage}
      />
    </section>
  );
}

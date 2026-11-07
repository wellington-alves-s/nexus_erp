"use client";

import { useEffect, useState } from "react";
import { api, mensagensDoErro, type Pagina } from "@/lib/api";

const TAMANHO_PAGINA = 20;
const ATRASO_BUSCA_MS = 300;

type Resultado<T> = { chave: string; pagina?: Pagina<T>; erro?: string };

export function useListagem<T>(recurso: string) {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState<Resultado<T>>();

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaAplicada(busca);
      setPage(1);
    }, ATRASO_BUSCA_MS);
    return () => clearTimeout(temporizador);
  }, [busca]);

  const chave = `${page}|${buscaAplicada}`;

  useEffect(() => {
    const controle = new AbortController();
    const parametros = new URLSearchParams({
      page: String(page),
      pageSize: String(TAMANHO_PAGINA),
    });
    if (buscaAplicada) parametros.set("busca", buscaAplicada);

    api<Pagina<T>>(`/${recurso}?${parametros}`, { signal: controle.signal })
      .then((pagina) => setResultado({ chave, pagina }))
      .catch((erro) => {
        if (controle.signal.aborted) return;
        setResultado({ chave, erro: mensagensDoErro(erro).join(" ") });
      });
    return () => controle.abort();
  }, [recurso, page, buscaAplicada, chave]);

  const atual = resultado?.chave === chave ? resultado : undefined;
  const total = resultado?.pagina?.total ?? 0;

  return {
    busca,
    setBusca,
    page,
    setPage,
    totalPaginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA)),
    total,
    itens: resultado?.pagina?.data ?? [],
    carregando: !atual,
    erro: atual?.erro,
  };
}

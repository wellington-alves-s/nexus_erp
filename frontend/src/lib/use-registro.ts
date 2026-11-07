"use client";

import { useEffect, useState } from "react";
import { api, mensagensDoErro } from "@/lib/api";

type Resultado<T> = { caminho: string; registro?: T; erros?: string[] };

/** Carrega um recurso da API (ex.: "produtos/123" ou "depositos"). */
export function useRegistro<T>(caminho: string) {
  const [resultado, setResultado] = useState<Resultado<T>>();

  useEffect(() => {
    const controle = new AbortController();
    api<T>(`/${caminho}`, { signal: controle.signal })
      .then((registro) => setResultado({ caminho, registro }))
      .catch((erro) => {
        if (controle.signal.aborted) return;
        setResultado({ caminho, erros: mensagensDoErro(erro) });
      });
    return () => controle.abort();
  }, [caminho]);

  const atual = resultado?.caminho === caminho ? resultado : undefined;
  return { registro: atual?.registro, erros: atual?.erros ?? [], carregando: !atual };
}

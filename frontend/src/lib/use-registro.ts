"use client";

import { useEffect, useState } from "react";
import { api, mensagensDoErro } from "@/lib/api";

type Resultado<T> = { id: string; registro?: T; erros?: string[] };

export function useRegistro<T>(recurso: string, id: string) {
  const [resultado, setResultado] = useState<Resultado<T>>();

  useEffect(() => {
    const controle = new AbortController();
    api<T>(`/${recurso}/${id}`, { signal: controle.signal })
      .then((registro) => setResultado({ id, registro }))
      .catch((erro) => {
        if (controle.signal.aborted) return;
        setResultado({ id, erros: mensagensDoErro(erro) });
      });
    return () => controle.abort();
  }, [recurso, id]);

  const atual = resultado?.id === id ? resultado : undefined;
  return { registro: atual?.registro, erros: atual?.erros ?? [], carregando: !atual };
}

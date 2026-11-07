"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListagem } from "@/lib/use-listagem";

interface SeletorBuscaProps<T extends { id: string }> {
  recurso: string;
  rotulo: string;
  rotuloDe: (item: T) => string;
  valor: T | null;
  onChange: (item: T | null) => void;
  placeholder: string;
}

function Resultados<T extends { id: string }>({
  recurso,
  rotulo,
  rotuloDe,
  onChange,
  placeholder,
}: Omit<SeletorBuscaProps<T>, "valor">) {
  const listagem = useListagem<T>(recurso, "ativo=true");
  return (
    <div className="flex flex-col gap-1">
      <Input
        type="search"
        aria-label={rotulo}
        placeholder={placeholder}
        value={listagem.busca}
        onChange={(evento) => listagem.setBusca(evento.target.value)}
      />
      <ul className="max-h-48 overflow-auto rounded-lg border">
        {listagem.itens.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="w-full px-2.5 py-1.5 text-left text-sm hover:bg-muted"
              onClick={() => onChange(item)}
            >
              {rotuloDe(item)}
            </button>
          </li>
        ))}
        {!listagem.carregando && !listagem.erro && listagem.itens.length === 0 && (
          <li className="px-2.5 py-1.5 text-sm text-muted-foreground">Nenhum resultado.</li>
        )}
        {listagem.erro && <li className="px-2.5 py-1.5 text-sm text-destructive">{listagem.erro}</li>}
      </ul>
    </div>
  );
}

/** Seleciona um registro ativo de um cadastro por busca textual. */
export function SeletorBusca<T extends { id: string }>({ valor, ...props }: SeletorBuscaProps<T>) {
  if (!valor) return <Resultados {...props} />;
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 truncate text-sm">{props.rotuloDe(valor)}</span>
      <Button type="button" variant="outline" size="sm" onClick={() => props.onChange(null)}>
        Trocar
      </Button>
    </div>
  );
}

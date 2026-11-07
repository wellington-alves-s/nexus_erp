import type { ReactNode } from "react";

interface CabecalhoPaginaProps {
  titulo: string;
  descricao?: string;
  children?: ReactNode;
}

export function CabecalhoPagina({ titulo, descricao, children }: CabecalhoPaginaProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

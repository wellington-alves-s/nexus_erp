import type { ReactNode } from "react";

/** Par rótulo e valor para blocos de dados somente leitura. */
export function Informacao({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SecaoProps {
  titulo: string;
  children: ReactNode;
  /** Classes do conteúdo; por padrão, grade de duas colunas. */
  className?: string;
}

/** Painel com título para agrupar campos ou informações relacionadas. */
export function Secao({ titulo, children, className }: SecaoProps) {
  const id = useId();
  return (
    <section role="group" aria-labelledby={id} className="rounded-lg border bg-card">
      <h2 id={id} className="border-b px-5 py-3 text-sm font-semibold">
        {titulo}
      </h2>
      <div className={cn("grid gap-4 p-5 sm:grid-cols-2", className)}>{children}</div>
    </section>
  );
}

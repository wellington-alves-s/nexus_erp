import type { Metadata } from "next";
import { Suspense } from "react";
import { ConferenciaDetalhe } from "@/features/recebimento/conferencia-detalhe";

export const metadata: Metadata = { title: "Conferência de recebimento" };

export default function ConferenciaPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
      <ConferenciaDetalhe />
    </Suspense>
  );
}

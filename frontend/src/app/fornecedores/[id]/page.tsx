import type { Metadata } from "next";
import { Suspense } from "react";
import { FornecedorEdicao } from "@/features/fornecedores/fornecedor-edicao";

export const metadata: Metadata = { title: "Editar fornecedor" };

export default function EditarFornecedorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
      <FornecedorEdicao />
    </Suspense>
  );
}

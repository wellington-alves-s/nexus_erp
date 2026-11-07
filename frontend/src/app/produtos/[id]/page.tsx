import type { Metadata } from "next";
import { Suspense } from "react";
import { ProdutoEdicao } from "@/features/produtos/produto-edicao";

export const metadata: Metadata = { title: "Editar produto" };

export default function EditarProdutoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
      <ProdutoEdicao />
    </Suspense>
  );
}

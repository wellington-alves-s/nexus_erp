import type { Metadata } from "next";
import { ProdutoFormulario } from "@/features/produtos/produto-formulario";

export const metadata: Metadata = { title: "Novo produto" };

export default function NovoProdutoPage() {
  return <ProdutoFormulario />;
}

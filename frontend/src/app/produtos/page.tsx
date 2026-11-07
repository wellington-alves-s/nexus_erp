import type { Metadata } from "next";
import { ProdutosLista } from "@/features/produtos/produtos-lista";

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage() {
  return <ProdutosLista />;
}

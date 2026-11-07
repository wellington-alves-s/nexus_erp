import type { Metadata } from "next";
import { FornecedoresLista } from "@/features/fornecedores/fornecedores-lista";

export const metadata: Metadata = { title: "Fornecedores" };

export default function FornecedoresPage() {
  return <FornecedoresLista />;
}

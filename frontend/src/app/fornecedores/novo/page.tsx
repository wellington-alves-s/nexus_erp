import type { Metadata } from "next";
import { FornecedorFormulario } from "@/features/fornecedores/fornecedor-formulario";

export const metadata: Metadata = { title: "Novo fornecedor" };

export default function NovoFornecedorPage() {
  return <FornecedorFormulario />;
}

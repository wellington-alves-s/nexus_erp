import type { Metadata } from "next";
import { EstoqueLista } from "@/features/recebimento/estoque-lista";

export const metadata: Metadata = { title: "Estoque" };

export default function EstoquePage() {
  return <EstoqueLista />;
}

"use client";

import { useParams } from "next/navigation";
import { MensagensErro } from "@/components/mensagens-erro";
import { useRegistro } from "@/lib/use-registro";
import { FornecedorFormulario } from "./fornecedor-formulario";
import type { Fornecedor } from "./tipos";

export function FornecedorEdicao() {
  const { id } = useParams<{ id: string }>();
  const { registro, erros, carregando } = useRegistro<Fornecedor>("fornecedores", id);

  if (carregando) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!registro) return <MensagensErro mensagens={erros} />;
  return <FornecedorFormulario fornecedor={registro} />;
}

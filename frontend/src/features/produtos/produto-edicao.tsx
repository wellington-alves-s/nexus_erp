"use client";

import { useParams } from "next/navigation";
import { MensagensErro } from "@/components/mensagens-erro";
import { useRegistro } from "@/lib/use-registro";
import { ProdutoFormulario } from "./produto-formulario";
import type { Produto } from "./tipos";

export function ProdutoEdicao() {
  const { id } = useParams<{ id: string }>();
  const { registro, erros, carregando } = useRegistro<Produto>("produtos", id);

  if (carregando) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!registro) return <MensagensErro mensagens={erros} />;
  return <ProdutoFormulario produto={registro} />;
}

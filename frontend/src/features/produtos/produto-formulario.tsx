"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/campo";
import { MensagensErro } from "@/components/mensagens-erro";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api, mensagensDoErro } from "@/lib/api";
import { UNIDADES, type Produto, type UnidadeMedida } from "./tipos";

export function ProdutoFormulario({ produto }: { produto?: Produto }) {
  const router = useRouter();
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [unidade, setUnidade] = useState<UnidadeMedida | "">(produto?.unidade ?? "");
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!unidade) {
      setErros(["Selecione a unidade de medida."]);
      return;
    }
    setEnviando(true);
    setErros([]);
    try {
      if (produto) {
        await api(`/produtos/${produto.id}`, {
          method: "PATCH",
          body: JSON.stringify({ nome, unidade, ativo }),
        });
      } else {
        await api("/produtos", { method: "POST", body: JSON.stringify({ nome, unidade }) });
      }
      router.push("/produtos");
    } catch (erro) {
      setErros(mensagensDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {produto ? `Produto ${produto.codigo}` : "Novo produto"}
      </h1>

      <Campo id="nome" rotulo="Nome" value={nome} onChange={setNome} maxLength={200} required />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unidade">Unidade de medida</Label>
        <Select
          value={unidade}
          onValueChange={(valor) => setUnidade((valor ?? "") as UnidadeMedida | "")}
        >
          <SelectTrigger id="unidade" className="w-40">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {UNIDADES.map((opcao) => (
              <SelectItem key={opcao} value={opcao}>
                {opcao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {produto && (
        <div className="flex items-center gap-2">
          <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
          <Label htmlFor="ativo">Ativo</Label>
        </div>
      )}

      <MensagensErro mensagens={erros} />

      <div className="flex gap-2">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/produtos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

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
import { formatarCep, formatarCnpj, formatarTelefone } from "@/lib/formatadores";
import { UFS, type Fornecedor } from "./tipos";

function estadoInicial(fornecedor?: Fornecedor) {
  return {
    razaoSocial: fornecedor?.razaoSocial ?? "",
    nomeFantasia: fornecedor?.nomeFantasia ?? "",
    cnpj: formatarCnpj(fornecedor?.cnpj ?? ""),
    email: fornecedor?.email ?? "",
    telefone: formatarTelefone(fornecedor?.telefone ?? ""),
    logradouro: fornecedor?.logradouro ?? "",
    cidade: fornecedor?.cidade ?? "",
    uf: fornecedor?.uf ?? "",
    cep: formatarCep(fornecedor?.cep ?? ""),
    contatoNome: fornecedor?.contatoNome ?? "",
    contatoEmail: fornecedor?.contatoEmail ?? "",
    contatoTelefone: formatarTelefone(fornecedor?.contatoTelefone ?? ""),
  };
}

type Dados = ReturnType<typeof estadoInicial>;

export function FornecedorFormulario({ fornecedor }: { fornecedor?: Fornecedor }) {
  const router = useRouter();
  const [dados, setDados] = useState<Dados>(() => estadoInicial(fornecedor));
  const [ativo, setAtivo] = useState(fornecedor?.ativo ?? true);
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo: keyof Dados, formatar?: (valor: string) => string) => (valor: string) =>
    setDados((atual) => ({ ...atual, [campo]: formatar ? formatar(valor) : valor }));

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErros([]);
    try {
      if (fornecedor) {
        await api(`/fornecedores/${fornecedor.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...dados, ativo }),
        });
      } else {
        await api("/fornecedores", { method: "POST", body: JSON.stringify(dados) });
      }
      router.push("/fornecedores");
    } catch (erro) {
      setErros(mensagensDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {fornecedor ? "Editar fornecedor" : "Novo fornecedor"}
      </h1>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-medium">Dados gerais</legend>
        <Campo id="razaoSocial" rotulo="Razão social" value={dados.razaoSocial} onChange={alterar("razaoSocial")} maxLength={200} required />
        <Campo id="nomeFantasia" rotulo="Nome fantasia" value={dados.nomeFantasia} onChange={alterar("nomeFantasia")} maxLength={200} />
        <Campo id="cnpj" rotulo="CNPJ" value={dados.cnpj} onChange={alterar("cnpj", formatarCnpj)} inputMode="text" required />
        <Campo id="email" rotulo="E-mail" type="email" value={dados.email} onChange={alterar("email")} maxLength={254} />
        <Campo id="telefone" rotulo="Telefone" type="tel" value={dados.telefone} onChange={alterar("telefone", formatarTelefone)} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-medium">Endereço</legend>
        <Campo id="logradouro" rotulo="Logradouro" value={dados.logradouro} onChange={alterar("logradouro")} maxLength={200} className="sm:col-span-2" />
        <Campo id="cidade" rotulo="Cidade" value={dados.cidade} onChange={alterar("cidade")} maxLength={100} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="uf">UF</Label>
          <Select value={dados.uf} onValueChange={(valor) => alterar("uf")(valor ?? "")}>
            <SelectTrigger id="uf" className="w-24">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {UFS.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Campo id="cep" rotulo="CEP" value={dados.cep} onChange={alterar("cep", formatarCep)} inputMode="numeric" />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-medium">Contato responsável</legend>
        <Campo id="contatoNome" rotulo="Nome" value={dados.contatoNome} onChange={alterar("contatoNome")} maxLength={200} className="sm:col-span-2" />
        <Campo id="contatoEmail" rotulo="E-mail" type="email" value={dados.contatoEmail} onChange={alterar("contatoEmail")} maxLength={254} />
        <Campo id="contatoTelefone" rotulo="Telefone" type="tel" value={dados.contatoTelefone} onChange={alterar("contatoTelefone", formatarTelefone)} />
      </fieldset>

      {fornecedor && (
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
        <Button type="button" variant="outline" onClick={() => router.push("/fornecedores")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/campo";
import { MensagensErro } from "@/components/mensagens-erro";
import { SeletorBusca } from "@/components/seletor-busca";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Fornecedor } from "@/features/fornecedores/tipos";
import type { Produto } from "@/features/produtos/tipos";
import { api, mensagensDoErro } from "@/lib/api";
import { formatarCnpj } from "@/lib/formatadores";
import { useRegistro } from "@/lib/use-registro";
import type { Deposito, PedidoCompra } from "./tipos";

interface LinhaItem {
  chave: number;
  produto: Produto | null;
  quantidade: string;
  preco: string;
}

let proximaChave = 0;
const novaLinha = (): LinhaItem => ({ chave: proximaChave++, produto: null, quantidade: "", preco: "" });

export function PedidoFormulario() {
  const router = useRouter();
  const { registro: depositos = [] } = useRegistro<Deposito[]>("depositos");
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [depositoEscolhido, setDepositoEscolhido] = useState("");
  const [linhas, setLinhas] = useState<LinhaItem[]>(() => [novaLinha()]);
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Com um único depósito ativo, ele é assumido.
  const depositoId = depositoEscolhido || (depositos.length === 1 ? depositos[0].id : "");

  const alterarLinha = (chave: number, dados: Partial<LinhaItem>) =>
    setLinhas((atuais) => atuais.map((linha) => (linha.chave === chave ? { ...linha, ...dados } : linha)));

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const pendencias: string[] = [];
    if (!fornecedor) pendencias.push("Selecione o fornecedor.");
    if (!depositoId) pendencias.push("Selecione o depósito.");
    if (linhas.some((linha) => !linha.produto)) pendencias.push("Selecione o produto de todos os itens.");
    if (pendencias.length > 0 || !fornecedor) {
      setErros(pendencias);
      return;
    }

    setEnviando(true);
    setErros([]);
    try {
      const pedido = await api<PedidoCompra>("/pedidos-compra", {
        method: "POST",
        body: JSON.stringify({
          fornecedorId: fornecedor.id,
          depositoId,
          itens: linhas.map((linha) => ({
            produtoId: linha.produto?.id,
            quantidade: Number(linha.quantidade),
            precoUnitario: Number(linha.preco),
          })),
        }),
      });
      router.push(`/pedidos-compra/${pedido.id}`);
    } catch (erro) {
      setErros(mensagensDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Novo pedido de compra</h1>

      <div className="flex flex-col gap-1.5">
        <Label>Fornecedor</Label>
        <SeletorBusca<Fornecedor>
          recurso="fornecedores"
          rotulo="Buscar fornecedor"
          placeholder="Buscar por razão social ou CNPJ"
          rotuloDe={(item) => `${item.razaoSocial} (${formatarCnpj(item.cnpj)})`}
          valor={fornecedor}
          onChange={setFornecedor}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deposito">Depósito</Label>
        <Select
          value={depositoId}
          onValueChange={(valor) => setDepositoEscolhido(valor ?? "")}
          items={depositos.map((deposito) => ({ value: deposito.id, label: deposito.nome }))}
        >
          <SelectTrigger id="deposito" className="w-64">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {depositos.map((deposito) => (
              <SelectItem key={deposito.id} value={deposito.id}>
                {deposito.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-medium">Itens</legend>
        {linhas.map((linha, indice) => (
          <div key={linha.chave} className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <div className="flex flex-col gap-1.5">
              <Label>Produto {indice + 1}</Label>
              <SeletorBusca<Produto>
                recurso="produtos"
                rotulo={`Buscar produto ${indice + 1}`}
                placeholder="Buscar por código ou nome"
                rotuloDe={(item) => `${item.codigo} - ${item.nome} (${item.unidade})`}
                valor={linha.produto}
                onChange={(produto) => alterarLinha(linha.chave, { produto })}
              />
            </div>
            <Campo
              id={`quantidade-${linha.chave}`}
              rotulo="Quantidade"
              type="number"
              min="0"
              step="0.001"
              required
              value={linha.quantidade}
              onChange={(quantidade) => alterarLinha(linha.chave, { quantidade })}
            />
            <Campo
              id={`preco-${linha.chave}`}
              rotulo="Preço unitário (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              value={linha.preco}
              onChange={(preco) => alterarLinha(linha.chave, { preco })}
            />
            <Button
              type="button"
              variant="outline"
              disabled={linhas.length === 1}
              onClick={() => setLinhas((atuais) => atuais.filter((atual) => atual.chave !== linha.chave))}
            >
              Remover
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" className="self-start" onClick={() => setLinhas((atuais) => [...atuais, novaLinha()])}>
          Adicionar item
        </Button>
      </fieldset>

      <MensagensErro mensagens={erros} />

      <div className="flex gap-2">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Criar pedido"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/pedidos-compra")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

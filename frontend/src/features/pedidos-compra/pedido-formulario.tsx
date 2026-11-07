"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Campo } from "@/components/campo";
import { MensagensErro } from "@/components/mensagens-erro";
import { Secao } from "@/components/secao";
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

const novaLinha = (chave: number): LinhaItem => ({
  chave,
  produto: null,
  quantidade: "",
  preco: "",
});

export function PedidoFormulario() {
  const router = useRouter();
  const { registro: depositos = [] } = useRegistro<Deposito[]>("depositos");
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [depositoEscolhido, setDepositoEscolhido] = useState("");
  // O contador fica no componente (e não no módulo) para que servidor e navegador gerem as mesmas chaves.
  const proximaChave = useRef(1);
  const [linhas, setLinhas] = useState<LinhaItem[]>(() => [novaLinha(0)]);
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Com um único depósito ativo, ele é assumido.
  const depositoId = depositoEscolhido || (depositos.length === 1 ? depositos[0].id : "");

  const alterarLinha = (chave: number, dados: Partial<LinhaItem>) =>
    setLinhas((atuais) =>
      atuais.map((linha) => (linha.chave === chave ? { ...linha, ...dados } : linha)),
    );

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const pendencias: string[] = [];
    if (!fornecedor) pendencias.push("Selecione o fornecedor.");
    if (!depositoId) pendencias.push("Selecione o depósito.");
    if (linhas.some((linha) => !linha.produto))
      pendencias.push("Selecione o produto de todos os itens.");
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
    <form onSubmit={enviar} className="flex max-w-4xl flex-col gap-5">
      <CabecalhoPagina titulo="Novo pedido de compra" />

      <Secao titulo="Dados do pedido">
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
            <SelectTrigger id="deposito" className="w-full">
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
      </Secao>

      <Secao titulo="Itens" className="sm:grid-cols-1">
        {linhas.map((linha, indice) => (
          <div
            key={linha.chave}
            className="grid items-end gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="flex flex-col gap-1.5 sm:col-span-3">
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
              onClick={() =>
                setLinhas((atuais) => atuais.filter((atual) => atual.chave !== linha.chave))
              }
            >
              Remover
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          onClick={() => setLinhas((atuais) => [...atuais, novaLinha(proximaChave.current++)])}
        >
          Adicionar item
        </Button>
      </Secao>

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

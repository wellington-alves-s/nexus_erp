import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";

const MODULOS = [
  { href: "/produtos", titulo: "Produtos", descricao: "Cadastro, consulta e edição de produtos." },
  {
    href: "/fornecedores",
    titulo: "Fornecedores",
    descricao: "Cadastro, consulta e edição de fornecedores.",
  },
  {
    href: "/pedidos-compra",
    titulo: "Pedidos de compra",
    descricao: "Criação de pedidos e acompanhamento do recebimento.",
  },
  { href: "/estoque", titulo: "Estoque", descricao: "Saldo por produto e depósito." },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo="NEXUS ERP" descricao="Gestão de compras, recebimento e estoque." />
      <div className="grid gap-4 sm:grid-cols-2">
        {MODULOS.map(({ href, titulo, descricao }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <h2 className="font-medium">{titulo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

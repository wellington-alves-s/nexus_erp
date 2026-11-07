"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/produtos", rotulo: "Produtos" },
  { href: "/fornecedores", rotulo: "Fornecedores" },
  { href: "/pedidos-compra", rotulo: "Pedidos de compra" },
  { href: "/estoque", rotulo: "Estoque" },
];

export function Navegacao() {
  const caminho = usePathname();
  return (
    <header className="border-b bg-card">
      <nav className="mx-auto flex h-14 max-w-6xl items-stretch gap-8 px-6">
        <Link href="/" className="flex items-center text-sm font-semibold tracking-wide">
          NEXUS ERP
        </Link>
        <div className="flex items-stretch gap-6">
          {LINKS.map(({ href, rotulo }) => (
            <Link
              key={href}
              href={href}
              aria-current={caminho.startsWith(href) ? "page" : undefined}
              className="flex items-center border-b-2 border-transparent text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:font-medium aria-[current=page]:text-foreground"
            >
              {rotulo}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

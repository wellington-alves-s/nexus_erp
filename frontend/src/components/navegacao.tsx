"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/produtos", rotulo: "Produtos" },
  { href: "/fornecedores", rotulo: "Fornecedores" },
];

export function Navegacao() {
  const caminho = usePathname();
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          NEXUS ERP
        </Link>
        {LINKS.map(({ href, rotulo }) => (
          <Link
            key={href}
            href={href}
            aria-current={caminho.startsWith(href) ? "page" : undefined}
            className="text-sm text-muted-foreground hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
          >
            {rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}

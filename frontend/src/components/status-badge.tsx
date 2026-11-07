import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export type TomStatus = "success" | "info" | "warning" | "neutral";

export function EtiquetaStatus({ tom, children }: { tom: TomStatus; children: ReactNode }) {
  return <Badge variant={tom}>{children}</Badge>;
}

export function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <EtiquetaStatus tom={ativo ? "success" : "neutral"}>
      {ativo ? "Ativo" : "Inativo"}
    </EtiquetaStatus>
  );
}

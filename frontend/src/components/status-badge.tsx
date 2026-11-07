import { Badge } from "@/components/ui/badge";

export function StatusBadge({ ativo }: { ativo: boolean }) {
  return <Badge variant={ativo ? "default" : "secondary"}>{ativo ? "Ativo" : "Inativo"}</Badge>;
}

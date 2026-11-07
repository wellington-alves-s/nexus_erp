import { Button } from "@/components/ui/button";

interface PaginacaoProps {
  page: number;
  totalPaginas: number;
  total: number;
  onChange: (page: number) => void;
}

export function Paginacao({ page, totalPaginas, total, onChange }: PaginacaoProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{total} {total === 1 ? "registro" : "registros"}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {page} de {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPaginas}
          onClick={() => onChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

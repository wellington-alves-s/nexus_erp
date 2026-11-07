import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CampoProps extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  id: string;
  rotulo: string;
  onChange: (valor: string) => void;
}

export function Campo({ id, rotulo, onChange, className, ...props }: CampoProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{rotulo}</Label>
      <Input id={id} onChange={(evento) => onChange(evento.target.value)} {...props} />
    </div>
  );
}

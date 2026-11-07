export function MensagensErro({ mensagens }: { mensagens: string[] }) {
  if (mensagens.length === 0) return null;
  return (
    <ul
      role="alert"
      className="list-disc rounded-lg border border-destructive/30 bg-destructive/10 py-3 pr-4 pl-8 text-sm text-destructive"
    >
      {mensagens.map((mensagem) => (
        <li key={mensagem}>{mensagem}</li>
      ))}
    </ul>
  );
}

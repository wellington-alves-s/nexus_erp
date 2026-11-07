const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface Pagina<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages.join("; "));
  }
}

async function lerMensagens(resposta: Response): Promise<string[]> {
  try {
    const corpo: { message?: string | string[] } = await resposta.json();
    if (Array.isArray(corpo.message)) return corpo.message;
    if (corpo.message) return [corpo.message];
  } catch {
    // corpo ausente ou fora do formato esperado
  }
  return ["Não foi possível concluir a operação."];
}

export async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ApiError(0, ["Não foi possível conectar à API."]);
  }
  if (!resposta.ok) {
    throw new ApiError(resposta.status, await lerMensagens(resposta));
  }
  return resposta.json();
}

export function mensagensDoErro(erro: unknown): string[] {
  return erro instanceof ApiError
    ? erro.messages
    : ["Não foi possível concluir a operação."];
}

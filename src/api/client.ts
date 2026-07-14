const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3003';

const TOKEN_KEY = 'capela.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Erro da API. O backend sempre responde `{ mensagem }`. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  /** Token expirado derruba a sessão. Desligue no login/cadastro. */
  deslogarNo401?: boolean;
}

async function request(caminho: string, opcoes: Opcoes = {}): Promise<Response> {
  const { metodo = 'GET', corpo, deslogarNo401 = true } = opcoes;
  const token = getToken();

  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  if (resposta.ok) return resposta;

  if (resposta.status === 401 && deslogarNo401 && token) {
    setToken(null);
    window.location.href = '/login';
  }

  let mensagem = 'Não foi possível falar com o servidor.';
  try {
    const dados = await resposta.json();
    if (typeof dados?.mensagem === 'string') mensagem = dados.mensagem;
  } catch {
    // resposta sem corpo JSON — fica a mensagem genérica
  }

  throw new ApiError(resposta.status, mensagem);
}

/** Chamada que devolve JSON. Use `api<Tipo>('/rota')`. */
export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const resposta = await request(caminho, opcoes);
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

/** Chamada que devolve arquivo — o `.docx` do relatório é autenticado. */
export async function apiBlob(caminho: string): Promise<Blob> {
  const resposta = await request(caminho);
  return resposta.blob();
}

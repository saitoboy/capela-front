// Espelho dos tipos públicos do backend (D:\capela — src/types/index.ts).
// Diferença: as datas chegam como string ISO, porque passaram por JSON.

export type Curso = 'TEOLOGIA';

export interface Usuario {
  ra: string;
  nome: string;
  email: string;
  curso: Curso;
  isAdmin: boolean;
  /** Só vem no GET /auth/me — login e register devolvem o usuário sem ela. */
  createdAt?: string;
}

export interface AuthResposta {
  token: string;
  usuario: Usuario;
}

// ── Persona ───────────────────────────────────────────────────────────────────

export type MbtiTipo =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface Persona {
  id: string;
  alunoRa: string;
  tipo: MbtiTipo;
  nome: string;
  tom: string;
  updatedAt: string;
}

export interface PersonaPergunta {
  id: number;
  pergunta: string;
  opcaoA: string;
  opcaoB: string;
}

export type Resposta = 'A' | 'B';

// ── Semestre ──────────────────────────────────────────────────────────────────

export interface Semestre {
  id: string;
  label: string;
  publishedAfter: string;
  publishedBefore: string;
  ativo: boolean;
  createdAt: string;
}

// ── Capela ────────────────────────────────────────────────────────────────────

export interface Sinopse {
  id: string;
  capelaId: string;
  texto: string;
  geradoEm: string;
}

export interface Capela {
  id: string;
  semestreId: string;
  indice: number;
  data: string;
  videoId: string | null;
  url: string | null;
  // null = a IA não extraiu; falta o admin preencher à mão. Na tela vira "—".
  textoBiblico: string | null;
  tema: string | null;
  pregador: string | null;
  source: string;
  createdAt: string;
  sinopse?: Sinopse | null;
}

// ── Coleta (job em background) ────────────────────────────────────────────────

export type StatusColeta = 'GERANDO' | 'CONCLUIDO' | 'ERRO';

export interface ColetaItem {
  indice: number;
  tema: string | null;
  source: string;
  faltando: string[];
  erro?: string;
}

export interface Coleta {
  id: string;
  semestreId: string;
  status: StatusColeta;
  etapa: string | null;
  total: number;
  processadas: number;
  inseridas: number;
  atualizadas: number;
  ignorados: number;
  itens: ColetaItem[];
  erroMsg: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Chaves da Groq ────────────────────────────────────────────────────────────

export type GroqKeyStatus = 'ATIVA' | 'ESGOTADA' | 'INVALIDA';

export interface GroqKey {
  id: string;
  label: string;
  preview: string; // "gsk_…4f2a" — a chave em si nunca volta da API
  status: GroqKeyStatus;
  resetAt: string | null;
  lastUsedAt: string | null;
  erroMsg: string | null;
  criadoPor: string;
  createdAt: string;
}

// ── Relatório ─────────────────────────────────────────────────────────────────

export type StatusRelatorio = 'PENDENTE' | 'GERANDO' | 'CONCLUIDO' | 'ERRO';

export interface Relatorio {
  id: string;
  alunoRa: string;
  semestreId: string;
  personaTipo: string;
  personaNome: string;
  focoCriativo: string | null;
  reflexaoTeologica: string | null;
  analiseLiturgica: string | null;
  status: StatusRelatorio;
  erroMsg: string | null;
  createdAt: string;
  updatedAt: string;
}

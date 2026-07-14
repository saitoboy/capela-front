import { createContext, useContext } from 'react';
import type { Curso, Usuario } from '../api/types';

export interface CadastroDados {
  ra: string;
  nome: string;
  email: string;
  senha: string;
  confirmSenha: string;
  curso: Curso;
}

export interface AuthValor {
  usuario: Usuario | null;
  /** true enquanto a sessão do localStorage é revalidada no boot. */
  carregando: boolean;
  entrar: (ra: string, senha: string) => Promise<void>;
  cadastrar: (dados: CadastroDados) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<AuthValor | null>(null);

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return valor;
}

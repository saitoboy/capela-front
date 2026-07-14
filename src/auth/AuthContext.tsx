import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getToken, setToken } from '../api/client';
import type { AuthResposta, Usuario } from '../api/types';
import { AuthContext } from './context';
import type { AuthValor } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Recarregar a página não pode perder a sessão: com token guardado,
  // busca o usuário de novo. Token morto derruba a sessão.
  useEffect(() => {
    if (!getToken()) {
      setCarregando(false);
      return;
    }

    api<Usuario>('/auth/me', { deslogarNo401: false })
      .then(setUsuario)
      .catch(() => setToken(null))
      .finally(() => setCarregando(false));
  }, []);

  async function autenticar(caminho: string, corpo: unknown) {
    const dados = await api<AuthResposta>(caminho, {
      metodo: 'POST',
      corpo,
      deslogarNo401: false,
    });
    setToken(dados.token);
    setUsuario(dados.usuario);
  }

  const valor: AuthValor = {
    usuario,
    carregando,
    entrar: (ra, senha) => autenticar('/auth/login', { ra, senha }),
    cadastrar: (dados) => autenticar('/auth/register', dados),
    sair: () => {
      setToken(null);
      setUsuario(null);
    },
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import { useAuth } from '../auth/context';
import logo from '../assets/capela-logotipo.svg';

export default function Login() {
  const { usuario, carregando, entrar } = useAuth();
  const navigate = useNavigate();

  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await entrar(ra, senha);
      navigate('/', { replace: true });
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  // Enquanto a sessão guardada é revalidada, não faz sentido piscar o formulário.
  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4">
      <div className="mb-10 flex flex-col items-center text-center">
        <img
          src={logo}
          alt="Capela"
          className="mb-3 w-64 max-w-full"
        />
        <p className="text-sm text-muted">Relatórios de capela</p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Input
          label="RA"
          inputMode="numeric"
          autoComplete="username"
          placeholder="251000841"
          value={ra}
          onChange={(e) => setRa(e.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && (
          <p
            role="alert"
            className="rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {erro}
          </p>
        )}

        <Button type="submit" loading={enviando} icone={<ArrowRight size={18} />}>
          Entrar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-lime">
          Criar
        </Link>
      </p>
    </div>
  );
}

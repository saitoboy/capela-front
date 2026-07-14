import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import { useAuth } from '../auth/context';

export default function Cadastro() {
  const { usuario, carregando, cadastrar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [ra, setRa] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Confere no cliente: uma senha digitada errada não precisa de ida e volta na rede.
  const senhasDivergem = confirmSenha.length > 0 && senha !== confirmSenha;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (senhasDivergem) return;

    setErro('');
    setEnviando(true);

    try {
      await cadastrar({ nome, ra, email, senha, confirmSenha, curso: 'TEOLOGIA' });
      navigate('/', { replace: true });
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 pb-8">
      <header className="pt-topo pb-4">
        <Link
          to="/login"
          aria-label="Voltar"
          className="-ml-2 inline-block p-2 text-muted hover:text-white"
        >
          <ArrowLeft size={22} />
        </Link>
      </header>

      <h1 className="mb-6 text-xl font-semibold">Criar conta</h1>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Input
          label="Nome"
          autoComplete="name"
          placeholder="Débora Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="debora@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirmSenha}
          onChange={(e) => setConfirmSenha(e.target.value)}
          erro={senhasDivergem ? 'As senhas não coincidem.' : undefined}
          required
        />

        {/* O enum do backend só tem TEOLOGIA — é campo fixo, não um select de um item. */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Curso</span>
          <div className="flex items-center justify-between rounded-btn border border-line bg-surface px-3 py-3">
            <span className="text-base">TEOLOGIA</span>
            <Lock size={16} className="text-muted" />
          </div>
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {erro}
          </p>
        )}

        <Button
          type="submit"
          loading={enviando}
          disabled={senhasDivergem}
          icone={<ArrowRight size={18} />}
        >
          Criar conta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-lime">
          Entrar
        </Link>
      </p>
    </div>
  );
}

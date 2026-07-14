import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MbtiTipo, Persona } from '../api/types';
import Spinner from '../components/Spinner';
import { MBTI } from '../lib/mbti';
import { cn } from '../lib/utils';

export default function PersonaEscolher() {
  const navigate = useNavigate();
  const [atual, setAtual] = useState<MbtiTipo | null>(null);
  const [salvando, setSalvando] = useState<MbtiTipo | null>(null);
  const [erro, setErro] = useState('');

  // Só para marcar o tipo atual na grade. Sem persona (404) não é problema aqui.
  useEffect(() => {
    api<Persona>('/persona/me')
      .then((p) => setAtual(p.tipo))
      .catch(() => setAtual(null));
  }, []);

  async function escolher(tipo: MbtiTipo) {
    if (salvando) return;

    setSalvando(tipo);
    setErro('');

    try {
      await api<Persona>('/persona/preset', { metodo: 'POST', corpo: { tipo } });
      navigate('/persona', { replace: true });
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Escolher tipo</h1>
        <p className="text-sm text-muted">Toque no seu tipo MBTI.</p>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="grid grid-cols-2 gap-3">
        {MBTI.map(({ tipo, nome }) => (
          <button
            key={tipo}
            type="button"
            onClick={() => escolher(tipo)}
            disabled={!!salvando}
            className={cn(
              'flex flex-col rounded-card border bg-surface p-3 text-left transition-colors',
              'disabled:opacity-60',
              tipo === atual ? 'border-lime' : 'border-line hover:border-lime/40',
            )}
          >
            <span className="flex items-center justify-between">
              <span className="text-lg font-semibold text-lime">{tipo}</span>
              {salvando === tipo ? (
                <Spinner className="size-3 text-lime" />
              ) : (
                tipo === atual && <span className="size-2 rounded-full bg-lime" />
              )}
            </span>
            <span className="text-xs text-muted">{nome}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted">
        Não sabe seu tipo?{' '}
        <Link to="/persona/teste" className="font-semibold text-lime">
          Fazer o teste
        </Link>
      </p>
    </div>
  );
}

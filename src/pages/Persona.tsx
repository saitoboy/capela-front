import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ApiError, api } from '../api/client';
import type { Persona as PersonaTipo } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import PersonaCard from '../components/PersonaCard';

type Estado = 'carregando' | 'pronto' | 'erro';

export default function Persona() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PersonaTipo | null>(null);
  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');

  const buscar = useCallback(() => {
    setEstado('carregando');

    api<PersonaTipo>('/persona/me')
      .then((p) => {
        setPersona(p);
        setEstado('pronto');
      })
      .catch((e: unknown) => {
        // 404 é "ainda não definiu", não é falha — é um estado legítimo da tela.
        if (e instanceof ApiError && e.status === 404) {
          setPersona(null);
          setEstado('pronto');
          return;
        }
        setErro((e as Error).message);
        setEstado('erro');
      });
  }, []);

  useEffect(buscar, [buscar]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Persona</h1>

      {estado === 'carregando' && (
        <div className="h-44 animate-pulse rounded-card border border-line bg-surface" />
      )}

      {estado === 'erro' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-danger">{erro}</p>
          <Button variante="outline" onClick={buscar}>
            Tentar de novo
          </Button>
        </div>
      )}

      {estado === 'pronto' && (
        <>
          {persona ? (
            <PersonaCard persona={persona} />
          ) : (
            <Card className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-5xl font-semibold text-muted">?</p>
              <p className="text-base font-semibold">Você ainda não tem persona</p>
            </Card>
          )}

          <p className="text-sm text-muted">
            Sua persona define o tom com que a IA escreve o seu relatório.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/persona/teste')}
              icone={<ArrowRight size={18} />}
            >
              {persona ? 'Refazer o teste' : 'Fazer o teste'}
            </Button>

            <Button variante="outline" onClick={() => navigate('/persona/escolher')}>
              {persona ? 'Escolher outro tipo' : 'Escolher meu tipo'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

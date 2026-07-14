import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { Persona, PersonaPergunta, Resposta } from '../api/types';
import Button from '../components/Button';
import PersonaCard from '../components/PersonaCard';
import Spinner from '../components/Spinner';
import { cn } from '../lib/utils';

export default function PersonaTeste() {
  const navigate = useNavigate();

  const [perguntas, setPerguntas] = useState<PersonaPergunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [escolhida, setEscolhida] = useState<Resposta | null>(null);
  const [resultado, setResultado] = useState<Persona | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // As 8 perguntas vêm da API (GET /persona/perguntas, público) — não são
  // duplicadas aqui, senão saem do compasso com a derivação do tipo no backend.
  useEffect(() => {
    api<PersonaPergunta[]>('/persona/perguntas')
      .then(setPerguntas)
      .catch((e: Error) => setErro(e.message));
  }, []);

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function enviar(todas: Resposta[]) {
    setEnviando(true);
    setErro('');

    try {
      const persona = await api<Persona>('/persona/teste', {
        metodo: 'POST',
        corpo: { respostas: todas },
      });
      setResultado(persona);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function responder(resposta: Resposta) {
    if (escolhida) return; // já está avançando — ignora toque duplo

    setEscolhida(resposta);

    // Refazer uma pergunta anterior sobrescreve a resposta dali para a frente.
    const todas: Resposta[] = [...respostas.slice(0, indice), resposta];
    setRespostas(todas);

    // A borda acende em lima por um instante antes de a tela virar.
    timer.current = window.setTimeout(() => {
      setEscolhida(null);
      if (todas.length === perguntas.length) enviar(todas);
      else setIndice((i) => i + 1);
    }, 150);
  }

  function voltar() {
    if (indice === 0) navigate('/persona');
    else setIndice((i) => i - 1);
  }

  // ── Resultado ───────────────────────────────────────────────────────────────

  if (resultado) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4 py-8 text-center">
        <Sparkles size={32} className="mx-auto text-lime" />

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">Sua persona é</p>
          <PersonaCard persona={resultado} />
        </div>

        <p className="text-sm text-muted">
          É esse o tom que a IA vai usar no seu relatório.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/persona')} icone={<ArrowRight size={18} />}>
            Concluir
          </Button>

          <Link to="/persona/escolher" className="text-sm font-semibold text-lime">
            Escolher outro tipo
          </Link>
        </div>
      </div>
    );
  }

  // ── Enviando / carregando ───────────────────────────────────────────────────

  const pergunta = perguntas[indice];

  if (enviando || !pergunta) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        {erro ? (
          <>
            <p className="text-center text-sm text-danger">{erro}</p>
            <Button variante="outline" className="w-auto px-6" onClick={() => navigate('/persona')}>
              Voltar
            </Button>
          </>
        ) : (
          <>
            <Spinner />
            {enviando && <p className="text-sm text-muted">Definindo sua persona…</p>}
          </>
        )}
      </div>
    );
  }

  // ── Pergunta ────────────────────────────────────────────────────────────────

  const progresso = ((indice + 1) / perguntas.length) * 100;

  const opcoes: { letra: Resposta; texto: string }[] = [
    { letra: 'A', texto: pergunta.opcaoA },
    { letra: 'B', texto: pergunta.opcaoB },
  ];

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 pb-8">
      <header className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={voltar}
            aria-label="Voltar"
            className="-ml-2 p-2 text-muted hover:text-white"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="text-sm text-muted">
            {indice + 1} / {perguntas.length}
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-lime transition-[width] duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <h1 className="text-xl font-semibold">{pergunta.pergunta}</h1>

        <div className="flex flex-col gap-3">
          {opcoes.map(({ letra, texto }) => (
            <button
              key={letra}
              type="button"
              onClick={() => responder(letra)}
              className={cn(
                'rounded-card border bg-surface p-4 text-left transition-colors',
                escolhida === letra ? 'border-lime' : 'border-line hover:border-lime/40',
              )}
            >
              <span className="text-sm font-semibold text-lime">{letra}</span>
              <p className="mt-1 text-base">{texto}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={voltar}
        className="py-2 text-center text-sm text-muted hover:text-white"
      >
        Voltar
      </button>
    </div>
  );
}

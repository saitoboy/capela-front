import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Lock } from 'lucide-react';
import { ApiError, api } from '../api/client';
import type { Capela, Persona, Relatorio, Semestre } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { baixarRelatorio } from '../lib/download';

type Estado = 'carregando' | 'pronto' | 'erro';

/** Enquanto está numa dessas, o servidor ainda está trabalhando — segue o polling. */
const EM_ANDAMENTO = ['PENDENTE', 'GERANDO'];

export default function Inicio() {
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState<Semestre | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [capelas, setCapelas] = useState<Capela[]>([]);

  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');

    try {
      // Sem semestre ativo (404) não há o que mostrar — é o eixo da tela toda.
      const ativo = await api<Semestre>('/semestre/ativo');
      setSemestre(ativo);

      const [p, rs, cs] = await Promise.all([
        // 404 aqui é "ainda não definiu", não é falha.
        api<Persona>('/persona/me').catch((e: unknown) => {
          if (e instanceof ApiError && e.status === 404) return null;
          throw e;
        }),
        api<Relatorio[]>('/relatorio/me'),
        api<Capela[]>(`/capela?semestreId=${ativo.id}`),
      ]);

      setPersona(p);
      setCapelas(cs);
      // Um relatório por (aluno, semestre) — o deste semestre é o que a tela trata.
      setRelatorio(rs.find((r) => r.semestreId === ativo.id) ?? null);
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  // ── Polling ─────────────────────────────────────────────────────────────────
  // O job roda no servidor e sobrevive à navegação; aqui só perguntamos como vai.

  const idEmAndamento =
    relatorio && EM_ANDAMENTO.includes(relatorio.status) ? relatorio.id : null;

  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!idEmAndamento) return;

    timer.current = window.setInterval(() => {
      api<Relatorio>(`/relatorio/${idEmAndamento}`)
        .then(setRelatorio)
        .catch(() => {
          /* falha de rede pontual: o próximo tick tenta de novo */
        });
    }, 3000);

    return () => window.clearInterval(timer.current);
  }, [idEmAndamento]);

  // ── Ações ───────────────────────────────────────────────────────────────────

  async function gerar() {
    if (!semestre) return;

    setGerando(true);
    setErro('');
    setConfirmando(false);

    try {
      const novo = await api<Relatorio>('/relatorio/gerar', {
        metodo: 'POST',
        corpo: { semestreId: semestre.id },
      });
      setRelatorio(novo); // já vem GERANDO — o polling assume daqui
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setGerando(false);
    }
  }

  async function baixar() {
    if (!relatorio || !semestre) return;

    setBaixando(true);
    setErro('');

    try {
      await baixarRelatorio(relatorio.id, `Relatório — ${semestre.label}`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setBaixando(false);
    }
  }

  // ── Estados da tela ─────────────────────────────────────────────────────────

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (estado === 'erro') {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="text-sm text-danger">{erro}</p>
        <Button variante="outline" onClick={() => void buscar()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Persona ── */}
      <Card className="flex flex-col gap-1">
        <p className="text-xs tracking-widest text-muted">SUA PERSONA</p>

        {persona ? (
          <>
            <p className="text-3xl font-semibold text-lime">{persona.tipo}</p>
            <p className="font-semibold">{persona.nome}</p>
            <p className="text-sm text-muted">{persona.tom}</p>
            <button
              type="button"
              onClick={() => navigate('/persona')}
              className="mt-2 self-end text-sm font-semibold text-lime"
            >
              Trocar →
            </button>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-muted">?</p>
            <p className="text-sm text-muted">Nenhuma definida</p>
            <Button
              className="mt-3"
              onClick={() => navigate('/persona')}
              icone={<ArrowRight size={18} />}
            >
              Definir persona
            </Button>
          </>
        )}
      </Card>

      {/* ── Relatório: os cinco estados ── */}
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-widest text-muted">RELATÓRIO</p>
          {!persona && <Lock size={14} className="text-muted" />}
          {relatorio && persona && <StatusPill status={relatorio.status} />}
        </div>

        {/* 1 · Bloqueado — a persona é pré-requisito; o backend recusa com 422 */}
        {!persona && (
          <>
            <p className="text-sm text-muted">
              Defina sua persona para gerar o relatório.
            </p>
            <Button className="mt-3" disabled>
              Gerar relatório
            </Button>
          </>
        )}

        {/* 2 · Pronto para gerar */}
        {persona && !relatorio && (
          <>
            <p className="font-semibold">{semestre?.label}</p>
            <p className="text-sm text-muted">
              {capelas.length} capelas · {persona.tipo}
            </p>
            <Button
              className="mt-3"
              loading={gerando}
              onClick={() => void gerar()}
              icone={<ArrowRight size={18} />}
            >
              Gerar relatório
            </Button>
          </>
        )}

        {persona && relatorio && (
          <>
            {/* 3 · Gerando */}
            {EM_ANDAMENTO.includes(relatorio.status) && (
              <>
                <p className="text-sm text-muted">
                  Leva cerca de 1 minuto. Pode sair desta tela.
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                  <div className="animate-indeterminate h-full w-1/3 rounded-full bg-lime" />
                </div>
              </>
            )}

            {/* 4 · Concluído */}
            {relatorio.status === 'CONCLUIDO' && (
              <>
                <p className="text-sm text-muted">
                  {relatorio.personaTipo}
                  {relatorio.focoCriativo && ` · foco ${relatorio.focoCriativo}`}
                </p>

                <Button
                  className="mt-3"
                  loading={baixando}
                  onClick={() => void baixar()}
                  icone={<Download size={18} />}
                >
                  Baixar .docx
                </Button>

                {/* Gerar de novo sobrescreve o anterior — o aluno precisa saber. */}
                {confirmando ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-sm text-muted">
                      Isso substitui o relatório atual. O texto de agora se perde.
                    </p>
                    <Button loading={gerando} onClick={() => void gerar()}>
                      Sim, gerar de novo
                    </Button>
                    <Button variante="ghost" onClick={() => setConfirmando(false)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variante="ghost"
                    className="mt-1"
                    onClick={() => setConfirmando(true)}
                  >
                    Gerar novamente
                  </Button>
                )}
              </>
            )}

            {/* 5 · Erro */}
            {relatorio.status === 'ERRO' && (
              <>
                <p className="text-sm text-muted">
                  {relatorio.erroMsg ?? 'Não foi possível gerar o relatório.'}
                </p>
                <Button
                  variante="outline"
                  className="mt-3"
                  loading={gerando}
                  onClick={() => void gerar()}
                >
                  Tentar novamente
                </Button>
              </>
            )}
          </>
        )}

        {erro && <p className="mt-2 text-sm text-danger">{erro}</p>}
      </Card>

      {/* ── Capelas ── */}
      <Card onClick={() => navigate('/capelas')} className="flex flex-col gap-1">
        <p className="text-xs tracking-widest text-muted">CAPELAS</p>
        <p className="text-3xl font-semibold text-lime">{capelas.length}</p>
        <span className="flex items-center justify-between text-sm text-muted">
          neste semestre
          <ArrowRight size={16} />
        </span>
      </Card>
    </div>
  );
}

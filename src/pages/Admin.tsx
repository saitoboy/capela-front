import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Play, Plus, Users } from 'lucide-react';
import { api } from '../api/client';
import type { Capela, GroqKey, Semestre, Usuario } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { periodoCurto } from '../lib/format';

type Estado = 'carregando' | 'pronto' | 'erro';

export default function Admin() {
  const navigate = useNavigate();

  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [capelasPorSemestre, setCapelasPorSemestre] = useState<Record<string, Capela[]>>({});
  const [chaves, setChaves] = useState<GroqKey[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);

  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [ativando, setAtivando] = useState<string | null>(null);

  const [abrirForm, setAbrirForm] = useState(false);
  const [label, setLabel] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [criando, setCriando] = useState(false);

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');

    try {
      const lista = await api<Semestre[]>('/semestre');

      const [porSemestre, ks, us] = await Promise.all([
        Promise.all(
          lista.map((s) =>
            api<Capela[]>(`/capela?semestreId=${s.id}`).then(
              (cs) => [s.id, cs] as const,
            ),
          ),
        ),
        // Os cards de atalho mostram o estado da fila e a contagem de contas;
        // falhar aqui não derruba a tela.
        api<GroqKey[]>('/groq-key').catch(() => [] as GroqKey[]),
        api<Usuario[]>('/usuario').catch(() => [] as Usuario[]),
      ]);

      setSemestres(lista);
      setCapelasPorSemestre(Object.fromEntries(porSemestre));
      setChaves(ks);
      setTotalUsuarios(us.length);
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  async function ativar(id: string) {
    setAtivando(id);
    setErro('');

    try {
      await api<Semestre>(`/semestre/${id}/ativar`, { metodo: 'PATCH' });
      await buscar(); // ativar um desativa os outros — a lista inteira mudou
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setAtivando(null);
    }
  }

  const datasInvertidas = !!inicio && !!fim && inicio >= fim;

  async function criar(evento: FormEvent) {
    evento.preventDefault();
    if (datasInvertidas) return;

    setCriando(true);
    setErro('');

    try {
      await api<Semestre>('/semestre', {
        metodo: 'POST',
        corpo: { label, publishedAfter: inicio, publishedBefore: fim },
      });

      setLabel('');
      setInicio('');
      setFim('');
      setAbrirForm(false);
      await buscar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCriando(false);
    }
  }

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-32 animate-pulse rounded bg-surface" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-card border border-line bg-surface"
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

  const ativo = semestres.find((s) => s.ativo);
  const capelasDoAtivo = ativo ? (capelasPorSemestre[ativo.id] ?? []) : [];
  const comSinopse = capelasDoAtivo.filter((c) => c.sinopse).length;

  const ativas = chaves.filter((k) => k.status === 'ATIVA').length;
  const esgotadas = chaves.filter((k) => k.status === 'ESGOTADA').length;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Admin</h1>

      {/* ── Semestres ── */}
      <p className="text-xs tracking-widest text-muted">SEMESTRES</p>

      {semestres.length === 0 ? (
        <p className="text-sm text-muted">Nenhum semestre criado.</p>
      ) : (
        semestres.map((semestre) => {
          const capelas = capelasPorSemestre[semestre.id] ?? [];

          return (
            <Card key={semestre.id} className="flex flex-col gap-2">
              <p className="font-semibold">{semestre.label}</p>
              <p className="text-sm text-muted">
                {periodoCurto(semestre.publishedAfter, semestre.publishedBefore)} ·{' '}
                {capelas.length} capelas
              </p>

              {semestre.ativo ? (
                <span className="self-end rounded-full border border-lime/40 px-3 py-1 text-sm text-lime">
                  ● ATIVO
                </span>
              ) : (
                <Button
                  variante="outline"
                  className="w-auto self-end px-6 py-2"
                  loading={ativando === semestre.id}
                  onClick={() => void ativar(semestre.id)}
                >
                  Ativar
                </Button>
              )}
            </Card>
          );
        })
      )}

      {/* ── Novo semestre ── */}
      {abrirForm ? (
        <Card>
          <form onSubmit={criar} className="flex flex-col gap-4">
            <Input
              label="Rótulo"
              placeholder="2º Semestre 2026"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Início"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />
              <Input
                label="Fim"
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                erro={datasInvertidas ? 'O fim tem que vir depois do início.' : undefined}
                required
              />
            </div>

            {/* Semestre novo nasce inativo — o backend não ativa sozinho. */}
            <p className="text-sm text-muted">
              O semestre é criado desativado. Toque em <strong>Ativar</strong> para
              passar a valer — só um fica ativo por vez.
            </p>

            <Button
              type="submit"
              loading={criando}
              disabled={datasInvertidas}
              icone={<ArrowRight size={18} />}
            >
              Criar
            </Button>

            <Button variante="ghost" onClick={() => setAbrirForm(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      ) : (
        <Button
          variante="ghost"
          className="justify-start"
          onClick={() => setAbrirForm(true)}
        >
          <Plus size={18} />
          Novo semestre
        </Button>
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <hr className="my-2 border-line" />

      {/* ── Atalhos ── */}
      <Card onClick={() => navigate('/admin/coletar')} className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-semibold">
          <Play size={16} className="text-lime" />
          Coletar capelas
        </span>
        <span className="flex items-center justify-between text-sm text-muted">
          {capelasDoAtivo.length} capelas · {comSinopse} sinopses
          <ArrowRight size={16} />
        </span>
      </Card>

      <Card onClick={() => navigate('/admin/chaves')} className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-semibold">
          <KeyRound size={16} className="text-lime" />
          Chaves da Groq
        </span>
        <span className="flex items-center justify-between text-sm text-muted">
          {chaves.length === 0
            ? 'Nenhuma cadastrada'
            : `${ativas} ativas · ${esgotadas} esgotadas`}
          <ArrowRight size={16} />
        </span>
      </Card>

      <Card onClick={() => navigate('/admin/usuarios')} className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-semibold">
          <Users size={16} className="text-lime" />
          Usuários
        </span>
        <span className="flex items-center justify-between text-sm text-muted">
          {totalUsuarios === null
            ? 'Ver e gerenciar contas'
            : `${totalUsuarios} ${totalUsuarios === 1 ? 'conta' : 'contas'}`}
          <ArrowRight size={16} />
        </span>
      </Card>
    </div>
  );
}

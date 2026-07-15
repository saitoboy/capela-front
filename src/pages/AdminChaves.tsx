import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, KeyRound, Plus, TriangleAlert } from 'lucide-react';
import { api } from '../api/client';
import type { GroqKey } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Input from '../components/Input';
import { hora, tempoRelativo } from '../lib/format';
import { cn } from '../lib/utils';

type Estado = 'carregando' | 'pronto' | 'erro';

/**
 * Barra de "quanto da cota diária (TPD) esta chave já gastou hoje".
 * É o sinal pra decidir cadastrar mais chaves: várias chaves batendo os 100%
 * cedo no dia = a fila não dá conta, precisa de mais.
 *
 * Só aparece se o back souber o limite (GROQ_TPD). Os headers da Groq não dão o
 * TPD, então o total vem do .env do backend.
 */
function CotaDiaria({ chave }: { chave: GroqKey }) {
  if (!chave.tpd) return null;

  const pct = Math.min(100, Math.round((chave.tokensHoje / chave.tpd) * 100));
  const cor =
    pct >= 100 ? 'bg-danger' : pct >= 75 ? 'bg-amber' : 'bg-lime';
  const corTexto =
    pct >= 100 ? 'text-danger' : pct >= 75 ? 'text-amber' : 'text-muted';

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">Cota de hoje</span>
        <span className={corTexto}>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', cor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted">
        {chave.tokensHoje.toLocaleString('pt-BR')} de{' '}
        {chave.tpd.toLocaleString('pt-BR')} tokens
      </span>
    </div>
  );
}

/** O que o backend escolhe a seguir é a ATIVA menos usada — não a primeira da lista. */
function proximaChave(chaves: GroqKey[]): string | null {
  const ativas = chaves.filter((k) => k.status === 'ATIVA');
  if (ativas.length === 0) return null;

  const ordenadas = [...ativas].sort((a, b) => {
    // Chave nunca usada vai primeiro — é o mesmo critério do listarChavesUsaveis.
    if (!a.lastUsedAt) return -1;
    if (!b.lastUsedAt) return 1;
    return a.lastUsedAt.localeCompare(b.lastUsedAt);
  });

  return ordenadas[0].id;
}

export default function AdminChaves() {
  const [chaves, setChaves] = useState<GroqKey[]>([]);
  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [agindo, setAgindo] = useState<string | null>(null);

  const [abrirForm, setAbrirForm] = useState(false);
  const [label, setLabel] = useState('');
  const [chave, setChave] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');

    try {
      // O GET já reativa sozinho as ESGOTADAS cujo resetAt passou.
      setChaves(await api<GroqKey[]>('/groq-key'));
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  async function agir(id: string, acao: 'reativar' | 'remover') {
    setAgindo(id);
    setErro('');

    try {
      if (acao === 'reativar') {
        await api<GroqKey>(`/groq-key/${id}/reativar`, { metodo: 'PATCH' });
      } else {
        await api<void>(`/groq-key/${id}`, { metodo: 'DELETE' });
      }
      await buscar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setAgindo(null);
    }
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();

    setSalvando(true);
    setErroForm('');

    try {
      // O POST bate na Groq antes de gravar — chave errada falha aqui.
      await api<GroqKey>('/groq-key', {
        metodo: 'POST',
        corpo: { label, key: chave },
      });

      setLabel('');
      setChave('');
      setAbrirForm(false);
      await buscar();
    } catch (e) {
      setErroForm((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-card border border-line bg-surface"
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

  const proxima = proximaChave(chaves);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Chaves da Groq</h1>

      <p className="text-sm text-muted">
        Quando uma chave bate o limite de tokens, o app usa a próxima da fila
        sozinho.
      </p>

      {chaves.length === 0 && !abrirForm && (
        <EmptyState
          icone={KeyRound}
          titulo="Nenhuma chave cadastrada."
          descricao="Sem chave no banco, o app usa a GROQ_API_KEY do .env."
          acao={{ label: 'Adicionar chave', onClick: () => setAbrirForm(true) }}
        />
      )}

      {chaves.map((k) => {
        const ehProxima = k.id === proxima;

        return (
          <Card key={k.id} className="flex flex-col gap-1">
            {k.status === 'ATIVA' && (
              <span
                className={cn(
                  'self-start rounded-full border px-3 py-1 text-xs',
                  ehProxima
                    ? 'border-lime/40 text-lime'
                    : 'border-line text-muted',
                )}
              >
                {ehProxima ? '● PRÓXIMA' : '○ NA FILA'}
              </span>
            )}

            {k.status === 'ESGOTADA' && (
              <span className="self-start rounded-full border border-amber/40 px-3 py-1 text-xs text-amber">
                ◐ ESGOTADA
              </span>
            )}

            {k.status === 'INVALIDA' && (
              <span className="self-start rounded-full border border-danger/40 px-3 py-1 text-xs text-danger">
                ✕ INVÁLIDA
              </span>
            )}

            <p className="font-semibold">{k.label}</p>
            {/* Nunca a chave — só o preview. Ela não volta da API nem para o admin. */}
            <p className="font-mono text-sm text-muted">{k.preview}</p>

            {k.lastUsedAt && (
              <p className="text-xs text-muted">usada {tempoRelativo(k.lastUsedAt)}</p>
            )}

            <CotaDiaria chave={k} />

            {k.status === 'ESGOTADA' && k.resetAt && (
              <p className="text-xs">
                <span className="text-muted">volta às </span>
                <span className="text-lime">{hora(k.resetAt)}</span>
              </p>
            )}

            {k.status === 'INVALIDA' && k.erroMsg && (
              <p className="text-xs text-muted">{k.erroMsg}</p>
            )}

            {k.status !== 'ATIVA' && (
              <div className="mt-2 flex gap-2 self-end">
                {k.status === 'ESGOTADA' && (
                  <Button
                    variante="outline"
                    className="w-auto px-5 py-2 text-sm"
                    loading={agindo === k.id}
                    onClick={() => void agir(k.id, 'reativar')}
                  >
                    Reativar
                  </Button>
                )}

                <Button
                  variante="ghost"
                  className="w-auto px-5 py-2 text-sm"
                  loading={agindo === k.id}
                  onClick={() => void agir(k.id, 'remover')}
                >
                  Remover
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      {abrirForm ? (
        <Card>
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <p className="font-semibold">Adicionar chave</p>

            <Input
              label="Apelido"
              placeholder="chave do Guilherme"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <Input
                label="Chave da API"
                type="password"
                placeholder="gsk_…"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                required
              />
              <p className="text-xs text-muted">Pegue em console.groq.com</p>
            </div>

            {/* Quem doa a chave precisa saber disto antes, não depois. */}
            <div className="flex gap-2 rounded-btn border border-amber/40 bg-amber/5 p-3">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-sm text-muted">
                A sua chave entra numa fila compartilhada e vai gastar tokens
                gerando relatório de outros alunos também.
              </p>
            </div>

            {erroForm && <p className="text-sm text-danger">{erroForm}</p>}

            <Button type="submit" loading={salvando} icone={<ArrowRight size={18} />}>
              Validar e salvar
            </Button>

            <Button variante="ghost" onClick={() => setAbrirForm(false)}>
              Cancelar
            </Button>

            <p className="text-xs text-muted">
              A chave é criptografada e nunca mais é exibida.
            </p>
          </form>
        </Card>
      ) : (
        chaves.length > 0 && (
          <Button onClick={() => setAbrirForm(true)} icone={<ArrowRight size={18} />}>
            <Plus size={18} />
            Adicionar chave
          </Button>
        )
      )}
    </div>
  );
}

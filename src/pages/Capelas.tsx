import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Pencil } from 'lucide-react';
import { api } from '../api/client';
import type { Capela, Semestre, Sinopse } from '../api/types';
import { useAuth } from '../auth/context';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { dataCurta, ouTraco } from '../lib/format';

type Estado = 'carregando' | 'pronto' | 'erro';

export default function Capelas() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [semestre, setSemestre] = useState<Semestre | null>(null);
  const [capelas, setCapelas] = useState<Capela[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState<string | null>(null);
  const [erroSinopse, setErroSinopse] = useState<Record<string, string>>({});

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');

    try {
      const ativo = await api<Semestre>('/semestre/ativo');
      const lista = await api<Capela[]>(`/capela?semestreId=${ativo.id}`);

      setSemestre(ativo);
      setCapelas(lista);
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  async function gerarSinopse(id: string) {
    setGerando(id);
    setErroSinopse((m) => ({ ...m, [id]: '' }));

    try {
      const sinopse = await api<Sinopse>(`/sinopse/${id}`, { metodo: 'POST' });
      setCapelas((cs) => cs.map((c) => (c.id === id ? { ...c, sinopse } : c)));
      setAberta(id);
    } catch (e) {
      setErroSinopse((m) => ({ ...m, [id]: (e as Error).message }));
    } finally {
      setGerando(null);
    }
  }

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
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
      <div>
        <h1 className="text-xl font-semibold">Capelas</h1>
        <p className="text-sm text-muted">
          {semestre?.label} · {capelas.length}
        </p>
      </div>

      {capelas.length === 0 ? (
        <EmptyState icone={BookOpen} titulo="Nenhuma capela neste semestre ainda." />
      ) : (
        capelas.map((capela) => {
          const abertaAgora = aberta === capela.id;
          const sinopse = capela.sinopse;

          return (
            <Card key={capela.id} className="flex flex-col gap-1">
              <p className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold text-lime">
                    {String(capela.indice).padStart(2, '0')}
                  </span>
                  <span className="text-muted"> · {dataCurta(capela.data)}</span>
                </span>

                {/* Só o admin edita — é por aqui que ele preenche o que ficou NULL. */}
                {usuario?.isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/capelas/${capela.id}`)}
                    aria-label={`Editar capela ${capela.indice}`}
                    className="p-1 text-muted hover:text-lime"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </p>

              {/* Campo que a IA não extraiu vem NULL e vira "—". Nunca "null". */}
              <p className="font-semibold">{ouTraco(capela.tema)}</p>
              <p className="text-sm text-muted">{ouTraco(capela.textoBiblico)}</p>
              <p className="text-sm text-muted">{ouTraco(capela.pregador)}</p>

              <hr className="my-2 border-line" />

              {sinopse ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAberta(abertaAgora ? null : capela.id)}
                    aria-expanded={abertaAgora}
                    className="flex items-center justify-between text-sm font-semibold text-lime"
                  >
                    Sinopse
                    {abertaAgora ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>

                  {abertaAgora && (
                    <div className="mt-3 flex flex-col gap-3">
                      <p className="text-sm whitespace-pre-line">{sinopse.texto}</p>

                      {capela.url && (
                        <a
                          href={capela.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm font-semibold text-lime"
                        >
                          Assistir no YouTube
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </>
              ) : usuario?.isAdmin && (capela.tema || capela.textoBiblico) ? (
                <>
                  <Button
                    variante="outline"
                    className="py-2 text-sm"
                    loading={gerando === capela.id}
                    disabled={gerando !== null}
                    onClick={() => void gerarSinopse(capela.id)}
                  >
                    Gerar sinopse
                  </Button>
                  {erroSinopse[capela.id] && (
                    <p className="text-sm text-danger">{erroSinopse[capela.id]}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">Sinopse ainda não gerada</p>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

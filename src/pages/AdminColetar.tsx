import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CircleDot, TriangleAlert } from 'lucide-react';
import { api } from '../api/client';
import type { Capela, Coleta, GroqKey, Semestre } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import StatusPill from '../components/StatusPill';
import { paraCampoData } from '../lib/format';

const DIAS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function AdminColetar() {
  const navigate = useNavigate();

  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [semestreId, setSemestreId] = useState('');
  const [chavesAtivas, setChavesAtivas] = useState(0);

  const [coleta, setColeta] = useState<Coleta | null>(null);
  const [capelas, setCapelas] = useState<Capela[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [erro, setErro] = useState('');

  // Filtros. Vazio = o backend usa o default do .env dele — por isso não
  // chutamos aqui o valor do canal/palavra-chave: o front não conhece o .env.
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [canal, setCanal] = useState('');
  const [keyword, setKeyword] = useState('');
  const [weekday, setWeekday] = useState('');
  const [gerarSinopses, setGerarSinopses] = useState(true);

  // ── Carga inicial ───────────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const [ss, ks] = await Promise.all([
          api<Semestre[]>('/semestre'),
          api<GroqKey[]>('/groq-key').catch(() => [] as GroqKey[]),
        ]);

        setSemestres(ss);
        setChavesAtivas(ks.filter((k) => k.status === 'ATIVA').length);

        const ativo = ss.find((s) => s.ativo) ?? ss[0];
        if (ativo) setSemestreId(ativo.id);
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  // Trocar de semestre: repõe as datas e retoma uma coleta que ficou rodando.
  useEffect(() => {
    if (!semestreId) return;

    const s = semestres.find((x) => x.id === semestreId);
    if (s) {
      setInicio(paraCampoData(s.publishedAfter));
      setFim(paraCampoData(s.publishedBefore));
    }

    setColeta(null);
    setErro('');

    // A coleta mais recente do semestre. É o que permite sair da tela (ou abrir
    // noutro navegador) e voltar a acompanhar um job que segue rodando.
    api<Coleta[]>(`/capela/coletar?semestreId=${semestreId}`)
      .then((lista) => setColeta(lista[0] ?? null))
      .catch(() => setColeta(null));
  }, [semestreId, semestres]);

  // ── Polling (2s) ────────────────────────────────────────────────────────────

  const emAndamento = coleta?.status === 'GERANDO' ? coleta.id : null;
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!emAndamento) return;

    timer.current = window.setInterval(() => {
      api<Coleta>(`/capela/coletar/${emAndamento}`)
        .then(setColeta)
        .catch(() => {
          /* falha pontual de rede: o próximo tick tenta de novo */
        });
    }, 2000);

    return () => window.clearInterval(timer.current);
  }, [emAndamento]);

  // O log liga capela por índice; a rota de edição precisa do id. Daí o cruzamento.
  useEffect(() => {
    if (coleta?.status !== 'CONCLUIDO' && coleta?.status !== 'ERRO') return;

    api<Capela[]>(`/capela?semestreId=${coleta.semestreId}`)
      .then(setCapelas)
      .catch(() => setCapelas([]));
  }, [coleta?.status, coleta?.semestreId]);

  // ── Ações ───────────────────────────────────────────────────────────────────

  async function iniciar() {
    setIniciando(true);
    setErro('');

    try {
      const nova = await api<Coleta>('/capela/coletar', {
        metodo: 'POST',
        corpo: {
          semestreId,
          publishedAfter: inicio || undefined,
          publishedBefore: fim || undefined,
          canal: canal.trim() || undefined,
          keyword: keyword.trim() || undefined,
          weekday: weekday === '' ? undefined : Number(weekday),
          gerarSinopses,
        },
      });

      setColeta(nova);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setIniciando(false);
    }
  }

  function idDaCapela(indice: number): string | undefined {
    return capelas.find((c) => c.indice === indice)?.id;
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="h-64 animate-pulse rounded-card border border-line bg-surface" />
      </div>
    );
  }

  const emCurso = coleta?.status === 'GERANDO';
  const pct = coleta && coleta.total > 0 ? (coleta.processadas / coleta.total) * 100 : 0;
  const erros = coleta?.itens.filter((i) => i.erro).length ?? 0;
  const pendentes = coleta?.itens.filter((i) => i.faltando.length > 0).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Coletar capelas</h1>

      {/* ── Configuração ── */}
      {!coleta && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">Semestre</span>
            <select
              value={semestreId}
              onChange={(e) => setSemestreId(e.target.value)}
              className="rounded-btn border border-line bg-surface px-3 py-3 text-base focus:border-lime focus:outline-none"
            >
              {semestres.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.ativo ? '(ativo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-2 text-xs tracking-widest text-muted">PERÍODO DE BUSCA</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="De"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
            <Input
              label="Até"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>

          <p className="mt-2 text-xs tracking-widest text-muted">FILTROS</p>

          {/* Campo vazio = o backend cai no default do .env dele. */}
          <Input
            label="Canal"
            placeholder="@souseminariodosul (padrão)"
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          />
          <Input
            label="Palavra-chave no título"
            placeholder="Devoção na Capela (padrão)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">Dia da semana</span>
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
              className="rounded-btn border border-line bg-surface px-3 py-3 text-base focus:border-lime focus:outline-none"
            >
              <option value="">Padrão do servidor</option>
              {DIAS.map((dia, i) => (
                <option key={dia} value={i}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-btn border border-line bg-surface px-3 py-3">
            <input
              type="checkbox"
              checked={gerarSinopses}
              onChange={(e) => setGerarSinopses(e.target.checked)}
              className="size-4 accent-lime"
            />
            <span className="text-base">Gerar sinopses junto</span>
          </label>

          <div className="flex gap-2 rounded-btn border border-line p-3">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-muted" />
            <p className="text-sm text-muted">
              Vai usar cerca de 3 chamadas de IA por capela.
              <br />
              Chaves ativas:{' '}
              <span className={chavesAtivas > 0 ? 'text-lime' : 'text-amber'}>
                {chavesAtivas}
              </span>
              {chavesAtivas === 0 && ' — vai usar a chave do .env'}
            </p>
          </div>

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <Button
            loading={iniciando}
            disabled={!semestreId}
            onClick={() => void iniciar()}
            icone={<ArrowRight size={18} />}
          >
            Buscar capelas
          </Button>
        </>
      )}

      {/* ── Progresso ── */}
      {coleta && (
        <>
          <Card className="flex flex-col gap-3">
            <StatusPill
              status={coleta.status}
              label={emCurso ? 'Coletando' : undefined}
            />

            {emCurso && (
              <>
                <p>
                  <span className="text-3xl font-semibold text-lime">
                    {coleta.processadas} de {coleta.total}
                  </span>
                  <br />
                  <span className="text-sm text-muted">capelas processadas</span>
                </p>

                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-lime transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {coleta.etapa && <p className="text-sm text-muted">{coleta.etapa}</p>}
                <p className="text-sm text-muted">Pode sair desta tela.</p>
              </>
            )}

            {coleta.status === 'CONCLUIDO' && (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['inseridas', coleta.inseridas],
                    ['atualizadas', coleta.atualizadas],
                    ['erros', erros],
                  ].map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <p className="text-2xl font-semibold text-lime">{valor}</p>
                      <p className="text-xs text-muted">{rotulo}</p>
                    </div>
                  ))}
                </div>

                {/* Vídeo descartado era ignorado em silêncio — sem isto, o admin
                    não entende por que "sumiram" capelas. */}
                {coleta.ignorados > 0 && (
                  <p className="text-sm text-muted">
                    ⚠ {coleta.ignorados} vídeos ignorados (sem data no título ou fora
                    do dia da semana)
                  </p>
                )}
              </>
            )}

            {coleta.status === 'ERRO' && (
              <>
                <p className="text-sm">
                  Parou em {coleta.processadas} de {coleta.total}.
                </p>
                <p className="text-sm text-muted">
                  {coleta.erroMsg ?? 'Falha na coleta.'}
                </p>
                <Button
                  onClick={() => navigate('/admin/chaves')}
                  icone={<ArrowRight size={18} />}
                >
                  Cadastrar chave
                </Button>
              </>
            )}
          </Card>

          {/* As capelas já processadas ficam salvas; recoletar não refaz as prontas
              nem apaga edição manual. */}
          {!emCurso && (
            <>
              {pendentes > 0 && (
                <div className="flex gap-2 rounded-card border border-amber/40 bg-amber/5 p-3">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" />
                  <p className="text-sm text-muted">
                    {pendentes} capelas com campos em branco. A IA não achou tudo;
                    preencha à mão.
                  </p>
                </div>
              )}

              <Button onClick={() => navigate('/capelas')} icone={<ArrowRight size={18} />}>
                Ver as capelas
              </Button>

              <Button
                variante="outline"
                loading={iniciando}
                onClick={() => setColeta(null)}
              >
                {coleta.status === 'ERRO' ? 'Continuar coleta' : 'Coletar de novo'}
              </Button>
            </>
          )}

          {erro && <p className="text-sm text-danger">{erro}</p>}

          {/* ── Log ── */}
          {coleta.itens.length > 0 && (
            <>
              <p className="mt-2 text-xs tracking-widest text-muted">LOG</p>

              <Card className="flex flex-col divide-y divide-line p-0">
                {coleta.itens.map((item) => {
                  const capelaId = idDaCapela(item.indice);
                  const falta = item.faltando.length > 0;

                  return (
                    <div key={item.indice} className="flex flex-col gap-1 p-3">
                      <span className="flex items-center gap-2 text-sm">
                        {item.erro ? (
                          <TriangleAlert size={14} className="shrink-0 text-danger" />
                        ) : falta ? (
                          <TriangleAlert size={14} className="shrink-0 text-amber" />
                        ) : (
                          <Check size={14} className="shrink-0 text-lime" />
                        )}
                        <span className="text-muted">
                          {String(item.indice).padStart(2, '0')}
                        </span>
                        <span className="font-semibold">
                          {item.tema ?? '(sem tema)'}
                        </span>
                      </span>

                      {/* De onde o dado veio — é como o admin sabe em quem confiar. */}
                      <span className="pl-6 text-xs text-muted">{item.source}</span>

                      {item.erro && (
                        <span className="pl-6 text-xs text-danger">{item.erro}</span>
                      )}

                      {falta && (
                        <span className="flex items-center justify-between pl-6">
                          <span className="text-xs text-amber">
                            falta: {item.faltando.join(', ')}
                          </span>

                          {capelaId && (
                            <Button
                              variante="outline"
                              className="w-auto px-4 py-1 text-xs"
                              onClick={() => navigate(`/admin/capelas/${capelaId}`)}
                            >
                              Preencher
                            </Button>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </Card>
            </>
          )}

          {emCurso && coleta.itens.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <CircleDot size={14} className="animate-pulse text-lime" />
              Buscando vídeos no canal…
            </p>
          )}
        </>
      )}
    </div>
  );
}

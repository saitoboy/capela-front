import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { api } from '../api/client';
import type { Relatorio, Semestre } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import StatusPill from '../components/StatusPill';
import { baixarRelatorio } from '../lib/download';

type Estado = 'carregando' | 'pronto' | 'erro';

export default function Relatorios() {
  const navigate = useNavigate();

  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  // O relatório só carrega o semestreId — o rótulo ("1º Semestre 2026") vem daqui.
  const [semestres, setSemestres] = useState<Record<string, string>>({});

  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [baixando, setBaixando] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');

    try {
      const [rs, ss] = await Promise.all([
        api<Relatorio[]>('/relatorio/me'),
        api<Semestre[]>('/semestre'),
      ]);

      setRelatorios(rs);
      setSemestres(Object.fromEntries(ss.map((s) => [s.id, s.label])));
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  async function baixar(relatorio: Relatorio, label: string) {
    setBaixando(relatorio.id);
    setErro('');

    try {
      await baixarRelatorio(relatorio.id, `Relatório — ${label}`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setBaixando(null);
    }
  }

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-card border border-line bg-surface"
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
      <h1 className="text-xl font-semibold">Relatórios</h1>

      {relatorios.length === 0 ? (
        <EmptyState
          icone={FileText}
          titulo="Nenhum relatório ainda."
          descricao="Gere o relatório do semestre atual na Início."
          acao={{ label: 'Gerar o do semestre atual', onClick: () => navigate('/') }}
        />
      ) : (
        relatorios.map((relatorio) => {
          // Semestre apagado deixaria o card sem nome — o travessão é melhor que "undefined".
          const label = semestres[relatorio.semestreId] ?? 'Semestre —';

          return (
            <Card key={relatorio.id} className="flex flex-col gap-2">
              <p className="font-semibold">{label}</p>
              <StatusPill status={relatorio.status} />

              {relatorio.status === 'ERRO' ? (
                <p className="text-sm text-muted">
                  {relatorio.erroMsg ?? 'Falha na geração.'}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  {relatorio.personaTipo}
                  {relatorio.focoCriativo && ` · foco ${relatorio.focoCriativo}`}
                </p>
              )}

              {/* O .docx só existe quando o job terminou — o backend recusa antes disso. */}
              {relatorio.status === 'CONCLUIDO' && (
                <Button
                  className="mt-2"
                  loading={baixando === relatorio.id}
                  onClick={() => void baixar(relatorio, label)}
                  icone={<Download size={18} />}
                >
                  Baixar .docx
                </Button>
              )}
            </Card>
          );
        })
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}
    </div>
  );
}

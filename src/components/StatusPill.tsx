import { cn } from '../lib/utils';
import type { StatusColeta, StatusRelatorio } from '../api/types';

type Status = StatusRelatorio | StatusColeta;

const ESTILOS: Record<Status, { classe: string; ponto: string; texto: string }> = {
  PENDENTE:  { classe: 'border-line text-muted',        ponto: 'bg-muted animate-pulse', texto: 'Na fila' },
  GERANDO:   { classe: 'border-line text-muted',        ponto: 'bg-muted animate-pulse', texto: 'Gerando…' },
  CONCLUIDO: { classe: 'border-lime/40 text-lime',      ponto: 'bg-lime',                texto: 'Concluído' },
  ERRO:      { classe: 'border-danger/40 text-danger',  ponto: 'bg-danger',              texto: 'Erro' },
};

interface Props {
  status: Status;
  /** Sobrescreve o texto — a coleta diz "Coletando" onde o relatório diz "Gerando…". */
  label?: string;
}

export default function StatusPill({ status, label }: Props) {
  const { classe, ponto, texto } = ESTILOS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
        classe,
      )}
    >
      <span className={cn('size-2 rounded-full', ponto)} />
      {label ?? texto}
    </span>
  );
}

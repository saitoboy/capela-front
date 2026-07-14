import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface Props {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: { label: string; onClick: () => void };
}

export default function EmptyState({ icone: Icone, titulo, descricao, acao }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icone size={40} className="text-muted" strokeWidth={1.5} />
      <p className="text-base font-semibold">{titulo}</p>
      {descricao && <p className="max-w-xs text-sm text-muted">{descricao}</p>}
      {acao && (
        <Button className="mt-2 w-auto px-6" onClick={acao.onClick}>
          {acao.label}
        </Button>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  /** Com onClick o card vira botão — mantém o teclado e o foco funcionando. */
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: Props) {
  const estilo = cn(
    'rounded-card border border-line bg-surface p-4 text-left',
    onClick && 'w-full transition-colors hover:border-lime/40',
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={estilo}>
        {children}
      </button>
    );
  }

  return <div className={estilo}>{children}</div>;
}

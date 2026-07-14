import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';
import Spinner from './Spinner';

type Variante = 'primary' | 'outline' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  loading?: boolean;
  /** Ícone à direita — a seta `→` do botão primário, por exemplo. */
  icone?: ReactNode;
}

const VARIANTES: Record<Variante, string> = {
  // Texto sobre lima é sempre preto — branco sobre lima é ilegível.
  primary: 'bg-lime text-bg hover:bg-lime/90 disabled:bg-line disabled:text-muted',
  outline:
    'border border-lime text-lime hover:bg-lime/10 disabled:border-line disabled:text-muted',
  ghost: 'text-lime hover:bg-lime/10 disabled:text-muted',
};

export default function Button({
  variante = 'primary',
  loading = false,
  icone,
  disabled,
  children,
  className,
  // O padrão do HTML é "submit": sem isto, um botão qualquer dentro de um
  // formulário (um "Cancelar", por exemplo) o envia sem querer.
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-btn px-4 py-3',
        'text-base font-semibold transition-colors',
        'disabled:cursor-not-allowed',
        VARIANTES[variante],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : children}
      {!loading && icone}
    </button>
  );
}

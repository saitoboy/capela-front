import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
  /** Borda âmbar: não é erro, é tarefa pendente (campo que a IA não extraiu). */
  pendente?: boolean;
}

export default function Input({
  label,
  erro,
  pendente = false,
  type = 'text',
  className,
  ...props
}: Props) {
  const id = useId();
  const [revelada, setRevelada] = useState(false);

  const senha = type === 'password';
  const tipoEfetivo = senha && revelada ? 'text' : type;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={tipoEfetivo}
          aria-invalid={!!erro}
          className={cn(
            'w-full rounded-btn border bg-surface px-3 py-3 text-base text-white',
            'placeholder:text-muted focus:outline-none focus:ring-1',
            senha && 'pr-11',
            erro
              ? 'border-danger focus:border-danger focus:ring-danger'
              : pendente
                ? 'border-amber focus:border-amber focus:ring-amber'
                : 'border-line focus:border-lime focus:ring-lime',
            'disabled:text-muted',
          )}
          {...props}
        />

        {senha && (
          <button
            type="button"
            onClick={() => setRevelada((v) => !v)}
            aria-label={revelada ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-white"
          >
            {revelada ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
    </div>
  );
}

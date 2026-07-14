import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Telas de foco (teste de persona) e de admin: sem barra inferior, com `←`.
 * Chega-se a elas por um caminho, e sai-se por ele — não são destinos.
 */
export default function FlowShell() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 pb-8">
      <header className="pt-topo pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="-ml-2 p-2 text-muted hover:text-white"
        >
          <ArrowLeft size={22} />
        </button>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

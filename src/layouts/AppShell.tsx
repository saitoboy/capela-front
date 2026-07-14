import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { api } from '../api/client';
import type { Semestre } from '../api/types';
import { useAuth } from '../auth/context';
import BottomNav from '../components/BottomNav';

export default function AppShell() {
  const { usuario, sair } = useAuth();
  const [semestre, setSemestre] = useState<Semestre | null>(null);

  // Pode não haver semestre ativo ainda — nesse caso o header só não mostra o rótulo.
  useEffect(() => {
    api<Semestre>('/semestre/ativo')
      .then(setSemestre)
      .catch(() => setSemestre(null));
  }, []);

  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 pb-20">
      <header className="flex items-start justify-between py-4">
        <div>
          <p className="text-xl font-semibold">Olá, {primeiroNome}</p>
          {semestre && <p className="text-sm text-muted">{semestre.label}</p>}
        </div>

        <div className="flex items-center gap-1">
          {usuario?.isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin"
              className="p-2 text-muted hover:text-lime"
            >
              <Settings size={20} />
            </Link>
          )}
          <button
            type="button"
            onClick={sair}
            aria-label="Sair"
            className="p-2 text-muted hover:text-lime"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

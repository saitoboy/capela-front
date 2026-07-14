import { NavLink } from 'react-router-dom';
import { BookOpen, FileText, Home, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const ITENS: { rota: string; label: string; icone: LucideIcon }[] = [
  { rota: '/',           label: 'Início',     icone: Home },
  { rota: '/capelas',    label: 'Capelas',    icone: BookOpen },
  { rota: '/persona',    label: 'Persona',    icone: Sparkles },
  { rota: '/relatorios', label: 'Relatórios', icone: FileText },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg">
      <ul className="mx-auto flex h-16 max-w-md">
        {ITENS.map(({ rota, label, icone: Icone }) => (
          <li key={rota} className="flex-1">
            <NavLink
              to={rota}
              end={rota === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs',
                  isActive ? 'text-lime' : 'text-muted',
                )
              }
            >
              <Icone size={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context';
import Spinner from '../components/Spinner';

/**
 * Guarda de rota. Sem token → /login. Com token mas sem isAdmin → / (nas rotas admin).
 */
export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { usuario, carregando } = useAuth();

  // Sem esperar a revalidação, um F5 jogaria o usuário logado para /login.
  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (admin && !usuario.isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

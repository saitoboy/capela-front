import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './layouts/AppShell';
import FlowShell from './layouts/FlowShell';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Inicio from './pages/Inicio';
import Capelas from './pages/Capelas';
import Persona from './pages/Persona';
import PersonaTeste from './pages/PersonaTeste';
import PersonaEscolher from './pages/PersonaEscolher';
import Relatorios from './pages/Relatorios';
import Admin from './pages/Admin';
import AdminColetar from './pages/AdminColetar';
import AdminCapela from './pages/AdminCapela';
import AdminChaves from './pages/AdminChaves';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Aluno — com barra inferior */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/capelas" element={<Capelas />} />
              <Route path="/persona" element={<Persona />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>

            {/* Fluxos de foco — sem barra inferior */}
            <Route element={<FlowShell />}>
              <Route path="/persona/escolher" element={<PersonaEscolher />} />
            </Route>

            {/* O teste tem header próprio: o `←` volta uma pergunta, não sai do fluxo. */}
            <Route path="/persona/teste" element={<PersonaTeste />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute admin />}>
            <Route element={<FlowShell />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/coletar" element={<AdminColetar />} />
              <Route path="/admin/capelas/:id" element={<AdminCapela />} />
              <Route path="/admin/chaves" element={<AdminChaves />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { api } from '../api/client';
import type { Usuario } from '../api/types';
import { useAuth } from '../auth/context';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Input from '../components/Input';
import { dataCurta } from '../lib/format';

type Estado = 'carregando' | 'pronto' | 'erro';

/** Qual painel do card está aberto — só um por vez, e só para um usuário. */
type Painel = { ra: string; modo: 'editar' | 'senha' | 'remover' } | null;

export default function AdminUsuarios() {
  const { usuario: eu } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  const [painel, setPainel] = useState<Painel>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroPainel, setErroPainel] = useState('');

  // Campos do painel de edição / senha (reaproveitados a cada abertura).
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ehAdmin, setEhAdmin] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');

  // Form de novo usuário.
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [nRa, setNRa] = useState('');
  const [nNome, setNNome] = useState('');
  const [nEmail, setNEmail] = useState('');
  const [nSenha, setNSenha] = useState('');
  const [nAdmin, setNAdmin] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erroNovo, setErroNovo] = useState('');

  const buscar = useCallback(async () => {
    setEstado('carregando');
    setErro('');
    try {
      setUsuarios(await api<Usuario[]>('/usuario'));
      setEstado('pronto');
    } catch (e) {
      setErro((e as Error).message);
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  // ── Abrir painéis ───────────────────────────────────────────────────────────

  function abrirEditar(u: Usuario) {
    setPainel({ ra: u.ra, modo: 'editar' });
    setErroPainel('');
    setNome(u.nome);
    setEmail(u.email);
    setEhAdmin(u.isAdmin);
  }

  function abrirSenha(u: Usuario) {
    setPainel({ ra: u.ra, modo: 'senha' });
    setErroPainel('');
    setNovaSenha('');
  }

  function fecharPainel() {
    setPainel(null);
    setErroPainel('');
  }

  // ── Ações ───────────────────────────────────────────────────────────────────

  async function salvarEdicao(ra: string) {
    setSalvando(true);
    setErroPainel('');
    try {
      await api<Usuario>(`/usuario/${ra}`, {
        metodo: 'PATCH',
        corpo: { nome, email, isAdmin: ehAdmin },
      });
      fecharPainel();
      await buscar();
    } catch (e) {
      setErroPainel((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarSenha(ra: string) {
    setSalvando(true);
    setErroPainel('');
    try {
      await api<void>(`/usuario/${ra}/senha`, {
        metodo: 'PATCH',
        corpo: { senha: novaSenha },
      });
      fecharPainel();
    } catch (e) {
      setErroPainel((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(ra: string) {
    setSalvando(true);
    setErroPainel('');
    try {
      await api<void>(`/usuario/${ra}`, { metodo: 'DELETE' });
      fecharPainel();
      await buscar();
    } catch (e) {
      setErroPainel((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function criar(evento: FormEvent) {
    evento.preventDefault();
    setCriando(true);
    setErroNovo('');
    try {
      await api<Usuario>('/usuario', {
        metodo: 'POST',
        corpo: {
          ra: nRa,
          nome: nNome,
          email: nEmail,
          senha: nSenha,
          curso: 'TEOLOGIA',
          isAdmin: nAdmin,
        },
      });
      setNRa('');
      setNNome('');
      setNEmail('');
      setNSenha('');
      setNAdmin(false);
      setAbrirNovo(false);
      await buscar();
    } catch (e) {
      setErroNovo((e as Error).message);
    } finally {
      setCriando(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (estado === 'erro') {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="text-sm text-danger">{erro}</p>
        <Button variante="outline" onClick={() => void buscar()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  // "admin"/"administrador" no texto de busca casa com quem tem o selo — assim
  // dá para filtrar os admins só digitando a palavra.
  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? usuarios.filter((u) =>
        `${u.nome} ${u.ra} ${u.email} ${u.isAdmin ? 'admin administrador' : ''}`
          .toLowerCase()
          .includes(termo),
      )
    : usuarios;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Usuários</h1>
      <p className="text-sm text-muted">
        Quem já se cadastrou. Dá para criar, editar, trocar a senha e remover.
      </p>

      {usuarios.length > 0 && (
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, RA, e-mail ou admin"
            className="w-full rounded-btn border border-line bg-surface py-3 pr-3 pl-10 text-base text-white placeholder:text-muted focus:border-lime focus:ring-1 focus:ring-lime focus:outline-none"
          />
        </div>
      )}

      {usuarios.length === 0 && !abrirNovo && (
        <EmptyState
          icone={UserPlus}
          titulo="Nenhum usuário."
          descricao="Crie o primeiro por aqui."
          acao={{ label: 'Novo usuário', onClick: () => setAbrirNovo(true) }}
        />
      )}

      {usuarios.length > 0 && filtrados.length === 0 && (
        <p className="py-4 text-center text-sm text-muted">
          Nenhum usuário para “{busca.trim()}”.
        </p>
      )}

      {filtrados.map((u) => {
        const souEu = u.ra === eu?.ra;
        const aberto = painel?.ra === u.ra ? painel.modo : null;

        return (
          <Card key={u.ra} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-semibold">
                  {u.nome}
                  {souEu && <span className="text-xs text-muted">(você)</span>}
                </span>
                <span className="font-mono text-sm text-muted">{u.ra}</span>
                <span className="text-sm text-muted">{u.email}</span>
              </div>

              {u.isAdmin && (
                <span className="shrink-0 self-start rounded-full border border-lime/40 px-3 py-1 text-xs text-lime">
                  ● ADMIN
                </span>
              )}
            </div>

            {u.createdAt && (
              <span className="text-xs text-muted">
                cadastrado em {dataCurta(u.createdAt)}
              </span>
            )}

            {/* ── Painel: editar ── */}
            {aberto === 'editar' && (
              <div className="mt-2 flex flex-col gap-3 border-t border-line pt-3">
                <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label className="flex items-center gap-3 rounded-btn border border-line bg-surface px-3 py-3">
                  <input
                    type="checkbox"
                    checked={ehAdmin}
                    // Não deixa o próprio admin se rebaixar e ficar de fora — o back
                    // também barra, mas aqui já evita a ida à rede.
                    disabled={souEu}
                    onChange={(e) => setEhAdmin(e.target.checked)}
                    className="size-4 accent-lime disabled:opacity-50"
                  />
                  <span className="text-base">
                    Administrador
                    {souEu && (
                      <span className="ml-2 text-xs text-muted">
                        não dá para tirar o seu próprio
                      </span>
                    )}
                  </span>
                </label>

                {erroPainel && <p className="text-sm text-danger">{erroPainel}</p>}

                <div className="flex gap-2">
                  <Button
                    className="px-5 py-2 text-sm"
                    loading={salvando}
                    onClick={() => void salvarEdicao(u.ra)}
                    icone={<ArrowRight size={16} />}
                  >
                    Salvar
                  </Button>
                  <Button
                    variante="ghost"
                    className="w-auto px-5 py-2 text-sm"
                    onClick={fecharPainel}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* ── Painel: trocar senha ── */}
            {aberto === 'senha' && (
              <div className="mt-2 flex flex-col gap-3 border-t border-line pt-3">
                <Input
                  label="Nova senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="ao menos 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />

                {erroPainel && <p className="text-sm text-danger">{erroPainel}</p>}

                <div className="flex gap-2">
                  <Button
                    className="px-5 py-2 text-sm"
                    loading={salvando}
                    disabled={novaSenha.length < 6}
                    onClick={() => void salvarSenha(u.ra)}
                    icone={<ArrowRight size={16} />}
                  >
                    Trocar senha
                  </Button>
                  <Button
                    variante="ghost"
                    className="w-auto px-5 py-2 text-sm"
                    onClick={fecharPainel}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* ── Painel: confirmar remoção ── */}
            {aberto === 'remover' && (
              <div className="mt-2 flex flex-col gap-3 border-t border-danger/30 pt-3">
                <p className="text-sm text-muted">
                  Remover <strong className="text-white">{u.nome}</strong>? Isso apaga
                  também a persona, os relatórios e as chaves da conta. Não dá para
                  desfazer.
                </p>

                {erroPainel && <p className="text-sm text-danger">{erroPainel}</p>}

                <div className="flex gap-2">
                  <Button
                    variante="outline"
                    className="w-auto border-danger px-5 py-2 text-sm text-danger hover:bg-danger/10"
                    loading={salvando}
                    onClick={() => void remover(u.ra)}
                  >
                    Sim, remover
                  </Button>
                  <Button
                    variante="ghost"
                    className="w-auto px-5 py-2 text-sm"
                    onClick={fecharPainel}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* ── Rodapé de ações (escondido enquanto um painel está aberto) ── */}
            {!aberto && (
              <div className="-mx-4 -mb-4 mt-1 flex items-center justify-end gap-1 border-t border-line px-2 py-1.5 text-sm">
                <button
                  type="button"
                  onClick={() => abrirEditar(u)}
                  className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-lime transition-colors hover:bg-lime/10"
                >
                  <Pencil size={15} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => abrirSenha(u)}
                  className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-lime transition-colors hover:bg-lime/10"
                >
                  <KeyRound size={15} />
                  Senha
                </button>
                {!souEu && (
                  <button
                    type="button"
                    onClick={() => {
                      setPainel({ ra: u.ra, modo: 'remover' });
                      setErroPainel('');
                    }}
                    className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 size={15} />
                    Remover
                  </button>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* ── Novo usuário ── */}
      {abrirNovo ? (
        <Card>
          <form onSubmit={criar} className="flex flex-col gap-4">
            <p className="font-semibold">Novo usuário</p>

            <Input
              label="Nome"
              placeholder="Débora Silva"
              value={nNome}
              onChange={(e) => setNNome(e.target.value)}
              required
            />
            <Input
              label="RA"
              inputMode="numeric"
              placeholder="251000841"
              value={nRa}
              onChange={(e) => setNRa(e.target.value)}
              required
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="debora@email.com"
              value={nEmail}
              onChange={(e) => setNEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="ao menos 6 caracteres"
              value={nSenha}
              onChange={(e) => setNSenha(e.target.value)}
              required
            />

            {/* Curso é fixo — o enum do backend só tem TEOLOGIA. */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Curso</span>
              <div className="flex items-center justify-between rounded-btn border border-line bg-surface px-3 py-3">
                <span className="text-base">TEOLOGIA</span>
                <Lock size={16} className="text-muted" />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-btn border border-line bg-surface px-3 py-3">
              <input
                type="checkbox"
                checked={nAdmin}
                onChange={(e) => setNAdmin(e.target.checked)}
                className="size-4 accent-lime"
              />
              <span className="text-base">Administrador</span>
            </label>

            {erroNovo && <p className="text-sm text-danger">{erroNovo}</p>}

            <Button
              type="submit"
              loading={criando}
              disabled={nSenha.length < 6}
              icone={<ArrowRight size={18} />}
            >
              Criar usuário
            </Button>
            <Button variante="ghost" onClick={() => setAbrirNovo(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      ) : (
        usuarios.length > 0 && (
          <Button onClick={() => setAbrirNovo(true)} icone={<ArrowRight size={18} />}>
            <Plus size={18} />
            Novo usuário
          </Button>
        )
      )}
    </div>
  );
}

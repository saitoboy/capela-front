import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Check, Play } from 'lucide-react';
import { api } from '../api/client';
import type { Capela, Sinopse } from '../api/types';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { dataLonga, paraCampoData } from '../lib/format';

type Estado = 'carregando' | 'pronto' | 'erro';

export default function AdminCapela() {
  const { id = '' } = useParams();

  const [capela, setCapela] = useState<Capela | null>(null);
  const [estado, setEstado] = useState<Estado>('carregando');
  const [erro, setErro] = useState('');

  const [tema, setTema] = useState('');
  const [textoBiblico, setTextoBiblico] = useState('');
  const [pregador, setPregador] = useState('');
  const [data, setData] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [gerando, setGerando] = useState(false);

  function carregar(c: Capela) {
    setCapela(c);
    setTema(c.tema ?? '');
    setTextoBiblico(c.textoBiblico ?? '');
    setPregador(c.pregador ?? '');
    setData(paraCampoData(c.data));
  }

  useEffect(() => {
    api<Capela>(`/capela/${id}`)
      .then((c) => {
        carregar(c);
        setEstado('pronto');
      })
      .catch((e: Error) => {
        setErro(e.message);
        setEstado('erro');
      });
  }, [id]);

  async function salvar(evento: FormEvent) {
    evento.preventDefault();

    setSalvando(true);
    setErro('');
    setSalvo(false);

    try {
      // Campo enviado vazio vira NULL no backend — "preenchido em branco" é vazio.
      const atualizada = await api<Capela>(`/capela/${id}`, {
        metodo: 'PATCH',
        corpo: { tema, textoBiblico, pregador, data },
      });

      carregar(atualizada);
      setSalvo(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function gerarSinopse() {
    setGerando(true);
    setErro('');

    try {
      const sinopse = await api<Sinopse>(`/sinopse/${id}`, { metodo: 'POST' });
      setCapela((c) => (c ? { ...c, sinopse } : c));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setGerando(false);
    }
  }

  if (estado === 'carregando') {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        <div className="h-96 animate-pulse rounded-card border border-line bg-surface" />
      </div>
    );
  }

  if (estado === 'erro' || !capela) {
    return <p className="pt-8 text-sm text-danger">{erro}</p>;
  }

  // A IA recusa (422) sem tema nem texto bíblico — sem nada disso, ela inventaria
  // a pregação inteira. Um dos dois já libera.
  const podeGerarSinopse = !!tema.trim() || !!textoBiblico.trim();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">
          Capela {String(capela.indice).padStart(2, '0')}
        </h1>
        <p className="text-sm text-muted">{dataLonga(capela.data)}</p>
      </div>

      {capela.url && (
        <a
          href={capela.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-btn border border-lime px-4 py-3 font-semibold text-lime"
        >
          <Play size={16} />
          Assistir no YouTube
        </a>
      )}

      <form onSubmit={salvar} className="flex flex-col gap-4">
        {/* Borda âmbar = tarefa pendente, não erro. E o placeholder é "Em branco",
            nunca "(não encontrado)" — o backend acabou de parar de mentir esse dado. */}
        <Input
          label="Tema"
          placeholder="Em branco"
          value={tema}
          pendente={!tema.trim()}
          onChange={(e) => setTema(e.target.value)}
        />

        <Input
          label="Texto bíblico"
          placeholder="Em branco"
          value={textoBiblico}
          pendente={!textoBiblico.trim()}
          onChange={(e) => setTextoBiblico(e.target.value)}
        />

        <Input
          label="Pregador"
          placeholder="Em branco"
          value={pregador}
          pendente={!pregador.trim()}
          onChange={(e) => setPregador(e.target.value)}
        />

        <Input
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <Button
          type="submit"
          loading={salvando}
          icone={salvo ? <Check size={18} /> : <ArrowRight size={18} />}
        >
          {salvo ? 'Salvo' : 'Salvar'}
        </Button>
      </form>

      <hr className="my-2 border-line" />

      <p className="text-xs tracking-widest text-muted">SINOPSE</p>

      <Card className="flex flex-col gap-3">
        {capela.sinopse ? (
          <p className="text-sm whitespace-pre-line">{capela.sinopse.texto}</p>
        ) : (
          <p className="text-sm text-muted">Ainda não gerada.</p>
        )}

        <Button
          loading={gerando}
          disabled={!podeGerarSinopse}
          onClick={() => void gerarSinopse()}
          icone={<ArrowRight size={18} />}
        >
          {capela.sinopse ? 'Gerar novamente' : 'Gerar sinopse'}
        </Button>

        {!podeGerarSinopse && (
          <p className="text-sm text-muted">
            Preencha o tema ou o texto bíblico antes — sem nenhum dos dois, a IA
            não tem do que escrever.
          </p>
        )}
      </Card>
    </div>
  );
}

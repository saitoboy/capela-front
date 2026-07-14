import type { Persona } from '../api/types';
import Card from './Card';

/** O card grande da persona — aparece em /persona e no resultado do teste. */
export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Card className="flex flex-col items-center gap-1 py-8 text-center">
      <p className="text-5xl font-semibold tracking-wide text-lime">{persona.tipo}</p>
      <p className="text-xl font-semibold">{persona.nome}</p>
      <p className="text-sm text-muted">{persona.tom}</p>
    </Card>
  );
}

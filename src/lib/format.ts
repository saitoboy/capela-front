/** Campo que a IA não extraiu vira travessão — nunca "null", nunca texto inventado. */
export const TRACO = '—';

export function ouTraco(valor: string | null | undefined): string {
  return valor?.trim() ? valor : TRACO;
}

/** "04 mar" — usado na lista de capelas. */
export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** "18 mar 2026" */
export function dataLonga(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "fev – jul" — o período de um semestre, na lista do admin. */
export function periodoCurto(inicio: string, fim: string): string {
  const mes = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
      .replace('.', '');

  return `${mes(inicio)} – ${mes(fim)}`;
}

/** "2026-02-24T00:00:00.000Z" → "2026-02-24", que é o que o <input type="date"> quer. */
export function paraCampoData(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** "14:30" — quando uma chave esgotada da Groq volta. */
export function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "há 2 min" — último uso de uma chave. */
export function tempoRelativo(iso: string): string {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  return `há ${Math.round(horas / 24)} d`;
}

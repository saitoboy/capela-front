import { apiBlob } from '../api/client';

/**
 * O download do .docx exige o header Authorization, então um <a href> simples não
 * serve: baixa o blob autenticado e dispara um link temporário.
 */
export async function baixarRelatorio(id: string, nomeArquivo: string): Promise<void> {
  const blob = await apiBlob(`/relatorio/${id}/docx`);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo.endsWith('.docx') ? nomeArquivo : `${nomeArquivo}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

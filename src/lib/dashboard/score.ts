// Conversao linear da escala Likert (1 a 5) para percentual (0% a 100%): 1 -> 0%, 3 -> 50%,
// 5 -> 100%. Usada tanto no indice por dimensao quanto no escore geral do dashboard.
export function paraPercentual(valor1a5: number): number {
  return ((valor1a5 - 1) / 4) * 100;
}

export function formatarPercentual(valor1a5: number | null | undefined): string {
  if (valor1a5 === null || valor1a5 === undefined || Number.isNaN(valor1a5)) return "—";
  return `${Math.round(paraPercentual(valor1a5))}%`;
}

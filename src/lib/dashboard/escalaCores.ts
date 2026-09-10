// Paleta fixa para valores 1-5 (Likert/saude), reaproveitada no formulario (LikertButton) e no
// dashboard (comparacoes por categoria), para o mesmo valor ter sempre a mesma cor no app.
// Classes estaticas: interpolacao dinamica de classes Tailwind e purgada pelo JIT.
export const BG_ESCALA_1A5 = [
  "bg-orange-500",
  "bg-amber-500",
  "bg-slate-500",
  "bg-lime-500",
  "bg-emerald-500",
];

// Rampa separada para a Escala de Impacto (0-100, continua): sem tom neutro/cinza no meio -
// BG_ESCALA_1A5 usa slate no "3" porque ali o "3" e literalmente "Neutro" num Likert de
// concordancia. Aqui o meio da escala ainda precisa parecer colorido, entao troca o cinza por
// amarelo.
const BG_ESCALA_IMPACTO = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
];

// Divide 0-100 em 5 faixas iguais e devolve a cor da faixa correspondente.
export function corPorPontuacao(pontos: number): string {
  const indice = Math.min(4, Math.max(0, Math.floor(pontos / 20)));
  return BG_ESCALA_IMPACTO[indice];
}

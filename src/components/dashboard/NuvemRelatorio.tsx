import type { PalavraContagem } from "@/lib/dashboard/positiveLexicon";

const VW_MIN = 3;
const VW_MAX = 7;
const PX_PISO = 14;
const PX_TETO = 52;

function tamanhoFonte(proporcao: number): string {
  const vw = VW_MIN + proporcao * (VW_MAX - VW_MIN);
  return `clamp(${PX_PISO}px, ${vw}vw, ${PX_TETO}px)`;
}

// Interpola de roxo a verde-esmeralda - mesma dupla de cores do banner do evento, reaproveitada
// aqui pra dar unidade visual ao relatório sem depender de imagem nenhuma.
function corDe(proporcao: number): string {
  const de = { r: 124, g: 58, b: 237 }; // violet-600
  const para = { r: 4, g: 120, b: 87 }; // emerald-700
  const r = Math.round(de.r + (para.r - de.r) * proporcao);
  const g = Math.round(de.g + (para.g - de.g) * proporcao);
  const b = Math.round(de.b + (para.b - de.b) * proporcao);
  return `rgb(${r}, ${g}, ${b})`;
}

// Versao estatica (sem animacao/polling) da nuvem de palavras, pensada pra impressao/PDF - a
// versao "ao vivo" (NuvemAoVivo) e pro totem do evento, essa aqui e pro relatorio consolidado.
export function NuvemRelatorio({ palavras }: { palavras: PalavraContagem[] | null }) {
  const maxN = palavras?.[0]?.n ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-slate-800">Valores do Esporte</h3>
      <p className="mb-4 text-xs text-slate-400">
        Palavras mais citadas na pergunta &ldquo;Qual o maior valor do Esporte?&rdquo;
      </p>
      {!palavras || palavras.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Ainda sem respostas suficientes.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-center">
          {palavras.map((p) => {
            const proporcao = maxN > 1 ? (p.n - 1) / (maxN - 1) : 1;
            return (
              <span
                key={p.palavra}
                className="font-bold leading-none"
                style={{ fontSize: tamanhoFonte(proporcao), color: corDe(proporcao) }}
              >
                {p.palavra}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

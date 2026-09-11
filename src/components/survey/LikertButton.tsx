"use client";

import type { OpcaoResposta } from "@/lib/types/survey";

// Classes estaticas: interpolacao dinamica de classes Tailwind (`bg-${cor}`) e purgada pelo JIT.
const CORES_INATIVO = [
  "border-orange-300 text-orange-700 hover:bg-orange-50",
  "border-amber-300 text-amber-700 hover:bg-amber-50",
  "border-slate-300 text-slate-600 hover:bg-slate-50",
  "border-lime-300 text-lime-700 hover:bg-lime-50",
  "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
];

const CORES_ATIVO = [
  "bg-orange-500 border-orange-500 text-white",
  "bg-amber-500 border-amber-500 text-white",
  "bg-slate-500 border-slate-500 text-white",
  "bg-lime-500 border-lime-500 text-white",
  "bg-emerald-500 border-emerald-500 text-white",
];

const LABELS_PADRAO = [
  "Discordo Totalmente",
  "Discordo Parcialmente",
  "Neutro",
  "Concordo Parcialmente",
  "Concordo Totalmente",
];

type LikertButtonProps = {
  valor: number | undefined;
  onChange: (valor: number) => void;
  opcoes?: OpcaoResposta[] | null;
};

export function LikertButton({ valor, onChange, opcoes }: LikertButtonProps) {
  const escalas = [1, 2, 3, 4, 5];
  const labelDe = (n: number, i: number) => opcoes?.find((o) => o.valor === n)?.label ?? LABELS_PADRAO[i];
  const labelSelecionado = valor !== undefined ? labelDe(valor, valor - 1) : null;

  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {escalas.map((n, i) => {
          const ativo = valor === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={ativo}
              aria-label={labelDe(n, i)}
              onClick={() => onChange(n)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-2 text-xl font-semibold transition-colors active:scale-95 ${
                ativo ? CORES_ATIVO[i] : `bg-white ${CORES_INATIVO[i]}`
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-sm text-slate-500">
        <span className="max-w-[45%]">{labelDe(1, 0)}</span>
        <span className="max-w-[45%] text-right">{labelDe(5, 4)}</span>
      </div>
      {labelSelecionado && (
        <p className="mt-1 text-center text-base font-medium text-slate-700">{labelSelecionado}</p>
      )}
    </div>
  );
}

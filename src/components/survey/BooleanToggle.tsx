"use client";

import type { OpcaoResposta } from "@/lib/types/survey";

type BooleanToggleProps = {
  valor: number | undefined;
  onChange: (valor: number) => void;
  opcoes?: OpcaoResposta[] | null;
};

export function BooleanToggle({ valor, onChange, opcoes }: BooleanToggleProps) {
  const labelSim = opcoes?.find((o) => o.valor === 1)?.label ?? "Sim";
  const labelNao = opcoes?.find((o) => o.valor === 0)?.label ?? "Não";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        aria-pressed={valor === 1}
        onClick={() => onChange(1)}
        className={`min-h-14 rounded-xl border-2 text-lg font-semibold transition-colors active:scale-95 ${
          valor === 1
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        {labelSim}
      </button>
      <button
        type="button"
        aria-pressed={valor === 0}
        onClick={() => onChange(0)}
        className={`min-h-14 rounded-xl border-2 text-lg font-semibold transition-colors active:scale-95 ${
          valor === 0
            ? "border-slate-500 bg-slate-500 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        {labelNao}
      </button>
    </div>
  );
}

"use client";

type NumericInputProps = {
  valor: number | undefined;
  onChange: (valor: number) => void;
  sufixo?: string;
};

export function NumericInput({ valor, onChange, sufixo }: NumericInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={120}
        value={valor ?? ""}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="min-h-14 w-28 rounded-xl border-2 border-slate-300 px-4 text-center text-lg font-semibold text-slate-800 focus:border-slate-500 focus:outline-none"
      />
      {sufixo && <span className="text-slate-600">{sufixo}</span>}
    </div>
  );
}

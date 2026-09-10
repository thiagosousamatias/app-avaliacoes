"use client";

type TextInputProps = {
  valor: string | undefined;
  onChange: (valor: string) => void;
  maxLength: number;
};

export function TextInput({ valor, onChange, maxLength }: TextInputProps) {
  const texto = valor ?? "";

  return (
    <div>
      <textarea
        value={texto}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Opcional…"
        className="w-full rounded-xl border-2 border-slate-300 p-3 text-base text-slate-800 focus:border-slate-500 focus:outline-none"
      />
      <p className="mt-1 text-right text-xs text-slate-400">
        {texto.length}/{maxLength}
      </p>
    </div>
  );
}

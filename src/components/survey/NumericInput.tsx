"use client";

import { useState } from "react";

type NumericInputProps = {
  valor: number | undefined;
  onChange: (valor: number) => void;
  sufixo?: string;
};

// type="text" + inputMode="numeric" em vez de type="number": o input nativo "number" com
// min/max atrapalha a edicao no celular (o navegador tenta corrigir/clampar enquanto voce
// ainda esta digitando, dificultando apagar e corrigir um numero de 3 digitos). Aqui o texto
// digitado fica livre, so filtramos pra manter apenas digitos.
export function NumericInput({ valor, onChange, sufixo }: NumericInputProps) {
  const [texto, setTexto] = useState(valor !== undefined ? String(valor) : "");

  function handleChange(novoTexto: string) {
    const apenasDigitos = novoTexto.replace(/\D/g, "");
    setTexto(apenasDigitos);
    if (apenasDigitos !== "") {
      onChange(Number(apenasDigitos));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={texto}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-14 w-28 rounded-xl border-2 border-slate-300 px-4 text-center text-xl font-semibold text-slate-800 focus:border-slate-500 focus:outline-none"
      />
      {sufixo && <span className="text-lg text-slate-600">{sufixo}</span>}
    </div>
  );
}

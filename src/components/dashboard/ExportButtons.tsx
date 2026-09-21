"use client";

import { useState } from "react";
import { baixarDadosBrutosCsv } from "@/lib/dashboard/exportCsv";

type ExportButtonsProps = {
  pesquisaId: string;
  pesquisaSlug: string;
};

export function ExportButtons({ pesquisaId, pesquisaSlug }: ExportButtonsProps) {
  const [baixando, setBaixando] = useState(false);

  async function handleCsv() {
    setBaixando(true);
    try {
      await baixarDadosBrutosCsv(pesquisaId, pesquisaSlug);
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      <button
        type="button"
        onClick={handleCsv}
        disabled={baixando}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        {baixando ? "Gerando…" : "Baixar dados (CSV)"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
      >
        Baixar relatório (PDF)
      </button>
    </div>
  );
}

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
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {baixando ? "Gerando…" : "Baixar dados (CSV)"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Baixar relatório (PDF)
      </button>
    </div>
  );
}

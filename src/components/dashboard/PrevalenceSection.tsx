"use client";

import { useMemo } from "react";
import { BG_ESCALA_1A5 } from "@/lib/dashboard/escalaCores";
import type { OpcaoResposta, SessionScore } from "@/lib/types/survey";

const LABELS_PADRAO = ["1", "2", "3", "4", "5"];

function PrevalenceBlock({
  titulo,
  sessoes,
  variavel,
  opcoes,
}: {
  titulo: string;
  sessoes: SessionScore[];
  variavel: "saude_fisica" | "saude_mental";
  opcoes: OpcaoResposta[];
}) {
  const dados = useMemo(() => {
    const total = sessoes.filter((s) => s[variavel] !== null).length;
    return [1, 2, 3, 4, 5].map((categoria) => {
      const n = sessoes.filter((s) => s[variavel] === categoria).length;
      return {
        categoria,
        label: opcoes.find((o) => o.valor === categoria)?.label ?? LABELS_PADRAO[categoria - 1],
        n,
        pct: total > 0 ? (n / total) * 100 : 0,
      };
    });
  }, [sessoes, variavel, opcoes]);

  const maxPct = Math.max(1, ...dados.map((d) => d.pct));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-800">{titulo}</h3>
      <div className="space-y-2">
        {dados.map((d) => (
          <div key={d.categoria} className="flex items-center gap-2 text-sm">
            <span className="w-28 shrink-0 truncate text-slate-600">{d.label}</span>
            <div className="h-3 flex-1 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${BG_ESCALA_1A5[d.categoria - 1]}`}
                style={{ width: `${(d.pct / maxPct) * 100}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-slate-500">
              {Math.round(d.pct)}% (n={d.n})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type PrevalenceSectionProps = {
  sessoes: SessionScore[];
  opcoesSaudeFisica: OpcaoResposta[];
  opcoesSaudeMental: OpcaoResposta[];
};

export function PrevalenceSection({
  sessoes,
  opcoesSaudeFisica,
  opcoesSaudeMental,
}: PrevalenceSectionProps) {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Prevalência de percepção de saúde
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Quantos respondentes se enquadram em cada categoria de autopercepção de saúde.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <PrevalenceBlock
          titulo="Saúde física"
          sessoes={sessoes}
          variavel="saude_fisica"
          opcoes={opcoesSaudeFisica}
        />
        <PrevalenceBlock
          titulo="Saúde mental"
          sessoes={sessoes}
          variavel="saude_mental"
          opcoes={opcoesSaudeMental}
        />
      </div>
    </div>
  );
}

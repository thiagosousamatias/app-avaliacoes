"use client";

import { useMemo } from "react";
import { studentTTest } from "@/lib/dashboard/stats";
import { paraPercentual } from "@/lib/dashboard/score";
import { BG_ESCALA_1A5 } from "@/lib/dashboard/escalaCores";
import type { SessionScore } from "@/lib/types/survey";

const COR_0 = BG_ESCALA_1A5[0];
const COR_1 = BG_ESCALA_1A5[4];

type DichotomousSectionProps = {
  titulo: string; // ex: "Saúde física"
  sessoes: SessionScore[];
  getValor: (s: SessionScore) => 0 | 1 | null;
  label0: string; // ex: "Ruim" / "Não"
  label1: string; // ex: "Boa" / "Sim"
};

export function DichotomousSection({
  titulo,
  sessoes,
  getValor,
  label0,
  label1,
}: DichotomousSectionProps) {
  const { prevalencia, media1Pontos, media0Pontos, significativo } = useMemo(() => {
    const pares = sessoes
      .map((s) => ({ s, v: getValor(s) }))
      .filter((p): p is { s: SessionScore; v: 0 | 1 } => p.v !== null);
    const grupo1 = pares.filter((p) => p.v === 1).map((p) => p.s);
    const grupo0 = pares.filter((p) => p.v === 0).map((p) => p.s);
    const total = pares.length;

    const resultado = studentTTest(
      grupo1.map((s) => s.overall),
      grupo0.map((s) => s.overall),
    );

    return {
      prevalencia: [
        { grupo: 1, label: label1, n: grupo1.length, pct: total > 0 ? (grupo1.length / total) * 100 : 0 },
        { grupo: 0, label: label0, n: grupo0.length, pct: total > 0 ? (grupo0.length / total) * 100 : 0 },
      ],
      resultado,
      media1Pontos: grupo1.length ? Math.round(paraPercentual(resultado.mediaA)) : null,
      media0Pontos: grupo0.length ? Math.round(paraPercentual(resultado.mediaB)) : null,
      significativo: resultado.pValor !== null && resultado.pValor < 0.05,
    };
  }, [sessoes, getValor, label0, label1]);

  const maxPontos = Math.max(1, media1Pontos ?? 0, media0Pontos ?? 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{titulo}</h3>
        {significativo && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Diferença relevante
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {prevalencia.map((p) => (
          <div key={p.grupo}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">{p.label}</span>
              <span className="text-xs text-slate-400">n={p.n}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${p.grupo === 1 ? COR_1 : COR_0}`}
                style={{ width: `${p.pct}%` }}
              />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800">
              {Math.round(p.pct)}%
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          Impacto Geral
        </p>
        <div className="space-y-1.5">
          {[
            { label: label1, pontos: media1Pontos, cor: COR_1 },
            { label: label0, pontos: media0Pontos, cor: COR_0 },
          ].map((g) => (
            <div key={g.label} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-sm text-slate-600">{g.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                <div
                  className={`h-2.5 rounded-full ${g.cor}`}
                  style={{ width: `${((g.pontos ?? 0) / maxPontos) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                {g.pontos ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

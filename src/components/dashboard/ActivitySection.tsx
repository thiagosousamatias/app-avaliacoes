"use client";

import { useMemo } from "react";
import { studentTTest, type StudentTTestResult } from "@/lib/dashboard/stats";
import { paraPercentual } from "@/lib/dashboard/score";
import { BG_ESCALA_1A5 } from "@/lib/dashboard/escalaCores";
import type { OpcaoResposta, SessionScore } from "@/lib/types/survey";

const COR_NAO = BG_ESCALA_1A5[0];
const COR_SIM = BG_ESCALA_1A5[4];

function interpretar(resultado: StudentTTestResult): string {
  if (resultado.t === null || resultado.pValor === null) {
    return "Dados insuficientes para comparar os dois grupos.";
  }
  const significativo = resultado.pValor < 0.05;
  if (!significativo) {
    return `Não foi encontrada diferença estatisticamente significativa no Impacto Geral entre quem se considera fisicamente ativo e quem não (p = ${resultado.pValor.toFixed(3)}).`;
  }
  const quemMaior = resultado.mediaA > resultado.mediaB ? "ativas" : "não ativas";
  return `Pessoas fisicamente ${quemMaior} relatam Impacto Geral significativamente maior (teste t de Student, p = ${resultado.pValor.toFixed(3)}).`;
}

export function ActivitySection({
  sessoes,
  opcoes,
}: {
  sessoes: SessionScore[];
  opcoes: OpcaoResposta[];
}) {
  const labelSim = opcoes.find((o) => o.valor === 1)?.label ?? "Sim";
  const labelNao = opcoes.find((o) => o.valor === 0)?.label ?? "Não";

  const { prevalencia, resultado, mediaSimPontos, mediaNaoPontos } = useMemo(() => {
    const validas = sessoes.filter((s) => s.ativo_fisicamente !== null);
    const sim = validas.filter((s) => s.ativo_fisicamente === 1);
    const nao = validas.filter((s) => s.ativo_fisicamente === 0);
    const total = validas.length;

    const resultado = studentTTest(
      sim.map((s) => s.overall),
      nao.map((s) => s.overall),
    );

    return {
      prevalencia: [
        { categoria: 1, label: labelSim, n: sim.length, pct: total > 0 ? (sim.length / total) * 100 : 0 },
        { categoria: 0, label: labelNao, n: nao.length, pct: total > 0 ? (nao.length / total) * 100 : 0 },
      ],
      resultado,
      mediaSimPontos: sim.length ? Math.round(paraPercentual(resultado.mediaA)) : null,
      mediaNaoPontos: nao.length ? Math.round(paraPercentual(resultado.mediaB)) : null,
    };
  }, [sessoes, labelSim, labelNao]);

  const maxPontos = Math.max(1, mediaSimPontos ?? 0, mediaNaoPontos ?? 0);

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Atividade física × Impacto Geral
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Quantos respondentes se consideram fisicamente ativos, e se o Impacto Geral difere entre
        os dois grupos (teste t de Student para 2 amostras independentes).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">Fisicamente ativo</h3>
          <div className="space-y-2">
            {prevalencia.map((p) => (
              <div key={p.categoria} className="flex items-center gap-2 text-sm">
                <span className="w-16 shrink-0 truncate text-slate-600">{p.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${p.categoria === 1 ? COR_SIM : COR_NAO}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-slate-500">
                  {Math.round(p.pct)}% (n={p.n})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">Comparação do Impacto Geral</h3>
          <div className="space-y-2">
            {[
              { label: labelSim, pontos: mediaSimPontos, cor: COR_SIM, n: resultado.nA },
              { label: labelNao, pontos: mediaNaoPontos, cor: COR_NAO, n: resultado.nB },
            ].map((g) => (
              <div key={g.label} className="flex items-center gap-2 text-sm">
                <span className="w-16 shrink-0 truncate text-slate-600">{g.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${g.cor}`}
                    style={{ width: `${((g.pontos ?? 0) / maxPontos) * 100}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-slate-500">
                  {g.pontos ?? "—"} pts (n={g.n})
                </span>
              </div>
            ))}
          </div>
          {resultado.t !== null && resultado.df !== null && (
            <p className="mt-3 text-xs text-slate-500">
              t({resultado.df}) = {resultado.t.toFixed(2)}, p = {resultado.pValor?.toFixed(3)}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-700">{interpretar(resultado)}</p>
        </div>
      </div>
    </div>
  );
}

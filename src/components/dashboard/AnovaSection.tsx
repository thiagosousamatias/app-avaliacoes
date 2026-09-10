"use client";

import { useMemo } from "react";
import { oneWayAnova } from "@/lib/dashboard/stats";
import { paraPercentual } from "@/lib/dashboard/score";
import { BG_ESCALA_1A5 } from "@/lib/dashboard/escalaCores";
import type { OpcaoResposta, SessionScore } from "@/lib/types/survey";

const LABELS_PADRAO = ["1", "2", "3", "4", "5"];

function AnovaBlock({
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
  const resultado = useMemo(() => {
    const grupos = [1, 2, 3, 4, 5].map((categoria) => ({
      categoria,
      label: opcoes.find((o) => o.valor === categoria)?.label ?? LABELS_PADRAO[categoria - 1],
      valores: sessoes.filter((s) => s[variavel] === categoria).map((s) => s.overall),
    }));
    return oneWayAnova(grupos);
  }, [sessoes, variavel, opcoes]);

  const diferencasSignificativas = resultado.posHoc.filter((p) => p.significativo);
  const maxPct = Math.max(1, ...resultado.grupos.map((g) => paraPercentual(g.media)));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-800">{titulo}</h3>

      {resultado.grupos.length === 0 ? (
        <p className="text-sm text-slate-400">Sem dados suficientes ainda.</p>
      ) : (
        <div className="space-y-2">
          {resultado.grupos.map((g) => {
            const pontos = paraPercentual(g.media);
            const cor = BG_ESCALA_1A5[g.categoria - 1];
            return (
              <div key={g.categoria} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0 truncate text-slate-600">{g.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${cor}`}
                    style={{ width: `${(pontos / maxPct) * 100}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-slate-500">
                  {Math.round(pontos)} pts (n={g.n})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {resultado.f !== null && resultado.pValor !== null && (
        <p className="mt-3 text-xs text-slate-500">
          ANOVA: F({resultado.df1}, {resultado.df2}) = {resultado.f.toFixed(2)}, p ={" "}
          {resultado.pValor.toFixed(3)}
          {resultado.pValor < 0.05 ? " (diferença significativa entre categorias)" : " (sem diferença significativa)"}
        </p>
      )}

      {diferencasSignificativas.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-slate-500">
            Diferenças significativas (post-hoc, Bonferroni):
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
            {diferencasSignificativas.map((p) => (
              <li key={`${p.a}-${p.b}`}>
                {p.a} vs {p.b}: p ajustado = {p.pAjustado.toFixed(3)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type AnovaSectionProps = {
  sessoes: SessionScore[];
  opcoesSaudeFisica: OpcaoResposta[];
  opcoesSaudeMental: OpcaoResposta[];
};

export function AnovaSection({ sessoes, opcoesSaudeFisica, opcoesSaudeMental }: AnovaSectionProps) {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Impacto Geral por categoria de saúde
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Compara a média do Impacto Geral (escala 0 a 100) entre as categorias de cada pergunta
        de saúde (ANOVA one-way). Quando o teste indica diferença, o post-hoc aponta quais
        categorias diferem entre si, já corrigido para múltiplas comparações (Bonferroni) — mais
        conservador que olhar cada par isoladamente.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <AnovaBlock
          titulo="Saúde física"
          sessoes={sessoes}
          variavel="saude_fisica"
          opcoes={opcoesSaudeFisica}
        />
        <AnovaBlock
          titulo="Saúde mental"
          sessoes={sessoes}
          variavel="saude_mental"
          opcoes={opcoesSaudeMental}
        />
      </div>
    </div>
  );
}

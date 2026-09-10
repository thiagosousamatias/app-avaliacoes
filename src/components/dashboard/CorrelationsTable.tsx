"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { spearman, type CorrelationResult } from "@/lib/dashboard/stats";
import { paraPercentual } from "@/lib/dashboard/score";
import type { SessionScore } from "@/lib/types/survey";

type CorrelationsTableProps = {
  sessoes: SessionScore[];
};

function interpretar(nomeVariavel: string, resultado: CorrelationResult): string {
  if (resultado.rho === null || resultado.pValor === null) {
    return "Dados insuficientes para avaliar essa relação.";
  }
  const forca = Math.abs(resultado.rho) >= 0.5 ? "forte" : Math.abs(resultado.rho) >= 0.3 ? "moderada" : "fraca";
  const direcao = resultado.rho >= 0 ? "maior" : "menor";
  const significativo = resultado.pValor < 0.05;

  if (!significativo) {
    return `Não foi encontrada relação estatisticamente significativa entre ${nomeVariavel} e o Impacto Geral nesta amostra (p = ${resultado.pValor.toFixed(3)}).`;
  }
  return `Quanto melhor a ${nomeVariavel}, ${direcao} tende a ser o Impacto Geral — correlação ${forca} e estatisticamente significativa (p = ${resultado.pValor.toFixed(3)}).`;
}

function CorrelationBlock({
  titulo,
  nomeVariavel,
  pontos,
  resultado,
}: {
  titulo: string;
  nomeVariavel: string;
  pontos: { x: number; y: number }[];
  resultado: CorrelationResult;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 font-semibold text-slate-800">{titulo}</h3>
      <p className="mb-3 text-xs text-slate-400">
        Cada ponto é uma resposta: posição horizontal = saúde percebida (1 a 5), posição
        vertical = Impacto Geral (0 a 100).
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name={titulo}
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Impacto Geral"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Scatter data={pontos} fill="#0f172a" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-slate-700">{interpretar(nomeVariavel, resultado)}</p>
      <p className="mt-1 text-xs text-slate-400">
        ρ (Spearman) = {resultado.rho === null ? "—" : resultado.rho.toFixed(2)} · n =
        {" "}
        {resultado.n}
      </p>
    </div>
  );
}

export function CorrelationsTable({ sessoes }: CorrelationsTableProps) {
  const { saudeFisica, saudeMental } = useMemo(() => {
    const validasFisica = sessoes.filter((s) => s.saude_fisica !== null);
    const validasMental = sessoes.filter((s) => s.saude_mental !== null);

    return {
      saudeFisica: {
        pontos: validasFisica.map((s) => ({
          x: s.saude_fisica as number,
          y: Math.round(paraPercentual(s.overall)),
        })),
        resultado: spearman(
          validasFisica.map((s) => s.saude_fisica as number),
          validasFisica.map((s) => s.overall),
        ),
      },
      saudeMental: {
        pontos: validasMental.map((s) => ({
          x: s.saude_mental as number,
          y: Math.round(paraPercentual(s.overall)),
        })),
        resultado: spearman(
          validasMental.map((s) => s.saude_mental as number),
          validasMental.map((s) => s.overall),
        ),
      },
    };
  }, [sessoes]);

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Saúde × Impacto Geral
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Correlação de Spearman entre a saúde percebida e o Impacto Geral. Mede se as duas coisas
        tendem a crescer/diminuir juntas — não prova causa e efeito.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CorrelationBlock
          titulo="Saúde física"
          nomeVariavel="saúde física percebida"
          pontos={saudeFisica.pontos}
          resultado={saudeFisica.resultado}
        />
        <CorrelationBlock
          titulo="Saúde mental"
          nomeVariavel="saúde mental percebida"
          pontos={saudeMental.pontos}
          resultado={saudeMental.resultado}
        />
      </div>
    </div>
  );
}

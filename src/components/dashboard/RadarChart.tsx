"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardData } from "@/lib/types/survey";

type RadarChartProps = {
  radar: DashboardData["radar"];
};

export function RadarChart({ radar }: RadarChartProps) {
  if (radar.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        Sem respostas suficientes para exibir o radar ainda.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={radar} outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimensao_nome"
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <PolarRadiusAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(1), "Média (1 a 5)"]}
            contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Radar
            name="Média"
            dataKey="media"
            stroke="#0f172a"
            fill="#0f172a"
            fillOpacity={0.35}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

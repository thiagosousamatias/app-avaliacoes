import { paraPercentual } from "@/lib/dashboard/score";
import { corPorPontuacao } from "@/lib/dashboard/escalaCores";
import type { DashboardData } from "@/lib/types/survey";

type ScoreIndexProps = {
  radar: DashboardData["radar"];
  impactoGeral: number | null;
};

function BarraPontuacao({ pontos }: { pontos: number | null }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className={`h-2 rounded-full transition-all ${corPorPontuacao(pontos ?? 0)}`}
        style={{ width: `${pontos ?? 0}%` }}
      />
    </div>
  );
}

function ScoreTile({ label, valor1a5 }: { label: string; valor1a5: number | null }) {
  const pontos = valor1a5 !== null ? Math.round(paraPercentual(valor1a5)) : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="min-h-8 text-xs leading-4 text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-800">{pontos ?? "—"}</p>
      <div className="mt-2">
        <BarraPontuacao pontos={pontos} />
      </div>
    </div>
  );
}

export function ScoreIndex({ radar, impactoGeral }: ScoreIndexProps) {
  const pontosGeral = impactoGeral !== null ? Math.round(paraPercentual(impactoGeral)) : null;

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm print:border-slate-300">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Impacto Geral
        </p>
        <p className="mt-1 text-6xl font-bold tabular-nums text-slate-800">
          {pontosGeral ?? "—"}
        </p>
        <div className="mx-auto mt-3 max-w-xs">
          <BarraPontuacao pontos={pontosGeral} />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Escala de Impacto: 0 = sem impacto · 100 = maior impacto
        </p>
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Índice por dimensão
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {radar.map((d) => (
          <ScoreTile key={d.dimensao_id} label={d.dimensao_nome} valor1a5={d.media} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Cada resposta usa escala de 1 a 5. Os valores acima convertem essa média para a Escala
        de Impacto (0 a 100): 1 → 0, 3 → 50, 5 → 100. O Impacto Geral é a média das 5 dimensões.
      </p>
    </div>
  );
}

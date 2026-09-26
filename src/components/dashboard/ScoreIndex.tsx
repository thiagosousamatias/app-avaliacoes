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
      <p className="min-h-9 text-sm font-medium leading-tight text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-800">{pontos ?? "—"}</p>
      <div className="mt-2">
        <BarraPontuacao pontos={pontos} />
      </div>
    </div>
  );
}

// Barra grande do indice geral, com escala numerica (0-100) e os extremos nomeados - o numero
// grande sozinho nao deixava claro que 0 = sem impacto e 100 = impacto maximo.
function BarraIndiceGeral({ pontos }: { pontos: number | null }) {
  const p = pontos ?? 0;
  return (
    <div className="mx-auto mt-4 max-w-md">
      <div className="h-6 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-6 rounded-full transition-all ${corPorPontuacao(p)}`}
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] font-medium text-slate-400 tabular-nums">
        <span className="absolute left-0">0</span>
        <span className="absolute left-1/4 -translate-x-1/2">25</span>
        <span className="absolute left-1/2 -translate-x-1/2">50</span>
        <span className="absolute left-3/4 -translate-x-1/2">75</span>
        <span className="absolute right-0">100</span>
      </div>
      <div className="mt-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>Sem impacto</span>
        <span>Alto impacto</span>
      </div>
    </div>
  );
}

export function ScoreIndex({ radar, impactoGeral }: ScoreIndexProps) {
  const pontosGeral = impactoGeral !== null ? Math.round(paraPercentual(impactoGeral)) : null;

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm print:border-slate-300">
        <p className="text-base font-semibold text-slate-500">Impacto Geral</p>
        <p className="mt-1 text-7xl font-bold tabular-nums text-slate-800">
          {pontosGeral ?? "—"}
        </p>
        <BarraIndiceGeral pontos={pontosGeral} />
      </div>

      <h2 className="mb-3 mt-6 text-lg font-bold text-slate-800">Por dimensão</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {radar.map((d) => (
          <ScoreTile key={d.dimensao_id} label={d.dimensao_nome} valor1a5={d.media} />
        ))}
      </div>
    </div>
  );
}

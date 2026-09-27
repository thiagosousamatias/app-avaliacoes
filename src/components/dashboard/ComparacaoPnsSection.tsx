import { PNS_2019 } from "@/lib/dashboard/pnsReferencia";
import type { SessionScore } from "@/lib/types/survey";

const COR_NOSSO = "bg-emerald-500";
const COR_PNS = "bg-slate-400";

type Indicador = {
  nome: string;
  pctNosso: number | null;
  pctPns: number;
  rodape: string;
};

function BarraDupla({ indicador }: { indicador: Indicador }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{indicador.nome}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-xs text-slate-500">Nosso grupo</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-5 rounded-full ${COR_NOSSO}`}
              style={{ width: `${indicador.pctNosso ?? 0}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-slate-800">
            {indicador.pctNosso !== null ? `${Math.round(indicador.pctNosso)}%` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-xs text-slate-500">PNS 2019 (Brasil)</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-5 rounded-full ${COR_PNS}`} style={{ width: `${indicador.pctPns}%` }} />
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-slate-600">
            {indicador.pctPns}%
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">{indicador.rodape}</p>
    </div>
  );
}

export function ComparacaoPnsSection({ sessoes }: { sessoes: SessionScore[] }) {
  const comSaude = sessoes.filter((s) => s.saude_fisica !== null);
  const pctSaude = comSaude.length
    ? (comSaude.filter((s) => (s.saude_fisica as number) >= 4).length / comSaude.length) * 100
    : null;

  const comAtivo = sessoes.filter((s) => s.ativo_fisicamente !== null);
  const pctAtivo = comAtivo.length
    ? (comAtivo.filter((s) => s.ativo_fisicamente === 1).length / comAtivo.length) * 100
    : null;

  const indicadores: Indicador[] = [
    {
      nome: "Saúde boa ou muito boa",
      pctNosso: pctSaude,
      pctPns: PNS_2019.saudeBoaOuMuitoBoa.percentual,
      rodape: `PNS: ${PNS_2019.saudeBoaOuMuitoBoa.descricao}.`,
    },
    {
      nome: "Fisicamente ativo",
      pctNosso: pctAtivo,
      pctPns: PNS_2019.fisicamenteAtivoLazer.percentual,
      rodape: `PNS: ${PNS_2019.fisicamenteAtivoLazer.descricao} - critério mais rigoroso que o nosso (150min/semana de atividade), números não são estritamente equivalentes.`,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-800">
        Comparação com a Pesquisa Nacional de Saúde
      </h3>
      <div className="space-y-5">
        {indicadores.map((i) => (
          <BarraDupla key={i.nome} indicador={i} />
        ))}
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
        Fonte: {PNS_2019.fonte}. Saúde mental não entra aqui porque a PNS mede diagnóstico de
        depressão, não autoavaliação da saúde mental - são medidas diferentes.
      </p>
    </div>
  );
}

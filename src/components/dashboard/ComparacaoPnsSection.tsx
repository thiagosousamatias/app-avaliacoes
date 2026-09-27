import { PNS_2019 } from "@/lib/dashboard/pnsReferencia";
import type { SessionScore } from "@/lib/types/survey";

const COR_NOSSO = "bg-emerald-500";
const COR_PNS = "bg-violet-400";

type Indicador = {
  nome: string;
  pctNosso: number | null;
  pctPns: number;
  rodape: string;
};

function BarraDupla({ nome, pct, cor }: { nome: string; pct: number | null; cor: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-600">{nome}</span>
        <span className="text-2xl font-black tabular-nums text-slate-800">
          {pct !== null ? `${Math.round(pct)}%` : "—"}
        </span>
      </div>
      <div className="h-7 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-7 rounded-full ${cor}`} style={{ width: `${pct ?? 0}%` }} />
      </div>
    </div>
  );
}

function CardIndicador({ indicador }: { indicador: Indicador }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-base font-bold text-slate-800">{indicador.nome}</h4>
      <div className="space-y-4">
        <BarraDupla nome="Nosso grupo" pct={indicador.pctNosso} cor={COR_NOSSO} />
        <BarraDupla nome="PNS 2019 (Brasil)" pct={indicador.pctPns} cor={COR_PNS} />
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
        {indicador.rodape}
      </p>
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
    <div>
      <h2 className="mb-3 text-lg font-bold text-slate-800">
        Comparação com a Pesquisa Nacional de Saúde
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {indicadores.map((i) => (
          <CardIndicador key={i.nome} indicador={i} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Fonte: {PNS_2019.fonte}. Saúde mental não entra aqui porque a PNS mede diagnóstico de
        depressão, não autoavaliação da saúde mental - são medidas diferentes.
      </p>
    </div>
  );
}

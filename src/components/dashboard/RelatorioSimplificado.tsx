"use client";

import Image from "next/image";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import { useSessionScores } from "@/lib/dashboard/useSessionScores";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";
import { paraPercentual } from "@/lib/dashboard/score";
import { corPorPontuacao } from "@/lib/dashboard/escalaCores";
import type { Pesquisa, SessionScore } from "@/lib/types/survey";
import { ComparacaoPnsSection } from "./ComparacaoPnsSection";
import { NuvemRelatorio } from "./NuvemRelatorio";

function DimensaoTile({ label, valor1a5 }: { label: string; valor1a5: number | null }) {
  const pontos = valor1a5 !== null ? Math.round(paraPercentual(valor1a5)) : null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="min-h-10 text-sm font-semibold leading-tight text-slate-600">{label}</p>
      <p className="mt-1 text-4xl font-black tabular-nums text-slate-800">{pontos ?? "—"}</p>
      <div className="mt-2 h-2.5 rounded-full bg-slate-100">
        <div
          className={`h-2.5 rounded-full ${corPorPontuacao(pontos ?? 0)}`}
          style={{ width: `${pontos ?? 0}%` }}
        />
      </div>
    </div>
  );
}

function CardIndicadorSaude({
  titulo,
  sessoes,
  getValor,
  labelPositivo,
  labelNegativo,
}: {
  titulo: string;
  sessoes: SessionScore[];
  getValor: (s: SessionScore) => 0 | 1 | null;
  labelPositivo: string;
  labelNegativo: string;
}) {
  const pares = sessoes.map((s) => getValor(s)).filter((v): v is 0 | 1 => v !== null);
  const total = pares.length;
  const pctPositivo = total ? (pares.filter((v) => v === 1).length / total) * 100 : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <h4 className="mb-3 text-base font-bold text-slate-800">{titulo}</h4>
      <p className="text-5xl font-black tabular-nums text-emerald-600">
        {pctPositivo !== null ? `${Math.round(pctPositivo)}%` : "—"}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{labelPositivo}</p>
      <div className="mx-auto mt-3 h-3 max-w-[180px] overflow-hidden rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${pctPositivo ?? 0}%` }} />
      </div>
      {pctPositivo !== null && (
        <p className="mt-2 text-xs text-slate-400">
          {Math.round(100 - pctPositivo)}% responderam &ldquo;{labelNegativo}&rdquo;
        </p>
      )}
    </div>
  );
}

export function RelatorioSimplificado({ pesquisa }: { pesquisa: Pesquisa }) {
  const { data } = useDashboardData(pesquisa.id, []);
  const sessionScores = useSessionScores(pesquisa.id);
  const { palavras } = useNuvemPalavras(pesquisa.id);

  const pontosGeral =
    data?.kpis.media_geral != null ? Math.round(paraPercentual(data.kpis.media_geral)) : null;
  const semDadosSuficientes = !sessionScores.loading && sessionScores.sessoes.length < 3;

  return (
    <div className="space-y-6 print:space-y-4">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 print:hidden"
      >
        Imprimir / Baixar PDF
      </button>

      {/* Capa: mesma paleta e tipografia em negrito italico do banner de divulgacao do evento. */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-400 to-emerald-400 p-8 text-center text-white shadow-lg print:break-inside-avoid">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Image
            src="/jogos-sesi-saude-logo.png"
            alt="Jogos do SESI + Saúde"
            width={640}
            height={640}
            className="h-16 w-auto"
            priority
          />
          <Image
            src="/sesi-saude-logo.png"
            alt="SESI + Saúde"
            width={1067}
            height={584}
            className="h-9 w-auto"
          />
          <Image
            src="/sesi-institucional-logo.png"
            alt="SESI - Serviço Social da Indústria"
            width={373}
            height={106}
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight uppercase italic sm:text-4xl">
          {pesquisa.titulo}
        </h1>
        <p className="mt-1 text-sm font-semibold italic text-white/80">
          &ldquo;O SESI incentiva. A indústria vence.&rdquo;
        </p>

        {data && (
          <p className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
            {data.kpis.total_respondentes} pessoa{data.kpis.total_respondentes === 1 ? "" : "s"}{" "}
            respondeu{data.kpis.total_respondentes === 1 ? "" : "ram"} a pesquisa
          </p>
        )}

        <p className="mt-8 text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
          Impacto dos jogos na vida e no trabalho
        </p>
        <p className="mt-1 text-8xl font-black tabular-nums italic">{pontosGeral ?? "—"}</p>
        <div className="mx-auto mt-5 max-w-md">
          <div className="h-7 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-7 rounded-full bg-white" style={{ width: `${pontosGeral ?? 0}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-bold tracking-wide text-white/70 uppercase">
            <span>Sem impacto</span>
            <span>Alto impacto</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-800">Por dimensão</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(data?.radar ?? []).map((d) => (
            <DimensaoTile key={d.dimensao_id} label={d.dimensao_nome} valor1a5={d.media} />
          ))}
        </div>
      </div>

      {semDadosSuficientes ? (
        <p className="text-sm text-slate-500">
          Ainda não há respostas suficientes para calcular os indicadores de saúde (mínimo de 3
          respondentes).
        </p>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-800">Indicadores de saúde</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <CardIndicadorSaude
                titulo="Saúde atual"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_fisica === null ? null : s.saude_fisica <= 3 ? 0 : 1)}
                labelPositivo="Boa ou muito boa"
                labelNegativo="Ruim"
              />
              <CardIndicadorSaude
                titulo="Saúde mental"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_mental === null ? null : s.saude_mental <= 3 ? 0 : 1)}
                labelPositivo="Boa ou muito boa"
                labelNegativo="Ruim"
              />
              <CardIndicadorSaude
                titulo="Fisicamente ativo"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.ativo_fisicamente === null ? null : (s.ativo_fisicamente as 0 | 1))}
                labelPositivo="Sim"
                labelNegativo="Não"
              />
            </div>
          </div>

          <ComparacaoPnsSection sessoes={sessionScores.sessoes} />
        </>
      )}

      <NuvemRelatorio palavras={palavras} />
    </div>
  );
}

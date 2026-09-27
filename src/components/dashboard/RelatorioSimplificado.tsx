"use client";

import Image from "next/image";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import { useSessionScores } from "@/lib/dashboard/useSessionScores";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";
import type { Pesquisa } from "@/lib/types/survey";
import { ScoreIndex } from "./ScoreIndex";
import { DichotomousSection } from "./DichotomousSection";
import { ComparacaoPnsSection } from "./ComparacaoPnsSection";
import { NuvemRelatorio } from "./NuvemRelatorio";

export function RelatorioSimplificado({ pesquisa }: { pesquisa: Pesquisa }) {
  const { data } = useDashboardData(pesquisa.id, []);
  const sessionScores = useSessionScores(pesquisa.id);
  const { palavras } = useNuvemPalavras(pesquisa.id);

  const geradoEm = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
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

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-600 to-emerald-500 p-6 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <Image
            src="/jogos-sesi-saude-logo.png"
            alt="Jogos do SESI + Saúde"
            width={640}
            height={640}
            className="h-14 w-auto"
            priority
          />
          <Image
            src="/sesi-institucional-logo.png"
            alt="SESI - Serviço Social da Indústria"
            width={373}
            height={106}
            className="h-8 w-auto brightness-0 invert"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase italic">
              {pesquisa.titulo}
            </h1>
            <p className="text-sm font-medium text-white/80">Relatório gerado em {geradoEm}</p>
          </div>
        </div>
      </div>

      <ScoreIndex
        radar={data?.radar ?? []}
        impactoGeral={data?.kpis.media_geral ?? null}
        titulo="Impacto dos jogos na vida e no trabalho"
      />

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
              <DichotomousSection
                titulo="Saúde atual"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_fisica === null ? null : s.saude_fisica <= 3 ? 0 : 1)}
                label0="Ruim"
                label1="Boa"
                mostrarComparacaoImpacto={false}
              />
              <DichotomousSection
                titulo="Saúde mental"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_mental === null ? null : s.saude_mental <= 3 ? 0 : 1)}
                label0="Ruim"
                label1="Boa"
                mostrarComparacaoImpacto={false}
              />
              <DichotomousSection
                titulo="Fisicamente ativo"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.ativo_fisicamente === null ? null : (s.ativo_fisicamente as 0 | 1))}
                label0="Não"
                label1="Sim"
                mostrarComparacaoImpacto={false}
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

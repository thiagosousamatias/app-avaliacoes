"use client";

import { useState } from "react";
import Image from "next/image";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import { useSessionScores } from "@/lib/dashboard/useSessionScores";
import type { FiltroDashboard, Pesquisa } from "@/lib/types/survey";
import { KpiCard } from "./KpiCard";
import { FilterPanel } from "./FilterPanel";
import { ScoreIndex } from "./ScoreIndex";
import { DichotomousSection } from "./DichotomousSection";
import { OddsRatioSection } from "./OddsRatioSection";
import { WordCloudSection } from "./WordCloudSection";
import { ExportButtons } from "./ExportButtons";
import { QrCodeCard } from "./QrCodeCard";
import { AdminDangerZone } from "./AdminDangerZone";
import { DashboardTabs, type AbaDashboard } from "./DashboardTabs";

export function DashboardView({ pesquisa }: { pesquisa: Pesquisa }) {
  const [aba, setAba] = useState<AbaDashboard>("dashboard");

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-center gap-4">
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
          className="h-8 w-auto"
        />
        <Image
          src="/sesi-institucional-logo.png"
          alt="SESI - Serviço Social da Indústria"
          width={373}
          height={106}
          className="h-8 w-auto"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{pesquisa.titulo}</h1>
          <p className="text-sm text-slate-500">/{pesquisa.slug}</p>
        </div>
      </div>

      <DashboardTabs ativa={aba} onChange={setAba} />

      {aba === "dashboard" && <DashboardTabContent pesquisa={pesquisa} />}
      {aba === "compartilhar" && (
        <div className="mx-auto max-w-xs rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <QrCodeCard slug={pesquisa.slug} tamanho="full" />
        </div>
      )}
      {aba === "administracao" && <AdminDangerZone pesquisa={pesquisa} />}
    </div>
  );
}

function DashboardTabContent({ pesquisa }: { pesquisa: Pesquisa }) {
  const [filtros, setFiltros] = useState<FiltroDashboard[]>([]);
  const { data, loading, error } = useDashboardData(pesquisa.id, filtros);
  const sessionScores = useSessionScores(pesquisa.id);
  const dimensoesNomes = (data?.radar ?? []).map((d) => d.dimensao_nome);

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex justify-end">
        <ExportButtons pesquisaId={pesquisa.id} pesquisaSlug={pesquisa.slug} />
      </div>

      <div className="print:hidden">
        <FilterPanel pesquisaId={pesquisa.id} filtros={filtros} onChange={setFiltros} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <>
          <KpiCard label="Total de respondentes" value={data?.kpis.total_respondentes ?? 0} />
          <ScoreIndex radar={data?.radar ?? []} impactoGeral={data?.kpis.media_geral ?? null} />
        </>
      )}

      {sessionScores.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {sessionScores.error}
        </div>
      )}

      {sessionScores.loading ? (
        <p className="text-slate-500">Carregando análises…</p>
      ) : sessionScores.sessoes.length < 3 ? (
        <p className="text-sm text-slate-500">
          Ainda não há respostas suficientes para calcular comparações estatísticas (mínimo de
          3 respondentes).
        </p>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-800">Impacto Geral por perfil</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <DichotomousSection
                titulo="Saúde atual"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_fisica === null ? null : s.saude_fisica <= 3 ? 0 : 1)}
                label0="Ruim"
                label1="Boa"
              />
              <DichotomousSection
                titulo="Saúde mental"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.saude_mental === null ? null : s.saude_mental <= 3 ? 0 : 1)}
                label0="Ruim"
                label1="Boa"
              />
              <DichotomousSection
                titulo="Fisicamente ativo"
                sessoes={sessionScores.sessoes}
                getValor={(s) => (s.ativo_fisicamente === null ? null : (s.ativo_fisicamente as 0 | 1))}
                label0="Não"
                label1="Sim"
              />
            </div>
          </div>
          <OddsRatioSection sessoes={sessionScores.sessoes} dimensoesNomes={dimensoesNomes} />
        </>
      )}

      <WordCloudSection pesquisaId={pesquisa.id} pesquisaSlug={pesquisa.slug} />
    </div>
  );
}

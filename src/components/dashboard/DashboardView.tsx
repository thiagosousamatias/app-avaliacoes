"use client";

import { useState } from "react";
import Image from "next/image";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import { useSessionScores } from "@/lib/dashboard/useSessionScores";
import type { FiltroDashboard, Pesquisa } from "@/lib/types/survey";
import { KpiCard } from "./KpiCard";
import { RadarChart } from "./RadarChart";
import { FilterPanel } from "./FilterPanel";
import { ScoreIndex } from "./ScoreIndex";
import { PrevalenceSection } from "./PrevalenceSection";
import { ActivitySection } from "./ActivitySection";
import { CorrelationsTable } from "./CorrelationsTable";
import { AnovaSection } from "./AnovaSection";
import { WordCloudSection } from "./WordCloudSection";
import { ExportButtons } from "./ExportButtons";
import { QrCodeCard } from "./QrCodeCard";
import { AdminDangerZone } from "./AdminDangerZone";
import { DashboardTabs, type AbaDashboard } from "./DashboardTabs";

export function DashboardView({ pesquisa }: { pesquisa: Pesquisa }) {
  const [aba, setAba] = useState<AbaDashboard>("dashboard");

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center gap-3">
        <Image
          src="/sesi-saude-logo.png"
          alt="SESI+ Saúde"
          width={1067}
          height={584}
          className="h-9 w-auto"
          priority
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

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
            <RadarChart radar={data?.radar ?? []} />
          </div>
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
        <p className="text-sm text-slate-400">
          Ainda não há respostas suficientes para calcular correlações e comparações
          estatísticas (mínimo de 3 respondentes).
        </p>
      ) : (
        <>
          <PrevalenceSection
            sessoes={sessionScores.sessoes}
            opcoesSaudeFisica={sessionScores.opcoesSaudeFisica}
            opcoesSaudeMental={sessionScores.opcoesSaudeMental}
          />
          <ActivitySection
            sessoes={sessionScores.sessoes}
            opcoes={sessionScores.opcoesAtivoFisicamente}
          />
          <CorrelationsTable sessoes={sessionScores.sessoes} />
          <AnovaSection
            sessoes={sessionScores.sessoes}
            opcoesSaudeFisica={sessionScores.opcoesSaudeFisica}
            opcoesSaudeMental={sessionScores.opcoesSaudeMental}
          />
        </>
      )}

      <WordCloudSection pesquisaId={pesquisa.id} />
    </div>
  );
}

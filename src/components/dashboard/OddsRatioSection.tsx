"use client";

import { useMemo } from "react";
import { oddsRatio } from "@/lib/dashboard/stats";
import { BG_ESCALA_1A5 } from "@/lib/dashboard/escalaCores";
import type { SessionScore } from "@/lib/types/survey";

const COR_BAIXO = "bg-slate-400";
const COR_ALTO = BG_ESCALA_1A5[4];

type Medida = { chave: "overall" | string; nome: string };

type Desfecho = {
  nome: string; // ex: "boa saúde física"
  getValor: (s: SessionScore) => 0 | 1 | null;
};

type LinhaResultado = {
  nome: string;
  pctBaixo: number;
  pctAlto: number;
  nBaixo: number;
  nAlto: number;
  or: number;
  significativo: boolean;
};

function Pilula({ or, significativo }: { or: number; significativo: boolean }) {
  const positivo = or >= 1;
  const valor = positivo ? or : 1 / or;
  const cor = !significativo
    ? "bg-slate-100 text-slate-500"
    : positivo
      ? "bg-emerald-100 text-emerald-700"
      : "bg-orange-100 text-orange-700";

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums ${cor}`}>
      {significativo && <span aria-hidden>{positivo ? "▲" : "▼"}</span>}
      {valor.toFixed(1)}x
    </span>
  );
}

function Dumbbell({ linha }: { linha: LinhaResultado }) {
  const esquerda = Math.min(linha.pctBaixo, linha.pctAlto);
  const direita = Math.max(linha.pctBaixo, linha.pctAlto);

  return (
    <div className="relative h-5 w-full">
      <div className="absolute inset-y-1/2 h-px w-full bg-slate-100" />
      <div
        className="absolute inset-y-1/2 h-0.5 -translate-y-1/2 bg-slate-300"
        style={{ left: `${esquerda}%`, width: `${direita - esquerda}%` }}
      />
      <div
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${COR_BAIXO}`}
        style={{ left: `${linha.pctBaixo}%` }}
      />
      <div
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${COR_ALTO} ring-2 ring-white`}
        style={{ left: `${linha.pctAlto}%` }}
      />
    </div>
  );
}

function PainelDesfecho({
  desfecho,
  medidas,
  sessoes,
}: {
  desfecho: Desfecho;
  medidas: Medida[];
  sessoes: SessionScore[];
}) {
  const linhas = useMemo<(LinhaResultado | null)[]>(() => {
    return medidas.map((m) => {
      const pares = sessoes
        .map((s) => {
          const desfechoValor = desfecho.getValor(s);
          const medidaValor = m.chave === "overall" ? s.overall : s.dimensoes[m.chave];
          return { desfechoValor, medidaValor };
        })
        .filter(
          (p): p is { desfechoValor: 0 | 1; medidaValor: number } =>
            p.desfechoValor !== null && p.medidaValor !== undefined,
        );

      if (pares.length < 4) return null;

      // Mediana do impacto (geral ou do dominio) define os grupos Baixo/Alto - a variavel
      // independente aqui e o impacto; o desfecho observado em cada grupo e a saude/atividade.
      const valores = pares.map((p) => p.medidaValor).sort((a, b) => a - b);
      const meio = Math.floor(valores.length / 2);
      const med =
        valores.length % 2 === 0 ? (valores[meio - 1] + valores[meio]) / 2 : valores[meio];

      const grupoBaixo = pares.filter((p) => p.medidaValor < med);
      const grupoAlto = pares.filter((p) => p.medidaValor >= med);
      const desfechoBaixo = grupoBaixo.filter((p) => p.desfechoValor === 1).length;
      const desfechoAlto = grupoAlto.filter((p) => p.desfechoValor === 1).length;

      const grupoImpacto = pares.map((p) => (p.medidaValor >= med ? 1 : 0) as 0 | 1);
      const desfechoArr = pares.map((p) => p.desfechoValor);
      const resultado = oddsRatio(desfechoArr, grupoImpacto);

      return {
        nome: m.nome,
        pctBaixo: grupoBaixo.length ? (desfechoBaixo / grupoBaixo.length) * 100 : 0,
        pctAlto: grupoAlto.length ? (desfechoAlto / grupoAlto.length) * 100 : 0,
        nBaixo: grupoBaixo.length,
        nAlto: grupoAlto.length,
        or: resultado.or,
        significativo: resultado.significativo,
      };
    });
  }, [desfecho, medidas, sessoes]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-slate-800">{desfecho.nome}</h3>
      <div className="mb-4 flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${COR_BAIXO}`} />
          Impacto Baixo
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${COR_ALTO}`} />
          Impacto Alto
        </span>
      </div>
      <div className="space-y-4">
        {linhas.map((l, i) =>
          l ? (
            <div key={l.nome}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">{l.nome}</span>
                <Pilula or={l.or} significativo={l.significativo} />
              </div>
              <Dumbbell linha={l} />
            </div>
          ) : (
            <div key={medidas[i].nome}>
              <span className="text-sm text-slate-300">{medidas[i].nome} — dados insuficientes</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function OddsRatioSection({
  sessoes,
  dimensoesNomes,
}: {
  sessoes: SessionScore[];
  dimensoesNomes: string[];
}) {
  const medidas: Medida[] = [
    { chave: "overall", nome: "Impacto Geral" },
    ...dimensoesNomes.map((nome) => ({ chave: nome, nome })),
  ];

  const desfechos: Desfecho[] = [
    {
      nome: "Boa saúde física",
      getValor: (s) => (s.saude_fisica === null ? null : s.saude_fisica <= 3 ? 0 : 1),
    },
    {
      nome: "Boa saúde mental",
      getValor: (s) => (s.saude_mental === null ? null : s.saude_mental <= 3 ? 0 : 1),
    },
    {
      nome: "Fisicamente ativo",
      getValor: (s) => (s.ativo_fisicamente === null ? null : (s.ativo_fisicamente as 0 | 1)),
    },
  ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-slate-800">
        Chance de boa saúde por nível de Impacto
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {desfechos.map((d) => (
          <PainelDesfecho key={d.nome} desfecho={d} medidas={medidas} sessoes={sessoes} />
        ))}
      </div>
    </div>
  );
}

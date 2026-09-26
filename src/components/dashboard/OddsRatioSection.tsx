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
  // Frase natural pra interpretacao em texto - ex: "ter boa saúde física", "ser fisicamente
  // ativo". Cada desfecho pede uma construcao verbal diferente, entao nao da pra derivar de
  // "nome" automaticamente.
  frase: string;
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

// Duas barras (grupo Baixo x grupo Alto) com o percentual escrito do lado - troca o dumbbell
// anterior (dois pontos numa linha) por algo que se le direto, sem precisar interpretar
// posicao relativa num eixo sem numeros.
function BarraComparativa({ linha }: { linha: LinhaResultado }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-xs text-slate-500">Baixo</span>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-4 rounded-full ${COR_BAIXO}`} style={{ width: `${linha.pctBaixo}%` }} />
        </div>
        <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">
          {Math.round(linha.pctBaixo)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-xs text-slate-500">Alto</span>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-4 rounded-full ${COR_ALTO}`} style={{ width: `${linha.pctAlto}%` }} />
        </div>
        <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">
          {Math.round(linha.pctAlto)}%
        </span>
      </div>
    </div>
  );
}

// Frase pronta com a leitura do Impacto Geral - o numero de "vezes mais chances" (Pilula) ja
// existe em cada linha, mas so faz sentido de cara pra quem ja entende odds ratio. Aqui vira
// uma frase direta com o resultado especifico do Impacto Geral (1a linha de cada painel).
function fraseInterpretacao(desfecho: Desfecho, linhaGeral: LinhaResultado | null | undefined): string {
  if (!linhaGeral) return "Ainda não há dados suficientes pra essa comparação.";
  if (!linhaGeral.significativo) {
    return `Impacto Geral alto ou baixo não fez diferença clara em ${desfecho.frase} nas respostas até agora.`;
  }
  const positivo = linhaGeral.or >= 1;
  const valor = positivo ? linhaGeral.or : 1 / linhaGeral.or;
  const grupoForte = positivo ? "alto" : "baixo";
  const grupoFraco = positivo ? "baixo" : "alto";
  return `Quem tem Impacto Geral ${grupoForte} tem ${valor.toFixed(1)}x mais chances de ${desfecho.frase} do que quem tem Impacto Geral ${grupoFraco}.`;
}

function Interpretacao({
  desfecho,
  linhaGeral,
}: {
  desfecho: Desfecho;
  linhaGeral: LinhaResultado | null | undefined;
}) {
  const tom =
    !linhaGeral || !linhaGeral.significativo
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : linhaGeral.or >= 1
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-orange-200 bg-orange-50 text-orange-800";

  return (
    <p className={`mb-4 rounded-lg border px-3 py-2 text-sm font-medium ${tom}`}>
      {fraseInterpretacao(desfecho, linhaGeral)}
    </p>
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
      <Interpretacao desfecho={desfecho} linhaGeral={linhas[0]} />
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
              <BarraComparativa linha={l} />
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
      frase: "ter boa saúde física",
      getValor: (s) => (s.saude_fisica === null ? null : s.saude_fisica <= 3 ? 0 : 1),
    },
    {
      nome: "Boa saúde mental",
      frase: "ter boa saúde mental",
      getValor: (s) => (s.saude_mental === null ? null : s.saude_mental <= 3 ? 0 : 1),
    },
    {
      nome: "Fisicamente ativo",
      frase: "ser fisicamente ativo",
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

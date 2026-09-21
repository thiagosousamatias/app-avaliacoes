"use client";

import Image from "next/image";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";
import type { Pesquisa } from "@/lib/types/survey";

const TAMANHO_MIN_PX = 28;
const TAMANHO_MAX_PX = 136;

// Interpola de cinza-azulado escuro (pouco citada) a verde-esmeralda vivo (muito citada) -
// fundo escuro agora, entao a cor precisa ser clara/vibrante o bastante pra manter contraste.
function corDe(proporcao: number): string {
  const de = { r: 100, g: 116, b: 139 }; // slate-500
  const para = { r: 52, g: 211, b: 153 }; // emerald-400
  const r = Math.round(de.r + (para.r - de.r) * proporcao);
  const g = Math.round(de.g + (para.g - de.g) * proporcao);
  const b = Math.round(de.b + (para.b - de.b) * proporcao);
  return `rgb(${r}, ${g}, ${b})`;
}

export function NuvemAoVivo({ pesquisa }: { pesquisa: Pesquisa }) {
  const { palavras } = useNuvemPalavras(pesquisa.id, 8_000);
  const maxN = palavras?.[0]?.n ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-8 py-12 text-center">
      <div className="mb-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <Image
          src="/jogos-sesi-saude-logo.png"
          alt="Jogos do SESI + Saúde"
          width={640}
          height={640}
          className="h-28 w-auto"
          priority
        />
        <Image
          src="/sesi-institucional-logo.png"
          alt="SESI - Serviço Social da Indústria"
          width={373}
          height={106}
          className="h-12 w-auto brightness-0 invert"
        />
      </div>
      <h1 className="mb-12 text-4xl font-bold text-white">Valores do Esporte</h1>

      {!palavras || palavras.length === 0 ? (
        <p className="text-xl text-slate-500">Aguardando as primeiras respostas…</p>
      ) : (
        <div className="flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {palavras.map((p) => {
            const proporcao = maxN > 1 ? (p.n - 1) / (maxN - 1) : 1;
            return (
              <span
                key={p.palavra}
                className="font-bold leading-none transition-all duration-700"
                style={{
                  fontSize: `${TAMANHO_MIN_PX + proporcao * (TAMANHO_MAX_PX - TAMANHO_MIN_PX)}px`,
                  color: corDe(proporcao),
                }}
              >
                {p.palavra}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

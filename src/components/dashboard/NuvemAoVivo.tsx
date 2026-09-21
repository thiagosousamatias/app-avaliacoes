"use client";

import Image from "next/image";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";
import type { Pesquisa } from "@/lib/types/survey";

// Baseado em vw (largura da tela), com piso/teto em px - assim nenhuma palavra fica mais
// larga que a tela, seja num totem estreito em pe ou numa TV larga. clamp(piso, vw, teto).
const VW_MIN = 5;
const VW_MAX = 13;
const PX_PISO = 18;
const PX_TETO = 92;

function tamanhoFonte(proporcao: number): string {
  const vw = VW_MIN + proporcao * (VW_MAX - VW_MIN);
  return `clamp(${PX_PISO}px, ${vw}vw, ${PX_TETO}px)`;
}

// Interpola de cinza-azulado escuro (pouco citada) a verde-esmeralda vivo (muito citada).
function corDe(proporcao: number): string {
  const de = { r: 100, g: 116, b: 139 }; // slate-500
  const para = { r: 52, g: 211, b: 153 }; // emerald-400
  const r = Math.round(de.r + (para.r - de.r) * proporcao);
  const g = Math.round(de.g + (para.g - de.g) * proporcao);
  const b = Math.round(de.b + (para.b - de.b) * proporcao);
  return `rgb(${r}, ${g}, ${b})`;
}

// Delay/duracao de flutuacao variam por palavra (hash simples do texto), pra nao animar tudo
// em sincronia - fica mais organico.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function NuvemAoVivo({ pesquisa }: { pesquisa: Pesquisa }) {
  const { palavras, error } = useNuvemPalavras(pesquisa.id, 8_000);
  const maxN = palavras?.[0]?.n ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950 px-4 py-6 text-center sm:px-8 sm:py-8">
      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.4em); }
        }
        @keyframes fundoVivo {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .fundo-animado {
          background: linear-gradient(120deg, #020617, #0f172a, #022c22, #0f172a, #020617);
          background-size: 300% 300%;
          animation: fundoVivo 18s ease-in-out infinite;
        }
        .palavra-flutuante {
          display: inline-block;
          animation: flutuar 5s ease-in-out infinite;
        }
      `}</style>
      <div className="fundo-animado absolute inset-0 -z-10" />

      <div className="mb-4 flex shrink-0 flex-col items-center gap-3 sm:mb-8 sm:flex-row sm:justify-center sm:gap-6">
        <Image
          src="/jogos-sesi-saude-logo.png"
          alt="Jogos do SESI + Saúde"
          width={640}
          height={640}
          className="h-14 w-auto sm:h-20"
          priority
        />
        <Image
          src="/sesi-institucional-logo.png"
          alt="SESI - Serviço Social da Indústria"
          width={373}
          height={106}
          className="h-7 w-auto brightness-0 invert sm:h-10"
        />
      </div>
      <h1 className="mb-4 shrink-0 text-2xl font-bold text-white sm:mb-10 sm:text-4xl">
        Valores do Esporte
      </h1>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <p className="max-w-lg text-lg text-red-400">
            Não foi possível carregar as mensagens: {error}
          </p>
        ) : !palavras || palavras.length === 0 ? (
          <p className="text-xl text-slate-500">Aguardando as primeiras respostas…</p>
        ) : (
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-5">
            {palavras.map((p) => {
              const proporcao = maxN > 1 ? (p.n - 1) / (maxN - 1) : 1;
              const h = hash(p.palavra);
              return (
                <span
                  key={p.palavra}
                  className="palavra-flutuante font-bold leading-none transition-[font-size,color] duration-700"
                  style={{
                    fontSize: tamanhoFonte(proporcao),
                    color: corDe(proporcao),
                    animationDelay: `${(h % 40) / 10}s`,
                    animationDuration: `${4 + (h % 30) / 10}s`,
                  }}
                >
                  {p.palavra}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

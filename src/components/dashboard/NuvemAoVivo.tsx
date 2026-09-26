"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";
import type { Pesquisa } from "@/lib/types/survey";

// Tempo que a palavra fica com a classe de halo aplicada. So precisa ser >= duracao do
// keyframe "halo" (2.5s) - a folga garante que a animacao termine de tocar antes de a classe
// sair (a saida em si e imperceptivel, ja que o keyframe volta ao estado neutro em 100%).
const HALO_DURACAO_MS = 3_000;

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

// Quantas palavras "se formam" no ranking fixo - o resto continua chegando/flutuando na outra
// zona ate crescer o suficiente pra entrar aqui.
const TOP_N_RANKING = 8;

// Escala bem mais contida que a nuvem principal - e uma coluna/faixa estreita com varias
// linhas empilhadas, nao o centro da tela.
function tamanhoFonteRanking(proporcao: number): string {
  const vw = 2 + proporcao * 3;
  return `clamp(15px, ${vw}vw, 34px)`;
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

function PalavraSpan({
  palavra,
  fontSize,
  cor,
  emDestaque,
  estatico = false,
}: {
  palavra: string;
  fontSize: string;
  cor: string;
  emDestaque: boolean;
  estatico?: boolean;
}) {
  // O ranking e estatico de proposito - e uma lista fixa, ler nomes bailando junto ali
  // atrapalha exatamente o efeito de "olhar e saber o que importa" que ele existe pra dar.
  // So a zona de chegada flutua/brilha; o resize suave de fonte (ao subir/descer de posicao
  // ali dentro) continua vindo da transition no className, nao de keyframes.
  if (estatico) {
    return (
      <span
        className="font-bold leading-none transition-[font-size,color] duration-700"
        style={{ fontSize, color: cor, display: "inline-block" }}
      >
        {palavra}
      </span>
    );
  }

  const h = hash(palavra);
  const flutuar = `flutuar ${4 + (h % 30) / 10}s ease-in-out ${(h % 40) / 10}s infinite`;
  // O halo entra como uma 2a animacao na mesma propriedade "animation" - por afetarem
  // "transform" as duas juntas, o halo (mais recente na lista) assume o transform enquanto
  // toca, entao a flutuacao pausa por ~2.5s e retoma sozinha quando o keyframe termina. Efeito
  // aceitavel: um "pulso" em vez de flutuar+crescer ao mesmo tempo.
  const animacao = emDestaque ? `${flutuar}, halo 2.5s ease-out` : flutuar;
  return (
    <span
      className="font-bold leading-none transition-[font-size,color] duration-700"
      style={{ fontSize, color: cor, display: "inline-block", animation: animacao }}
    >
      {palavra}
    </span>
  );
}

export function NuvemAoVivo({ pesquisa }: { pesquisa: Pesquisa }) {
  const { palavras, error } = useNuvemPalavras(pesquisa.id, 8_000);
  const maxN = palavras?.[0]?.n ?? 1;

  // palavras ja vem ordenada por n desc (contarPalavrasPositivas) - as primeiras TOP_N_RANKING
  // "se formam" no ranking fixo, o resto continua na zona de chegada ate crescer o bastante
  // pra entrar. Sem isso fica dificil bater o olho e saber o que mais importa na nuvem.
  const ranking = palavras?.slice(0, TOP_N_RANKING) ?? [];
  // A nuvem mostra TODAS as palavras, nao so as que ficaram de fora do ranking: o lexico
  // positivo curado tem poucas dezenas de termos, entao e comum um evento inteiro nao passar de
  // 5-8 palavras distintas - se a zona de chegada so mostrasse quem nao entrou no ranking, ela
  // ficaria vazia a partir do momento em que todas as palavras existentes coubessem no top 8
  // (foi exatamente o que aconteceu ao vivo). As mesmas palavras aparecem nas duas zonas.
  const chegando = palavras ?? [];

  // Marca palavras cuja contagem acabou de subir (nova palavra ou mencionada de novo) pra
  // receberem o halo. Compara cada leitura com a anterior guardada num ref - so entra em
  // destaque quem cresceu de fato, nunca a lista toda na primeira carga.
  const [destaque, setDestaque] = useState<Set<string>>(new Set());
  const contagemAnteriorRef = useRef<Map<string, number> | null>(null);

  useEffect(() => {
    if (!palavras) return;

    const anterior = contagemAnteriorRef.current;
    contagemAnteriorRef.current = new Map(palavras.map((p) => [p.palavra, p.n]));

    // Primeira carga: nada "cresceu", so existe - nao faz sentido destacar a nuvem inteira.
    if (anterior === null) return;

    const crescidas = palavras.filter((p) => p.n > (anterior.get(p.palavra) ?? 0));
    if (crescidas.length === 0) return;

    setDestaque((atual) => {
      const novo = new Set(atual);
      crescidas.forEach((p) => novo.add(p.palavra));
      return novo;
    });

    crescidas.forEach((p) => {
      setTimeout(() => {
        setDestaque((atual) => {
          if (!atual.has(p.palavra)) return atual;
          const novo = new Set(atual);
          novo.delete(p.palavra);
          return novo;
        });
      }, HALO_DURACAO_MS);
    });
  }, [palavras]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950 px-4 py-6 text-center sm:px-8 sm:py-8">
      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.4em); }
        }
        @keyframes halo {
          0% { filter: drop-shadow(0 0 0px currentColor); transform: scale(1); }
          20% { filter: drop-shadow(0 0 14px currentColor) drop-shadow(0 0 28px currentColor); transform: scale(1.25); }
          100% { filter: drop-shadow(0 0 0px currentColor); transform: scale(1); }
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
        .nuvem-corpo {
          display: flex;
          flex: 1 1 auto;
          flex-direction: row;
          overflow: hidden;
        }
        .zona-chegada {
          flex: 1 1 auto;
          min-width: 0;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0.5rem;
        }
        .zona-ranking {
          flex: 0 0 300px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          overflow: hidden;
          padding: 1rem 1.25rem;
          border-left: 1px solid rgba(16, 185, 129, 0.18);
        }
        /* O totem fica de pe (retrato) - colunas lado a lado ficariam apertadas demais, entao
           empilha a zona de chegada em cima e o ranking embaixo nessa orientacao. Usar
           orientation (nao largura) porque um totem em pe pode ter resolucao larga mesmo assim. */
        @media (orientation: portrait) {
          .nuvem-corpo {
            flex-direction: column;
          }
          .zona-ranking {
            flex: 0 0 38%;
            width: 100%;
            border-left: none;
            border-top: 1px solid rgba(16, 185, 129, 0.18);
          }
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
          src="/sesi-saude-logo.png"
          alt="SESI + Saúde"
          width={1067}
          height={584}
          className="h-9 w-auto sm:h-12"
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

      {error ? (
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <p className="max-w-lg text-lg text-red-400">
            Não foi possível carregar as mensagens: {error}
          </p>
        </div>
      ) : !palavras || palavras.length === 0 ? (
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <p className="text-xl text-slate-500">Aguardando as primeiras respostas…</p>
        </div>
      ) : (
        <div className="nuvem-corpo">
          <div className="zona-chegada">
            {chegando.length === 0 ? (
              <p className="text-lg text-slate-600">Novas respostas aparecem aqui…</p>
            ) : (
              <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-5">
                {chegando.map((p) => {
                  const proporcao = maxN > 1 ? (p.n - 1) / (maxN - 1) : 1;
                  return (
                    <PalavraSpan
                      key={p.palavra}
                      palavra={p.palavra}
                      fontSize={tamanhoFonte(proporcao)}
                      cor={corDe(proporcao)}
                      emDestaque={destaque.has(p.palavra)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="zona-ranking">
            <p className="mb-1 shrink-0 text-xs font-semibold tracking-[0.2em] text-emerald-500/70 uppercase">
              Nosso Ranking de Valores
            </p>
            {ranking.map((p) => {
              const proporcao = maxN > 1 ? (p.n - 1) / (maxN - 1) : 1;
              return (
                <PalavraSpan
                  key={p.palavra}
                  palavra={p.palavra}
                  fontSize={tamanhoFonteRanking(proporcao)}
                  cor={corDe(proporcao)}
                  emDestaque={false}
                  estatico
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

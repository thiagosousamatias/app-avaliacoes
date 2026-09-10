"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contarPalavrasPositivas, type PalavraContagem } from "@/lib/dashboard/positiveLexicon";

const TAMANHO_MIN_PX = 14;
const TAMANHO_MAX_PX = 40;

function tamanhoFonte(n: number, max: number): number {
  if (max <= 1) return TAMANHO_MIN_PX;
  const proporcao = (n - 1) / (max - 1);
  return Math.round(TAMANHO_MIN_PX + proporcao * (TAMANHO_MAX_PX - TAMANHO_MIN_PX));
}

export function WordCloudSection({ pesquisaId }: { pesquisaId: string }) {
  const [palavras, setPalavras] = useState<PalavraContagem[] | null>(null);
  const [totalMensagens, setTotalMensagens] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    supabase
      .from("respostas_itens")
      .select("valor_texto, questoes!inner(pesquisa_id, tipo_resposta)")
      .eq("questoes.pesquisa_id", pesquisaId)
      .eq("questoes.tipo_resposta", "texto")
      .not("valor_texto", "is", null)
      .then(({ data }) => {
        if (cancelado) return;
        const textos = (data ?? []).map((r) => r.valor_texto as string);
        setTotalMensagens(textos.length);
        setPalavras(contarPalavrasPositivas(textos));
      });

    return () => {
      cancelado = true;
    };
  }, [pesquisaId]);

  if (palavras === null) return null;
  if (totalMensagens === 0) return null;

  const maxN = palavras[0]?.n ?? 1;

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Nuvem de palavras (mensagens)
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Palavras extraídas das {totalMensagens} mensagens abertas, filtradas por uma lista de
        termos de caráter positivo — quanto maior a palavra, mais vezes apareceu. Não é uma
        análise de sentimento completa, é um apoio visual rápido.
      </p>

      {palavras.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">
          Nenhuma palavra da lista positiva apareceu nas mensagens ainda.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
            {palavras.map((p) => (
              <span
                key={p.palavra}
                className="font-semibold text-emerald-700"
                style={{ fontSize: `${tamanhoFonte(p.n, maxN)}px` }}
                title={`${p.palavra}: ${p.n}`}
              >
                {p.palavra}
              </span>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-slate-400">
              Ver contagem exata
            </summary>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-3">
              {palavras.map((p) => (
                <li key={p.palavra} className="flex justify-between">
                  <span>{p.palavra}</span>
                  <span className="tabular-nums text-slate-400">{p.n}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useNuvemPalavras } from "@/lib/dashboard/useNuvemPalavras";

const TAMANHO_MIN_PX = 14;
const TAMANHO_MAX_PX = 40;

function tamanhoFonte(n: number, max: number): number {
  if (max <= 1) return TAMANHO_MIN_PX;
  const proporcao = (n - 1) / (max - 1);
  return Math.round(TAMANHO_MIN_PX + proporcao * (TAMANHO_MAX_PX - TAMANHO_MIN_PX));
}

export function WordCloudSection({
  pesquisaId,
  pesquisaSlug,
}: {
  pesquisaId: string;
  pesquisaSlug: string;
}) {
  const { palavras, totalMensagens, error } = useNuvemPalavras(pesquisaId, 20_000);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        Não foi possível carregar as mensagens: {error}
      </div>
    );
  }

  if (palavras === null) return null;
  if (totalMensagens === 0) return null;

  const maxN = palavras[0]?.n ?? 1;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Palavras mais citadas</h2>
        <Link
          href={`/dashboard/${pesquisaSlug}/nuvem`}
          target="_blank"
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 print:hidden"
        >
          Abrir tela ao vivo ↗
        </Link>
      </div>

      {palavras.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">
          Nenhuma palavra da lista positiva apareceu nas mensagens ainda.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

"use client";

import { useEffect, useState } from "react";
import { contarRespostas, apagarTodasRespostas } from "@/lib/dashboard/resetResponses";
import type { Pesquisa } from "@/lib/types/survey";

export function AdminDangerZone({ pesquisa }: { pesquisa: Pesquisa }) {
  const [total, setTotal] = useState<number | null>(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<number | null>(null);

  useEffect(() => {
    contarRespostas(pesquisa.id).then(setTotal).catch(() => setTotal(null));
  }, [pesquisa.id]);

  const habilitado = confirmacao.trim() === pesquisa.slug && !apagando;

  async function handleApagar() {
    if (!habilitado) return;
    setErro(null);
    setApagando(true);
    try {
      const n = await apagarTodasRespostas(pesquisa.id);
      setResultado(n);
      setTotal(0);
      setConfirmacao("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível apagar as respostas.");
    } finally {
      setApagando(false);
    }
  }

  return (
    <div className="print:hidden">
      <h2 className="mb-1 text-lg font-bold text-slate-800">Zona de perigo</h2>
      <p className="mb-4 text-sm text-slate-500">
        Apaga permanentemente todas as respostas desta pesquisa (útil para limpar dados de
        teste antes de começar a coleta de verdade). Não afeta a pesquisa em si, só as
        respostas — o formulário continua funcionando normalmente depois.
      </p>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-slate-700">
          Respostas registradas atualmente:{" "}
          <span className="font-semibold">{total ?? "…"}</span>
        </p>

        {resultado !== null ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">
            {resultado} resposta(s) apagada(s) com sucesso.
          </p>
        ) : (
          <div className="mt-3">
            <label className="block text-xs text-slate-600">
              Para confirmar, digite o slug da pesquisa (<code>{pesquisa.slug}</code>):
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="text"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder={pesquisa.slug}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={!habilitado}
                onClick={handleApagar}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {apagando ? "Apagando…" : "Apagar todas as respostas"}
              </button>
            </div>
          </div>
        )}

        {erro && <p className="mt-3 text-sm text-red-700">{erro}</p>}
      </div>
    </div>
  );
}

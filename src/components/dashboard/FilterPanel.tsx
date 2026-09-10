"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FiltroDashboard, Questao } from "@/lib/types/survey";

type FilterPanelProps = {
  pesquisaId: string;
  filtros: FiltroDashboard[];
  onChange: (filtros: FiltroDashboard[]) => void;
};

export function FilterPanel({ pesquisaId, filtros, onChange }: FilterPanelProps) {
  const [perguntasPerfil, setPerguntasPerfil] = useState<Questao[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("questoes")
      .select("id, pesquisa_id, dimensao_id, enunciado, tipo_resposta, chave, ordem, opcoes")
      .eq("pesquisa_id", pesquisaId)
      .is("dimensao_id", null)
      .in("tipo_resposta", ["likert", "boolean"])
      .order("ordem")
      .returns<Questao[]>()
      .then(({ data }) => setPerguntasPerfil(data ?? []));
  }, [pesquisaId]);

  if (perguntasPerfil.length === 0) return null;

  function valorAtual(questaoId: string) {
    return filtros.find((f) => f.questao_id === questaoId)?.valor;
  }

  function setFiltro(questaoId: string, valor: number | undefined) {
    const semEste = filtros.filter((f) => f.questao_id !== questaoId);
    onChange(valor === undefined ? semEste : [...semEste, { questao_id: questaoId, valor }]);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {perguntasPerfil.map((q) => {
        // A query ja filtra tipo_resposta in (likert, boolean), entao opcoes aqui e sempre
        // OpcaoResposta[] | null (nunca o formato { maxLength } das perguntas de texto).
        const opcoes =
          (Array.isArray(q.opcoes) ? q.opcoes : null) ??
          (q.tipo_resposta === "boolean"
            ? [
                { valor: 1, label: "Sim" },
                { valor: 0, label: "Não" },
              ]
            : []);
        const atual = valorAtual(q.id);

        return (
          <div key={q.id} className="flex items-center gap-2">
            <label className="text-sm text-slate-600">{q.enunciado}</label>
            <select
              value={atual ?? ""}
              onChange={(e) =>
                setFiltro(q.id, e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">Todos</option>
              {opcoes.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

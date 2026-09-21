"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FiltroDashboard, Questao } from "@/lib/types/survey";

type FilterPanelProps = {
  pesquisaId: string;
  filtros: FiltroDashboard[];
  onChange: (filtros: FiltroDashboard[]) => void;
};

type OpcaoFiltro = { label: string; min: number; max: number };

// Nomes curtos pra exibir no filtro, em vez do enunciado completo da pergunta.
const LABEL_CURTO: Record<string, string> = {
  saude_fisica: "Saúde atual",
  saude_mental: "Saúde mental",
  ativo_fisicamente: "Fisicamente ativo",
};

const CHAVES_DICOTOMICAS = new Set(["saude_fisica", "saude_mental"]);
const OPCOES_DICOTOMICAS: OpcaoFiltro[] = [
  { label: "Ruim", min: 1, max: 3 },
  { label: "Boa", min: 4, max: 5 },
];

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

  function opcoesDe(q: Questao): OpcaoFiltro[] {
    if (q.chave && CHAVES_DICOTOMICAS.has(q.chave)) return OPCOES_DICOTOMICAS;

    const lista =
      (Array.isArray(q.opcoes) ? q.opcoes : null) ??
      (q.tipo_resposta === "boolean"
        ? [
            { valor: 1, label: "Sim" },
            { valor: 0, label: "Não" },
          ]
        : []);
    return lista.map((o) => ({ label: o.label, min: o.valor, max: o.valor }));
  }

  function estaSemFiltro(questaoId: string) {
    return !filtros.some((f) => f.questao_id === questaoId);
  }

  function ativo(questaoId: string, min: number, max: number) {
    const atual = filtros.find((f) => f.questao_id === questaoId);
    return atual?.min === min && atual?.max === max;
  }

  function limpar(questaoId: string) {
    onChange(filtros.filter((f) => f.questao_id !== questaoId));
  }

  function selecionar(questaoId: string, min: number, max: number) {
    onChange([...filtros.filter((f) => f.questao_id !== questaoId), { questao_id: questaoId, min, max }]);
  }

  return (
    <div className="flex flex-wrap gap-4">
      {perguntasPerfil.map((q) => {
        const opcoes = opcoesDe(q);
        return (
          <div key={q.id} className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              {(q.chave && LABEL_CURTO[q.chave]) ?? q.enunciado}
            </span>
            <div className="flex gap-1 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => limpar(q.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  estaSemFiltro(q.id)
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                Todos
              </button>
              {opcoes.map((o) => {
                const selecionado = ativo(q.id, o.min, o.max);
                return (
                  <button
                    key={`${o.min}:${o.max}`}
                    type="button"
                    onClick={() => selecionar(q.id, o.min, o.max)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      selecionado
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

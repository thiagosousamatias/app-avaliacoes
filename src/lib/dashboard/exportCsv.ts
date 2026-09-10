import { createClient } from "@/lib/supabase/client";

// Delimitador ';' (nao ',') porque o Excel em pt-BR usa virgula como separador decimal e so
// reconhece colunas de CSV automaticamente com ponto-e-virgula ao abrir por duplo clique.
const DELIM = ";";

function celula(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (texto.includes(DELIM) || texto.includes('"') || texto.includes("\n")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export async function baixarDadosBrutosCsv(pesquisaId: string, pesquisaSlug: string) {
  const supabase = createClient();

  const [{ data: questoes }, { data: sessoes }, { data: respostas }] = await Promise.all([
    supabase
      .from("questoes")
      .select("id, chave, enunciado, dimensao_id, ordem")
      .eq("pesquisa_id", pesquisaId)
      .order("dimensao_id", { nullsFirst: true })
      .order("ordem"),
    supabase
      .from("sessoes_resposta")
      .select("id, created_at")
      .eq("pesquisa_id", pesquisaId)
      .order("created_at"),
    supabase
      .from("respostas_itens")
      .select(
        "sessao_id, questao_id, valor_numerico, valor_texto, sessoes_resposta!inner(pesquisa_id)",
      )
      .eq("sessoes_resposta.pesquisa_id", pesquisaId),
  ]);

  if (!questoes || !sessoes || !respostas) {
    throw new Error("Não foi possível carregar os dados para exportação.");
  }

  const colunaPorQuestao = new Map(questoes.map((q) => [q.id, q.chave ?? q.enunciado]));
  const valorPorSessaoQuestao = new Map<string, number | string>();
  respostas.forEach((r) =>
    valorPorSessaoQuestao.set(`${r.sessao_id}:${r.questao_id}`, r.valor_texto ?? r.valor_numerico),
  );

  const cabecalho = ["sessao_id", "data_hora", ...questoes.map((q) => colunaPorQuestao.get(q.id)!)];
  const linhas = sessoes.map((s) => {
    const base = [s.id, new Date(s.created_at).toLocaleString("pt-BR")];
    const respostasLinha = questoes.map((q) => {
      const v = valorPorSessaoQuestao.get(`${s.id}:${q.id}`);
      return v === undefined ? "" : v;
    });
    return [...base, ...respostasLinha];
  });

  const csv = [cabecalho, ...linhas].map((linha) => linha.map(celula).join(DELIM)).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dados-brutos-${pesquisaSlug}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

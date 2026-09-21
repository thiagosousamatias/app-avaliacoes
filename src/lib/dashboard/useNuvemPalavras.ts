"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contarPalavrasPositivas, type PalavraContagem } from "./positiveLexicon";

export function useNuvemPalavras(pesquisaId: string, intervaloMs?: number) {
  const [palavras, setPalavras] = useState<PalavraContagem[] | null>(null);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    async function carregar() {
      try {
        const { data, error: queryError } = await supabase
          .from("respostas_itens")
          .select("valor_texto, questoes!inner(pesquisa_id, tipo_resposta)")
          .eq("questoes.pesquisa_id", pesquisaId)
          .eq("questoes.tipo_resposta", "texto")
          .not("valor_texto", "is", null);

        if (cancelado) return;

        if (queryError) {
          setError(queryError.message);
          return;
        }

        const textos = (data ?? []).map((r) => r.valor_texto as string);
        setTotalMensagens(textos.length);
        setPalavras(contarPalavrasPositivas(textos));
        setError(null);
      } catch (e) {
        // Falha de rede (bloqueio, DNS, sem conexao) nunca chega no {error} do supabase-js -
        // sem isso, a tela ficaria em branco pra sempre, sem nenhuma mensagem.
        if (cancelado) return;
        setError(e instanceof Error ? e.message : "Não foi possível carregar as mensagens.");
      }
    }

    carregar();
    const id = intervaloMs ? setInterval(carregar, intervaloMs) : null;

    return () => {
      cancelado = true;
      if (id) clearInterval(id);
    };
  }, [pesquisaId, intervaloMs]);

  return { palavras, totalMensagens, error };
}

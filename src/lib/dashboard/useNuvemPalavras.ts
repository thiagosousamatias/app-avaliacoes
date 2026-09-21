"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contarPalavrasPositivas, type PalavraContagem } from "./positiveLexicon";

export function useNuvemPalavras(pesquisaId: string, intervaloMs?: number) {
  const [palavras, setPalavras] = useState<PalavraContagem[] | null>(null);
  const [totalMensagens, setTotalMensagens] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    async function carregar() {
      const { data } = await supabase
        .from("respostas_itens")
        .select("valor_texto, questoes!inner(pesquisa_id, tipo_resposta)")
        .eq("questoes.pesquisa_id", pesquisaId)
        .eq("questoes.tipo_resposta", "texto")
        .not("valor_texto", "is", null);

      if (cancelado) return;
      const textos = (data ?? []).map((r) => r.valor_texto as string);
      setTotalMensagens(textos.length);
      setPalavras(contarPalavrasPositivas(textos));
    }

    carregar();
    const id = intervaloMs ? setInterval(carregar, intervaloMs) : null;

    return () => {
      cancelado = true;
      if (id) clearInterval(id);
    };
  }, [pesquisaId, intervaloMs]);

  return { palavras, totalMensagens };
}

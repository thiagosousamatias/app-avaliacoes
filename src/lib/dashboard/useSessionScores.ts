"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OpcaoResposta, SessionScore } from "@/lib/types/survey";

type SessionScoresState = {
  sessoes: SessionScore[];
  opcoesSaudeFisica: OpcaoResposta[];
  opcoesSaudeMental: OpcaoResposta[];
  opcoesAtivoFisicamente: OpcaoResposta[];
  loading: boolean;
  error: string | null;
};

export function useSessionScores(pesquisaId: string): SessionScoresState {
  const [state, setState] = useState<SessionScoresState>({
    sessoes: [],
    opcoesSaudeFisica: [],
    opcoesSaudeMental: [],
    opcoesAtivoFisicamente: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    async function carregar() {
      const [{ data: sessoes, error: rpcError }, { data: questoesPerfil }] = await Promise.all([
        supabase.rpc("get_session_scores", { p_pesquisa_id: pesquisaId }),
        supabase
          .from("questoes")
          .select("chave, opcoes")
          .eq("pesquisa_id", pesquisaId)
          .in("chave", ["saude_fisica", "saude_mental", "ativo_fisicamente"]),
      ]);

      if (cancelado) return;

      if (rpcError) {
        setState((s) => ({ ...s, loading: false, error: rpcError.message }));
        return;
      }

      const opcoesDe = (chave: string) =>
        questoesPerfil?.find((q) => q.chave === chave)?.opcoes ?? [];

      setState({
        sessoes: (sessoes as SessionScore[]) ?? [],
        opcoesSaudeFisica: opcoesDe("saude_fisica"),
        opcoesSaudeMental: opcoesDe("saude_mental"),
        opcoesAtivoFisicamente: opcoesDe("ativo_fisicamente"),
        loading: false,
        error: null,
      });
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [pesquisaId]);

  return state;
}

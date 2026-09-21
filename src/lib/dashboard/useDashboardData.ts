"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardData, FiltroDashboard } from "@/lib/types/survey";

const REFETCH_INTERVAL_MS = 30_000;

export function useDashboardData(pesquisaId: string, filtros: FiltroDashboard[]) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sem estado de "loading" dedicado: setState() antes do primeiro `await` dentro de um
  // efeito dispara o lint react-hooks/set-state-in-effect. `loading` e derivado de `data`.
  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: result, error: rpcError } = await supabase.rpc("get_dashboard_data", {
        p_pesquisa_id: pesquisaId,
        p_filtros: filtros,
      });

      if (rpcError) {
        setError(rpcError.message);
      } else {
        setData(result as DashboardData);
        setError(null);
      }
    } catch (e) {
      // Falha de rede (bloqueio, DNS, sem conexao) nunca chega no {error} do supabase-js -
      // sem isso, a tela ficaria "carregando" pra sempre, sem nenhuma mensagem.
      setError(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
    }
  }, [pesquisaId, filtros]);

  useEffect(() => {
    // fetchData only touches state after its internal `await`, never synchronously; the lint
    // rule can't see that and flags every async-fetch-in-effect call regardless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();

    const interval = setInterval(fetchData, REFETCH_INTERVAL_MS);
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchData]);

  return { data, loading: data === null && error === null, error, refetch: fetchData };
}

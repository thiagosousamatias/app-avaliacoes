import { createClient } from "@/lib/supabase/client";

export async function contarRespostas(pesquisaId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("sessoes_resposta")
    .select("*", { count: "exact", head: true })
    .eq("pesquisa_id", pesquisaId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// respostas_itens cai em cascata (FK on delete cascade em sessao_id) - apagar as sessoes ja
// limpa tudo. authenticated ja tem SELECT em sessoes_resposta, entao o RETURNING do delete()
// funciona normalmente (diferente do insert anonimo do formulario).
export async function apagarTodasRespostas(pesquisaId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessoes_resposta")
    .delete()
    .eq("pesquisa_id", pesquisaId)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

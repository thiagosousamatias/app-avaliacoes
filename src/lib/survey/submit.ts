import { createClient } from "@/lib/supabase/client";
import type { RespostaFormulario } from "@/lib/types/survey";

export async function enviarRespostas(pesquisaId: string, respostas: RespostaFormulario) {
  const supabase = createClient();

  // O id e gerado aqui, nao pelo banco: RETURNING exige privilegio de SELECT no Postgres, e o
  // anon nao tem (nem deve ter) SELECT nas tabelas de resposta. Gerando o UUID no client, o
  // insert nao precisa pedir nada de volta.
  const sessaoId = crypto.randomUUID();

  const { error: sessaoError } = await supabase
    .from("sessoes_resposta")
    .insert({ id: sessaoId, pesquisa_id: pesquisaId });

  if (sessaoError) {
    throw new Error(sessaoError.message);
  }

  // Perguntas de texto opcionais podem ficar vazias no state - nao envia linha pra elas
  // (o trigger no banco rejeita valor_texto vazio).
  const itens = Object.entries(respostas)
    .filter(([, valor]) => typeof valor !== "string" || valor.trim().length > 0)
    .map(([questaoId, valor]) => ({
      sessao_id: sessaoId,
      questao_id: questaoId,
      valor_numerico: typeof valor === "number" ? valor : null,
      valor_texto: typeof valor === "string" ? valor : null,
    }));

  const { error: itensError } = await supabase.from("respostas_itens").insert(itens);

  if (itensError) {
    throw new Error(itensError.message);
  }
}

import { createClient } from "@/lib/supabase/client";
import type { RespostaFormulario } from "@/lib/types/survey";

const CHAVE_DISPOSITIVO = "device_id";

export function chaveEnviado(slug: string) {
  return `submitted:${slug}`;
}

export function jaEnviouNesteAparelho(slug: string): boolean {
  try {
    return window.localStorage.getItem(chaveEnviado(slug)) === "1";
  } catch {
    return false;
  }
}

function marcarEnviado(slug: string) {
  try {
    window.localStorage.setItem(chaveEnviado(slug), "1");
  } catch {
    // localStorage indisponivel (modo privado etc.) - segue sem o aviso de reenvio.
  }
}

// UUID aleatorio, gerado uma vez e reaproveitado neste navegador - sem ligacao com
// identidade, so serve pra distinguir "mesmo aparelho" de "aparelho diferente". Se
// localStorage estiver indisponivel, retorna undefined e o insert segue sem essa protecao
// (nao trava o envio por causa disso).
function obterDispositivoId(): string | undefined {
  try {
    const existente = window.localStorage.getItem(CHAVE_DISPOSITIVO);
    if (existente) return existente;
    const novo = crypto.randomUUID();
    window.localStorage.setItem(CHAVE_DISPOSITIVO, novo);
    return novo;
  } catch {
    return undefined;
  }
}

export async function enviarRespostas(
  slug: string,
  pesquisaId: string,
  respostas: RespostaFormulario,
) {
  const supabase = createClient();

  // O id e gerado aqui, nao pelo banco: RETURNING exige privilegio de SELECT no Postgres, e o
  // anon nao tem (nem deve ter) SELECT nas tabelas de resposta. Gerando o UUID no client, o
  // insert nao precisa pedir nada de volta.
  const sessaoId = crypto.randomUUID();
  const dispositivoId = obterDispositivoId();

  const { error: sessaoError } = await supabase
    .from("sessoes_resposta")
    .insert({ id: sessaoId, pesquisa_id: pesquisaId, dispositivo_id: dispositivoId ?? null });

  if (sessaoError) {
    // 23505 = unique_violation: esse aparelho ja respondeu essa pesquisa (bloqueado no banco,
    // nao so avisado no client).
    if (sessaoError.code === "23505") {
      marcarEnviado(slug);
      throw new Error("Este aparelho já enviou uma resposta para esta pesquisa.");
    }
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

  marcarEnviado(slug);
}

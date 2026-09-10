"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type { PesquisaCompleta, RespostaFormulario } from "@/lib/types/survey";
import { enviarRespostas, jaEnviouNesteAparelho } from "@/lib/survey/submit";
import { LikertButton } from "./LikertButton";
import { BooleanToggle } from "./BooleanToggle";
import { NumericInput } from "./NumericInput";
import { TextInput } from "./TextInput";

type SurveyFormProps = {
  dados: PesquisaCompleta;
};

export function SurveyForm({ dados }: SurveyFormProps) {
  const { pesquisa, perguntasPerfil, perguntasFechamento, dimensoes } = dados;

  // Perguntas de texto (ex: "mensagem para o voce do futuro") sao opcionais - nao entram na
  // contagem de completude nem bloqueiam o envio.
  const questoesObrigatorias = useMemo(
    () => [...perguntasPerfil, ...dimensoes.flatMap((d) => d.questoes)],
    [perguntasPerfil, dimensoes],
  );

  const [respostas, setRespostas] = useState<RespostaFormulario>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  // useSyncExternalStore (nao useEffect+setState) para ler o localStorage: o snapshot do
  // servidor e sempre `false` (servidor nao tem localStorage) e o do cliente le o valor real
  // logo apos a hidratacao, sem o mismatch de ler localStorage direto no render/useState.
  const jaRespondeuAntes = useSyncExternalStore(
    () => () => {},
    () => jaEnviouNesteAparelho(pesquisa.slug),
    () => false,
  );

  const respondidas = questoesObrigatorias.filter((q) => respostas[q.id] !== undefined).length;
  const completo = respondidas === questoesObrigatorias.length;

  function setResposta(questaoId: string, valor: number | string) {
    setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
  }

  async function handleSubmit() {
    if (!completo || enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await enviarRespostas(pesquisa.slug, pesquisa.id, respostas);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <Image src="/sesi-saude-logo.png" alt="SESI+ Saúde" width={1067} height={584} className="h-10 w-auto" />
        <div className="text-5xl">✅</div>
        <h1 className="text-xl font-bold text-slate-800">Obrigado pela participação!</h1>
        <p className="text-slate-600">Suas respostas foram registradas com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <header className="mb-6">
        <Image
          src="/sesi-saude-logo.png"
          alt="SESI+ Saúde"
          width={1067}
          height={584}
          className="mb-4 h-10 w-auto"
          priority
        />
        <h1 className="text-xl font-bold text-slate-800">{pesquisa.titulo}</h1>
        {pesquisa.descricao && (
          <p className="mt-1 text-sm text-slate-500">{pesquisa.descricao}</p>
        )}
      </header>

      {jaRespondeuAntes && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Este aparelho já enviou uma resposta para esta pesquisa. Você ainda pode enviar de
          novo se quiser.
        </div>
      )}

      <div className="space-y-8">
        {perguntasPerfil.map((q) => (
          <QuestaoField
            key={q.id}
            enunciado={q.enunciado}
            tipo={q.tipo_resposta}
            valor={respostas[q.id]}
            opcoes={q.opcoes}
            onChange={(v) => setResposta(q.id, v)}
          />
        ))}

        {dimensoes.map((d) => (
          <section key={d.id} className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {d.nome}
            </h2>
            {d.questoes.map((q) => (
              <QuestaoField
                key={q.id}
                enunciado={q.enunciado}
                tipo={q.tipo_resposta}
                valor={respostas[q.id]}
                opcoes={q.opcoes}
                onChange={(v) => setResposta(q.id, v)}
              />
            ))}
          </section>
        ))}

        {perguntasFechamento.map((q) => (
          <QuestaoField
            key={q.id}
            enunciado={q.enunciado}
            tipo={q.tipo_resposta}
            valor={respostas[q.id]}
            opcoes={q.opcoes}
            onChange={(v) => setResposta(q.id, v)}
          />
        ))}
      </div>

      {erro && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            disabled={!completo || enviando}
            onClick={handleSubmit}
            className="min-h-14 w-full rounded-xl bg-slate-800 text-base font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {enviando ? "Enviando…" : `Enviar respostas (${respondidas}/${questoesObrigatorias.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestaoField({
  enunciado,
  tipo,
  valor,
  opcoes,
  onChange,
}: {
  enunciado: string;
  tipo: "likert" | "boolean" | "numeric" | "texto";
  valor: number | string | undefined;
  opcoes: PesquisaCompleta["perguntasPerfil"][number]["opcoes"];
  onChange: (v: number | string) => void;
}) {
  const opcoesLista = Array.isArray(opcoes) ? opcoes : null;
  const maxLength = !Array.isArray(opcoes) && opcoes ? opcoes.maxLength : 140;

  return (
    <div>
      <p className="mb-3 text-base font-medium text-slate-800">{enunciado}</p>
      {tipo === "likert" && (
        <LikertButton valor={valor as number | undefined} onChange={onChange} opcoes={opcoesLista} />
      )}
      {tipo === "boolean" && (
        <BooleanToggle valor={valor as number | undefined} onChange={onChange} opcoes={opcoesLista} />
      )}
      {tipo === "numeric" && (
        <NumericInput valor={valor as number | undefined} onChange={onChange} sufixo="anos" />
      )}
      {tipo === "texto" && (
        <TextInput valor={valor as string | undefined} onChange={onChange} maxLength={maxLength} />
      )}
    </div>
  );
}

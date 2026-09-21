"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { PesquisaCompleta, RespostaFormulario } from "@/lib/types/survey";
import { enviarRespostas } from "@/lib/survey/submit";
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
  const refsPerguntas = useRef(new Map<string, HTMLDivElement | null>());

  const respondidas = questoesObrigatorias.filter((q) => respostas[q.id] !== undefined).length;
  const completo = respondidas === questoesObrigatorias.length;

  function setResposta(questaoId: string, valor: number | string) {
    setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
  }

  async function handleSubmit() {
    if (enviando) return;
    setErro(null);

    if (!completo) {
      const faltando = questoesObrigatorias.find((q) => respostas[q.id] === undefined);
      if (faltando) {
        setErro(`Falta responder: "${faltando.enunciado}"`);
        refsPerguntas.current.get(faltando.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setEnviando(true);
    try {
      await enviarRespostas(pesquisa.id, respostas);
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
        <Image src="/jogos-sesi-saude-logo.png" alt="Jogos do SESI + Saúde" width={640} height={640} className="h-32 w-auto" />
        <Image src="/sesi-institucional-logo.png" alt="SESI - Serviço Social da Indústria" width={373} height={106} className="h-10 w-auto" />
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold text-slate-800">Obrigado pela participação!</h1>
        <p className="text-lg text-slate-600">Suas respostas foram registradas com sucesso.</p>
        <p className="mt-4 text-xl font-semibold text-slate-800">
          &ldquo;O SESI incentiva. A indústria vence&rdquo;
        </p>
        <p className="text-base text-slate-600">
          Somos: Comprometimento; Orgulho de representar a empresa, Motivação; Espírito de
          Equipe; Respeito
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <Image
            src="/jogos-sesi-saude-logo.png"
            alt="Jogos do SESI + Saúde"
            width={640}
            height={640}
            className="h-20 w-auto"
            priority
          />
          <Image
            src="/sesi-institucional-logo.png"
            alt="SESI - Serviço Social da Indústria"
            width={373}
            height={106}
            className="h-8 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{pesquisa.titulo}</h1>
        {pesquisa.descricao && (
          <p className="mt-1 text-base text-slate-500">{pesquisa.descricao}</p>
        )}
      </header>

      <div className="space-y-8">
        {perguntasPerfil.map((q) => (
          <div key={q.id} ref={(el) => { refsPerguntas.current.set(q.id, el); }}>
            <QuestaoField
              enunciado={q.enunciado}
              tipo={q.tipo_resposta}
              valor={respostas[q.id]}
              opcoes={q.opcoes}
              onChange={(v) => setResposta(q.id, v)}
            />
          </div>
        ))}

        {dimensoes.map((d) => (
          <section key={d.id} className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {d.nome}
            </h2>
            {d.questoes.map((q) => (
              <div key={q.id} ref={(el) => { refsPerguntas.current.set(q.id, el); }}>
                <QuestaoField
                  enunciado={q.enunciado}
                  tipo={q.tipo_resposta}
                  valor={respostas[q.id]}
                  opcoes={q.opcoes}
                  onChange={(v) => setResposta(q.id, v)}
                />
              </div>
            ))}
          </section>
        ))}

        {perguntasFechamento.map((q) => (
          <div key={q.id} ref={(el) => { refsPerguntas.current.set(q.id, el); }}>
            <QuestaoField
              enunciado={q.enunciado}
              tipo={q.tipo_resposta}
              valor={respostas[q.id]}
              opcoes={q.opcoes}
              onChange={(v) => setResposta(q.id, v)}
            />
          </div>
        ))}
      </div>

      {erro && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-base text-red-700">
          {erro}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            disabled={enviando}
            onClick={handleSubmit}
            className="min-h-14 w-full rounded-xl bg-slate-800 text-lg font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
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
      <p className="mb-3 text-lg font-medium text-slate-800">{enunciado}</p>
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

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SurveyForm } from "@/components/survey/SurveyForm";
import type { Dimensao, Pesquisa, PesquisaCompleta, Questao } from "@/lib/types/survey";

export default async function PesquisaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pesquisa } = await supabase
    .from("pesquisas")
    .select("id, titulo, slug, descricao, status")
    .eq("slug", slug)
    .eq("status", "ativo")
    .maybeSingle<Pesquisa>();

  if (!pesquisa) {
    notFound();
  }

  const [{ data: dimensoesRaw }, { data: questoesRaw }] = await Promise.all([
    supabase
      .from("dimensoes")
      .select("id, pesquisa_id, nome, ordem")
      .eq("pesquisa_id", pesquisa.id)
      .order("ordem")
      .returns<Dimensao[]>(),
    supabase
      .from("questoes")
      .select("id, pesquisa_id, dimensao_id, enunciado, tipo_resposta, chave, ordem, opcoes")
      .eq("pesquisa_id", pesquisa.id)
      .order("ordem")
      .returns<Questao[]>(),
  ]);

  const dimensoesList = dimensoesRaw ?? [];
  const questoesList = questoesRaw ?? [];

  const dados: PesquisaCompleta = {
    pesquisa,
    perguntasPerfil: questoesList.filter((q) => q.dimensao_id === null && q.tipo_resposta !== "texto"),
    perguntasFechamento: questoesList.filter((q) => q.dimensao_id === null && q.tipo_resposta === "texto"),
    dimensoes: dimensoesList.map((d) => ({
      ...d,
      questoes: questoesList.filter((q) => q.dimensao_id === d.id),
    })),
  };

  return <SurveyForm dados={dados} />;
}

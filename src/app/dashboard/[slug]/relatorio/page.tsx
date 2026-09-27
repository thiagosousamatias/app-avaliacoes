import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RelatorioSimplificado } from "@/components/dashboard/RelatorioSimplificado";
import type { Pesquisa } from "@/lib/types/survey";

export default async function RelatorioSimplificadoPage({
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
    .maybeSingle<Pesquisa>();

  if (!pesquisa) {
    notFound();
  }

  return <RelatorioSimplificado pesquisa={pesquisa} />;
}

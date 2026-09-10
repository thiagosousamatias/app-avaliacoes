import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { Pesquisa } from "@/lib/types/survey";

export default async function DashboardPesquisaPage({
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

  return <DashboardView pesquisa={pesquisa} />;
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NuvemAoVivo } from "@/components/dashboard/NuvemAoVivo";
import type { Pesquisa } from "@/lib/types/survey";

export default async function NuvemAoVivoPage({
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

  return <NuvemAoVivo pesquisa={pesquisa} />;
}

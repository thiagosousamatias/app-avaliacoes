import { createClient } from "@/lib/supabase/server";
import { SurveyCard } from "@/components/dashboard/SurveyCard";
import type { Pesquisa } from "@/lib/types/survey";

export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const { data: pesquisas } = await supabase
    .from("pesquisas")
    .select("id, titulo, slug, descricao, status")
    .order("created_at", { ascending: false })
    .returns<Pesquisa[]>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Pesquisas</h1>

      {!pesquisas || pesquisas.length === 0 ? (
        <p className="text-slate-500">Nenhuma pesquisa cadastrada ainda.</p>
      ) : (
        <div className="space-y-3">
          {pesquisas.map((p) => (
            <SurveyCard key={p.id} pesquisa={p} />
          ))}
        </div>
      )}
    </div>
  );
}

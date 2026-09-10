import Link from "next/link";
import type { Pesquisa } from "@/lib/types/survey";
import { ShareQrButton } from "./ShareQrButton";

const STATUS_LABEL: Record<Pesquisa["status"], string> = {
  rascunho: "Rascunho",
  ativo: "Ativa",
  encerrado: "Encerrada",
};

const STATUS_CLASS: Record<Pesquisa["status"], string> = {
  rascunho: "bg-slate-100 text-slate-600",
  ativo: "bg-emerald-100 text-emerald-700",
  encerrado: "bg-slate-100 text-slate-500",
};

export function SurveyCard({ pesquisa }: { pesquisa: Pesquisa }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Link
            href={`/dashboard/${pesquisa.slug}`}
            className="font-semibold text-slate-800 hover:underline"
          >
            {pesquisa.titulo}
          </Link>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[pesquisa.status]}`}
          >
            {STATUS_LABEL[pesquisa.status]}
          </span>
        </div>
        <p className="text-sm text-slate-500">/{pesquisa.slug}</p>
      </div>
      <ShareQrButton slug={pesquisa.slug} />
    </div>
  );
}

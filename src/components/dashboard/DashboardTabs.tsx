"use client";

export type AbaDashboard = "dashboard" | "compartilhar" | "administracao";

const ABAS: { id: AbaDashboard; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "compartilhar", label: "Compartilhar" },
  { id: "administracao", label: "Administração" },
];

export function DashboardTabs({
  ativa,
  onChange,
}: {
  ativa: AbaDashboard;
  onChange: (aba: AbaDashboard) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-slate-200 print:hidden" role="tablist">
      {ABAS.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onChange(aba.id)}
            className={`-mb-px border-b-[3px] px-4 py-2.5 text-base font-semibold transition-colors ${
              selecionada
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {aba.label}
          </button>
        );
      })}
    </div>
  );
}

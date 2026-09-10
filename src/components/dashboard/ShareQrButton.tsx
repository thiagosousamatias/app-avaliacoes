"use client";

import { useState } from "react";
import { QrCodeCard } from "./QrCodeCard";

type ShareQrButtonProps = {
  slug: string;
};

export function ShareQrButton({ slug }: ShareQrButtonProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Compartilhar QR
      </button>

      {aberto && (
        <div className="absolute right-0 z-10 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <QrCodeCard slug={slug} tamanho="compact" />
        </div>
      )}
    </div>
  );
}

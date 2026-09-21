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
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
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

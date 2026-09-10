"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type QrCodeCardProps = {
  slug: string;
  tamanho?: "compact" | "full";
};

export function QrCodeCard({ slug, tamanho = "compact" }: QrCodeCardProps) {
  const [copiado, setCopiado] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = `${siteUrl}/pesquisa/${slug}`;
  const qrSize = tamanho === "full" ? 260 : 180;

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponivel - usuario pode selecionar o texto manualmente.
    }
  }

  function baixarPng() {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className={tamanho === "full" ? "" : "w-64"}>
      <div ref={canvasWrapperRef} className="flex justify-center">
        <QRCodeCanvas value={url} size={qrSize} />
      </div>
      <p className="mt-3 truncate text-center text-xs text-slate-500">{url}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={copiarLink}
          className="flex-1 rounded-lg border border-slate-300 py-1.5 text-sm hover:bg-slate-50"
        >
          {copiado ? "Copiado!" : "Copiar link"}
        </button>
        <button
          type="button"
          onClick={baixarPng}
          className="flex-1 rounded-lg border border-slate-300 py-1.5 text-sm hover:bg-slate-50"
        >
          Baixar PNG
        </button>
      </div>
    </div>
  );
}

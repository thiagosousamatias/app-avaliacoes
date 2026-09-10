import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Sistema de Pesquisas</h1>
      <p className="max-w-sm text-slate-600">
        Colete respostas via QR Code e acompanhe os resultados em tempo real.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700"
      >
        Acessar painel de gestão
      </Link>
    </div>
  );
}

export default function PesquisaNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="text-5xl">🔍</div>
      <h1 className="text-xl font-bold text-slate-800">Pesquisa não encontrada</h1>
      <p className="text-slate-600">
        Este link não existe ou a pesquisa não está mais ativa.
      </p>
    </div>
  );
}

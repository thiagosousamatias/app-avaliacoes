type KpiCardProps = {
  label: string;
  value: string | number;
};

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

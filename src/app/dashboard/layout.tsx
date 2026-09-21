// Sem tela de login: o middleware (src/lib/supabase/middleware.ts) autentica toda requisicao
// a /dashboard* nos bastidores com uma conta de servico fixa, entao o RLS do Supabase (que
// exige role "authenticated" pra ler/apagar respostas) continua valendo sem pedir nada de
// ninguem.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>;
}

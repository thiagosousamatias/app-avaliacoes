import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
      // O cookie de sessao do login automatico do /dashboard nao pode valer pro site inteiro -
      // senao o formulario publico em /pesquisa passa a enviar como a role authenticated (sem
      // permissao de INSERT) sempre que o mesmo navegador ja tiver visitado o /dashboard antes.
      cookieOptions: { path: "/dashboard" },
    },
  );

  // Necessario para o refresh do token de sessao funcionar via SSR.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login automatico pra rotas /dashboard, sem pedir senha de ninguem: nao ha mais tela de
  // login no app, entao isso e a unica forma de obter uma sessao "authenticated" (exigida
  // pelo RLS pra ler/apagar respostas). Usa uma conta de servico fixa via env vars (nunca a
  // conta pessoal de ninguem). O signInWithPassword aqui usa o mesmo client (com os cookies
  // grudados via setAll acima), entao a sessao resultante propaga tanto pro resto desta mesma
  // requisicao quanto pro navegador. Pra voltar a exigir login de verdade, seria preciso
  // reintroduzir a pagina /login e o guard em dashboard/layout.tsx, alem de remover este bloco.
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard") &&
    process.env.DASHBOARD_AUTH_EMAIL &&
    process.env.DASHBOARD_AUTH_PASSWORD
  ) {
    await supabase.auth.signInWithPassword({
      email: process.env.DASHBOARD_AUTH_EMAIL,
      password: process.env.DASHBOARD_AUTH_PASSWORD,
    });
  }

  return supabaseResponse;
}

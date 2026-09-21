import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // O cookie de sessao (usado so pelo /dashboard, via login automatico no middleware) nao
      // pode valer pro site inteiro - senao quem visita o /dashboard fica "logado" tambem no
      // formulario publico em /pesquisa, e o insert anonimo passa a ser enviado com a role
      // authenticated (sem permissao de INSERT), quebrando o envio. Restringir o path faz o
      // navegador simplesmente nao expor esse cookie fora de /dashboard.
      cookieOptions: { path: "/dashboard" },
    },
  );
}

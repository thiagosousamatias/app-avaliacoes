import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component; o middleware cuida de
            // refrescar a sessao nessas requisicoes.
          }
        },
      },
      // Mesmo motivo do client.ts: o cookie de sessao do /dashboard nao pode vazar pro
      // formulario publico em /pesquisa (que usa este mesmo createClient no server component).
      cookieOptions: { path: "/dashboard" },
    },
  );
}

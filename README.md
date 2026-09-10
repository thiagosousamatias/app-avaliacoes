# Sistema de Pesquisas

QR Code → formulário mobile → dashboard de gestão. Arquitetura pensada para suportar novas
pesquisas sem alterar o schema (veja `supabase/migrations/`).

## Stack

Next.js (App Router, TypeScript) + Tailwind CSS + Supabase (Postgres, Auth, RLS) + Recharts.

## Setup

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e aplique as migrations em
   `supabase/migrations/` (em ordem numérica) pelo SQL Editor do painel, ou via
   Supabase CLI (`supabase db push`).

3. Copie `.env.local.example` para `.env.local` e preencha com as credenciais do projeto
   (URL, anon key, e a service role key — essa última só é usada localmente pelo script de
   seed, nunca deve ir para produção/Vercel).

4. Rode o seed da primeira pesquisa (Jogos Esportivos):
   ```
   npm run seed
   ```

5. Suba o app:
   ```
   npm run dev
   ```
   - Formulário público: `/pesquisa/jogos-esportivos`
   - Login de gestor (e-mail + senha): `/login`
   - Dashboard: `/dashboard`

## Configurar autenticação (Supabase Auth)

Login é e-mail + senha simples (sem confirmação por e-mail). Para cada gestor, crie o usuário
direto no painel do Supabase: **Authentication → Users → Add user**, preenchendo e-mail e
senha manualmente e marcando "Auto Confirm User".

## Estrutura

- `supabase/migrations/` — schema, RLS e a função `get_dashboard_data` (agregação para o dashboard).
- `supabase/seed/` — script idempotente que popula a pesquisa a partir do PDF em `docs/`.
- `src/app/pesquisa/[slug]` — formulário público, uma rota por pesquisa.
- `src/app/dashboard/[slug]` — dashboard analítico de uma pesquisa.
- `src/components/survey` / `src/components/dashboard` — componentes reutilizáveis entre pesquisas.

## Deploy

Vercel, com as env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`NEXT_PUBLIC_SITE_URL` (URL de produção). **Não** configure `SUPABASE_SERVICE_ROLE_KEY` lá —
nada no app em produção precisa dela.

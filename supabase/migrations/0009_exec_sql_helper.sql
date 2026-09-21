-- Funcao auxiliar pra permitir aplicar migrations futuras via API REST (service_role key),
-- sem precisar colar SQL manualmente no editor do Supabase toda vez. Travada exclusivamente
-- pra service_role - anon e authenticated nunca tem acesso, entao nao abre brecha nova pro
-- app publico (a service_role key ja e equivalente a acesso total, so nunca sai do terminal
-- local, nunca vai pra Vercel).
create or replace function exec_sql(sql text) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute sql;
end;
$$;

revoke all on function exec_sql(text) from public, anon, authenticated;
grant execute on function exec_sql(text) to service_role;

alter table pesquisas enable row level security;
alter table dimensoes enable row level security;
alter table questoes enable row level security;
alter table sessoes_resposta enable row level security;
alter table respostas_itens enable row level security;

-- Conteudo: anon so ve pesquisas ativas (mesmo que o slug de um rascunho vaze, nao e renderizavel).
-- Gestores (authenticated) veem tudo, inclusive rascunho/encerrado, para preview e QA.
create policy pesquisas_select_anon on pesquisas
  for select to anon using (status = 'ativo');
create policy pesquisas_select_auth on pesquisas
  for select to authenticated using (true);

create policy dimensoes_select_anon on dimensoes
  for select to anon using (
    exists (select 1 from pesquisas p where p.id = pesquisa_id and p.status = 'ativo')
  );
create policy dimensoes_select_auth on dimensoes
  for select to authenticated using (true);

create policy questoes_select_anon on questoes
  for select to anon using (
    exists (select 1 from pesquisas p where p.id = pesquisa_id and p.status = 'ativo')
  );
create policy questoes_select_auth on questoes
  for select to authenticated using (true);

-- Respostas: anon so faz INSERT, nunca SELECT. Gestores so fazem SELECT (dashboard read-only).
create policy sessoes_insert_anon on sessoes_resposta
  for insert to anon with check (
    exists (select 1 from pesquisas p where p.id = pesquisa_id and p.status = 'ativo')
  );
create policy sessoes_select_auth on sessoes_resposta
  for select to authenticated using (true);

-- IMPORTANTE: "with check (true)" e proposital aqui, nao uma subquery contra sessoes_resposta.
-- anon nao tem policy de SELECT em sessoes_resposta, entao uma subquery ali nao enxergaria
-- nenhuma linha e faria todo insert falhar silenciosamente. A integridade referencial ja e
-- garantida pelas foreign keys (sessao_id, questao_id), que o Postgres aplica por baixo da RLS.
create policy itens_insert_anon on respostas_itens
  for insert to anon with check (true);
create policy itens_select_auth on respostas_itens
  for select to authenticated using (true);

-- Grants explicitos: nao depender dos grants padrao do schema public do Supabase.
revoke all on pesquisas, dimensoes, questoes, sessoes_resposta, respostas_itens
  from anon, authenticated;

grant select on pesquisas, dimensoes, questoes to anon, authenticated;
grant insert on sessoes_resposta, respostas_itens to anon;
grant select on sessoes_resposta, respostas_itens to authenticated;

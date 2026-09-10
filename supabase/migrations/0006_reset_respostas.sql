-- Permite que gestores (authenticated) apaguem respostas de uma pesquisa pelo admin.
-- respostas_itens tem "on delete cascade" em sessao_id, entao apagar sessoes_resposta ja
-- limpa os itens junto, sem precisar de mais nenhuma policy/grant.

create policy sessoes_delete_auth on sessoes_resposta
  for delete to authenticated using (true);

grant delete on sessoes_resposta to authenticated;

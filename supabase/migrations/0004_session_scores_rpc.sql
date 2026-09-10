-- Dados por sessao (nao agregados entre sessoes) para as analises inferenciais do dashboard:
-- correlacao (idade/saude x escores) e ANOVA (escore por categoria de saude). Diferente de
-- get_dashboard_data, que ja agrega tudo numa media geral, esta funcao devolve uma linha por
-- sessao para permitir o pareamento (idade da sessao X, escore da sessao X).
create or replace function get_session_scores(p_pesquisa_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  with perfil as (
    select
      ri.sessao_id,
      max(ri.valor_numerico) filter (where q.chave = 'idade') as idade,
      max(ri.valor_numerico) filter (where q.chave = 'saude_fisica') as saude_fisica,
      max(ri.valor_numerico) filter (where q.chave = 'saude_mental') as saude_mental,
      max(ri.valor_numerico) filter (where q.chave = 'ativo_fisicamente') as ativo_fisicamente
    from respostas_itens ri
    join questoes q on q.id = ri.questao_id
    where q.pesquisa_id = p_pesquisa_id and q.dimensao_id is null
    group by ri.sessao_id
  ),
  dim_scores as (
    select
      ri.sessao_id,
      d.nome as dimensao_nome,
      d.ordem,
      avg(ri.valor_numerico) as score
    from respostas_itens ri
    join questoes q on q.id = ri.questao_id
    join dimensoes d on d.id = q.dimensao_id
    where d.pesquisa_id = p_pesquisa_id
    group by ri.sessao_id, d.nome, d.ordem
  ),
  sessao_overall as (
    select sessao_id, avg(score) as overall
    from dim_scores
    group by sessao_id
  ),
  sessao_dims as (
    select
      sessao_id,
      jsonb_object_agg(dimensao_nome, round(score::numeric, 3) order by ordem) as dimensoes
    from dim_scores
    group by sessao_id
  )
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'sessao_id', p.sessao_id,
      'idade', p.idade,
      'saude_fisica', p.saude_fisica,
      'saude_mental', p.saude_mental,
      'ativo_fisicamente', p.ativo_fisicamente,
      'overall', round(so.overall::numeric, 3),
      'dimensoes', sd.dimensoes
    )),
    '[]'::jsonb
  )
  from perfil p
  join sessao_overall so on so.sessao_id = p.sessao_id
  join sessao_dims sd on sd.sessao_id = p.sessao_id;
$$;

grant execute on function get_session_scores(uuid) to authenticated;

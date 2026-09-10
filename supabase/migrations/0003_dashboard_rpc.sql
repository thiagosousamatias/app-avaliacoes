-- Devolve, num unico round-trip, as medias das 5 dimensoes (radar) + KPIs de uma pesquisa,
-- aplicando filtros dinamicos expressos como pares {questao_id, valor} (AND logico).
-- Roda com os direitos de quem chama (authenticated), que ja tem SELECT via RLS -- sem
-- security definer, para nao abrir acesso alem do que a RLS ja concede.
create or replace function get_dashboard_data(
  p_pesquisa_id uuid,
  p_filtros jsonb default '[]'::jsonb
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with sessoes_filtradas as (
    select s.id
    from sessoes_resposta s
    where s.pesquisa_id = p_pesquisa_id
      and (
        p_filtros = '[]'::jsonb
        or not exists (
          select 1 from jsonb_array_elements(p_filtros) f
          where not exists (
            select 1 from respostas_itens ri
            where ri.sessao_id = s.id
              and ri.questao_id = (f->>'questao_id')::uuid
              and ri.valor_numerico = (f->>'valor')::numeric
          )
        )
      )
  ),
  radar as (
    select
      d.id as dimensao_id,
      d.nome as dimensao_nome,
      d.ordem,
      round(avg(ri.valor_numerico)::numeric, 2) as media,
      count(distinct ri.sessao_id) as n_sessoes
    from dimensoes d
    join questoes q on q.dimensao_id = d.id
    join respostas_itens ri on ri.questao_id = q.id
    join sessoes_filtradas sf on sf.id = ri.sessao_id
    where d.pesquisa_id = p_pesquisa_id
    group by d.id, d.nome, d.ordem
  )
  select jsonb_build_object(
    'radar', coalesce((select jsonb_agg(r order by r.ordem) from radar r), '[]'::jsonb),
    'kpis', jsonb_build_object(
      'total_respondentes', (select count(*) from sessoes_filtradas),
      'media_geral', (select round(avg(media)::numeric, 2) from radar)
    )
  );
$$;

grant execute on function get_dashboard_data(uuid, jsonb) to authenticated;

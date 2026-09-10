-- Core content: survey definitions, reusable across future pesquisas.

create table pesquisas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  descricao text,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'ativo', 'encerrado')),
  created_at timestamptz not null default now()
);

create table dimensoes (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references pesquisas(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create index dimensoes_pesquisa_id_idx on dimensoes(pesquisa_id);

create table questoes (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references pesquisas(id) on delete cascade,
  dimensao_id uuid references dimensoes(id) on delete set null, -- null = pergunta de perfil (Bloco 1)
  enunciado text not null,
  tipo_resposta text not null check (tipo_resposta in ('likert', 'boolean', 'numeric')),
  chave text, -- chave estável, ex: 'idade', 'saude_fisica', 'q1'
  ordem int not null default 0,
  opcoes jsonb, -- rótulos customizados, ex: [{"valor":1,"label":"Muito ruim"}, ...]
  created_at timestamptz not null default now()
);
create index questoes_pesquisa_id_idx on questoes(pesquisa_id);
create index questoes_dimensao_id_idx on questoes(dimensao_id);
-- Indice nao-parcial: no Postgres, NULL nunca "colide" com NULL numa unique constraint, entao
-- multiplas questoes sem chave continuam permitidas. Precisa ser nao-parcial para o
-- ON CONFLICT (pesquisa_id, chave) do client Supabase conseguir usar este indice na inferencia.
create unique index questoes_pesquisa_chave_key
  on questoes(pesquisa_id, chave);

-- Response data: anonymous submissions.

create table sessoes_resposta (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references pesquisas(id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb, -- segmentação ad-hoc futura (setor, turno, unidade)
  created_at timestamptz not null default now()
);
create index sessoes_resposta_pesquisa_id_idx on sessoes_resposta(pesquisa_id);

create table respostas_itens (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references sessoes_resposta(id) on delete cascade,
  questao_id uuid not null references questoes(id) on delete cascade,
  valor_numerico numeric not null, -- likert: 1-5, boolean: 0/1, numeric: valor bruto (ex: idade)
  created_at timestamptz not null default now(),
  unique (sessao_id, questao_id)
);
create index respostas_itens_sessao_id_idx on respostas_itens(sessao_id);
create index respostas_itens_questao_id_idx on respostas_itens(questao_id);

-- Valida o valor de cada resposta contra o tipo da questão, mesmo vindo de insert anônimo.
create or replace function validate_resposta_range() returns trigger
language plpgsql as $$
declare
  v_tipo text;
begin
  select tipo_resposta into v_tipo from questoes where id = new.questao_id;

  if v_tipo = 'boolean' and new.valor_numerico not in (0, 1) then
    raise exception 'valor_numerico deve ser 0 ou 1 para questoes boolean';
  elsif v_tipo = 'likert' and (new.valor_numerico < 1 or new.valor_numerico > 5) then
    raise exception 'valor_numerico deve estar entre 1 e 5 para questoes likert';
  elsif v_tipo = 'numeric' and new.valor_numerico < 0 then
    raise exception 'valor_numerico invalido para questao numerica';
  end if;

  return new;
end;
$$;

create trigger trg_validate_resposta
  before insert on respostas_itens
  for each row execute function validate_resposta_range();

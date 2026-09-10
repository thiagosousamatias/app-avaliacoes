-- Suporte a perguntas de texto livre (ex: "mensagem para o voce do futuro"), alem dos tipos
-- likert/boolean/numeric ja existentes.

alter table respostas_itens
  alter column valor_numerico drop not null,
  add column valor_texto text;

alter table questoes drop constraint if exists questoes_tipo_resposta_check;
alter table questoes add constraint questoes_tipo_resposta_check
  check (tipo_resposta in ('likert', 'boolean', 'numeric', 'texto'));

-- Reescreve a validacao: tipo 'texto' exige valor_texto (com limite de caracteres opcional em
-- questoes.opcoes->>'maxLength', default 280); os demais tipos continuam exigindo
-- valor_numerico dentro do range esperado (agora que a coluna aceita NULL).
create or replace function validate_resposta_range() returns trigger
language plpgsql as $$
declare
  v_tipo text;
  v_max_len int;
begin
  select tipo_resposta, coalesce((opcoes->>'maxLength')::int, 280)
    into v_tipo, v_max_len
  from questoes where id = new.questao_id;

  if v_tipo = 'texto' then
    if new.valor_texto is null or length(trim(new.valor_texto)) = 0 then
      raise exception 'valor_texto e obrigatorio para questoes do tipo texto';
    end if;
    if length(new.valor_texto) > v_max_len then
      raise exception 'valor_texto excede o limite de % caracteres', v_max_len;
    end if;
  else
    if new.valor_numerico is null then
      raise exception 'valor_numerico e obrigatorio para questoes do tipo %', v_tipo;
    elsif v_tipo = 'boolean' and new.valor_numerico not in (0, 1) then
      raise exception 'valor_numerico deve ser 0 ou 1 para questoes boolean';
    elsif v_tipo = 'likert' and (new.valor_numerico < 1 or new.valor_numerico > 5) then
      raise exception 'valor_numerico deve estar entre 1 e 5 para questoes likert';
    elsif v_tipo = 'numeric' and new.valor_numerico < 0 then
      raise exception 'valor_numerico invalido para questao numerica';
    end if;
  end if;

  return new;
end;
$$;

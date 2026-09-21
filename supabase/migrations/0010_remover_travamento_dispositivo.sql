-- Libera responder quantas vezes quiser do mesmo aparelho (ex: totem/tablet compartilhado
-- por varias pessoas no evento) - remove a restricao de "uma resposta por aparelho" criada
-- na 0007.
drop index if exists sessoes_resposta_pesquisa_dispositivo_key;
alter table sessoes_resposta drop column if exists dispositivo_id;

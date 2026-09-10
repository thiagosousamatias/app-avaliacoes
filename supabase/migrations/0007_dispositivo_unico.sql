-- Bloqueia (nao so avisa) uma segunda resposta do mesmo aparelho para a mesma pesquisa.
-- dispositivo_id e um UUID aleatorio gerado no navegador (localStorage), sem nenhuma ligacao
-- com identidade - continua anonimo, so deixa de ser trivialmente burlavel com um refresh.
-- Contorna (aba anonima, limpar o site, outro aparelho) continuam funcionando - nao existe
-- prevencao de duplicidade 100% robusta que preserve o anonimato total.

alter table sessoes_resposta add column dispositivo_id uuid;

create unique index sessoes_resposta_pesquisa_dispositivo_key
  on sessoes_resposta(pesquisa_id, dispositivo_id)
  where dispositivo_id is not null;

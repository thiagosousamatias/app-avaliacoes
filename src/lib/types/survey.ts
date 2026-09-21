export type TipoResposta = "likert" | "boolean" | "numeric" | "texto";

export type OpcaoResposta = {
  valor: number;
  label: string;
};

// Para tipo_resposta 'texto', `opcoes` guarda { maxLength } em vez da lista de rotulos.
export type OpcoesTexto = {
  maxLength: number;
};

export type Pesquisa = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  status: "rascunho" | "ativo" | "encerrado";
};

export type Dimensao = {
  id: string;
  pesquisa_id: string;
  nome: string;
  ordem: number;
};

export type Questao = {
  id: string;
  pesquisa_id: string;
  dimensao_id: string | null;
  enunciado: string;
  tipo_resposta: TipoResposta;
  chave: string | null;
  ordem: number;
  opcoes: OpcaoResposta[] | OpcoesTexto | null;
};

export type PesquisaCompleta = {
  pesquisa: Pesquisa;
  perguntasPerfil: Questao[]; // dimensao_id === null, tipo_resposta !== 'texto' — topo do formulario
  perguntasFechamento: Questao[]; // dimensao_id === null, tipo_resposta === 'texto' — fim do formulario
  dimensoes: (Dimensao & { questoes: Questao[] })[];
};

export type RespostaFormulario = Record<string, number | string>; // questao_id -> valor

export type DashboardData = {
  radar: {
    dimensao_id: string;
    dimensao_nome: string;
    ordem: number;
    media: number;
    n_sessoes: number;
  }[];
  kpis: {
    total_respondentes: number;
    media_geral: number | null;
  };
};

export type FiltroDashboard = {
  questao_id: string;
  min: number;
  max: number;
};

export type SessionScore = {
  sessao_id: string;
  idade: number | null;
  saude_fisica: number | null;
  saude_mental: number | null;
  ativo_fisicamente: number | null; // 0 ou 1
  overall: number; // 1-5
  dimensoes: Record<string, number>; // nome da dimensao -> media 1-5
};

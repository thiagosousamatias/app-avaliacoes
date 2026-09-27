// Indicadores nacionais de referencia para contraste no relatorio simplificado. Fonte: IBGE,
// Pesquisa Nacional de Saude (PNS) 2019 - "Percepcao do estado de saude, estilos de vida e
// doencas cronicas", divulgada em 2020 (ultima edicao com esses indicadores publicados).
// https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias
//
// So entram aqui indicadores com um equivalente direto na nossa pesquisa - saude mental fica
// de fora porque a PNS mede diagnostico de depressao (10,2% da populacao adulta), nao
// autoavaliacao da saude mental como a nossa pergunta: sao construtos diferentes, comparar um
// com o outro seria enganoso.
export const PNS_2019 = {
  fonte: "IBGE, Pesquisa Nacional de Saúde (PNS) 2019",
  saudeBoaOuMuitoBoa: {
    percentual: 66.1,
    // Pergunta da PNS: autoavaliacao geral de saude (muito boa/boa/regular/ruim/muito ruim),
    // mesma escala e mesmo corte (boa+muito boa) da nossa pergunta "saude_fisica".
    descricao: "Adultos (18+) que avaliam a própria saúde como boa ou muito boa",
  },
  fisicamenteAtivoLazer: {
    percentual: 30.1,
    // Metodologia mais rigorosa que a nossa pergunta: PNS considera ativo quem atinge o nivel
    // recomendado pela OMS no lazer (150min moderado ou 75min vigoroso/semana); a nossa
    // pergunta e autopercepcao ("pratica exercicios 2-3x/semana"), sem medir duracao/intensidade
    // - os numeros nao sao estritamente equivalentes, por isso o aviso no rodape do grafico.
    descricao: "Adultos (18+) fisicamente ativos no lazer (nível recomendado pela OMS)",
  },
} as const;

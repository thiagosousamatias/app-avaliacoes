// Seed idempotente da pesquisa "Impacto dos Jogos Esportivos na Indústria" (ver
// docs/Projeto_Jogos_Esportivos_Industria_v1.pdf). Roda localmente com a service role key,
// nunca faz parte do bundle da aplicação.
//
// Uso: npm run seed  (requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local)

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local ausente - segue usando variaveis ja presentes no ambiente.
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de rodar o seed.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const LIKERT_PADRAO = [
  { valor: 1, label: "Discordo Totalmente" },
  { valor: 2, label: "Discordo Parcialmente" },
  { valor: 3, label: "Neutro" },
  { valor: 4, label: "Concordo Parcialmente" },
  { valor: 5, label: "Concordo Totalmente" },
];

const DIMENSOES = [
  { nome: "Mudança de Comportamento", ordem: 1 },
  { nome: "Motivação, Pertencimento e Sentido", ordem: 2 },
  { nome: "Clima e Sociabilidade", ordem: 3 },
  { nome: "Engajamento e Força de Vontade", ordem: 4 },
  { nome: "Valores do Esporte", ordem: 5 },
] as const;

const QUESTOES_BLOCO2 = [
  { chave: "q1", dimensao: "Mudança de Comportamento", ordem: 1, enunciado: "Os jogos do SESI me motivam a adotar hábitos saudáveis (como melhorar a alimentação ou o sono)." },
  { chave: "q2", dimensao: "Mudança de Comportamento", ordem: 2, enunciado: "Participar dos jogos do SESI me dá vontade de praticar mais exercícios no meu tempo livre." },
  { chave: "q3", dimensao: "Motivação, Pertencimento e Sentido", ordem: 1, enunciado: "Os jogos do SESI me dão mais energia e ânimo para lidar com os desafios do dia a dia." },
  { chave: "q4", dimensao: "Motivação, Pertencimento e Sentido", ordem: 2, enunciado: "Através do esporte, sinto que sou parte importante e valorizada da equipe." },
  { chave: "q5", dimensao: "Clima e Sociabilidade", ordem: 1, enunciado: "Os jogos do SESI melhoram a convivência e o clima entre os diferentes setores da empresa." },
  { chave: "q6", dimensao: "Clima e Sociabilidade", ordem: 2, enunciado: "As partidas aumentam o companheirismo e a confiança com meus colegas de trabalho." },
  { chave: "q7", dimensao: "Engajamento e Força de Vontade", ordem: 1, enunciado: "Iniciativas esportivas me dão mais força de vontade para o meu dia a dia." },
  { chave: "q8", dimensao: "Engajamento e Força de Vontade", ordem: 2, enunciado: "Sinto orgulho em representar a minha empresa." },
  { chave: "q9", dimensao: "Valores do Esporte", ordem: 1, enunciado: "A cooperação exigida nos jogos do SESI é um valor que eu valorizo para minha vida." },
  { chave: "q10", dimensao: "Valores do Esporte", ordem: 2, enunciado: "Lidar com vitórias e derrotas no esporte me ajuda a superar as frustrações do dia a dia." },
] as const;

const QUESTOES_PERFIL = [
  {
    chave: "idade",
    ordem: 1,
    enunciado: "Qual é a sua idade?",
    tipo_resposta: "numeric" as const,
    opcoes: null,
  },
  {
    chave: "saude_fisica",
    ordem: 2,
    enunciado: "Em geral, como você avalia o seu estado de saúde físico atual?",
    tipo_resposta: "likert" as const,
    opcoes: [
      { valor: 1, label: "Muito ruim" },
      { valor: 2, label: "Ruim" },
      { valor: 3, label: "Regular" },
      { valor: 4, label: "Bom" },
      { valor: 5, label: "Muito bom" },
    ],
  },
  {
    chave: "saude_mental",
    ordem: 3,
    enunciado: "Em geral, como você avalia a sua saúde mental e emocional atualmente?",
    tipo_resposta: "likert" as const,
    opcoes: [
      { valor: 1, label: "Muito ruim" },
      { valor: 2, label: "Ruim" },
      { valor: 3, label: "Regular" },
      { valor: 4, label: "Boa" },
      { valor: 5, label: "Muito boa" },
    ],
  },
  {
    chave: "ativo_fisicamente",
    ordem: 4,
    enunciado:
      "Você se considera uma pessoa fisicamente ativa? (Pratica exercícios físicos ou esportes pelo menos 2 a 3 vezes na semana)",
    tipo_resposta: "boolean" as const,
    opcoes: [
      { valor: 1, label: "Sim" },
      { valor: 0, label: "Não" },
    ],
  },
  {
    chave: "mensagem_futuro",
    ordem: 5,
    enunciado: "Para você, qual o maior valor do Esporte? (opcional)",
    tipo_resposta: "texto" as const,
    opcoes: { maxLength: 140 },
  },
];

async function main() {
  const { data: pesquisa, error: pesquisaError } = await supabase
    .from("pesquisas")
    .upsert(
      {
        titulo: "Jogos do SESI/SC",
        slug: "jogos-esportivos",
        descricao:
          "Queremos saber sua percepção sobre os jogos do SESI na sua vida. Sua resposta é anônima e serve para sempre melhorarmos nossos serviços para vocês. Muito Obrigado e bom jogos.",
        status: "ativo",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (pesquisaError || !pesquisa) {
    throw new Error(`Falha ao criar pesquisa: ${pesquisaError?.message}`);
  }
  console.log(`Pesquisa "jogos-esportivos" ok (id=${pesquisa.id})`);

  const dimensaoIdPorNome = new Map<string, string>();
  for (const d of DIMENSOES) {
    const { data: existente } = await supabase
      .from("dimensoes")
      .select("id")
      .eq("pesquisa_id", pesquisa.id)
      .eq("nome", d.nome)
      .maybeSingle();

    if (existente) {
      dimensaoIdPorNome.set(d.nome, existente.id);
      continue;
    }

    const { data: nova, error } = await supabase
      .from("dimensoes")
      .insert({ pesquisa_id: pesquisa.id, nome: d.nome, ordem: d.ordem })
      .select("id")
      .single();

    if (error || !nova) throw new Error(`Falha ao criar dimensão "${d.nome}": ${error?.message}`);
    dimensaoIdPorNome.set(d.nome, nova.id);
  }
  console.log(`${DIMENSOES.length} dimensões ok`);

  for (const q of QUESTOES_PERFIL) {
    const { error } = await supabase.from("questoes").upsert(
      {
        pesquisa_id: pesquisa.id,
        dimensao_id: null,
        enunciado: q.enunciado,
        tipo_resposta: q.tipo_resposta,
        chave: q.chave,
        ordem: q.ordem,
        opcoes: q.opcoes,
      },
      { onConflict: "pesquisa_id,chave" },
    );
    if (error) throw new Error(`Falha ao criar questão de perfil "${q.chave}": ${error.message}`);
  }
  console.log(`${QUESTOES_PERFIL.length} questões de perfil ok`);

  for (const q of QUESTOES_BLOCO2) {
    const dimensaoId = dimensaoIdPorNome.get(q.dimensao);
    if (!dimensaoId) throw new Error(`Dimensão não encontrada: ${q.dimensao}`);

    const { error } = await supabase.from("questoes").upsert(
      {
        pesquisa_id: pesquisa.id,
        dimensao_id: dimensaoId,
        enunciado: q.enunciado,
        tipo_resposta: "likert",
        chave: q.chave,
        ordem: q.ordem,
        opcoes: LIKERT_PADRAO,
      },
      { onConflict: "pesquisa_id,chave" },
    );
    if (error) throw new Error(`Falha ao criar questão "${q.chave}": ${error.message}`);
  }
  console.log(`${QUESTOES_BLOCO2.length} questões Likert ok`);

  console.log("\nSeed concluído. Slug da pesquisa: jogos-esportivos");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

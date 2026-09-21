// Lista curada de palavras de carater positivo em portugues, usada para filtrar a nuvem de
// palavras das respostas abertas. Isso NAO e analise de sentimento (nao entende negacao,
// ironia, contexto) - e uma lista de termos permitidos, propositalmente simples e facil de
// editar. Para adicionar/remover termos, mexa so no array LEXICO_POSITIVO abaixo.

type EntradaLexico = {
  canonico: string; // forma exibida na nuvem
  variantes?: string[]; // outras formas (masculino/feminino, singular/plural irregular etc.)
};

const LEXICO_POSITIVO: EntradaLexico[] = [
  // Saude e bem-estar
  { canonico: "saúde", variantes: ["saudável", "saudáveis"] },
  { canonico: "vida" },
  { canonico: "bem-estar" },
  { canonico: "equilíbrio" },
  { canonico: "energia" },
  { canonico: "disposição" },
  { canonico: "descanso" },
  { canonico: "cuidado", variantes: ["cuidar", "cuidando"] },

  // Forca de vontade e disciplina
  { canonico: "força", variantes: ["forte", "fortes"] },
  { canonico: "coragem", variantes: ["corajoso", "corajosa", "corajosos", "corajosas"] },
  { canonico: "determinação", variantes: ["determinado", "determinada"] },
  { canonico: "disciplina", variantes: ["disciplinado", "disciplinada"] },
  { canonico: "foco", variantes: ["focado", "focada"] },
  { canonico: "dedicação", variantes: ["dedicado", "dedicada"] },
  { canonico: "persistência", variantes: ["persistente", "persistentes"] },
  { canonico: "resiliência", variantes: ["resiliente", "resilientes"] },
  { canonico: "perseverança", variantes: ["perseverante"] },
  { canonico: "confiança", variantes: ["confiante", "confiantes"] },
  { canonico: "motivação", variantes: ["motivado", "motivada", "motivar"] },
  { canonico: "vontade" },
  { canonico: "esforço" },
  { canonico: "empenho" },

  // Conquista e superacao
  { canonico: "sucesso" },
  { canonico: "vitória", variantes: ["vitórias", "vencer", "vencedor", "vencedora"] },
  { canonico: "conquista", variantes: ["conquistar", "conquistas"] },
  { canonico: "superação", variantes: ["superar"] },
  { canonico: "crescimento", variantes: ["crescer"] },
  { canonico: "evolução", variantes: ["evoluir"] },
  { canonico: "progresso" },
  { canonico: "sonho", variantes: ["sonhos", "sonhar"] },
  { canonico: "objetivo", variantes: ["objetivos", "meta", "metas"] },
  { canonico: "orgulho", variantes: ["orgulhoso", "orgulhosa"] },
  { canonico: "capaz", variantes: ["capacidade"] },
  { canonico: "campeão", variantes: ["campeã", "campeões", "campeãs"] },

  // Emocoes positivas
  { canonico: "felicidade", variantes: ["feliz", "felizes"] },
  { canonico: "alegria", variantes: ["alegre", "alegres"] },
  { canonico: "gratidão", variantes: ["grato", "grata", "obrigado", "obrigada"] },
  { canonico: "amor", variantes: ["amar"] },
  { canonico: "carinho" },
  { canonico: "paz" },
  { canonico: "tranquilidade", variantes: ["tranquilo", "tranquila"] },
  { canonico: "esperança" },
  { canonico: "entusiasmo", variantes: ["animado", "animada"] },
  { canonico: "prazer" },
  { canonico: "diversão", variantes: ["divertido", "divertida"] },

  // Valores do esporte (reforçado pra pergunta "qual o maior valor do Esporte?")
  { canonico: "comprometimento", variantes: ["comprometido", "comprometida", "compromisso"] },
  { canonico: "espírito" },
  { canonico: "humildade", variantes: ["humilde"] },
  { canonico: "ética", variantes: ["ético", "etica"] },
  { canonico: "justiça", variantes: ["justo", "justa"] },
  { canonico: "honestidade", variantes: ["honesto", "honesta"] },
  { canonico: "integridade" },
  { canonico: "generosidade", variantes: ["generoso", "generosa"] },

  // Social e equipe
  { canonico: "equipe", variantes: ["time"] },
  { canonico: "união", variantes: ["unido", "unida"] },
  { canonico: "amizade", variantes: ["amigo", "amiga", "amigos", "amigas"] },
  { canonico: "companheirismo", variantes: ["companheiro", "companheira"] },
  { canonico: "respeito" },
  { canonico: "família" },
  { canonico: "parabéns" },
  { canonico: "cooperação" },

  // Qualidades gerais positivas
  { canonico: "bom", variantes: ["boa", "bons", "boas"] },
  { canonico: "ótimo", variantes: ["ótima", "ótimos", "ótimas"] },
  { canonico: "excelente", variantes: ["excelentes"] },
  { canonico: "incrível", variantes: ["incríveis"] },
  { canonico: "maravilhoso", variantes: ["maravilhosa"] },
  { canonico: "especial" },
  { canonico: "importante" },
  { canonico: "valioso", variantes: ["valiosa"] },
  { canonico: "orgulhoso", variantes: ["orgulhosa"] },
];

function semAcento(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const MAPA_POSITIVO = new Map<string, string>();
for (const { canonico, variantes = [] } of LEXICO_POSITIVO) {
  const formas = [canonico, `${canonico}s`, ...variantes, ...variantes.map((v) => `${v}s`)];
  for (const forma of formas) {
    MAPA_POSITIVO.set(semAcento(forma.toLowerCase()), canonico);
  }
}

function tokenizar(texto: string): string[] {
  return texto
    .toLowerCase()
    .replace(/[^\p{L}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export type PalavraContagem = { palavra: string; n: number };

export function contarPalavrasPositivas(textos: string[]): PalavraContagem[] {
  const contagem = new Map<string, number>();
  for (const texto of textos) {
    for (const token of tokenizar(texto)) {
      const canonico = MAPA_POSITIVO.get(semAcento(token));
      if (canonico) {
        contagem.set(canonico, (contagem.get(canonico) ?? 0) + 1);
      }
    }
  }
  return [...contagem.entries()]
    .map(([palavra, n]) => ({ palavra, n }))
    .sort((a, b) => b.n - a.n);
}

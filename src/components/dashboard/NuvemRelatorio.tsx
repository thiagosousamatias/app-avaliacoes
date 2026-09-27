import type { PalavraContagem } from "@/lib/dashboard/positiveLexicon";

// Teia em vez de nuvem solta: "Saude" fica fixa no centro (o tema da pesquisa - "Jogos do SESI
// + Saude"), e as palavras mais citadas orbitam ao redor, ligadas por uma linha curva - menos
// poluido que uma nuvem com dezenas de palavras soltas, e da uma leitura mais clara de
// hierarquia. As linhas ligam cada palavra ao centro (o tema comum), nao representam uma
// relacao medida entre pares de palavras - nao temos esse dado, entao nao fingimos que temos.
const MAX_SATELITES = 8;
const RAIO_MIN = 28; // % do container - satelite mais citado (mais perto do centro, mas sem
// encostar no rotulo do centro, que e um pouco maior)
const RAIO_MAX = 46; // % do container - satelite menos citado (mais longe)

// Adjetivos de elogio generico ("e bom", "e otimo") nao dizem QUAL o valor do esporte - poluem
// a teia sem acrescentar sentido. Mesmo recorte da categoria "Qualidades gerais positivas" do
// lexico (src/lib/dashboard/positiveLexicon.ts).
const PALAVRAS_GENERICAS = new Set([
  "bom",
  "ótimo",
  "excelente",
  "incrível",
  "maravilhoso",
  "especial",
  "importante",
  "valioso",
  "orgulhoso",
]);

function corDe(proporcao: number): string {
  const de = { r: 100, g: 116, b: 139 }; // slate-500
  const para = { r: 4, g: 120, b: 87 }; // emerald-700
  const r = Math.round(de.r + (para.r - de.r) * proporcao);
  const g = Math.round(de.g + (para.g - de.g) * proporcao);
  const b = Math.round(de.b + (para.b - de.b) * proporcao);
  return `rgb(${r}, ${g}, ${b})`;
}

export function NuvemRelatorio({ palavras }: { palavras: PalavraContagem[] | null }) {
  const relevantes = (palavras ?? []).filter(
    (p) => p.palavra !== "saúde" && !PALAVRAS_GENERICAS.has(p.palavra),
  );
  const satelites = relevantes.slice(0, MAX_SATELITES);

  const maxSatN = satelites.length ? Math.max(...satelites.map((p) => p.n)) : 1;
  const minSatN = satelites.length ? Math.min(...satelites.map((p) => p.n)) : 1;

  const posicionados = satelites.map((p, i) => {
    const angulo = (i / satelites.length) * 2 * Math.PI - Math.PI / 2;
    const proporcao = maxSatN > minSatN ? (p.n - minSatN) / (maxSatN - minSatN) : 1;
    const raio = RAIO_MAX - proporcao * (RAIO_MAX - RAIO_MIN);
    return {
      palavra: p.palavra,
      x: 50 + raio * Math.cos(angulo),
      y: 50 + raio * Math.sin(angulo),
      // Ponto de controle da curva, a meio caminho do centro mas deslocado - da o efeito de
      // "fio puxado" em vez de uma linha reta, mais organico/suave.
      cx: 50 + (raio / 2) * Math.cos(angulo + 0.25),
      cy: 50 + (raio / 2) * Math.sin(angulo + 0.25),
      fontSize: 16 + proporcao * 14,
      cor: corDe(proporcao * 0.7), // satelites ficam um tom abaixo do centro, que e sempre o mais forte
    };
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm print:break-inside-avoid">
      <h3 className="mb-4 text-base font-bold text-slate-800">
        Os Valores do Esporte pelos Olhos do Trabalhador
      </h3>

      {satelites.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Ainda sem respostas suficientes.</p>
      ) : (
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <radialGradient id="haloCentro" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={50} cy={50} r={26} fill="url(#haloCentro)" />
            {posicionados.map((p) => (
              <path
                key={p.palavra}
                d={`M 50 50 Q ${p.cx} ${p.cy} ${p.x} ${p.y}`}
                fill="none"
                stroke="#ddd6fe"
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            ))}
          </svg>

          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700 px-5 py-2.5 text-center text-xl font-black text-white shadow-md sm:text-2xl">
            Saúde
          </span>

          {posicionados.map((p) => (
            <span
              key={p.palavra}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
              style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.fontSize}px`, color: p.cor }}
            >
              {p.palavra}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import type { PalavraContagem } from "@/lib/dashboard/positiveLexicon";

// Teia em vez de nuvem solta: a palavra mais citada vira o centro (o "valor principal"), e as
// proximas mais citadas orbitam ao redor, ligadas por uma linha fina - menos poluido que uma
// nuvem com dezenas de palavras soltas, e da uma leitura mais clara de hierarquia. As linhas
// ligam cada palavra ao centro (o tema comum), nao representam uma relacao medida entre pares
// de palavras - nao temos esse dado, entao nao fingimos que temos.
const MAX_PALAVRAS = 9; // 1 centro + ate 8 satelites
const RAIO_MIN = 28; // % do container - satelite mais citado (mais perto do centro, mas sem
// encostar no rotulo do centro, que e um pouco maior)
const RAIO_MAX = 46; // % do container - satelite menos citado (mais longe)

function corDe(proporcao: number): string {
  const de = { r: 100, g: 116, b: 139 }; // slate-500
  const para = { r: 4, g: 120, b: 87 }; // emerald-700
  const r = Math.round(de.r + (para.r - de.r) * proporcao);
  const g = Math.round(de.g + (para.g - de.g) * proporcao);
  const b = Math.round(de.b + (para.b - de.b) * proporcao);
  return `rgb(${r}, ${g}, ${b})`;
}

export function NuvemRelatorio({ palavras }: { palavras: PalavraContagem[] | null }) {
  const topPalavras = (palavras ?? []).slice(0, MAX_PALAVRAS);
  const [hub, ...satelites] = topPalavras;

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
      fontSize: 13 + proporcao * 11,
      cor: corDe(proporcao * 0.7), // satelites ficam um tom abaixo do centro, que e sempre o mais forte
    };
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm print:break-inside-avoid">
      <h3 className="mb-1 text-base font-bold text-slate-800">Valores do Esporte</h3>
      <p className="mb-4 text-xs text-slate-400">
        Palavras mais citadas na pergunta &ldquo;Qual o maior valor do Esporte?&rdquo;
      </p>

      {!hub ? (
        <p className="py-8 text-center text-sm text-slate-400">Ainda sem respostas suficientes.</p>
      ) : (
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            {posicionados.map((p) => (
              <line
                key={p.palavra}
                x1={50}
                y1={50}
                x2={p.x}
                y2={p.y}
                stroke="#c4b5fd"
                strokeWidth={0.5}
              />
            ))}
          </svg>

          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700 px-4 py-2 text-center text-lg font-black text-white shadow-md sm:text-xl">
            {hub.palavra}
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

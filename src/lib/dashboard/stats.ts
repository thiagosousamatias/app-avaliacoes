// Estatística inferencial leve, sem dependência externa: correlação de Spearman e ANOVA
// one-way com post-hoc de Bonferroni (pares via teste t de Welch). Os p-valores usam a
// função beta incompleta regularizada (algoritmo padrão, ex. Numerical Recipes), que dá as
// distribuições t e F sem precisar de tabela ou biblioteca de estatística.

function logGamma(x: number): number {
  const cof = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  const t = x + 7.5;
  for (let i = 0; i < cof.length; i++) a += cof[i] / (x + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(x: number, a: number, b: number): number {
  const MAXIT = 200;
  const EPS = 3e-9;
  const FPMIN = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

// P(X <= x) da distribuição Beta(a, b) regularizada - "I_x(a, b)".
function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

// p-valor bicaudal de um t de Student com `df` graus de liberdade.
function tTwoTailedPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  return regularizedIncompleteBeta(x, df / 2, 0.5);
}

// p-valor (cauda superior) de um F de Fisher com df1/df2 graus de liberdade.
function fPValue(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return regularizedIncompleteBeta(x, df2 / 2, df1 / 2);
}

function ranks(valores: number[]): number[] {
  const indices = valores.map((_, i) => i).sort((a, b) => valores[a] - valores[b]);
  const out = new Array(valores.length);
  let i = 0;
  while (i < indices.length) {
    let j = i;
    while (j + 1 < indices.length && valores[indices[j + 1]] === valores[indices[i]]) j++;
    const rankMedio = (i + j) / 2 + 1; // ranks 1-based, empates recebem a media do intervalo
    for (let k = i; k <= j; k++) out[indices[k]] = rankMedio;
    i = j + 1;
  }
  return out;
}

export type CorrelationResult = {
  n: number;
  rho: number | null;
  pValor: number | null;
};

// Correlação de Spearman: Pearson calculado sobre os ranks (com correção de empates).
export function spearman(x: number[], y: number[]): CorrelationResult {
  const pares = x.map((xi, i) => [xi, y[i]] as const).filter(([a, b]) => a != null && b != null);
  const n = pares.length;
  if (n < 3) return { n, rho: null, pValor: null };

  const rx = ranks(pares.map((p) => p[0]));
  const ry = ranks(pares.map((p) => p[1]));
  const mx = rx.reduce((s, v) => s + v, 0) / n;
  const my = ry.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i++) {
    cov += (rx[i] - mx) * (ry[i] - my);
    vx += (rx[i] - mx) ** 2;
    vy += (ry[i] - my) ** 2;
  }
  if (vx === 0 || vy === 0) return { n, rho: null, pValor: null };

  const rho = cov / Math.sqrt(vx * vy);
  const df = n - 2;
  if (df < 1 || Math.abs(rho) >= 1) return { n, rho, pValor: df < 1 ? null : 0 };
  const t = (rho * Math.sqrt(df)) / Math.sqrt(1 - rho * rho);
  const pValor = tTwoTailedPValue(t, df);
  return { n, rho, pValor };
}

export type StudentTTestResult = {
  nA: number;
  nB: number;
  mediaA: number;
  mediaB: number;
  t: number | null;
  df: number | null;
  pValor: number | null;
};

// Teste t de Student para 2 amostras independentes, variancia agrupada (pooled) - a forma
// classica do teste, diferente do post-hoc de Welch usado na ANOVA (que assume variancias
// desiguais). Serve para comparar 2 grupos, como "ativo fisicamente: sim" vs "nao".
export function studentTTest(a: number[], b: number[]): StudentTTestResult {
  const nA = a.length;
  const nB = b.length;
  const mediaA = media(a);
  const mediaB = media(b);

  if (nA < 2 || nB < 2) {
    return { nA, nB, mediaA: nA ? mediaA : NaN, mediaB: nB ? mediaB : NaN, t: null, df: null, pValor: null };
  }

  const varA = variancia(a, mediaA);
  const varB = variancia(b, mediaB);
  const df = nA + nB - 2;
  const variancaAgrupada = ((nA - 1) * varA + (nB - 1) * varB) / df;
  const se = Math.sqrt(variancaAgrupada * (1 / nA + 1 / nB));

  if (se === 0) return { nA, nB, mediaA, mediaB, t: null, df, pValor: null };

  const t = (mediaA - mediaB) / se;
  const pValor = tTwoTailedPValue(t, df);
  return { nA, nB, mediaA, mediaB, t, df, pValor };
}

export type GrupoAnova = {
  categoria: number;
  label: string;
  n: number;
  media: number;
  desvio: number;
};

export type PosHocPar = {
  a: string;
  b: string;
  diferenca: number;
  pValor: number;
  pAjustado: number;
  significativo: boolean;
};

export type AnovaResult = {
  grupos: GrupoAnova[];
  f: number | null;
  df1: number | null;
  df2: number | null;
  pValor: number | null;
  posHoc: PosHocPar[];
};

function media(v: number[]) {
  return v.reduce((s, x) => s + x, 0) / v.length;
}

function variancia(v: number[], m: number) {
  if (v.length < 2) return 0;
  return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1);
}

// ANOVA one-way + post-hoc de pares via teste t de Welch com correção de Bonferroni.
// Bonferroni (em vez de Tukey HSD) porque nao depende da distribuicao do alcance
// estudentizado (sem forma fechada via beta incompleta) - mais simples de implementar
// corretamente, ao custo de ser um pouco mais conservador.
export function oneWayAnova(
  grupos: { categoria: number; label: string; valores: number[] }[],
): AnovaResult {
  const validos = grupos.filter((g) => g.valores.length >= 2);
  const resumo: GrupoAnova[] = validos.map((g) => {
    const m = media(g.valores);
    return {
      categoria: g.categoria,
      label: g.label,
      n: g.valores.length,
      media: m,
      desvio: Math.sqrt(variancia(g.valores, m)),
    };
  });

  if (validos.length < 2) {
    return { grupos: resumo, f: null, df1: null, df2: null, pValor: null, posHoc: [] };
  }

  const todos = validos.flatMap((g) => g.valores);
  const mediaGeral = media(todos);
  const dfBetween = validos.length - 1;
  const dfWithin = todos.length - validos.length;

  let ssBetween = 0;
  let ssWithin = 0;
  validos.forEach((g) => {
    const m = media(g.valores);
    ssBetween += g.valores.length * (m - mediaGeral) ** 2;
    ssWithin += g.valores.reduce((s, x) => s + (x - m) ** 2, 0);
  });

  const msBetween = ssBetween / dfBetween;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;
  const f = msWithin > 0 ? msBetween / msWithin : null;
  const pValor = f !== null && dfWithin > 0 ? fPValue(f, dfBetween, dfWithin) : null;

  const pares: PosHocPar[] = [];
  const nComparacoes = (validos.length * (validos.length - 1)) / 2;
  for (let i = 0; i < validos.length; i++) {
    for (let j = i + 1; j < validos.length; j++) {
      const a = validos[i];
      const b = validos[j];
      const ma = media(a.valores);
      const mb = media(b.valores);
      const va = variancia(a.valores, ma);
      const vb = variancia(b.valores, mb);
      const se = Math.sqrt(va / a.valores.length + vb / b.valores.length);
      if (se === 0) continue;
      const t = (ma - mb) / se;
      // Graus de liberdade de Welch-Satterthwaite.
      const df =
        (va / a.valores.length + vb / b.valores.length) ** 2 /
        ((va / a.valores.length) ** 2 / (a.valores.length - 1) +
          (vb / b.valores.length) ** 2 / (b.valores.length - 1));
      const pParcial = tTwoTailedPValue(Math.abs(t), df);
      const pAjustado = Math.min(1, pParcial * nComparacoes);
      pares.push({
        a: a.label,
        b: b.label,
        diferenca: ma - mb,
        pValor: pParcial,
        pAjustado,
        significativo: pAjustado < 0.05,
      });
    }
  }

  return { grupos: resumo, f, df1: dfBetween, df2: dfWithin, pValor, posHoc: pares };
}

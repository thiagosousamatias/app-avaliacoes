// Estatística inferencial leve, sem dependência externa: teste t de Student e razão de
// chances (odds ratio) via tabela 2x2. Os p-valores usam a função beta incompleta
// regularizada (algoritmo padrão, ex. Numerical Recipes), que dá a distribuição t sem
// precisar de tabela ou biblioteca de estatística.

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

function media(v: number[]) {
  return v.reduce((s, x) => s + x, 0) / v.length;
}

function variancia(v: number[], m: number) {
  if (v.length < 2) return 0;
  return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1);
}

export function mediana(valores: number[]): number {
  const s = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[meio - 1] + s[meio]) / 2 : s[meio];
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
// classica do teste. Serve para comparar 2 grupos, como "ativo fisicamente: sim" vs "nao".
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

export type OddsRatioResult = {
  or: number;
  significativo: boolean;
  n: number;
};

// Razao de chances via tabela 2x2, com correcao de Haldane-Anscombe (+0.5 em cada celula,
// evita divisao por zero com amostras pequenas/desbalanceadas). Com preditor e desfecho
// binarios, isso e numericamente identico ao que uma regressao logistica binaria univariada
// devolveria - mais simples de implementar certo do que ajustar um modelo iterativamente.
// `desfecho` e `preditor` devem estar pareados por indice e sem valores nulos (filtrar antes
// de chamar).
export function oddsRatio(desfecho: (0 | 1)[], preditor: (0 | 1)[]): OddsRatioResult {
  let a = 0.5; // preditor=1, desfecho=1
  let b = 0.5; // preditor=1, desfecho=0
  let c = 0.5; // preditor=0, desfecho=1
  let d = 0.5; // preditor=0, desfecho=0

  const n = Math.min(desfecho.length, preditor.length);
  for (let i = 0; i < n; i++) {
    if (preditor[i] === 1 && desfecho[i] === 1) a++;
    else if (preditor[i] === 1 && desfecho[i] === 0) b++;
    else if (preditor[i] === 0 && desfecho[i] === 1) c++;
    else d++;
  }

  const or = (a * d) / (b * c);
  const seLnOr = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
  const lnOr = Math.log(or);
  const ciBaixo = Math.exp(lnOr - 1.96 * seLnOr);
  const ciAlto = Math.exp(lnOr + 1.96 * seLnOr);
  const significativo = ciBaixo > 1 || ciAlto < 1;

  return { or, significativo, n };
}

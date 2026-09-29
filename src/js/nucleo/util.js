/**
 * @file util.js
 * @description Funções numéricas e de formatação pequenas e puras.
 */

export const limitar = (n, minimo, maximo) => Math.max(minimo, Math.min(maximo, n));

export const interpolar = (a, b, t) => a + (b - a) * t;

/** Remove itens que não satisfazem `manter`, in loco e sem alocar nova lista. */
export function filtrarNoLugar(lista, manter) {
  let escrita = 0;
  for (let i = 0; i < lista.length; i++) {
    if (manter(lista[i])) lista[escrita++] = lista[i];
  }
  lista.length = escrita;
}

const formatadorInteiro = new Intl.NumberFormat('pt-BR');

/** 12345 -> "12.345" */
export function formatarInteiro(n) {
  return formatadorInteiro.format(Math.round(Number.isFinite(n) ? n : 0));
}

/** 1.25 -> "×1,25" */
export function formatarMultiplicador(m) {
  return `×${m.toFixed(2).replace('.', ',')}`;
}

export function ehNumeroFinito(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

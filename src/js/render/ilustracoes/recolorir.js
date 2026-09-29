/**
 * @file recolorir.js
 * @description Recolorização dos uniformes sobre os quadros ilustrados (azul SEMAE original).
 * A arte foi desenhada só no uniforme clássico; os outros uniformes trocam os tons azuis por região
 * (boné, camisa, calça/mochila) e a cor da faixa refletiva, mantendo contorno, sombras e brilhos.
 * Funções puras sobre RGBA: testáveis sem canvas.
 */

/** Tons de referência do uniforme clássico (média do tom "chapado" de cada região). */
const REF = { camisa: { v: 0.81, s: 0.95 }, bone: { v: 0.63, s: 0.95 }, calca: { v: 0.42, s: 0.9 } };
const FAIXA_ORIGINAL = { h: 48, sMin: 0.6, vMin: 0.6 };
const AZUL = { hMin: 205, hMax: 250, sMin: 0.35 };
const ALFA_MINIMO = 90;

export function hexParaHsv(hex) {
  const n = parseInt(hex.slice(1), 16);
  return rgbParaHsv((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

export function rgbParaHsv(r, g, b) {
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  let h = 0;
  if (d > 0) {
    if (mx === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: h * 60, s: mx === 0 ? 0 : d / mx, v: mx / 255 };
}

export function hsvParaRgb(h, s, v, saida) {
  const h6 = (((h % 360) + 360) % 360) / 60;
  const i = Math.floor(h6);
  const f = h6 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
  saida[0] = Math.round(r * 255);
  saida[1] = Math.round(g * 255);
  saida[2] = Math.round(b * 255);
}

/** Receita de um uniforme: cor-alvo (HSV) de cada região; `null` mantém a arte original. */
export function receitaDoUniforme(u, classico) {
  if (!u || u === classico) return null;
  return { camisa: hexParaHsv(u.camisa), bone: hexParaHsv(u.bone), calca: hexParaHsv(u.calca), faixa: hexParaHsv(u.faixa) };
}

function regiao(v, yRel) {
  if (v >= 0.72) return 'camisa';
  if (v < 0.27) return null;
  if (yRel < 0.36) return v >= 0.45 ? 'bone' : null;
  return v >= 0.55 ? 'camisa' : 'calca';
}

function trocar(alvo, ref, s, v, rgb) {
  let novoS = Math.min(1, alvo.s * Math.min(1.15, s / ref.s));
  let novoV = alvo.v * (v / ref.v);
  if (novoV > 1) {
    novoS *= Math.max(0.4, 1 - (novoV - 1) * 0.8);
    novoV = 1;
  }
  hsvParaRgb(alvo.h, novoS, Math.min(1, novoV), rgb);
}

/** Faixa refletiva amarela da arte original (matiz ~48 graus, saturada e clara). */
function ehFaixa(h, s, v, yRel) {
  return yRel > 0.3 && Math.abs(h - FAIXA_ORIGINAL.h) < 9 && s > FAIXA_ORIGINAL.sMin && v > FAIXA_ORIGINAL.vMin;
}

/** Limites verticais (linhas com alfa) de cada célula; usados para separar boné de camisa. */
function limitesDaCelula(dados, largura, x0, y0, cw, ch) {
  let topo = -1;
  let base = -1;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (dados[((y0 + y) * largura + x0 + x) * 4 + 3] > 128) {
        if (topo < 0) topo = y;
        base = y;
        break;
      }
    }
  }
  return { topo: Math.max(0, topo), base: Math.max(topo + 1, base) };
}

/**
 * Recolore no lugar. @param {Uint8ClampedArray} dados RGBA do atlas inteiro
 * @param {{camisa,bone,calca,faixa}} receita  @param {[number,number]} celula [largura, altura]
 */
export function recolorirAtlas(dados, largura, altura, celula, receita) {
  const [cw, ch] = celula;
  const rgb = [0, 0, 0];
  for (let y0 = 0; y0 + ch <= altura; y0 += ch) {
    for (let x0 = 0; x0 + cw <= largura; x0 += cw) {
      const { topo, base } = limitesDaCelula(dados, largura, x0, y0, cw, ch);
      for (let y = 0; y < ch; y++) {
        const yRel = (y - topo) / (base - topo);
        for (let x = 0; x < cw; x++) {
          const i = ((y0 + y) * largura + x0 + x) * 4;
          if (dados[i + 3] < ALFA_MINIMO) continue;
          const { h, s, v } = rgbParaHsv(dados[i], dados[i + 1], dados[i + 2]);
          if (ehFaixa(h, s, v, yRel)) {
            trocar(receita.faixa, { v: 0.95, s: 0.95 }, s, v, rgb);
          } else if (h >= AZUL.hMin && h <= AZUL.hMax && s >= AZUL.sMin) {
            const nome = regiao(v, yRel);
            if (!nome) continue;
            trocar(receita[nome], REF[nome], s, v, rgb);
          } else continue;
          dados[i] = rgb[0];
          dados[i + 1] = rgb[1];
          dados[i + 2] = rgb[2];
        }
      }
    }
  }
}

/**
 * @file primitivas.js
 * @description Formas 2D reutilizadas pelos desenhos (todas em unidades lógicas).
 */

/** Cria uma tela fora da vista (OffscreenCanvas quando existir). */
export function criarTela(largura, altura) {
  const w = Math.max(1, Math.ceil(largura));
  const h = Math.max(1, Math.ceil(altura));
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  return new OffscreenCanvas(w, h);
}

/**
 * Tela para desenhar em unidades lógicas que preenche EXATAMENTE os pixels inteiros do bitmap
 * (escala ligeiramente diferente em x e y). Sem isso, a última coluna de pixels ficaria
 * parcialmente transparente e apareceria como uma linha fina na emenda dos tiles repetidos.
 */
export function criarTelaDeUnidades(larguraU, alturaU, k) {
  const tela = criarTela(larguraU * k, alturaU * k);
  const ctx = tela.getContext('2d');
  ctx.scale(tela.width / larguraU, tela.height / alturaU);
  return { tela, ctx };
}

/** Caminho de retângulo com cantos arredondados (não preenche). */
export function caminhoArredondado(ctx, x, y, w, h, r) {
  const raio = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.arcTo(x + w, y, x + w, y + h, raio);
  ctx.arcTo(x + w, y + h, x, y + h, raio);
  ctx.arcTo(x, y + h, x, y, raio);
  ctx.arcTo(x, y, x + w, y, raio);
  ctx.closePath();
}

export function arredondado(ctx, x, y, w, h, r, cor) {
  caminhoArredondado(ctx, x, y, w, h, r);
  ctx.fillStyle = cor;
  ctx.fill();
}

export function circulo(ctx, x, y, r, cor) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = cor;
  ctx.fill();
}

export function elipse(ctx, x, y, rx, ry, cor, rotacao = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotacao, 0, Math.PI * 2);
  ctx.fillStyle = cor;
  ctx.fill();
}

export function poligono(ctx, pontos, cor) {
  ctx.beginPath();
  pontos.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
}

export function linha(ctx, x1, y1, x2, y2, cor, espessura, ponta = 'round') {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = cor;
  ctx.lineWidth = espessura;
  ctx.lineCap = ponta;
  ctx.stroke();
}

/** Degradê linear vertical entre paradas [posicao, cor]. */
export function degradeVertical(ctx, y0, y1, paradas) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [pos, cor] of paradas) g.addColorStop(pos, cor);
  return g;
}

/** Mistura duas cores hex (#rrggbb) em `t` (0..1). */
export function misturarCor(a, b, t) {
  const p = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const canal = (i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t);
  return `rgb(${canal(0)},${canal(1)},${canal(2)})`;
}

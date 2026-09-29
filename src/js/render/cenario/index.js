/**
 * @file index.js
 * @description Monta as camadas de uma fase (pré-renderizadas no tamanho EXATO da tela) e as
 * desenha a cada quadro com paralaxe. Cada camada é copiada 1:1 em pixels do dispositivo, com
 * deslocamento inteiro: sem reamostragem, custa ~0,1 ms por camada até sem GPU (a cópia com
 * escala fracionária custava 10x mais). A cena final, que usa zoom, cai no caminho em unidades.
 */
import { temaDaFase } from '../../config/temas.js';
import { limitar } from '../../nucleo/util.js';
import { criarCeu, criarNuvem } from './ceu.js';
import { criarLonge, criarMedio, LARGURA_LONGE, LARGURA_MEDIO } from './silhuetas.js';
import { criarCasas, LARGURA_CASAS, ALTURA_CASAS } from './casas.js';
import { criarCalcada, criarPista, ALTURA_CALCADA_ACIMA, ALTURA_CALCADA } from './chao.js';

const NUVENS = [
  { x: 0.08, y: 0.16, largura: 230, vel: 6, sprite: 0 }, { x: 0.42, y: 0.3, largura: 160, vel: 9, sprite: 1 },
  { x: 0.7, y: 0.12, largura: 200, vel: 5, sprite: 0 }, { x: 0.9, y: 0.36, largura: 140, vel: 11, sprite: 1 }
];
const FATORES = { longe: 0.1, medio: 0.25, casas: 0.55, nuvem: 0.03 };

/** Chave que muda sempre que as camadas precisam ser refeitas. */
export function chaveDoCenario(faseIdx, layout) {
  return `${faseIdx}|${layout.L.toFixed(0)}|${layout.chaoY.toFixed(0)}|${layout.A.toFixed(0)}|${(layout.escala * layout.pxRatio).toFixed(3)}`;
}

export function criarCenario(faseIdx, layout) {
  const tema = temaDaFase(faseIdx);
  const k = layout.escala * layout.pxRatio;
  const ev = limitar(layout.chaoY / 520, 1, 1.9);
  const alturaCeu = layout.chaoY + 60;
  return {
    chave: chaveDoCenario(faseIdx, layout), faseIdx, tema, ev, k,
    ceu: criarCeu(tema, layout.L, alturaCeu, k),
    nuvens: [criarNuvem(tema, 230, k), criarNuvem(tema, 160, k)],
    longe: criarLonge(tema, k, ev),
    medio: criarMedio(tema, k, ev),
    casas: criarCasas(tema, k),
    calcada: criarCalcada(tema, k),
    pista: criarPista(tema, k, layout.A - layout.chaoY - ALTURA_CALCADA_ACIMA + 12)
  };
}

/**
 * Copia um bitmap: 1:1 em pixels do dispositivo, ou em unidades quando há zoom de câmera.
 * Com zoom as bordas dos tiles caem entre pixels e deixariam uma linha fina de fundo; por isso
 * cada tile repetido avança 1,5 px sobre o vizinho (`sobreposicao`, só no caminho com zoom).
 */
function pintar(ctx, tela, xPx, yPx, k, emUnidades, sobreposicao = false) {
  if (!emUnidades) { ctx.drawImage(tela, xPx, yPx); return; }
  const sobra = sobreposicao ? 1.5 / ctx.getTransform().a : 0;
  ctx.drawImage(tela, xPx / k, yPx / k, tela.width / k + sobra, tela.height / k);
}

/** Repete o tile na horizontal; o período é a largura real do bitmap em pixels. */
function repetir(ctx, tela, deslocamentoPx, xExtra, yPx, larguraPx, k, emUnidades) {
  const periodo = tela.width;
  const inicio = -(Math.round(deslocamentoPx) % periodo) + xExtra;
  for (let x = inicio; x < larguraPx; x += periodo) pintar(ctx, tela, x, yPx, k, emUnidades, true);
}

function desenharNuvens(ctx, c, layout, rolagem, relogio, movimento, k, emUnidades) {
  const passeio = layout.L + 300;
  for (const n of NUVENS) {
    const deriva = movimento ? relogio * n.vel : 0;
    const x = (((n.x * passeio + deriva - rolagem * FATORES.nuvem) % passeio) + passeio) % passeio - 150;
    const tela = c.nuvens[n.sprite];
    ctx.globalAlpha = tela.alfa;
    pintar(ctx, tela, Math.round(x * k), Math.round(n.y * layout.chaoY * 0.8 * k), k, emUnidades);
  }
  ctx.globalAlpha = 1;
}

function desenharFaixaDeTravessia(ctx, layout, sim) {
  if (sim.travessia <= 0) return;
  const decorrido = 1.4 - sim.travessia;
  const x0 = layout.jogadorX + 260 - sim.velocidadeEfetiva * decorrido;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (let i = 0; i < 8; i++) ctx.fillRect(x0 + i * 34, layout.chaoY - ALTURA_CALCADA_ACIMA, 20, ALTURA_CALCADA);
}

/**
 * @param {number} relogio segundos desde o início da sessão (nuvens à deriva)
 * @param {boolean} movimento false com prefers-reduced-motion
 * @param {{emUnidades?:boolean, tremor?:{x:number,y:number}}} [opcoes] `emUnidades` mantém a
 *   transformação atual do chamador (zoom); o padrão redefine para pixels do dispositivo.
 */
export function desenharCenario(ctx, c, sim, layout, relogio, movimento, opcoes = {}) {
  const { emUnidades = false, tremor = { x: 0, y: 0 } } = opcoes;
  const { chaoY } = layout;
  const k = c.k;
  const larguraPx = Math.ceil(layout.L * k) + Math.ceil(12 * k);
  const r = sim.rolagem * k;
  ctx.save();
  if (!emUnidades) ctx.setTransform(1, 0, 0, 1, 0, 0);
  const py = (unidades) => Math.round(unidades * k) + tremor.y;
  pintar(ctx, c.ceu, 0, 0, k, emUnidades);
  desenharNuvens(ctx, c, layout, sim.rolagem, relogio, movimento, k, emUnidades);
  const base = chaoY - 10;
  repetir(ctx, c.longe, r * FATORES.longe, tremor.x, py(base - 330 * c.ev), larguraPx, k, emUnidades);
  repetir(ctx, c.medio, r * FATORES.medio, tremor.x, py(base - 250 * c.ev), larguraPx, k, emUnidades);
  repetir(ctx, c.casas, r * FATORES.casas, tremor.x, py(chaoY - ALTURA_CALCADA_ACIMA - ALTURA_CASAS), larguraPx, k, emUnidades);
  repetir(ctx, c.calcada, r, tremor.x, py(chaoY - ALTURA_CALCADA_ACIMA), larguraPx, k, emUnidades);
  repetir(ctx, c.pista, r, tremor.x, py(chaoY + ALTURA_CALCADA_ACIMA), larguraPx, k, emUnidades);
  ctx.restore();
  desenharFaixaDeTravessia(ctx, layout, sim);
}

export { LARGURA_LONGE, LARGURA_MEDIO, LARGURA_CASAS };

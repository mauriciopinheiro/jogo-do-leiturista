/**
 * Planejador do robô: prevê a trajetória de pulos (segurar por h segundos) contra o que vem
 * pela frente e escolhe a sequência de até dois pulos com menos colisões e mais leituras.
 */
import { JOGADOR } from '../../../src/js/config/constantes.js';
import { integrarJogador, pressionar, soltar } from '../../../src/js/simulacao/fisica-jogador.js';

const DT = 1 / 60;
const HORIZONTE = 2.2;
const AMOSTRAS = Math.round(HORIZONTE / DT);
export const SEGURAR = [0.05, 0.09, 0.14, 0.22, 0.4, 0.7];

/**
 * Altitude a cada DT de um pulo em que o dedo é solto após `h` segundos. Usa as próprias funções
 * de física do jogo (mesmo corte, mesma ordem de operações), sem reimplementar a trajetória.
 */
export function trajetoria(h) {
  const falsa = {
    estagio: 'corrida', pausado: false, eventos: [], buffer: 0, segurando: false,
    flow: { estado: 'ocioso', energia: 0, tempo: 0 },
    jogador: { alt: 0, vy: 0, noChao: true, amassar: 0 }
  };
  const corte = Math.round(h / DT);
  pressionar(falsa);
  const alts = [0];
  for (let passo = 0; passo < 200 && !falsa.jogador.noChao; passo++) {
    if (passo === corte) soltar(falsa);
    integrarJogador(falsa, DT);
    if (!falsa.jogador.noChao) alts.push(falsa.jogador.alt);
  }
  return alts;
}

const TRAJETORIAS = SEGURAR.map(trajetoria);

/** Altitude do jogador no instante k (em amostras) segundo um plano de pulos. */
function altitudeNoPlano(plano, k) {
  for (const salto of plano) {
    const rel = k - salto.inicio;
    const traj = TRAJETORIAS[salto.h];
    if (rel >= 0 && rel < traj.length) return traj[rel];
  }
  return 0;
}

function avaliar(sim, plano, objetos) {
  const c = JOGADOR.caixa;
  const x0 = sim.jogador.x + c.recuoX;
  const v = sim.velocidadeEfetiva;
  let colisoes = 0;
  const pegos = new Set();
  const batidos = new Set();
  for (let k = 0; k < AMOSTRAS; k++) {
    const alt = altitudeNoPlano(plano, k);
    const recuo = v * k * DT;
    for (const o of objetos.obstaculos) {
      const x = o.x - recuo;
      if (!batidos.has(o) && x < x0 + c.largura && x + o.w > x0 && alt + c.base < -o.dy && alt + c.topo > -o.dy - o.h) {
        batidos.add(o);
        colisoes++;
      }
    }
    for (const m of objetos.medidores) {
      if (pegos.has(m)) continue;
      if (Math.hypot(m.x - recuo - (x0 + c.largura / 2), -m.dy - (alt + 34)) < m.r + 20) pegos.add(m);
    }
  }
  return { pontos: pegos.size * 10 - colisoes * 1000 - plano.length, colisoes };
}

/** Melhor plano de 0, 1 ou 2 pulos. Devolve a lista de {inicio, h} em amostras. */
export function planejar(sim) {
  const objetos = {
    obstaculos: sim.obstaculos.filter((o) => o.x > sim.jogador.x - 60),
    medidores: sim.medidores.filter((m) => !m.coletado)
  };
  let melhor = { plano: [], ...avaliar(sim, [], objetos) };
  const consideracao = (plano) => {
    const r = avaliar(sim, plano, objetos);
    if (r.pontos > melhor.pontos) melhor = { plano, ...r };
  };
  for (let d1 = 0; d1 < 28; d1 += 2) {
    for (let h1 = 0; h1 < SEGURAR.length; h1++) {
      const primeiro = { inicio: d1, h: h1 };
      consideracao([primeiro]);
      const pouso = d1 + TRAJETORIAS[h1].length;
      for (let d2 = pouso - 3; d2 < pouso + 16; d2 += 2) {
        for (let h2 = 0; h2 < SEGURAR.length; h2++) consideracao([primeiro, { inicio: d2, h: h2 }]);
      }
    }
  }
  return melhor.plano;
}

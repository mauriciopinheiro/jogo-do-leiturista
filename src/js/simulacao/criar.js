/**
 * @file criar.js
 * @description Estado da simulação e início de partida. O objeto `sim` é único e reaproveitado
 * entre partidas (o renderizador guarda a referência); iniciarPartida() o reinicia por completo.
 */
import { ROTAS_SEMAE, velocidadeBaseUps } from '../config/rotas.js';
import { criarPrng } from '../nucleo/prng.js';
import { montarFila } from './medidores.js';

export function estadoInicial(rotas, mundo) {
  return {
    rotas,
    mundo: { ...mundo },
    estagio: 'inativo',
    subestagio: '',
    tempoSub: 0,
    pausado: false,
    infinito: false,
    faseIdx: 0,
    semente: 1,
    partidaId: '',
    rng: criarPrng(1),
    tempo: 0,
    tempoCorrida: 0,
    rolagem: 0,
    velocidade: 0,
    velocidadeEfetiva: 0,
    pontos: 0,
    leituras: 0,
    perfeitas: 0,
    combo: 0,
    comboMax: 0,
    mult: 1,
    tempoCombo: 0,
    ameaca: 0,
    golpes: 0,
    tempoGolpe: 0,
    calor: 0,
    turbo: 0,
    escudo: false,
    flow: { energia: 0, estado: 'ocioso', tempo: 0 },
    jogador: { x: 0, alt: 0, vy: 0, noChao: true, machucado: 0, fasePerna: 0, amassar: 0, visivel: false },
    cao: { x: -250, fasePerna: 0, latido: 0, visivel: false, investida: 0 },
    kombi: { x: -220, portaAberta: true, visivel: false },
    fila: null,
    medidores: [],
    obstaculos: [],
    powerups: [],
    placas: [],
    ultimoSpawnX: 0,
    relogioPowerup: 0,
    proximoPowerup: 12,
    buffer: 0,
    segurando: false,
    tremor: 0,
    ruaAtual: 0,
    ruaAnunciada: -1,
    travessia: 0,
    melhorAnterior: 0,
    resultado: null,
    eventos: []
  };
}

export function criarSimulacao({ rotas = ROTAS_SEMAE, mundo = { L: 720, chaoY: 420, jogadorX: 200 } } = {}) {
  return estadoInicial(rotas, mundo);
}

/** Prepara a fila, as listas e a velocidade da fase atual (também usada no modo infinito). */
export function prepararFase(sim) {
  const rota = sim.rotas[sim.faseIdx];
  sim.fila = montarFila(rota, sim.faseIdx);
  sim.medidores.length = 0;
  sim.obstaculos.length = 0;
  sim.powerups.length = 0;
  sim.placas.length = 0;
  sim.velocidade = velocidadeBaseUps(rota);
  sim.ultimoSpawnX = sim.mundo.L;
  sim.ruaAtual = 0;
  sim.ruaAnunciada = -1;
  sim.travessia = 0;
}

/**
 * Inicia uma partida nova, já na abertura (Kombi chegando).
 * @param {{faseIdx?:number, infinito?:boolean, semente?:number, melhorAnterior?:number}} opcoes
 */
export function iniciarPartida(sim, opcoes = {}) {
  const { faseIdx = 0, infinito = false, semente = Date.now(), melhorAnterior = 0 } = opcoes;
  Object.assign(sim, estadoInicial(sim.rotas, sim.mundo));
  sim.faseIdx = Math.max(0, Math.min(sim.rotas.length - 1, faseIdx));
  sim.infinito = infinito;
  sim.semente = semente >>> 0;
  sim.partidaId = `partida-${sim.semente}`;
  sim.rng = criarPrng(sim.semente);
  sim.melhorAnterior = melhorAnterior;
  prepararFase(sim);
  sim.estagio = 'abertura';
  sim.subestagio = 'chegada';
  sim.kombi = { x: -220, portaAberta: true, visivel: true };
  sim.jogador.x = 90;
  sim.jogador.visivel = false;
  return sim;
}

/** Ajusta o mundo (giro de tela/redimensionamento) mantendo as distâncias relativas ao jogador. */
export function redimensionarMundo(sim, novo) {
  const dx = novo.jogadorX - sim.mundo.jogadorX;
  sim.mundo = { L: novo.L, chaoY: novo.chaoY, jogadorX: novo.jogadorX };
  if (sim.estagio === 'corrida' && dx !== 0) {
    sim.jogador.x += dx;
    sim.cao.x += dx;
    sim.ultimoSpawnX += dx;
    for (const lista of [sim.medidores, sim.obstaculos, sim.powerups, sim.placas]) {
      for (const item of lista) item.x += dx;
    }
  }
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarSimulacao, iniciarPartida } from '../../src/js/simulacao/criar.js';
import { passo } from '../../src/js/simulacao/passo.js';
import { pressionar, soltar } from '../../src/js/simulacao/fisica-jogador.js';
import { pularAbertura } from '../../src/js/simulacao/kombi.js';
import { coletarPowerup, baterNoObstaculo } from '../../src/js/simulacao/colisoes.js';
import { MUNDO_PADRAO } from './auxiliar/robo.js';

function novaCorrida(faseIdx = 0) {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  iniciarPartida(sim, { faseIdx, semente: 7 });
  pularAbertura(sim);
  return sim;
}

/** Faz um pulo soltando o dedo após `segurar` s; devolve altura máxima e tempo de voo. */
function medirPulo(dtQuadro, segurar) {
  const sim = novaCorrida();
  sim.obstaculos.length = 0;
  pressionar(sim);
  let maxAlt = 0;
  let t = 0;
  let soltou = false;
  while (t < 2 && (t === 0 || !sim.jogador.noChao)) {
    if (!soltou && t >= segurar) { soltar(sim); soltou = true; }
    passo(sim, dtQuadro);
    sim.obstaculos.length = 0;
    maxAlt = Math.max(maxAlt, sim.jogador.alt);
    t += dtQuadro;
  }
  return { maxAlt, voo: t };
}

test('toque curto salta menos do que segurar (pulo baixo x alto)', () => {
  const baixo = medirPulo(1 / 60, 0.05);
  const alto = medirPulo(1 / 60, 0.9);
  assert.ok(baixo.maxAlt < alto.maxAlt);
  assert.ok(alto.maxAlt > 155 && alto.maxAlt < 175, `alto=${alto.maxAlt}`);
  assert.ok(alto.voo > 0.6 && alto.voo < 0.75, `voo=${alto.voo}`);
});

test('a física não depende da taxa de quadros (60, 30, 120 e 144 Hz)', () => {
  const ref = medirPulo(1 / 60, 0.9).maxAlt;
  for (const hz of [30, 120, 144]) {
    const alt = medirPulo(1 / hz, 0.9).maxAlt;
    assert.ok(Math.abs(alt - ref) / ref < 0.03, `${hz} Hz: ${alt} vs ${ref}`);
  }
});

test('pressionar no ar guarda o pulo e ele acontece ao pousar (buffer)', () => {
  const sim = novaCorrida();
  sim.obstaculos.length = 0;
  pressionar(sim);
  soltar(sim);
  for (let i = 0; i < 20; i++) passo(sim, 1 / 60);
  pressionar(sim);
  let pulos = 0;
  for (let i = 0; i < 90; i++) { passo(sim, 1 / 60); pulos += sim.eventos.filter((e) => e.tipo === 'pulo').length; sim.eventos.length = 0; }
  assert.ok(pulos >= 1, 'segundo pulo automático ao aterrissar');
});

test('colisão: dá tropeço, sobe a ameaça e dá invulnerabilidade curta', () => {
  const sim = novaCorrida();
  const o1 = { forma: 'cone', x: 0, dy: -52, w: 42, h: 52, acertado: false };
  const o2 = { ...o1 };
  baterNoObstaculo(sim, o1);
  assert.equal(Math.round(sim.ameaca), 20);
  assert.equal(sim.golpes, 1);
  baterNoObstaculo(sim, o2);
  assert.equal(Math.round(sim.ameaca), 20, 'segunda batida durante a invulnerabilidade não conta');
  assert.ok(sim.jogador.machucado > 0.5);
});

test('escudo bloqueia uma batida; osso reduz a ameaça; turbo acelera', () => {
  const sim = novaCorrida();
  coletarPowerup(sim, { tipo: 'escudo', x: 0, dy: -100 });
  assert.equal(sim.escudo, true);
  baterNoObstaculo(sim, { forma: 'cone', x: 0, dy: -52, w: 42, h: 52, acertado: false });
  assert.equal(sim.escudo, false);
  assert.equal(sim.ameaca, 0);
  sim.ameaca = 50;
  coletarPowerup(sim, { tipo: 'osso', x: 0, dy: -100 });
  assert.equal(Math.round(sim.ameaca), 20);
  coletarPowerup(sim, { tipo: 'turbo', x: 0, dy: -100 });
  assert.equal(sim.turbo, 5);
});

test('Flow ativo destrói o obstáculo e dá 250 pontos', () => {
  const sim = novaCorrida();
  sim.flow.estado = 'ativo';
  const pontos = sim.pontos;
  baterNoObstaculo(sim, { forma: 'lixeira', x: 0, dy: -65, w: 52, h: 65, acertado: false });
  assert.equal(sim.pontos - pontos, 250);
  assert.equal(sim.ameaca, 0);
});

test('pausar congela a simulação e dt inválido é ignorado', () => {
  const sim = novaCorrida();
  sim.pausado = true;
  passo(sim, 0.5);
  assert.equal(sim.tempoCorrida, 0);
  sim.pausado = false;
  passo(sim, NaN);
  passo(sim, -1);
  assert.equal(sim.tempoCorrida, 0);
  passo(sim, 0.1);
  assert.ok(sim.tempoCorrida > 0.09);
});

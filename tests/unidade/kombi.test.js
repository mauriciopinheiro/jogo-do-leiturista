import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarSimulacao, iniciarPartida } from '../../src/js/simulacao/criar.js';
import { passo } from '../../src/js/simulacao/passo.js';
import { pularAbertura } from '../../src/js/simulacao/kombi.js';
import { coletarPowerup } from '../../src/js/simulacao/colisoes.js';
import { KOMBI_CENA, TEMPOS } from '../../src/js/config/constantes.js';
import { jogar, MUNDO_PADRAO } from './auxiliar/robo.js';

const DT = 1 / 60;

/** Avança a simulação e devolve o registro de cada troca de subestágio (com o instante). */
function registrarTrocas(sim, segundos, parar = () => false) {
  const trocas = [];
  let anterior = null;
  for (let t = 0; t < segundos && !parar(sim); t += DT) {
    passo(sim, DT);
    const chave = `${sim.estagio}/${sim.subestagio}`;
    if (chave !== anterior) trocas.push({ chave, t, visivel: sim.jogador.visivel, kx: sim.kombi.x, jx: sim.jogador.x });
    anterior = chave;
    sim.eventos.length = 0;
  }
  return trocas;
}

test('abertura: a Kombi chega, o menino desce (invisível como sprite solto), corre e a Kombi parte', () => {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  iniciarPartida(sim, { faseIdx: 0, semente: 3 });
  const trocas = registrarTrocas(sim, 20, (s) => s.estagio === 'corrida');
  const ordem = trocas.map((x) => x.chave);
  assert.deepEqual(ordem.slice(0, 6), [
    'abertura/chegada', 'abertura/saindo', 'abertura/desembarque', 'abertura/partida', 'abertura/cao', 'corrida/'
  ]);
  const saindo = trocas.find((x) => x.chave === 'abertura/saindo');
  const desembarque = trocas.find((x) => x.chave === 'abertura/desembarque');
  assert.equal(saindo.visivel, false, 'enquanto a sequência da van mostra o menino, ele não é desenhado à parte');
  assert.ok(Math.abs(desembarque.t - saindo.t - TEMPOS.saidaDaKombi) < 2 * DT, 'a saída dura o tempo combinado');
  assert.equal(desembarque.visivel, true);
  const esperado = MUNDO_PADRAO.jogadorX + 22.5 - KOMBI_CENA.saidaX - 25;
  assert.ok(Math.abs(saindo.kx - esperado) < 240 * DT, `a Kombi para em ${saindo.kx.toFixed(1)}, esperado ~${esperado.toFixed(1)}`);
  assert.ok(desembarque.jx <= MUNDO_PADRAO.jogadorX, 'o menino nunca precisa correr para trás');
});

test('abertura: tocar para pular a animação leva direto à corrida, em qualquer subestágio', () => {
  const vistos = new Set();
  for (const parar of [0.3, 1.2, 2.0, 2.6, 3.2]) {
    const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
    iniciarPartida(sim, { faseIdx: 0, semente: 3 });
    for (let t = 0; t < parar; t += DT) passo(sim, DT);
    if (sim.estagio !== 'abertura') continue;
    vistos.add(sim.subestagio);
    pularAbertura(sim);
    assert.equal(sim.estagio, 'corrida', `pular a partir de "${sim.subestagio}"`);
    assert.equal(sim.jogador.visivel, true);
    assert.equal(sim.jogador.x, MUNDO_PADRAO.jogadorX);
    assert.equal(sim.kombi.visivel, false);
  }
  assert.ok(vistos.size >= 3, `só testou os subestágios ${[...vistos]}`);
});

test('as pernas acompanham a distância no desembarque (mesma cadência da corrida: 0,22 rad por unidade)', () => {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  iniciarPartida(sim, { faseIdx: 0, semente: 3 });
  while (sim.subestagio !== 'desembarque') passo(sim, DT);
  const x0 = sim.jogador.x;
  const f0 = sim.jogador.fasePerna;
  for (let i = 0; i < 6; i++) passo(sim, DT);
  const razao = (sim.jogador.fasePerna - f0) / (sim.jogador.x - x0);
  assert.ok(Math.abs(razao - 0.22) < 0.005, `${razao.toFixed(3)} rad/u`);
});

test('encerramento: a Kombi chega, o menino corre até a porta, entra (sequência) e a Kombi sai levando-o', () => {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  iniciarPartida(sim, { faseIdx: 0, semente: 4 });
  const trocas = [];
  let anterior = null;
  jogar({
    faseIdx: 0, semente: 4, perfil: 'perfeito', sim,
    aoQuadro: (s) => {
      const chave = `${s.estagio}/${s.subestagio}`;
      if (s.estagio !== 'corrida' && chave !== anterior) trocas.push({ chave, visivel: s.jogador.visivel, jx: s.jogador.x, kx: s.kombi.x, t: s.tempo });
      anterior = chave;
    }
  });
  assert.equal(sim.estagio, 'concluida');
  const ordem = trocas.map((x) => x.chave).filter((c) => c.startsWith('encerramento'));
  assert.deepEqual(ordem, ['encerramento/chegada', 'encerramento/embarque', 'encerramento/entrando', 'encerramento/saida']);
  const entrando = trocas.find((x) => x.chave === 'encerramento/entrando');
  const saida = trocas.find((x) => x.chave === 'encerramento/saida');
  assert.equal(entrando.visivel, false, 'dentro da sequência o menino é parte da ilustração');
  assert.ok(Math.abs(saida.t - entrando.t - TEMPOS.embarqueNaKombi) < 2 * DT);
  assert.ok(entrando.jx >= entrando.kx + KOMBI_CENA.portaX - 22.5 - 1, 'ele só entra quando chega à porta');
});

test('derrota: o respiro dura o suficiente para a sequência do cão e depois abre o resultado', () => {
  const { sim } = jogar({ faseIdx: 2, semente: 9, perfil: 'parado' });
  assert.equal(sim.estagio, 'fim');
  assert.ok(sim.tempoDerrota >= TEMPOS.respiroDerrota, `${sim.tempoDerrota}`);
  assert.equal(sim.resultado.vitoria, false);
});

test('power-up: o evento chega ao áudio e aos efeitos como "powerup" e informa qual foi', () => {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  iniciarPartida(sim, { faseIdx: 0, semente: 1 });
  for (const qual of ['turbo', 'escudo', 'osso']) {
    sim.eventos.length = 0;
    coletarPowerup(sim, { tipo: qual, x: 100, dy: -90 });
    const e = sim.eventos.find((ev) => ev.tipo === 'powerup');
    assert.ok(e, `o evento de ${qual} não chegou como "powerup"`);
    assert.equal(e.qual, qual);
  }
});

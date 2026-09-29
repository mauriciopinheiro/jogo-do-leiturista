import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarSimulacao, redimensionarMundo } from '../../src/js/simulacao/criar.js';
import { fotografarPartida, restaurarPartida } from '../../src/js/simulacao/retomada.js';
import { montarSalvamento, salvamentoValido } from '../../src/js/persistencia/salvamento.js';
import { progressoInicial } from '../../src/js/persistencia/progresso.js';
import { jogar, MUNDO_PADRAO } from './auxiliar/robo.js';

function jogarPartial(faseIdx, semente, condicao) {
  let alvo = null;
  const resultado = jogar({
    faseIdx, semente, perfil: 'perfeito', limiteSegundos: 300,
    aoQuadro: (s) => { if (!alvo && condicao(s)) alvo = fotografarPartida(s); }
  });
  return { sim: resultado.sim, foto: alvo };
}

test('AC-106: a partida retomada continua exatamente do ponto salvo (defeito da v3)', () => {
  const { foto } = jogarPartial(2, 555, (s) => s.estagio === 'corrida' && s.fila.lidos >= 12 && s.jogador.noChao);
  assert.ok(foto, 'deveria ter fotografado a corrida no meio da Fase 3');
  const idaEVolta = JSON.parse(JSON.stringify(foto));

  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  restaurarPartida(sim, idaEVolta, 0);
  assert.equal(sim.estagio, 'corrida');
  assert.equal(sim.faseIdx, 2);
  assert.equal(sim.fila.lidos, foto.totalFaseReadings);
  assert.equal(sim.fila.perdidos, foto.perdidos);
  assert.equal(sim.fila.proximo, foto.totalFaseReadings + foto.perdidos, 'a fila retoma do total processado; os que estavam na tela voltam a aparecer');
  sim.fila.porRua.forEach((rua, i) => {
    assert.equal(rua.lidos, foto.readingsByRua[i]);
    assert.ok(rua.lidos + rua.perdidos <= rua.total);
  });
  assert.equal(sim.pontos, foto.score);

  const { eventos } = jogar({ faseIdx: 2, semente: 555, perfil: 'perfeito', sim });
  assert.equal(sim.estagio, 'concluida', 'a rota retomada deve terminar');
  assert.equal(sim.fila.lidos + sim.fila.perdidos, sim.rotas[2].totalHidrometros);
  sim.fila.porRua.forEach((rua) => assert.ok(rua.lidos + rua.perdidos <= rua.total, 'contador por rua nunca passa da meta'));
  assert.equal(eventos.filter((e) => e.tipo === 'rota-concluida').length, 1);
});

test('uma partida salva pela v3.4.0 (sem os campos novos) também é retomada de forma consistente', () => {
  const antiga = {
    faseIdx: 1, isEndless: false, score: 2100, readings: 9, perfects: 1, maxCombo: 5, dogThreat: 35, ruaIdx: 0,
    readingsByRua: [9, 0, 0], completedRuas: [], totalFaseReadings: 9, partidaId: 'partida-1', seed: 4242
  };
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  restaurarPartida(sim, antiga, 0);
  assert.equal(sim.fila.lidos, 9);
  assert.equal(sim.fila.proximo, 9, 'sem o campo novo, retoma pelo total já processado');
  jogar({ faseIdx: 1, semente: 4242, perfil: 'perfeito', sim });
  assert.equal(sim.estagio, 'concluida');
  assert.equal(sim.fila.lidos + sim.fila.perdidos, 30);
});

test('dados adulterados da partida salva nunca quebram nem passam da meta', () => {
  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  restaurarPartida(sim, {
    faseIdx: 99, isEndless: 'sim', score: -5, readingsByRua: [999, 'x', -3], dogThreat: 1e9, seed: 'abc', proximoMedidor: 1e9
  }, 0);
  assert.ok(sim.faseIdx >= 0 && sim.faseIdx <= 4);
  sim.fila.porRua.forEach((rua) => assert.ok(rua.lidos <= rua.total && rua.lidos >= 0));
  assert.ok(sim.ameaca <= 90);
  assert.ok(sim.fila.proximo <= sim.fila.lista.length);
});

test('a foto da partida entra no save e volta validada; redimensionar o mundo desloca tudo junto', () => {
  const { foto } = jogarPartial(0, 77, (s) => s.estagio === 'corrida' && s.fila.lidos >= 4);
  const p = progressoInicial();
  p.partidaEmAndamento = foto;
  const salvo = JSON.parse(JSON.stringify(montarSalvamento(p)));
  assert.equal(salvamentoValido(salvo), true);

  const sim = criarSimulacao({ mundo: MUNDO_PADRAO });
  restaurarPartida(sim, foto, 0);
  const antes = { obst: sim.obstaculos.map((o) => o.x), cao: sim.cao.x, jogador: sim.jogador.x };
  redimensionarMundo(sim, { L: 900, chaoY: 330, jogadorX: 245 });
  const dx = 245 - antes.jogador;
  assert.equal(sim.jogador.x, 245);
  assert.ok(Math.abs(sim.cao.x - (antes.cao + dx)) < 1e-9);
  sim.obstaculos.forEach((o, i) => assert.ok(Math.abs(o.x - (antes.obst[i] + dx)) < 1e-9));
});

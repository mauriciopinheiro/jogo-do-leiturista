import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jogar } from './auxiliar/robo.js';

const SEMENTES = [231, 385, 539, 693, 847];

test('AC-105: sem nenhuma entrada o jogador perde em todas as fases', () => {
  for (let fase = 0; fase < 5; fase++) {
    const { sim, eventos } = jogar({ faseIdx: fase, semente: SEMENTES[fase], perfil: 'parado' });
    assert.equal(sim.estagio, 'fim', `fase ${fase + 1}`);
    assert.equal(sim.resultado.vitoria, false);
    assert.ok(eventos.some((e) => e.tipo === 'derrota'));
    assert.ok(eventos.some((e) => e.tipo === 'fim-derrota'));
    assert.ok(sim.tempoCorrida < 60, 'perde em menos de um minuto');
  }
});

test('AC-105: o robô planejador conclui as 5 fases', () => {
  for (let fase = 0; fase < 5; fase++) {
    const { sim, eventos } = jogar({ faseIdx: fase, semente: SEMENTES[fase], perfil: 'perfeito' });
    assert.equal(sim.estagio, 'concluida', `fase ${fase + 1}`);
    const r = sim.resultado;
    assert.equal(r.vitoria, true);
    assert.equal(r.leituras + r.perdidos, sim.rotas[fase].totalHidrometros);
    assert.equal(eventos.filter((e) => e.tipo === 'rota-concluida').length, 1);
    assert.equal(eventos.filter((e) => e.tipo === 'rua-concluida').length, sim.rotas[fase].ruas.length);
    assert.ok(eventos.some((e) => e.tipo === 'leitura' && e.perfeita || fase < 4));
  }
});

test('a mesma semente produz exatamente a mesma partida', () => {
  const a = jogar({ faseIdx: 1, semente: 4242, perfil: 'perfeito' }).sim;
  const b = jogar({ faseIdx: 1, semente: 4242, perfil: 'perfeito' }).sim;
  assert.equal(a.pontos, b.pontos);
  assert.equal(a.tempoCorrida, b.tempoCorrida);
  assert.deepEqual(a.resultado, b.resultado);
});

test('uma rua perdida não trava o progresso das ruas seguintes (defeito da v3)', () => {
  const { sim } = jogar({ faseIdx: 0, semente: 231, perfil: 'perfeito' });
  const cada = sim.fila.porRua.map((r) => r.lidos + r.perdidos >= r.total);
  assert.deepEqual(cada, sim.fila.porRua.map(() => true));
  assert.equal(sim.fila.concluidas.size, sim.rotas[0].ruas.length);
});

test('AC-106: contadores por rua nunca passam da meta, mesmo na Fase 5 com 90 hidrômetros', () => {
  const { sim } = jogar({ faseIdx: 4, semente: 847, perfil: 'perfeito' });
  for (const rua of sim.fila.porRua) assert.ok(rua.lidos + rua.perdidos <= rua.total);
  assert.equal(sim.fila.lidos + sim.fila.perdidos, 90);
});

test('modo infinito emenda a próxima rota e volta à primeira depois da quinta', () => {
  const { sim, eventos } = jogar({ faseIdx: 3, semente: 99, perfil: 'perfeito', infinito: true, limiteSegundos: 240 });
  const emendas = eventos.filter((e) => e.tipo === 'rota-emendada');
  assert.ok(emendas.length >= 1, 'emendou ao menos uma rota');
  assert.equal(emendas[0].faseIdx, 4);
  if (emendas.length > 1) assert.equal(emendas[1].faseIdx, 0);
  assert.notEqual(sim.estagio, 'concluida', 'no infinito não há encerramento com a Kombi');
});

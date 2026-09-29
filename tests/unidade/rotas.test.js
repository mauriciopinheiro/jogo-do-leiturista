import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROTAS_SEMAE, TOTAL_CAMPANHA } from '../../src/js/config/rotas.js';
import { PADROES } from '../../src/js/config/padroes.js';
import { montarLista } from '../../src/js/simulacao/medidores.js';

test('AC-107: o total de cada rota é a soma das suas ruas', () => {
  for (const rota of ROTAS_SEMAE) {
    const soma = rota.ruas.reduce((s, r) => s + r.hidrometros, 0);
    assert.equal(soma, rota.totalHidrometros, `Fase ${rota.fase}`);
  }
  assert.equal(TOTAL_CAMPANHA, 240);
});

test('a lista de medidores respeita as ruas, é estável e tem 10% de ouro', () => {
  for (const [idx, rota] of ROTAS_SEMAE.entries()) {
    const lista = montarLista(rota, idx);
    assert.equal(lista.length, rota.totalHidrometros);
    rota.ruas.forEach((rua, i) => {
      assert.equal(lista.filter((m) => m.ruaIdx === i).length, rua.hidrometros, `${rota.bairro}/${rua.nome}`);
    });
    assert.deepEqual(lista, montarLista(rota, idx), 'determinística');
    assert.equal(lista.filter((m) => m.ouro).length, Math.max(1, Math.ceil(lista.length * 0.1)));
  }
});

test('os padrões têm ids únicos e medidas coerentes', () => {
  const ids = new Set(PADROES.map((p) => p.id));
  assert.equal(ids.size, PADROES.length);
  for (const p of PADROES) {
    assert.ok(p.velMin < p.velMax && p.fim > 0 && p.itens.length > 0, p.id);
    for (const item of p.itens) assert.ok(item.dx >= 0 && item.dx < p.fim, `${p.id} dx`);
  }
  assert.ok(PADROES.some((p) => p.nivel === 0 && p.itens.some((i) => i.tipo === 'medidor')));
});

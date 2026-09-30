import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLHA, KOMBI, SEQUENCIAS, quadroPorTempo, escolherQuadroKombi
} from '../../src/js/render/ilustracoes/quadros.js';
import { SPRITES } from '../../src/js/config/quadros-sprites.js';
import { TEMPOS, KOMBI_CENA, DERROTA_CENA } from '../../src/js/config/constantes.js';

test('a Kombi sozinha: fechada, com a porta aberta ou andando (alterna os dois quadros de roda)', () => {
  assert.deepEqual(escolherQuadroKombi({ aberta: false, andando: false, tempo: 0 }), { folha: FOLHA.kombi, quadro: KOMBI.parada });
  assert.equal(escolherQuadroKombi({ aberta: true, andando: true, tempo: 0 }).quadro, KOMBI.aberta);
  const andando = new Set([0, 0.13, 0.26, 0.39].map((tempo) => escolherQuadroKombi({ aberta: false, andando: true, tempo }).quadro));
  assert.deepEqual([...andando].sort(), [KOMBI.parada, KOMBI.andando]);
});

test('sequências com dois personagens: os quadros existem e avançam com o tempo', () => {
  for (const [nome, seq] of Object.entries(SEQUENCIAS)) {
    const meta = SPRITES.folhas[seq.folha];
    assert.ok(meta, `${nome}: folha ${seq.folha} sem atlas`);
    for (const q of seq.quadros) assert.ok(q >= 0 && q < meta.quadros, `${nome}: quadro ${q} fora da folha`);
  }
  const passos = (seq, duracao) => [0, 0.26, 0.51, 0.76, 1].map((f) => quadroPorTempo(f * duracao, duracao, seq.quadros));
  assert.deepEqual(passos(SEQUENCIAS.descer, TEMPOS.saidaDaKombi), [0, 1, 2, 3, 3]);
  assert.deepEqual(passos(SEQUENCIAS.derrota, DERROTA_CENA.duracao), [0, 1, 2, 3, 3]);
  const entrar = passos(SEQUENCIAS.entrar, TEMPOS.embarqueNaKombi);
  assert.equal(entrar[0], 1, 'o embarque começa no quadro em que o menino já está na porta (o 0 é a corrida até ela)');
  assert.equal(entrar.at(-1), 3);
  assert.equal(quadroPorTempo(-1, 1, [5, 6]), 5, 'tempo negativo fica no primeiro quadro');
});

test('a derrota ilustrada cabe no respiro antes da tela de resultado', () => {
  assert.ok(DERROTA_CENA.duracao < TEMPOS.respiroDerrota, 'a sequência termina antes de a tela de resultado abrir');
});

test('todas as folhas têm escala, pivô dentro da célula e grade coerente', () => {
  for (const [nome, m] of Object.entries(SPRITES.folhas)) {
    assert.ok(m.upp > 0.3 && m.upp < 0.5, `${nome}: upp ${m.upp}`);
    assert.ok(m.pivo[0] > 0 && m.pivo[0] < m.celula[0] && m.pivo[1] > 0 && m.pivo[1] < m.celula[1], `${nome}: pivô fora da célula`);
    assert.ok(m.quadros <= m.colunas * Math.ceil(m.quadros / m.colunas), nome);
  }
});

test('a Kombi ilustrada tem largura e degraus coerentes com o mundo', () => {
  const van = SPRITES.folhas.kombi;
  const largura = van.celula[0] * van.upp;
  assert.ok(largura > KOMBI_CENA.largura && largura < KOMBI_CENA.largura * 1.15, `célula da van: ${largura.toFixed(0)} u`);
  assert.ok(KOMBI_CENA.saidaX < KOMBI_CENA.largura && KOMBI_CENA.portaX < KOMBI_CENA.saidaX);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medalhasDoResumo, dicaDoResumo, metaDeCombo } from '../../src/js/interface/medalhas.js';
import { calcularNota, montarMensagem, notificarPortal } from '../../src/js/integracao/portal.js';
import { estatisticasSeguras, CENAS } from '../../src/js/cena-final/roteiro.js';
import { rotuloDaAmeaca } from '../../src/js/simulacao/cao.js';
import { limitar, formatarInteiro, formatarMultiplicador } from '../../src/js/nucleo/util.js';

const resumo = (extra = {}) => ({
  vitoria: true, faseIdx: 0, infinito: false, pontos: 5000, leituras: 15, perdidos: 0, totalRota: 15,
  perfeitas: 5, comboMax: 6, duracao: 30, ameacaFinal: 10, golpes: 0, melhorAnterior: 0, ...extra
});

test('medalhas seguem os limiares da v3.4.0', () => {
  const m = medalhasDoResumo(resumo());
  assert.equal(m.leitura.nivel, 'ouro');
  assert.equal(m.precisao.nivel, 'ouro');
  assert.equal(m.agilidade.nivel, 'ouro');
  assert.equal(medalhasDoResumo(resumo({ leituras: 13 })).leitura.nivel, 'prata');
  assert.equal(medalhasDoResumo(resumo({ leituras: 11 })).leitura.nivel, 'bronze');
  assert.equal(medalhasDoResumo(resumo({ leituras: 8 })).leitura.nivel, 'nenhuma');
  assert.equal(medalhasDoResumo(resumo({ perfeitas: 0 })).precisao.nivel, 'nenhuma');
  assert.equal(metaDeCombo(0), 6);
  assert.equal(metaDeCombo(1), 10);
  assert.equal(metaDeCombo(4), 15);
});

test('a nota enviada ao Hub é um inteiro de 0 a 100 e premia leitura completa', () => {
  const cheia = calcularNota(resumo());
  const fraca = calcularNota(resumo({ leituras: 8, perfeitas: 0, comboMax: 0 }));
  assert.ok(Number.isInteger(cheia) && cheia === 100, `${cheia}`);
  assert.ok(fraca >= 0 && fraca < 40, `${fraca}`);
  assert.ok(cheia > fraca);
});

test('AC-110: só vitória na campanha gera mensagem para o Hub', () => {
  assert.equal(montarMensagem(resumo({ vitoria: false })), null);
  assert.equal(montarMensagem(resumo({ infinito: true })), null);
  const m = montarMensagem(resumo(), 123);
  assert.equal(m.tipo, 'SEMAE_FIM_PARTIDA');
  assert.equal(m.jogoId, 'app_jogo_do_leiturista');
  assert.equal(m.carimbo, 123);
  assert.ok(m.estrelas >= 1 && m.estrelas <= 3);
});

test('a dica do resultado é útil e nunca lança', () => {
  assert.match(dicaDoResumo(resumo({ pontos: 9000, melhorAnterior: 4000 }), true), /Novo recorde/);
  assert.match(dicaDoResumo(resumo({ vitoria: false, ameacaFinal: 100 }), false), /segurança/);
  assert.equal(typeof dicaDoResumo(resumo({ leituras: 0, perfeitas: 0, totalRota: 0 }), false), 'string');
});

test('cena final: estatísticas inválidas viram números seguros e os textos aprovados existem', () => {
  const s = estatisticasSeguras({ meters: 'x', totalMeters: -5, perfects: NaN, score: 1e15 }, 240);
  assert.deepEqual(Object.keys(s).sort(), ['maxCombo', 'meters', 'perfects', 'score', 'totalMeters']);
  assert.ok(Object.values(s).every(Number.isFinite));
  assert.equal(estatisticasSeguras(null, 240).totalMeters, 240);
  assert.equal(CENAS.length, 5);
});

test('rótulos de ameaça e formatação em português', () => {
  assert.deepEqual([0, 30, 60, 90].map(rotuloDaAmeaca), ['Seguro', 'Alerta', 'Perigo', 'Investida!']);
  assert.equal(limitar(5, 0, 3), 3);
  assert.equal(formatarInteiro(12345.6), '12.346');
  assert.equal(formatarMultiplicador(1.25), '×1,25');
});

test('AC-110: o aviso ao Hub vai só para a origem da página, só dentro de iframe e só na vitória', () => {
  const chamadas = [];
  const pai = { postMessage: (mensagem, alvo) => chamadas.push({ mensagem, alvo }) };
  const janela = { parent: pai, location: { origin: 'https://semae-educa.pages.dev' } };
  assert.equal(notificarPortal(janela, resumo(), 99), true);
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].alvo, 'https://semae-educa.pages.dev', 'nunca "*"');
  assert.equal(chamadas[0].mensagem.tipo, 'SEMAE_FIM_PARTIDA');

  const sozinha = { location: { origin: 'https://semae-educa.pages.dev' } };
  sozinha.parent = sozinha;
  assert.equal(notificarPortal(sozinha, resumo()), false, 'fora de iframe não envia');
  assert.equal(notificarPortal({ parent: pai, location: { origin: 'null' } }, resumo()), false, 'arquivo local não envia');
  assert.equal(notificarPortal(janela, resumo({ vitoria: false })), false, 'derrota não envia');
  assert.equal(notificarPortal(janela, resumo({ infinito: true })), false, 'modo infinito não envia');
  assert.equal(chamadas.length, 1);
});

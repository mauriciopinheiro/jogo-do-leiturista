import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { sha256 } from '../../src/js/persistencia/assinatura.js';
import { sha256LegadoV3 } from '../../src/js/persistencia/assinatura-legado.js';
import { montarSalvamento, salvamentoValido } from '../../src/js/persistencia/salvamento.js';
import { interpretarSalvamento, carregarProgresso, migrarV1 } from '../../src/js/persistencia/leitura.js';
import { progressoInicial } from '../../src/js/persistencia/progresso.js';
import { criarArmazenamento } from '../../src/js/persistencia/armazenamento.js';
import { criarGestor } from '../../src/js/persistencia/gestor.js';
import { CHAVE_SAVE } from '../../src/js/config/constantes.js';

const AMOSTRAS = ['', 'a', 'x'.repeat(55), 'x'.repeat(64), 'ção ✓ 💧'.repeat(9), JSON.stringify({ n: [...Array(300).keys()] })];

test('sha256 novo é o SHA-256 padrão', () => {
  for (const s of AMOSTRAS) assert.equal(sha256(s), crypto.createHash('sha256').update(s, 'utf8').digest('hex'));
});

test('a variante legada é idêntica à função que estava na v3.4.0 publicada', () => {
  const html = fs.readFileSync(new URL('../../versoes-preservadas/v3.4.0-no-ar/index.html', import.meta.url), 'utf8');
  const codigo = html.slice(html.indexOf('function sha256Sync(t)'), html.indexOf('function fnv1a(t)'));
  const original = new Function(`${codigo}; return sha256Sync;`)();
  for (const s of AMOSTRAS) assert.equal(sha256LegadoV3(s), original(s), `amostra de ${s.length} caracteres`);
});

function saveDaV3(estado) {
  const d = { app: 'jogo-do-leiturista-3', versaoJogo: '3.4.0', versaoEsquema: 2, criadoEm: '2026-09-20T10:00:00.000Z', estado };
  d.assinatura = `sha256-${sha256LegadoV3(JSON.stringify(d))}`;
  d.checksum = d.assinatura;
  return d;
}

const estadoDaV3 = () => ({
  lifetimeReadings: 47, best: 8123, endlessBest: 0, selectedSkin: 1, maxUnlockedFase: 3,
  bestByPhase: [4000, 6100, 0, 0, 0],
  phaseResults: [{ meters: 15, perfects: 2, maxCombo: 9, score: 4000 }, { meters: 30, perfects: 5, maxCombo: 12, score: 6100 }, null, null, null],
  lastCampaignStats: null, campaignCompleted: false, grandFinaleSeen: false, musicOn: false, sfxOn: true, partidaEmAndamento: null
});

test('AC-101: aceita um save assinado pela v3.4.0 e preserva o progresso', () => {
  const r = interpretarSalvamento(JSON.stringify(saveDaV3(estadoDaV3())));
  assert.equal(r.ok, true);
  const { progresso, origem } = carregarProgresso(criarArmazenamento({ getItem: () => JSON.stringify(saveDaV3(estadoDaV3())), setItem() {} }));
  assert.equal(origem, 'v2');
  assert.equal(progresso.leiturasVitalicias, 47);
  assert.equal(progresso.faseMaxLiberada, 3);
  assert.equal(progresso.musica, false);
  assert.deepEqual(progresso.melhorPorFase, [4000, 6100, 0, 0, 0]);
});

test('save novo é assinado com SHA-256 correto e volta íntegro', () => {
  const p = progressoInicial();
  p.leiturasVitalicias = 12;
  const d = montarSalvamento(p);
  assert.match(d.assinatura, /^sha256-[0-9a-f]{64}$/);
  assert.equal(d.checksum, d.assinatura);
  assert.equal(salvamentoValido(JSON.parse(JSON.stringify(d))), true);
});

test('AC-101: save adulterado, de outro jogo ou grande demais é recusado sem exceção', () => {
  const bom = JSON.stringify(montarSalvamento(progressoInicial()));
  const adulterado = JSON.parse(bom);
  adulterado.estado.lifetimeReadings = 99999;
  assert.equal(interpretarSalvamento(JSON.stringify(adulterado)).motivo, 'assinatura');
  assert.equal(interpretarSalvamento('{ isto não é json').motivo, 'json');
  assert.equal(interpretarSalvamento('null').motivo, 'json');
  assert.equal(interpretarSalvamento(JSON.stringify({ ...JSON.parse(bom), app: 'outro-jogo' })).motivo, 'incompativel');
  assert.equal(interpretarSalvamento(' '.repeat(300 * 1024)).motivo, 'grande');
  assert.equal(interpretarSalvamento(JSON.stringify({ versaoEsquema: 9 })).motivo, 'incompativel');
  const negativo = JSON.parse(bom);
  negativo.estado.best = -5;
  assert.equal(interpretarSalvamento(JSON.stringify(negativo)).ok, false);
});

test('migra o esquema v1 e ignora lixo', () => {
  const v1 = { app: 'jogo-do-leiturista', versaoEsquema: 1, estado: { totalReadings: 33, best: 900, selectedSkin: 2, maxUnlockedFase: 2 } };
  const migrado = migrarV1(v1);
  assert.equal(salvamentoValido(migrado), true);
  assert.equal(migrado.estado.lifetimeReadings, 33);
  assert.equal(migrarV1({ app: 'x', estado: {} }), null);
  assert.equal(migrarV1(null), null);
});

test('AC-108: armazenamento cheio ou bloqueado avisa uma vez, sem lançar, e o jogo segue', () => {
  const avisos = [];
  const cheio = { getItem: () => null, setItem() { throw new DOMException('cheio', 'QuotaExceededError'); } };
  const gestor = criarGestor(criarArmazenamento(cheio, (m) => avisos.push(m)), { agendar: (fn) => fn() });
  gestor.registrarLeitura();
  assert.equal(gestor.salvarAgora(), false);
  assert.equal(gestor.salvarAgora(), false);
  assert.equal(avisos.length, 1, 'avisa só na primeira falha');
  const bloqueado = criarArmazenamento(null);
  assert.equal(bloqueado.gravar('k', 'v'), false);
  assert.equal(bloqueado.ler('k'), 'v', 'cópia em memória');
});

test('save ilegível não é apagado: fica uma cópia em .invalido', () => {
  const mem = new Map([[CHAVE_SAVE, '{"quebrado":']]);
  const arm = criarArmazenamento({ getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) });
  const { origem, recusado } = carregarProgresso(arm);
  assert.equal(origem, 'novo');
  assert.equal(recusado, 'json');
  assert.equal(mem.get(`${CHAVE_SAVE}.invalido`), '{"quebrado":');
});

test('gestor: gravações em lote se fundem numa só (a cada 5 leituras) e contam as leituras vitalícias', () => {
  const gravacoes = [];
  const tarefas = [];
  const arm = criarArmazenamento({ getItem: () => null, setItem: (k, v) => gravacoes.push(v) });
  const gestor = criarGestor(arm, { agendar: (fn) => { tarefas.push(fn); return tarefas.length; }, cancelar() {} });
  for (let i = 0; i < 25; i++) gestor.registrarLeitura();
  assert.equal(tarefas.length, 1, 'um único salvamento pendente');
  tarefas[0]();
  assert.equal(gravacoes.length, 1);
  assert.equal(JSON.parse(gravacoes[0]).estado.lifetimeReadings, 25);
});

test('exportar e importar fecham o ciclo; importar lixo não altera o progresso', () => {
  const arm = criarArmazenamento({ getItem: () => null, setItem() {} });
  const gestor = criarGestor(arm);
  gestor.progresso.leiturasVitalicias = 77;
  const texto = gestor.exportarTexto();
  const outro = criarGestor(criarArmazenamento({ getItem: () => null, setItem() {} }));
  assert.equal(outro.importarTexto(texto).ok, true);
  assert.equal(outro.progresso.leiturasVitalicias, 77);
  const r = outro.importarTexto('{"lixo":true}');
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /versão incompatível|inválido|alterado/);
  assert.equal(outro.progresso.leiturasVitalicias, 77);
});

test('REQ-209: saves com qualquer uniforme da v3 (0 a 4) são aceitos e gravados de volta como uniforme 0', () => {
  for (const skin of [0, 1, 2, 3, 4]) {
    const r = interpretarSalvamento(JSON.stringify(saveDaV3({ ...estadoDaV3(), selectedSkin: skin })));
    assert.equal(r.ok, true, `selectedSkin ${skin} deveria ser aceito`);
  }
  const recusado = interpretarSalvamento(JSON.stringify(saveDaV3({ ...estadoDaV3(), selectedSkin: 5 })));
  assert.equal(recusado.ok, false, 'índice fora dos 5 uniformes da v3 continua inválido');
  const arm = criarArmazenamento({ getItem: () => JSON.stringify(saveDaV3({ ...estadoDaV3(), selectedSkin: 3 })), setItem() {} });
  const gestor = criarGestor(arm);
  assert.equal('uniforme' in gestor.progresso, false, 'o progresso não guarda mais escolha de uniforme');
  assert.equal(JSON.parse(gestor.exportarTexto()).estado.selectedSkin, 0);
});

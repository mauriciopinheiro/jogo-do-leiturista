import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLHA, L_ACAO, C_ACAO, CENA, quadroDeCorrida, quadroDeGalope, piscando,
  escolherQuadroLeiturista, escolherQuadroCao
} from '../../src/js/render/ilustracoes/quadros.js';
import { pintarQuadro } from '../../src/js/render/ilustracoes/quadro.js';
import { UNIFORME, AZUL_SEMAE, UNIFORMES_DA_V3 } from '../../src/js/config/uniformes.js';
import { SPRITES } from '../../src/js/config/quadros-sprites.js';

const base = { pose: 'corre', fase: 0, noAr: false, vy: 0, machucado: false, amassando: false, tempo: 0 };

test('AC-201: o quadro do leiturista segue o estado da simulação', () => {
  const de = (extra) => escolherQuadroLeiturista({ ...base, ...extra });
  assert.deepEqual(de({ pose: 'corre' }).folha, FOLHA.corrida);
  assert.equal(de({ noAr: true, vy: 800 }).quadro, L_ACAO.subindo);
  assert.equal(de({ noAr: true, vy: 100 }).quadro, L_ACAO.descendo);
  assert.equal(de({ noAr: true, vy: -500 }).quadro, L_ACAO.descendo);
  assert.equal(de({ amassando: true }).quadro, L_ACAO.agachado);
  assert.equal(de({ pose: 'parado' }).quadro, L_ACAO.parado);
  assert.equal(de({ pose: 'parado', tempo: 3.3 }).quadro, L_ACAO.piscando);
  assert.equal(de({ pose: 'vitoria' }).quadro, L_ACAO.vitoria);
  assert.equal(de({ pose: 'ajoelhado' }).quadro, L_ACAO.curvado);
  assert.deepEqual(de({ pose: 'mao' }), { folha: FOLHA.cena, quadro: CENA.mao });
  assert.deepEqual(de({ pose: 'tigela' }), { folha: FOLHA.cena, quadro: CENA.tigela });
  assert.deepEqual(de({ pose: 'afaga' }), { folha: FOLHA.cena, quadro: CENA.carinho });
});

test('o tropeço vale mesmo no ar e tem prioridade sobre o resto', () => {
  const q = escolherQuadroLeiturista({ ...base, machucado: true, noAr: true, vy: 900, amassando: true });
  assert.deepEqual(q, { folha: FOLHA.acoesL, quadro: L_ACAO.tropeco });
});

test('o ciclo de corrida anda com a distância percorrida e nunca sai dos 8 quadros', () => {
  const vistos = new Set();
  for (let fase = 0; fase < 200; fase += 0.37) {
    const q = quadroDeCorrida(fase);
    assert.ok(Number.isInteger(q) && q >= 0 && q < 8, `quadro ${q}`);
    vistos.add(q);
  }
  assert.equal(vistos.size, 8, 'todos os quadros do ciclo devem aparecer');
  assert.equal(quadroDeCorrida(-3), quadroDeCorrida(-3 + 8 / 0.2546), 'fase negativa também cicla');
  for (let i = 0; i < 6; i++) assert.ok(quadroDeGalope(i * 9) < 6);
});

test('a piscadela é curta e periódica', () => {
  assert.equal(piscando(0), false);
  assert.equal(piscando(3.3), true);
  assert.equal(piscando(3.4 + 1), false);
});

test('o quadro do cão: galope, latido, sentado (atento/feliz)', () => {
  const galope = escolherQuadroCao({ fase: 5, tempo: 1 });
  assert.equal(galope.folha, FOLHA.galope);
  const late = escolherQuadroCao({ latindo: true, fase: 5, tempo: 0.05 });
  assert.equal(late.folha, FOLHA.acoesC);
  assert.ok([C_ACAO.late1, C_ACAO.late2].includes(late.quadro));
  const atento = escolherQuadroCao({ sentado: true, feliz: false, tempo: 2 });
  assert.equal(atento.quadro, C_ACAO.sentadoOlhando);
  const feliz = escolherQuadroCao({ sentado: true, feliz: true, tempo: 0 });
  assert.ok([C_ACAO.sentadoFeliz, C_ACAO.sentadoLingua].includes(feliz.quadro));
});

test('todo quadro escolhido existe no atlas gerado (índice dentro da folha)', () => {
  const estados = [];
  for (const pose of ['corre', 'anda', 'parado', 'vitoria', 'ajoelhado', 'mao', 'tigela', 'afaga']) {
    for (const noAr of [false, true]) for (const machucado of [false, true]) for (const amassando of [false, true]) {
      for (const vy of [-300, 100, 900]) estados.push(escolherQuadroLeiturista({ ...base, pose, noAr, vy, machucado, amassando, fase: 17.3, tempo: 3.3 }));
    }
  }
  for (const sentado of [false, true]) for (const feliz of [false, true]) for (const latindo of [false, true]) {
    for (const tempo of [0, 0.3, 1.7]) estados.push(escolherQuadroCao({ sentado, feliz, latindo, fase: 41, tempo }));
  }
  for (const { folha, quadro } of estados) {
    const meta = SPRITES.folhas[folha];
    assert.ok(meta, `folha inexistente ${folha}`);
    assert.ok(quadro >= 0 && quadro < meta.quadros, `${folha}[${quadro}] fora de 0..${meta.quadros - 1}`);
  }
});

test('AC-201: espelhar vira o personagem em torno do pé; sem espelhar, não', () => {
  const chamadas = [];
  const ctx = {
    save: () => chamadas.push('save'), restore: () => chamadas.push('restore'),
    translate: (x, y) => chamadas.push(['translate', x, y]),
    scale: (x, y) => chamadas.push(['scale', x, y]),
    drawImage: (...a) => chamadas.push(['drawImage', ...a.slice(1)])
  };
  const q = { tela: {}, sx: 10, sy: 20, cw: 50, ch: 60, u: 0.5, px: 25, py: 58 };
  pintarQuadro(ctx, q, 100, 200, true);
  assert.deepEqual(chamadas, ['save', ['translate', 100, 200], ['scale', -1, 1],
    ['drawImage', 10, 20, 50, 60, -12.5, -29, 25, 30], 'restore']);
  chamadas.length = 0;
  pintarQuadro(ctx, q, 100, 200);
  assert.ok(!chamadas.some((c) => Array.isArray(c) && c[0] === 'scale'));
});

test('REQ-209: o uniforme é um só e usa o azul oficial do SEMAE (logotipo, #005E9F)', () => {
  assert.equal(AZUL_SEMAE, '#005E9F');
  assert.equal(UNIFORME.camisa, AZUL_SEMAE);
  assert.ok(!Array.isArray(UNIFORME), 'não há lista de uniformes para escolher');
  assert.equal(UNIFORMES_DA_V3, 5, 'saves da v3 podem trazer selectedSkin de 0 a 4 e continuam aceitos');
});

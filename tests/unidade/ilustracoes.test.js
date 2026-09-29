import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLHA, L_ACAO, C_ACAO, CENA, quadroDeCorrida, quadroDeGalope, piscando,
  escolherQuadroLeiturista, escolherQuadroCao
} from '../../src/js/render/ilustracoes/quadros.js';
import { pintarQuadro } from '../../src/js/render/ilustracoes/quadro.js';
import {
  hexParaHsv, rgbParaHsv, hsvParaRgb, receitaDoUniforme, recolorirAtlas
} from '../../src/js/render/ilustracoes/recolorir.js';
import { UNIFORMES } from '../../src/js/config/uniformes.js';
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

/** Célula sintética com as regiões do uniforme clássico da arte (tons medidos nos quadros reais). */
function celulaSintetica() {
  const largura = 40;
  const altura = 100;
  const dados = new Uint8ClampedArray(largura * altura * 4);
  const faixas = {
    bone: [[7, 72, 161], 6, 24], pele: [[224, 160, 90], 28, 36], camisa: [[11, 91, 206], 40, 48],
    faixa: [[255, 205, 7], 50, 54], camisaSombra: [[5, 57, 132], 56, 62], calca: [[9, 49, 107], 70, 90],
    contorno: [[6, 15, 43], 92, 96], telefone: [[110, 200, 235], 64, 68]
  };
  for (const [, [cor, y0, y1]] of Object.entries(faixas)) {
    for (let y = y0; y < y1; y++) for (let x = 5; x < 35; x++) {
      const i = (y * largura + x) * 4;
      dados.set([...cor, 255], i);
    }
  }
  const pixel = (dados2, nome, x = 20) => { const [, y0] = faixas[nome]; const i = (y0 * largura + x) * 4; return Array.from(dados2.slice(i, i + 3)); };
  return { dados, largura, altura, pixel };
}

test('AC-203: o uniforme clássico não altera nada e os outros trocam só o azul', () => {
  assert.equal(receitaDoUniforme(UNIFORMES[0], UNIFORMES[0]), null);
  const c = celulaSintetica();
  const original = Uint8ClampedArray.from(c.dados);
  const amarelo = receitaDoUniforme(UNIFORMES[1], UNIFORMES[0]);
  recolorirAtlas(c.dados, c.largura, c.altura, [c.largura, c.altura], amarelo);
  for (const intocado of ['pele', 'contorno', 'telefone']) {
    assert.deepEqual(c.pixel(c.dados, intocado), c.pixel(original, intocado), `${intocado} não deve mudar`);
  }
  const camisa = rgbParaHsv(...c.pixel(c.dados, 'camisa'));
  assert.ok(camisa.h > 35 && camisa.h < 52, `camisa amarela, matiz ${camisa.h}`);
  const faixa = c.pixel(c.dados, 'faixa');
  assert.ok(faixa.every((v) => v > 235), `a faixa do colete amarelo é branca: ${faixa}`);
  assert.notDeepEqual(c.pixel(c.dados, 'camisa'), c.pixel(original, 'camisa'));
});

test('AC-203: os cinco uniformes geram imagens distintas entre si', () => {
  const resultados = UNIFORMES.map((u) => {
    const c = celulaSintetica();
    const receita = receitaDoUniforme(u, UNIFORMES[0]);
    if (receita) recolorirAtlas(c.dados, c.largura, c.altura, [c.largura, c.altura], receita);
    return c.dados;
  });
  for (let a = 0; a < resultados.length; a++) for (let b = a + 1; b < resultados.length; b++) {
    let soma = 0;
    for (let i = 0; i < resultados[a].length; i++) soma += Math.abs(resultados[a][i] - resultados[b][i]);
    const media = soma / resultados[a].length;
    assert.ok(media > 4, `uniformes ${a} e ${b} muito parecidos (diferença média ${media.toFixed(2)})`);
  }
});

test('a recolorização usa o boné só no alto da figura e a calça só embaixo', () => {
  const c = celulaSintetica();
  recolorirAtlas(c.dados, c.largura, c.altura, [c.largura, c.altura], receitaDoUniforme(UNIFORMES[4], UNIFORMES[0]));
  const bone = rgbParaHsv(...c.pixel(c.dados, 'bone'));
  const calca = rgbParaHsv(...c.pixel(c.dados, 'calca'));
  assert.ok(bone.h > 40 && bone.h < 55 && bone.v > 0.6, `boné amarelo no uniforme noturno: ${JSON.stringify(bone)}`);
  assert.ok(calca.v < 0.25, `calça escura no uniforme noturno: ${JSON.stringify(calca)}`);
});

test('conversões HSV são consistentes (ida e volta) e hex é lido corretamente', () => {
  const saida = [0, 0, 0];
  for (const rgb of [[255, 0, 0], [12, 200, 90], [30, 60, 200], [128, 128, 128], [255, 205, 7]]) {
    const { h, s, v } = rgbParaHsv(...rgb);
    hsvParaRgb(h, s, v, saida);
    assert.deepEqual(saida, rgb);
  }
  const { h, s, v } = hexParaHsv('#ffcd07');
  assert.ok(Math.abs(h - 48) < 1 && s > 0.97 && v === 1);
});

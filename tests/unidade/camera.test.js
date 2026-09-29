import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularLayout } from '../../src/js/render/camera.js';

const TELAS = [
  [1920, 1080, 1, false], [1366, 768, 1, false], [2560, 1440, 1, false], [390, 844, 3, true], [844, 390, 3, true],
  [1024, 768, 2, true], [700, 900, 2, true], [360, 640, 2, true], [2560, 1080, 1, false], [300, 300, 2, true]
];

test('NFR-001: o canvas nunca passa do orçamento de pixels (v3 chegava a 8 Mpx)', () => {
  for (const [largura, altura, dpr, leve] of TELAS) {
    const l = calcularLayout({ largura, altura, dpr, leve });
    const orcamento = leve ? 2.2e6 : 4.2e6;
    assert.ok(l.pixelsW * l.pixelsH <= orcamento, `${largura}x${altura}@${dpr}: ${l.pixelsW}x${l.pixelsH}`);
  }
});

test('o mundo mantém largura entre 560 e 900 e altura mínima de 380 em qualquer proporção', () => {
  for (const [largura, altura, dpr, leve] of TELAS) {
    const l = calcularLayout({ largura, altura, dpr, leve });
    assert.ok(l.A >= 379.9, `altura lógica ${l.A} em ${largura}x${altura}`);
    assert.ok(l.L >= 559.9, `largura lógica ${l.L} em ${largura}x${altura}`);
    if (largura / altura < 2.3) assert.ok(l.L <= 900.1, `largura lógica ${l.L} em ${largura}x${altura}`);
    assert.ok(Math.abs(l.L * l.escala - largura) < 0.01, 'sem faixas laterais');
  }
});

test('o leiturista fica com tamanho útil: >=60 px em celular deitado (v3 tinha ~32 px)', () => {
  const paisagem = calcularLayout({ largura: 844, altura: 390, dpr: 3, leve: true });
  assert.ok(78 * paisagem.escala >= 60, `${78 * paisagem.escala}`);
  const retrato = calcularLayout({ largura: 390, altura: 844, dpr: 3, leve: true });
  assert.ok(78 * retrato.escala >= 50);
});

test('o chão e o jogador cabem na tela e o jogador tem espaço à frente', () => {
  for (const [largura, altura, dpr, leve] of TELAS) {
    const l = calcularLayout({ largura, altura, dpr, leve });
    assert.ok(l.chaoY > 200 && l.chaoY < l.A - 60, `chão ${l.chaoY} de ${l.A}`);
    assert.ok(l.L - l.jogadorX >= 350, `espaço à frente ${l.L - l.jogadorX}`);
  }
});

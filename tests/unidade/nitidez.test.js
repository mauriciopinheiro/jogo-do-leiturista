import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escalaDeLeitura, definirRazaoDePixels } from '../../src/js/render/leitura.js';
import { pintarSprite } from '../../src/js/render/sprites/cache.js';
import { dividirNome } from '../../src/js/render/sprites/placa.js';
import { adicionarPlaca } from '../../src/js/simulacao/placas.js';
import { PLACA, FATOR_CAO_NA_CENA } from '../../src/js/config/constantes.js';
import { criarPrng } from '../../src/js/nucleo/prng.js';
import { jogar } from './auxiliar/robo.js';

const L = 720;
const placa = (nome, x, total) => ({ nome, x, total });
const nomes = (lista) => lista.map((p) => p.nome);

test('nitidez: o sprite é copiado 1:1 em pixels inteiros, em qualquer posição fracionária', () => {
  const chamadas = [];
  const matriz = { a: 1.42, b: 0, c: 0, d: 1.42, e: 3.3, f: -1.6 };
  const ctx = {
    getTransform: () => matriz, save() {}, restore() {},
    setTransform: (...m) => chamadas.push(['setTransform', ...m]),
    drawImage: (...a) => chamadas.push(['drawImage', ...a.slice(1)])
  };
  const sprite = { tela: {}, oxPx: 54.3, oyPx: 54.3 };
  for (const [x, y] of [[100, 200], [100.37, 200.61], [-3.4, 12.5], [512.99, 0.01]]) {
    chamadas.length = 0;
    pintarSprite(ctx, sprite, x, y);
    const copia = chamadas.find((c) => c[0] === 'drawImage');
    assert.equal(copia.length, 3, 'sem largura/altura: nenhuma mudança de escala');
    assert.ok(Number.isInteger(copia[1]) && Number.isInteger(copia[2]), `(${copia[1]}, ${copia[2]}) para x=${x}, y=${y}`);
    assert.deepEqual(chamadas[0], ['setTransform', 1, 0, 0, 1, 0, 0]);
  }
});

test('leitura: hidrômetros e placas crescem em telas pequenas até um tamanho legível, sem mudar em telas grandes', () => {
  assert.equal(escalaDeLeitura(2), 1);
  assert.equal(escalaDeLeitura(1.15), 1);
  assert.ok(escalaDeLeitura(0.96) > 1.15 && escalaDeLeitura(0.96) < 1.25);
  assert.equal(escalaDeLeitura(0.5), 1.6, 'limitado a 1,6x');
  assert.equal(escalaDeLeitura(0.5, 1.35), 1.35);
  assert.equal(escalaDeLeitura(0), 1);
  let anterior = Infinity;
  for (let k = 0.4; k <= 3; k += 0.1) {
    const z = escalaDeLeitura(k);
    assert.ok(z <= anterior + 1e-9, 'a ampliação nunca cresce com a tela');
    anterior = z;
    if (k >= 0.6) assert.ok(9.6 * k * z >= 9, `número do hidrômetro com ${(9.6 * k * z).toFixed(1)} px em k=${k.toFixed(1)}`);
    if (k >= 0.72) assert.ok(9.6 * k * z >= 11, `número do hidrômetro com ${(9.6 * k * z).toFixed(1)} px em k=${k.toFixed(1)}`);
  }
});

test('leitura: o tamanho que conta é o físico (pixel CSS); celular 2x/3x amplia igual a um aparelho 1x', () => {
  try {
    const escalaCss = 0.7; // celular em pé
    definirRazaoDePixels(1);
    const em1x = escalaDeLeitura(escalaCss * 1);
    for (const razao of [1.5, 2, 2.6, 3]) {
      definirRazaoDePixels(razao);
      assert.ok(Math.abs(escalaDeLeitura(escalaCss * razao) - em1x) < 1e-9, `razão ${razao}`);
    }
    assert.ok(em1x > 1.5, `celular em pé deve ampliar bastante (${em1x.toFixed(2)}x)`);
    definirRazaoDePixels(2);
    assert.equal(escalaDeLeitura(1.42 * 2), 1, 'desktop 2x (retina) não é ampliado');
    definirRazaoDePixels(-1);
    assert.equal(escalaDeLeitura(0.7), Math.min(1.6, 1.15 / 0.7), 'razão inválida vale 1');
  } finally {
    definirRazaoDePixels(1);
  }
});

test('placas: sem conflito, entra; com conflito, fica a rua com mais hidrômetros', () => {
  const lista = [];
  assert.equal(adicionarPlaca(lista, placa('A', L + 40, 8), L), true);
  assert.equal(adicionarPlaca(lista, placa('pequena', L + 40 - 100, 3), L), false, 'rua menor sobre a maior: descartada');
  assert.deepEqual(nomes(lista), ['A']);
  assert.equal(adicionarPlaca(lista, placa('empate', L + 40, 8), L), false, 'empate fica com a mais antiga');
  assert.equal(adicionarPlaca(lista, placa('maior', L + 40, 20), L), true);
  assert.deepEqual(nomes(lista), ['maior'], 'a antiga ainda estava fora da tela: some sem ninguém ver');
});

test('placas: uma placa já visível não some; a rua mais importante vai para depois dela, sem sobrepor', () => {
  const lista = [placa('visivel', L - 200, 4)];
  assert.equal(adicionarPlaca(lista, placa('grande', L + 40, 30), L), true);
  assert.deepEqual(nomes(lista), ['visivel', 'grande']);
  assert.ok(lista[1].x >= lista[0].x + PLACA.largura + PLACA.folga, 'a nova começa depois do fim da visível');
});

test('placas: de várias ruas curtas seguidas sobra só a mais importante', () => {
  const lista = [];
  let x = L + 40;
  for (const [nome, total] of [['a', 2], ['b', 5], ['c', 3], ['d', 9], ['e', 4]]) {
    adicionarPlaca(lista, placa(nome, x, total), L);
    x -= 60; // o mundo anda entre uma rua e outra; todas ainda fora da tela ou encostadas
    for (const p of lista) p.x -= 60;
    x = L + 40;
  }
  assert.deepEqual(nomes(lista), ['d']);
});

test('placas: em 500 sorteios nenhuma placa cobre outra', () => {
  const rng = criarPrng(11);
  const lista = [];
  for (let i = 0; i < 500; i++) {
    const andou = rng() * 220;   // o mundo anda igual para todas as placas
    for (const p of lista) p.x -= andou;
    lista.splice(0, lista.length, ...lista.filter((p) => p.x > -400));
    adicionarPlaca(lista, placa(`rua ${i}`, L + 40, 1 + Math.floor(rng() * 30)), L);
    const ordenadas = [...lista].sort((a, b) => a.x - b.x);
    for (let j = 1; j < ordenadas.length; j++) {
      assert.ok(ordenadas[j].x - ordenadas[j - 1].x >= PLACA.largura + PLACA.folga - 1e-6, `sobreposição no passo ${i}`);
    }
  }
});

test('placas: nas fases mais avançadas, jogando a rota inteira, nunca há duas placas sobrepostas', () => {
  for (const [faseIdx, semente] of [[3, 5], [4, 6]]) {
    let pares = 0;
    let maxSimultaneas = 0;
    const { sim } = jogar({
      faseIdx, semente, perfil: 'perfeito',
      aoQuadro: (s) => {
        const ordenadas = [...s.placas].sort((a, b) => a.x - b.x);
        maxSimultaneas = Math.max(maxSimultaneas, ordenadas.filter((p) => p.x < s.mundo.L && p.x > -PLACA.largura).length);
        for (let i = 1; i < ordenadas.length; i++) if (ordenadas[i].x - ordenadas[i - 1].x < PLACA.largura + PLACA.folga - 1e-6) pares += 1;
      }
    });
    assert.equal(sim.estagio, 'concluida', `fase ${faseIdx + 1}`);
    assert.equal(pares, 0, `fase ${faseIdx + 1}: ${pares} quadros com placas sobrepostas`);
    assert.ok(maxSimultaneas <= 3, `fase ${faseIdx + 1}: ${maxSimultaneas} placas na tela ao mesmo tempo`);
  }
});

test('placas: o nome vai para duas linhas equilibradas quando não cabe em uma', () => {
  assert.deepEqual(dividirNome('Anésia'), ['Anésia']);
  const [a, b] = dividirNome('Avenida Aniger Francisco Maria Melillo');
  assert.equal(`${a} ${b}`, 'Avenida Aniger Francisco Maria Melillo');
  assert.ok(a.length > 0 && b.length > 0 && Math.abs(a.length - b.length) <= 12, `${a} | ${b}`);
});

test('cena final: o cão é desenhado menor que na corrida, na proporção dos quadros compostos', () => {
  assert.ok(FATOR_CAO_NA_CENA >= 0.6 && FATOR_CAO_NA_CENA <= 0.75, `${FATOR_CAO_NA_CENA}`);
  const cachorroSentadoNaCorrida = 88.3;   // u (medido no atlas cao-acoes)
  const cachorroSentadoNoComposto = 54.8;  // u (cena-final, quadro da mão estendida)
  const proporcao = (cachorroSentadoNaCorrida * FATOR_CAO_NA_CENA) / cachorroSentadoNoComposto;
  assert.ok(proporcao > 0.95 && proporcao < 1.2, `o cão avulso na cena fica ${proporcao.toFixed(2)}x o do quadro composto`);
});

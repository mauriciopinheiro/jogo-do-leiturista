import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLHA, KOMBI, GESTOS, SEQUENCIAS, quadroPorTempo, escolherQuadroKombi, escolherQuadroLeiturista,
  reacaoDoEvento, poseDoEstagio, olhandoParaTras, caoNoEncerramento
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

const menino = { pose: 'corre', reacao: null, fase: 0, noAr: false, vy: 0, alt: 0, machucado: false, amassando: false, tempo: 0 };
const gesto = (extra) => escolherQuadroLeiturista({ ...menino, ...extra });

test('gestos: cada evento do jogo pede o gesto certo e eventos sem gesto não pedem nada', () => {
  assert.deepEqual(reacaoDoEvento({ tipo: 'leitura', perfeita: true }), { pose: 'soco', duracao: 0.4 });
  assert.equal(reacaoDoEvento({ tipo: 'leitura', ouro: true }).pose, 'joinha');
  assert.equal(reacaoDoEvento({ tipo: 'leitura', anomalia: true }).pose, 'joinha');
  assert.equal(reacaoDoEvento({ tipo: 'leitura' }).pose, 'scan');
  assert.equal(reacaoDoEvento({ tipo: 'powerup', qual: 'turbo' }).pose, 'turbo');
  assert.equal(reacaoDoEvento({ tipo: 'powerup', qual: 'escudo' }).pose, 'escudo');
  assert.equal(reacaoDoEvento({ tipo: 'powerup', qual: 'osso' }), null, 'o osso é reação do cão, não do menino');
  assert.equal(reacaoDoEvento({ tipo: 'escudo-bloqueou' }).pose, 'escudo');
  assert.equal(reacaoDoEvento({ tipo: 'latido' }).pose, 'olhaTras');
  for (const tipo of ['pulo', 'colisao', 'rua-concluida', 'aviso']) assert.equal(reacaoDoEvento({ tipo }), null, tipo);
  for (const t of ['leitura', 'powerup', 'escudo-bloqueou', 'latido']) {
    const r = reacaoDoEvento({ tipo: t, qual: 'turbo', perfeita: false });
    if (r) assert.ok(r.duracao > 0.1 && r.duracao < 0.6, `${t}: ${r.duracao} s (gesto curto, não pode congelar a corrida)`);
  }
});

test('gestos: valem no chão; no ar só o soco e o escudo; o tropeço vence todos', () => {
  assert.deepEqual(gesto({ reacao: 'scan' }), { folha: FOLHA.gestos, quadro: GESTOS.scan });
  assert.deepEqual(gesto({ reacao: 'soco', noAr: true, vy: 300, alt: 90 }), { folha: FOLHA.gestos, quadro: GESTOS.soco });
  assert.deepEqual(gesto({ reacao: 'escudo', noAr: true, vy: 0, alt: 60 }), { folha: FOLHA.gestos, quadro: GESTOS.escudo });
  assert.equal(gesto({ reacao: 'scan', noAr: true, vy: 300, alt: 90 }).folha, FOLHA.pulo, 'escanear não interrompe o pulo');
  assert.equal(gesto({ reacao: 'turbo', noAr: true, vy: 300, alt: 90 }).folha, FOLHA.pulo);
  assert.equal(gesto({ reacao: 'soco', machucado: true }).folha, FOLHA.acoesL, 'bater num obstáculo mostra o tropeço');
  assert.equal(gesto({ pose: 'acena' }).quadro, GESTOS.acena);
  assert.equal(gesto({ pose: 'festa' }).quadro, GESTOS.festa);
  assert.equal(gesto({ pose: 'corre' }).folha, FOLHA.corrida);
});

test('gestos: poses que vêm do estágio da partida e o olhar para trás com a ameaça alta', () => {
  assert.equal(poseDoEstagio('abertura', 'partida'), 'acena');
  assert.equal(poseDoEstagio('abertura', 'cao'), 'olhaTras');
  assert.equal(poseDoEstagio('encerramento', 'chegada'), 'festa');
  for (const [e, s] of [['corrida', ''], ['abertura', 'desembarque'], ['encerramento', 'embarque'], ['derrota', '']]) assert.equal(poseDoEstagio(e, s), 'corre', `${e}/${s}`);
  assert.equal(olhandoParaTras(80, 0.1), true);
  assert.equal(olhandoParaTras(80, 0.5), false, 'só uma olhadela curta');
  assert.equal(olhandoParaTras(80, 1.85), true, 'e repete');
  assert.equal(olhandoParaTras(50, 0.1), false, 'com a ameaça baixa não olha');
});

test('gestos: todos os índices existem na folha', () => {
  const meta = SPRITES.folhas[FOLHA.gestos];
  assert.equal(meta.quadros, 8);
  for (const [nome, i] of Object.entries(GESTOS)) assert.ok(i >= 0 && i < meta.quadros, nome);
});

test('no fim da rota o cão espera sentado e fica contente quando o menino entra na Kombi', () => {
  assert.deepEqual(caoNoEncerramento('corrida', ''), { sentado: false, feliz: false });
  assert.deepEqual(caoNoEncerramento('abertura', 'cao'), { sentado: false, feliz: false });
  assert.deepEqual(caoNoEncerramento('encerramento', 'chegada'), { sentado: true, feliz: false });
  assert.deepEqual(caoNoEncerramento('encerramento', 'embarque'), { sentado: true, feliz: false });
  assert.deepEqual(caoNoEncerramento('encerramento', 'entrando'), { sentado: true, feliz: true });
  assert.deepEqual(caoNoEncerramento('encerramento', 'saida'), { sentado: true, feliz: true });
});

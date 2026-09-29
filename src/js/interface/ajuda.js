/**
 * @file ajuda.js
 * @description Tela "Como jogar" com regras e legenda de símbolos. Os ícones da legenda são
 * desenhados com as mesmas funções do jogo, então nunca ficam diferentes do que aparece na corrida.
 */
import { desenharCao } from '../render/sprites/cao.js';
import { pintarBaseMedidor } from '../render/sprites/medidor.js';
import { pintarBasePowerup } from '../render/sprites/powerups.js';
import { pintarObstaculoBase } from '../render/sprites/obstaculos.js';
import { pintarCaoIlustrado } from '../render/ilustracoes/pintura.js';
import { LIMITE_ANOMALIA } from '../config/constantes.js';

const REGRAS = [
  ['Pular', 'Toque ou clique curto faz um pulo baixo; segure para um pulo alto. No teclado: Espaço, ↑ ou W.'],
  ['Objetivo', 'Leia todos os hidrômetros da rota antes que o cão alcance você. Cada rua concluída afasta o cão.'],
  ['Coleta aérea', 'Pegue o hidrômetro no ponto mais alto do pulo: vale +50 pontos e enche o Flow mais rápido.'],
  ['Anomalia', `O número no hidrômetro é o consumo médio dos últimos 3 meses (m³). Acima de ${LIMITE_ANOMALIA} m³ é uma possível anomalia (+75).`],
  ['Flow', 'Leituras seguidas enchem a barra FLOW. Quando estiver cheia, pule para ativar: proteção e bônus de 1,5× por 6 segundos.'],
  ['Pausa e som', 'Tecla P ou Esc pausa. M liga/desliga a música e S os efeitos.']
];

const LEGENDA = [
  ['medidor', 'Hidrômetro', 'Toque nele para fazer a leitura.', 'comum'],
  ['medidor', 'Hidrômetro ouro', 'Vale mais pontos e enche o Flow.', 'ouro'],
  ['power', 'Turbo', 'Mais velocidade e pontos por 5 segundos.', 'turbo'],
  ['power', 'Escudo', 'Bloqueia uma batida.', 'escudo'],
  ['power', 'Osso', 'Distrai o cão e o afasta.', 'osso'],
  ['obst', 'Cone', 'Pule por cima.', 'cone', 42, 52],
  ['obst', 'Mangueira', 'Pule por cima.', 'mangueira', 92, 22],
  ['obst', 'Lixeira', 'Pule alto.', 'lixeira', 52, 65],
  ['obst', 'Poça', 'Pule por cima.', 'poca', 96, 14],
  ['obst', 'Barreira', 'Pule alto.', 'barreira', 70, 74],
  ['obst', 'Caixote', 'Pule alto.', 'caixote', 58, 58],
  ['cao', 'O cão', 'Cada batida o aproxima. Na barra, leia: Seguro, Alerta, Perigo, Investida.']
];

/** O cão da legenda: ilustração quando pronta, senão o desenho vetorial. */
function desenharCaoDaLegenda(c) {
  const ctx = c.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.setTransform(1.15, 0, 0, 1.15, 62, 88);
  if (pintarCaoIlustrado(ctx, 1.15, { x: 0, y: 0, fase: 0, tempo: 0 })) return;
  ctx.setTransform(1.3, 0, 0, 1.3, 14, 20);
  desenharCao(ctx, { fase: 0.6, boca: false, tempo: 0 });
}

function icone(doc, tipo, dados) {
  const c = doc.createElement('canvas');
  c.width = 128;
  c.height = 96;
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d');
  if (tipo === 'medidor') {
    ctx.setTransform(1.4, 0, 0, 1.4, 64, 48);
    pintarBaseMedidor(ctx, dados[3], 1.4);
  } else if (tipo === 'power') {
    ctx.setTransform(1.5, 0, 0, 1.5, 64, 48);
    pintarBasePowerup(ctx, dados[3], 1.5);
  } else if (tipo === 'obst') {
    const [, , , forma, w, h] = dados;
    const escala = Math.min(100 / w, 70 / h, 1.6);
    ctx.setTransform(escala, 0, 0, escala, 64 - (w * escala) / 2, 52 - (h * escala) / 2);
    pintarObstaculoBase(ctx, forma, w, h, escala);
  } else {
    desenharCaoDaLegenda(c);
    c.dataset.cao = '1';
  }
  return c;
}

/** @returns {()=>void} redesenha o cão da legenda (chamado quando as ilustrações terminam de carregar) */
export function montarAjuda(el) {
  const doc = el.ajudaRegras.ownerDocument;
  el.ajudaRegras.replaceChildren(...REGRAS.map(([titulo, texto]) => {
    const li = doc.createElement('li');
    const b = doc.createElement('b');
    b.textContent = titulo;
    li.append(b, texto);
    return li;
  }));
  el.ajudaLegenda.replaceChildren(...LEGENDA.map((dados) => {
    const li = doc.createElement('li');
    const info = doc.createElement('div');
    const nome = doc.createElement('b');
    nome.textContent = dados[1];
    const desc = doc.createElement('span');
    desc.textContent = dados[2];
    info.append(nome, desc);
    li.append(icone(doc, dados[0], dados), info);
    return li;
  }));
  return () => el.ajudaLegenda.querySelectorAll('canvas[data-cao]').forEach(desenharCaoDaLegenda);
}

/**
 * @file leiturista.js
 * @description Desenho do leiturista do SEMAE (caixa 45x78, pé em y=78, virado para a direita).
 * Poses: corrida, parado, ajoelhado, afagando, colocando a tigela, andando (com ou sem cão).
 */
import { arredondado, circulo, linha, elipse, misturarCor } from '../primitivas.js';
import { UNIFORME } from '../../config/uniformes.js';
import { braco, pernaAjoelhada, pernaDeCorrida, pernaNoAr } from './membros.js';

const PELE = '#d9a877';
const PELE_SOMBRA = '#b98559';
const CABELO = '#3b2a1e';

function perna(ctx, p, cor) {
  ctx.lineJoin = 'round';
  linha(ctx, p.quadril.x, p.quadril.y, p.joelho.x, p.joelho.y, cor, 8.5);
  linha(ctx, p.joelho.x, p.joelho.y, p.pe.x, p.pe.y, cor, 8);
  elipse(ctx, p.pe.x + 2.5, p.pe.y + 1.2, 6.2, 3.6, '#f8fafc');
  elipse(ctx, p.pe.x + 2.5, p.pe.y + 3.4, 6.2, 1.6, '#1e293b');
}

function dispositivo(ctx, x, y) {
  arredondado(ctx, x - 1, y - 2, 12, 18, 3, '#0f172a');
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(x + 0.8, y, 8.4, 13.5);
  ctx.fillStyle = '#168821';
  ctx.fillRect(x + 2, y + 2, 6, 2.6);
  ctx.fillStyle = '#0c326f';
  ctx.fillRect(x + 2, y + 6, 6, 1.3);
  ctx.fillRect(x + 2, y + 8.6, 4, 1.3);
}

function tronco(ctx, u) {
  const g = ctx.createLinearGradient(0, 22, 0, 60);
  g.addColorStop(0, misturarCor(u.camisa, '#ffffff', 0.18));
  g.addColorStop(1, u.camisa);
  arredondado(ctx, 7, 22, 34, 38, 10, g);
  ctx.fillStyle = u.faixa;
  ctx.fillRect(7.5, 42, 33, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillRect(7.5, 44, 33, 1.2);
  ctx.beginPath();
  ctx.moveTo(19, 22.5);
  ctx.lineTo(24, 31);
  ctx.lineTo(29, 22.5);
  ctx.closePath();
  ctx.fillStyle = PELE_SOMBRA;
  ctx.fill();
  circulo(ctx, 32, 33, 3.4, '#f8fafc');
  ctx.fillStyle = '#1351B4';
  ctx.beginPath();
  ctx.moveTo(32, 30.6);
  ctx.quadraticCurveTo(34.4, 33.4, 32, 35);
  ctx.quadraticCurveTo(29.6, 33.4, 32, 30.6);
  ctx.fill();
}

function cabeca(ctx, u, inclinacao, olhoFechado) {
  ctx.save();
  ctx.translate(25, 11);
  ctx.rotate(inclinacao);
  elipse(ctx, -9, 3, 5.5, 7, CABELO);
  circulo(ctx, 0, 0, 13, PELE);
  circulo(ctx, -11, 2, 3.2, PELE_SOMBRA);
  ctx.beginPath();
  ctx.arc(-1, -3, 14, Math.PI, Math.PI * 2);
  ctx.fillStyle = u.bone;
  ctx.fill();
  arredondado(ctx, 2, -6, 21, 5.5, 2.6, misturarCor(u.bone, '#000000', 0.22));
  circulo(ctx, 8, -9, 2.6, '#f8fafc');
  if (olhoFechado) linha(ctx, 6, 3, 10.5, 3, '#2a1a10', 1.8);
  else { circulo(ctx, 8.5, 3, 2.3, '#ffffff'); circulo(ctx, 9.2, 3.2, 1.5, '#1e1510'); }
  ctx.beginPath();
  ctx.arc(9, 8, 3.2, 0.15, Math.PI - 0.5);
  ctx.strokeStyle = '#7a3b26';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx já transladado para o canto superior esquerdo da caixa
 * @param {object} o { uniforme, fase, noAr, vy, pose, inclinacao, olhoFechado }
 */
export function desenharLeiturista(ctx, o) {
  const u = o.uniforme || UNIFORME;
  const ajoelhado = o.pose === 'ajoelhado' || o.pose === 'afaga' || o.pose === 'tigela';
  const quadrilY = ajoelhado ? 58 : 57;
  const traseiro = { x: 18, y: quadrilY };
  const dianteiro = { x: 29, y: quadrilY };
  const calc = (q, contra, frente) => {
    if (ajoelhado) return { quadril: q, ...pernaAjoelhada(q, frente) };
    if (o.noAr) return { quadril: q, ...pernaNoAr(q, o.vy, frente) };
    if (o.pose === 'parado') return { quadril: q, joelho: { x: q.x, y: q.y + 10 }, pe: { x: q.x + (frente ? 1 : -1), y: q.y + 20 } };
    return { quadril: q, ...pernaDeCorrida(q, o.fase + (contra ? Math.PI : 0), o.pose === 'anda' ? 0.5 : 0.72) };
  };
  perna(ctx, calc(traseiro, true, false), misturarCor(u.calca, '#000000', 0.25));
  perna(ctx, calc(dianteiro, false, true), u.calca);

  const balanco = o.noAr ? 0 : Math.sin(o.fase) * 0.9;
  const ombroTras = { x: 13, y: 30 };
  const ombro = { x: 34, y: 30 };
  const bracoTras = braco(ombroTras, o.noAr ? -0.5 : -balanco, 0.5);
  linha(ctx, ombroTras.x, ombroTras.y, bracoTras.cotovelo.x, bracoTras.cotovelo.y, misturarCor(u.camisa, '#000000', 0.3), 6.5);
  linha(ctx, bracoTras.cotovelo.x, bracoTras.cotovelo.y, bracoTras.mao.x, bracoTras.mao.y, PELE_SOMBRA, 5);
  arredondado(ctx, 0, 30, 11, 20, 4, misturarCor(u.camisa, '#000000', 0.35));
  tronco(ctx, u);
  cabeca(ctx, u, o.inclinacao || 0, o.olhoFechado);

  let angulo = o.noAr ? 1.2 : balanco;
  let dobra = 0.6;
  if (o.pose === 'afaga') { angulo = 1.5; dobra = 0.1; } else if (o.pose === 'tigela') { angulo = 0.5; dobra = 0.5; }
  const frente = braco(ombro, angulo, dobra);
  linha(ctx, ombro.x, ombro.y, frente.cotovelo.x, frente.cotovelo.y, u.camisa, 7);
  linha(ctx, frente.cotovelo.x, frente.cotovelo.y, frente.mao.x, frente.mao.y, PELE, 5.4);
  circulo(ctx, frente.mao.x, frente.mao.y, 3.2, PELE);
  if (!ajoelhado) dispositivo(ctx, frente.mao.x - 3, frente.mao.y - 8);
  return frente.mao;
}

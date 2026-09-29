/**
 * @file menu.js
 * @description Tela inicial: seleção de rota, detalhes, botões conforme o progresso e prévia do
 * uniforme. O DOM só é reconstruído quando muda a seleção ou o progresso.
 */
import { ROTAS_SEMAE } from '../config/rotas.js';
import { UNIFORMES } from '../config/uniformes.js';
import { formatarInteiro } from '../nucleo/util.js';
import { desenharLeiturista } from '../render/sprites/leiturista.js';

const SVG = (id) => `<svg class="icone cadeado" aria-hidden="true"><use href="#${id}"/></svg>`;

function desenharPrevia(canvas, uniformeIdx) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const escala = canvas.height / 88;
  ctx.setTransform(escala, 0, 0, escala, (canvas.width - 45 * escala) / 2, 5 * escala);
  desenharLeiturista(ctx, { uniforme: UNIFORMES[uniformeIdx], fase: 0, noAr: false, vy: 0, pose: 'parado' });
}

export function criarMenu(el, { aoEscolherRota }) {
  let selecionada = 0;
  const doc = el.rotasChips.ownerDocument;

  function chip(idx, progresso) {
    const rota = ROTAS_SEMAE[idx];
    const liberada = idx + 1 <= progresso.faseMaxLiberada;
    const concluida = Boolean(progresso.resultadosFases[idx]);
    const b = doc.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.disabled = !liberada;
    b.setAttribute('aria-pressed', String(idx === selecionada));
    b.setAttribute('aria-label', `Fase ${idx + 1}, ${rota.bairro}, ${rota.totalHidrometros} hidrômetros${concluida ? ', concluída' : ''}${liberada ? '' : ', bloqueada'}`);
    b.innerHTML = liberada
      ? `<b>${idx + 1}</b><small>${rota.totalHidrometros} hidr.</small>${concluida ? '<span class="concluida" aria-hidden="true">✓</span>' : ''}`
      : `<b>${idx + 1}</b>${SVG('i-cadeado')}`;
    if (liberada) b.addEventListener('click', () => aoEscolherRota(idx));
    return b;
  }

  function detalhe(progresso) {
    const rota = ROTAS_SEMAE[selecionada];
    const recorde = progresso.melhorPorFase[selecionada] || 0;
    el.rotaDetalhe.innerHTML = '';
    const linha = (classe, texto, tag = 'div') => {
      const n = doc.createElement(tag);
      n.className = classe;
      n.textContent = texto;
      el.rotaDetalhe.appendChild(n);
    };
    linha('', rota.nomeFase, 'h3');
    linha('meta', `Setor ${rota.setor} · Rota ${rota.rota} · ${rota.totalHidrometros} hidrômetros · ${rota.ruas.length} ruas`);
    linha('ruas', rota.ruas.map((r) => r.nome).join(' · '));
    linha('recorde', recorde > 0 ? `Recorde: ${formatarInteiro(recorde)} pontos` : 'Ainda sem recorde nesta rota');
  }

  return {
    get selecionada() { return selecionada; },
    selecionar(idx) { selecionada = idx; },
    atualizar(progresso, temPartida) {
      selecionada = Math.min(selecionada, progresso.faseMaxLiberada - 1);
      el.rotasChips.replaceChildren(...ROTAS_SEMAE.map((_, i) => chip(i, progresso)));
      detalhe(progresso);
      el.btnContinuar.hidden = !temPartida;
      el.btnInfinito.hidden = !progresso.campanhaConcluida;
      el.btnRever.hidden = !progresso.campanhaConcluida;
      el.btnIniciar.textContent = `Iniciar Fase ${selecionada + 1} ▶`;
      el.btnMusica.setAttribute('aria-pressed', String(progresso.musica));
      el.btnEfeitos.setAttribute('aria-pressed', String(progresso.efeitos));
      const u = UNIFORMES[progresso.uniforme];
      el.btnUniforme.setAttribute('aria-label', `Uniforme: ${u.nome}. Toque para trocar. ${progresso.leiturasVitalicias} leituras vitalícias.`);
      desenharPrevia(el.prevUniforme, progresso.uniforme);
    }
  };
}

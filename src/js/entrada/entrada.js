/**
 * @file entrada.js
 * @description Ponteiro (toque/mouse/caneta) e teclado. O jogo só conhece duas ações: pressionar
 * e soltar (o pulo alto/baixo depende da duração), além de atalhos de pausa e áudio.
 */

/**
 * @param {{palco:HTMLElement, documento:Document, acoes:{pressionar:()=>void, soltar:()=>void,
 *   pausar:()=>void, musica:()=>void, efeitos:()=>void, jogando:()=>boolean, emCena:()=>boolean,
 *   avancarCena:()=>void}}} deps
 */
export function ligarEntrada({ palco, documento, acoes }) {
  const ponteirosAtivos = new Set();

  palco.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { palco.setPointerCapture(e.pointerId); } catch { /* ponteiro já liberado */ }
    ponteirosAtivos.add(e.pointerId);
    acoes.pressionar();
  }, { passive: false });

  const liberar = (e) => {
    if (!ponteirosAtivos.delete(e.pointerId)) return;
    try { palco.releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
    if (ponteirosAtivos.size === 0) acoes.soltar();
  };
  palco.addEventListener('pointerup', liberar);
  palco.addEventListener('pointercancel', liberar);
  palco.addEventListener('lostpointercapture', liberar);
  palco.addEventListener('contextmenu', (e) => e.preventDefault());

  const teclasPulo = new Set([' ', 'arrowup', 'w']);
  documento.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tecla = e.key.toLowerCase();
    if (acoes.emCena()) {
      if (tecla === ' ' || tecla === 'enter') { e.preventDefault(); acoes.avancarCena(); }
      return;
    }
    if (acoes.jogando()) {
      if (teclasPulo.has(tecla)) { e.preventDefault(); if (!e.repeat) acoes.pressionar(); return; }
      if (tecla === 'p' || tecla === 'escape') { e.preventDefault(); if (!e.repeat) acoes.pausar(); return; }
    }
    if (e.repeat || e.target.closest?.('input,textarea,select')) return;
    if (tecla === 'm') acoes.musica();
    else if (tecla === 's') acoes.efeitos();
  });
  documento.addEventListener('keyup', (e) => {
    if (!teclasPulo.has(e.key.toLowerCase()) || !acoes.jogando()) return;
    e.preventDefault();
    acoes.soltar();
  });
}

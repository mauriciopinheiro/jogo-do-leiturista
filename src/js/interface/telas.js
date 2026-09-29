/**
 * @file telas.js
 * @description Controla qual painel está aberto (menu, pausa, resultado, ajuda) e o foco.
 */

const FOCO_INICIAL = { menu: 'btnIniciar', pausa: 'btnRetomar', resultado: 'btnResPrimario', ajuda: 'btnAjudaFechar' };

export function criarTelas(el) {
  const paineis = { menu: el.telaMenu, pausa: el.telaPausa, resultado: el.telaResultado, ajuda: el.telaAjuda };
  let atual = 'menu';
  let anterior = 'menu';

  return {
    get atual() { return atual; },
    /** Mostra um painel e esconde os demais. `null` mostra só o jogo. */
    mostrar(nome) {
      for (const [chave, painel] of Object.entries(paineis)) painel.hidden = chave !== nome;
      if (nome) {
        if (atual !== nome) anterior = atual;
        atual = nome;
        const alvo = el[FOCO_INICIAL[nome]];
        requestAnimationFrame(() => alvo && !alvo.hidden && alvo.focus({ preventScroll: true }));
      } else {
        anterior = atual;
        atual = 'jogo';
        el.palco.focus({ preventScroll: true });
      }
    },
    /** Fecha a ajuda e volta ao painel de onde ela foi aberta. */
    voltar() {
      const destino = anterior && anterior !== 'ajuda' && anterior !== 'jogo' ? anterior : 'menu';
      this.mostrar(destino);
    }
  };
}

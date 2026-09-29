/**
 * @file dom.js
 * @description Referências aos elementos da página (buscadas uma única vez).
 */

const IDS = [
  'app', 'palco', 'hud', 'hudSelo', 'hudRua', 'hudBairro', 'hudPontos', 'hudRuaContagem', 'hudRotaContagem',
  'hudCombo', 'hudAmeacaBarra', 'hudAmeaca', 'hudAmeacaTexto', 'hudFlow', 'hudFlowBarra', 'controles',
  'btnPausa', 'faixa', 'faixaTitulo', 'faixaSub', 'dica', 'telaMenu', 'rotasChips', 'rotaDetalhe',
  'btnContinuar', 'btnIniciar', 'btnInfinito', 'btnMusica', 'btnEfeitos',
  'btnAjuda', 'btnRever', 'btnExportar', 'btnImportar', 'inputImportar', 'versao',
  'telaPausa', 'btnRetomar', 'btnReiniciar', 'btnPausaAjuda', 'btnPausaMenu', 'telaResultado',
  'resTitulo', 'resSub', 'resResumo', 'resMedalhas', 'resDica', 'resPremios', 'btnResPrimario',
  'btnResSecundario', 'btnResMenu', 'telaAjuda', 'ajudaRegras', 'ajudaLegenda', 'btnAjudaFechar',
  'avisos', 'anuncio'
];

/** @param {Document} documento */
export function obterElementos(documento) {
  const el = {};
  for (const id of IDS) {
    el[id] = documento.getElementById(id);
    if (!el[id]) throw new Error(`Elemento #${id} não encontrado na página`);
  }
  return el;
}

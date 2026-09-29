/**
 * @file uniformes.js
 * @description Uniforme único do leiturista, na cor oficial do SEMAE: o azul do logotipo
 * (#005E9F, mediana dos pixels azuis de Logo_completo.png). As ilustrações já trazem essa cor
 * (scripts/sprites/uniforme.py); os valores abaixo servem ao desenho vetorial de reserva.
 */
export const AZUL_SEMAE = '#005E9F';

export const UNIFORME = {
  nome: 'Uniforme SEMAE',
  camisa: AZUL_SEMAE,
  calca: '#00385F',
  bone: '#004A7C',
  faixa: '#FFCD07'
};

/** A v3.4.0 gravava o índice de 5 uniformes no save (`selectedSkin`, 0 a 4); hoje só é aceito e ignorado. */
export const UNIFORMES_DA_V3 = 5;

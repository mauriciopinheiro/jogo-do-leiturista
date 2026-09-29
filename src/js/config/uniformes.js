/**
 * @file uniformes.js
 * @description Uniformes do leiturista, liberados pelo total de leituras vitalícias.
 */

export const UNIFORMES = [
  { nome: 'Azul SEMAE Clássico', exige: 0, camisa: '#1351B4', calca: '#0C326F', bone: '#083F73', faixa: '#FFCD07', rastro: '#37a8e8' },
  { nome: 'Colete Amarelo Operacional', exige: 25, camisa: '#f0b429', calca: '#0C326F', bone: '#1351B4', faixa: '#ffffff', rastro: '#ffe36d' },
  { nome: 'Boné Vermelho ETE', exige: 60, camisa: '#147a5b', calca: '#0e4a37', bone: '#d84242', faixa: '#ffffff', rastro: '#ff7a69' },
  { nome: 'Equipe Verde Meio Ambiente', exige: 120, camisa: '#2a9d58', calca: '#17324d', bone: '#1351B4', faixa: '#FFCD07', rastro: '#69db8b' },
  { nome: 'Refletivo Noturno SEMAE', exige: 250, camisa: '#263a50', calca: '#111b27', bone: '#f4d35e', faixa: '#5FDCF2', rastro: '#d8f3ff' }
];

/** Índices dos uniformes já liberados para o total de leituras informado. */
export function uniformesLiberados(leituras) {
  return UNIFORMES.map((u, i) => (leituras >= u.exige ? i : -1)).filter((i) => i >= 0);
}

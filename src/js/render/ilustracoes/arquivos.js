/**
 * @file arquivos.js
 * @description Atlas WebP embutidos como data URI pelo build (esbuild, loader dataurl). Único módulo
 * que importa as imagens: os testes de Node não o carregam.
 */
import corrida from '../../../assets/leiturista-corrida.webp';
import acoesL from '../../../assets/leiturista-acoes.webp';
import galope from '../../../assets/cao-galope.webp';
import acoesC from '../../../assets/cao-acoes.webp';
import cena from '../../../assets/cena-final.webp';

export const ARQUIVOS = {
  'leiturista-corrida': corrida,
  'leiturista-acoes': acoesL,
  'cao-galope': galope,
  'cao-acoes': acoesC,
  'cena-final': cena
};

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
import pulo from '../../../assets/leiturista-pulo.webp';
import caminhada from '../../../assets/leiturista-caminhada.webp';
import latido from '../../../assets/cao-latido.webp';
import derrota from '../../../assets/derrota.webp';
import kombi from '../../../assets/kombi.webp';
import kombiDescer from '../../../assets/kombi-descer.webp';
import kombiEntrar from '../../../assets/kombi-entrar.webp';

export const ARQUIVOS = {
  'leiturista-corrida': corrida,
  'leiturista-acoes': acoesL,
  'cao-galope': galope,
  'cao-acoes': acoesC,
  'cena-final': cena,
  'leiturista-pulo': pulo,
  'leiturista-caminhada': caminhada,
  'cao-latido': latido,
  derrota,
  kombi,
  'kombi-descer': kombiDescer,
  'kombi-entrar': kombiEntrar
};

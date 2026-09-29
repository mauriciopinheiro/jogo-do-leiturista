/**
 * @file atlas.js
 * @description Carrega os atlas ilustrados, gera as variantes de uniforme (recolorização única por
 * uniforme) e as versões pré-escaladas para a resolução da tela. Enquanto as imagens não estiverem
 * prontas — ou se falharem — `obterQuadro` devolve null e o jogo usa o desenho vetorial.
 */
import { SPRITES } from '../../config/quadros-sprites.js';
import { UNIFORMES } from '../../config/uniformes.js';
import { criarTela } from '../primitivas.js';
import { ARQUIVOS } from './arquivos.js';
import { receitaDoUniforme, recolorirAtlas } from './recolorir.js';

const GRUPOS_COM_UNIFORME = new Set(['leiturista', 'final']);
const estado = { imagens: new Map(), pronta: false, falhou: false, variantes: new Map(), escalados: new Map() };

function carregarImagem(janela, url) {
  return new Promise((resolver, rejeitar) => {
    const img = new janela.Image();
    img.onload = () => resolver(img);
    img.onerror = () => rejeitar(new Error('imagem'));
    img.src = url;
  });
}

/** Carrega tudo em segundo plano; `aoPronto` roda quando as ilustrações passam a valer. */
export function carregarIlustracoes(janela, aoPronto = () => {}) {
  const nomes = Object.keys(ARQUIVOS);
  return Promise.all(nomes.map((nome) => carregarImagem(janela, ARQUIVOS[nome]).then((img) => estado.imagens.set(nome, img))))
    .then(() => { estado.pronta = true; aoPronto(); })
    .catch(() => { estado.falhou = true; });
}

export function ilustracoesProntas() {
  return estado.pronta;
}

/** Fonte de pixels da folha para o uniforme: imagem original ou variante recolorida. */
function fonteDaFolha(nome, uniforme) {
  const meta = SPRITES.folhas[nome];
  const imagem = estado.imagens.get(nome);
  const receita = GRUPOS_COM_UNIFORME.has(meta.grupo) ? receitaDoUniforme(UNIFORMES[uniforme], UNIFORMES[0]) : null;
  if (!receita) return imagem;
  const chave = `${nome}|${uniforme}`;
  let tela = estado.variantes.get(chave);
  if (!tela) {
    tela = criarTela(imagem.naturalWidth, imagem.naturalHeight);
    const ctx = tela.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imagem, 0, 0);
    const dados = ctx.getImageData(0, 0, tela.width, tela.height);
    recolorirAtlas(dados.data, tela.width, tela.height, meta.celula, receita);
    ctx.putImageData(dados, 0, 0);
    estado.variantes.set(chave, tela);
  }
  return tela;
}

/** Atlas reduzido para `k` pixels por unidade, com células de tamanho inteiro (cópia 1:1 depois). */
function atlasEscalado(nome, uniforme, k) {
  const chave = `${nome}|${uniforme}|${k.toFixed(3)}`;
  let atlas = estado.escalados.get(chave);
  if (atlas) return atlas;
  const meta = SPRITES.folhas[nome];
  const porPixel = SPRITES.unidadesPorPixel[meta.grupo];
  const s = Math.min(1, k * porPixel);
  const [cw0, ch0] = meta.celula;
  const cw = Math.max(1, Math.round(cw0 * s));
  const ch = Math.max(1, Math.round(ch0 * s));
  const linhas = Math.ceil(meta.quadros / meta.colunas);
  const tela = criarTela(cw * meta.colunas, ch * linhas);
  const ctx = tela.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  const fonte = fonteDaFolha(nome, uniforme);
  for (let i = 0; i < meta.quadros; i++) {
    const c = i % meta.colunas;
    const l = Math.floor(i / meta.colunas);
    ctx.drawImage(fonte, c * cw0, l * ch0, cw0, ch0, c * cw, l * ch, cw, ch);
  }
  atlas = { tela, cw, ch, u: porPixel / s, px: meta.pivo[0] * s, py: meta.pivo[1] * s };
  estado.escalados.set(chave, atlas);
  return atlas;
}

/**
 * @returns {{tela, sx, sy, cw, ch, u, px, py}|null} `u` = unidades do jogo por pixel do quadro;
 * o pivô (pé) está em (px, py) pixels do quadro.
 */
export function obterQuadro(nome, quadro, uniforme, k) {
  if (!estado.pronta) return null;
  const a = atlasEscalado(nome, uniforme, k);
  const colunas = SPRITES.folhas[nome].colunas;
  return { tela: a.tela, sx: (quadro % colunas) * a.cw, sy: Math.floor(quadro / colunas) * a.ch, cw: a.cw, ch: a.ch, u: a.u, px: a.px, py: a.py };
}

/** Prepara (fora do quadro de jogo) as variantes do uniforme, para não travar ao começar a correr. */
export function prepararUniforme(uniforme, k) {
  if (!estado.pronta) return;
  for (const nome of ['leiturista-corrida', 'leiturista-acoes', 'cena-final']) atlasEscalado(nome, uniforme, k);
}

/** Descarta as versões pré-escaladas (mudou o tamanho da tela); mantém imagens e recolorizações. */
export function limparAtlasEscalados() {
  estado.escalados.clear();
}

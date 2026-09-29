/**
 * @file quadros.js
 * @description Escolha do quadro ilustrado a partir do estado do jogo. Funções puras (sem canvas,
 * sem imagens), por isso testáveis. Ordem dos quadros = ordem das folhas em scripts/preparar_sprites.py.
 */

/** Folhas de quadros: nome do atlas e quantidade de quadros. */
export const FOLHA = {
  corrida: 'leiturista-corrida',
  acoesL: 'leiturista-acoes',
  galope: 'cao-galope',
  acoesC: 'cao-acoes',
  cena: 'cena-final'
};

/** Índices em `leiturista-acoes`. */
export const L_ACAO = { agachado: 0, subindo: 1, descendo: 2, tropeco: 3, parado: 4, piscando: 5, vitoria: 6, curvado: 7 };
/** Índices em `cao-acoes`. */
export const C_ACAO = { late1: 0, late2: 1, sentadoLingua: 2, sentadoFeliz: 3, sentadoOlhando: 4, pulo: 5 };
/** Índices em `cena-final` (leiturista e cão juntos). */
export const CENA = { mao: 0, carinho: 1, tigela: 2, caminhada: 3 };

const QUADROS_CORRIDA = 8;
const QUADROS_GALOPE = 6;
/** Quadros por radiano da fase de perna: a passada fica proporcional à distância percorrida. */
const PASSO_LEITURISTA = 0.2546;
const PASSO_CAO = 0.18;

const modulo = (n, m) => ((n % m) + m) % m;

export function quadroDeCorrida(fase, passo = PASSO_LEITURISTA) {
  return modulo(Math.floor(fase * passo), QUADROS_CORRIDA);
}

export function quadroDeGalope(fase, passo = PASSO_CAO) {
  return modulo(Math.floor(fase * passo), QUADROS_GALOPE);
}

/** Piscadela periódica: 0,16 s de olho fechado a cada 3,4 s. */
export function piscando(tempo) {
  return modulo(tempo, 3.4) > 3.24;
}

/**
 * @param {{pose:string, fase:number, noAr:boolean, vy:number, machucado:boolean, amassando:boolean, tempo:number}} o
 * @returns {{folha:string, quadro:number}}
 */
export function escolherQuadroLeiturista(o) {
  if (o.machucado) return { folha: FOLHA.acoesL, quadro: L_ACAO.tropeco };
  if (o.noAr) return { folha: FOLHA.acoesL, quadro: o.vy > 240 ? L_ACAO.subindo : L_ACAO.descendo };
  if (o.amassando) return { folha: FOLHA.acoesL, quadro: L_ACAO.agachado };
  switch (o.pose) {
    case 'parado': return { folha: FOLHA.acoesL, quadro: piscando(o.tempo || 0) ? L_ACAO.piscando : L_ACAO.parado };
    case 'vitoria': return { folha: FOLHA.acoesL, quadro: L_ACAO.vitoria };
    case 'ajoelhado': return { folha: FOLHA.acoesL, quadro: L_ACAO.curvado };
    case 'mao': return { folha: FOLHA.cena, quadro: CENA.mao };
    case 'afaga': return { folha: FOLHA.cena, quadro: CENA.carinho };
    case 'tigela': return { folha: FOLHA.cena, quadro: CENA.tigela };
    case 'anda': return { folha: FOLHA.corrida, quadro: quadroDeCorrida(o.fase, 0.62) };
    default: return { folha: FOLHA.corrida, quadro: quadroDeCorrida(o.fase) };
  }
}

/**
 * @param {{sentado:boolean, feliz:boolean, latindo:boolean, fase:number, tempo:number}} o
 * @returns {{folha:string, quadro:number}}
 */
export function escolherQuadroCao(o) {
  if (o.sentado) {
    const alternar = Math.floor((o.tempo || 0) * 5) % 2 === 0;
    const quadro = o.feliz ? (alternar ? C_ACAO.sentadoFeliz : C_ACAO.sentadoLingua) : C_ACAO.sentadoOlhando;
    return { folha: FOLHA.acoesC, quadro };
  }
  if (o.latindo) return { folha: FOLHA.acoesC, quadro: Math.floor((o.tempo || 0) * 7) % 2 === 0 ? C_ACAO.late1 : C_ACAO.late2 };
  return { folha: FOLHA.galope, quadro: quadroDeGalope(o.fase) };
}

/** Quadros que já mostram o leiturista e o cão juntos (a cena final desenha só esse). */
export function ehQuadroDeCena(folha) {
  return folha === FOLHA.cena;
}

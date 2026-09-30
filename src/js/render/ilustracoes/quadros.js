/**
 * @file quadros.js
 * @description Escolha do quadro ilustrado a partir do estado do jogo. Funções puras (sem canvas,
 * sem imagens), por isso testáveis. Ordem dos quadros = ordem das folhas em scripts/sprites/folhas.py.
 */

/** Folhas de quadros (nome do atlas). */
export const FOLHA = {
  corrida: 'leiturista-corrida',
  acoesL: 'leiturista-acoes',
  pulo: 'leiturista-pulo',
  caminhada: 'leiturista-caminhada',
  gestos: 'leiturista-gestos',
  galope: 'cao-galope',
  acoesC: 'cao-acoes',
  latido: 'cao-latido',
  cena: 'cena-final',
  derrota: 'derrota',
  kombi: 'kombi',
  kombiDescer: 'kombi-descer',
  kombiEntrar: 'kombi-entrar'
};

/** Índices em `leiturista-acoes`. */
export const L_ACAO = { agachado: 0, subindo: 1, descendo: 2, tropeco: 3, parado: 4, piscando: 5, vitoria: 6, curvado: 7 };
/** Índices em `leiturista-pulo` (um pulo completo, em ordem). */
export const L_PULO = { agachado: 0, decolagem: 1, subindo: 2, quaseTopo: 3, topo: 4, comecaCair: 5, descendo: 6, prestesPisar: 7 };
/** Índices em `leiturista-gestos`: cada gesto tem o nome da pose que o pede. */
export const GESTOS = { scan: 0, joinha: 1, soco: 2, turbo: 3, escudo: 4, acena: 5, festa: 6, olhaTras: 7 };
/** Gestos que valem também com o menino no ar (os outros esperam ele pisar no chão). */
const GESTOS_NO_AR = new Set(['soco', 'escudo']);
/** Índices em `cao-acoes`. */
export const C_ACAO = { late1: 0, late2: 1, sentadoLingua: 2, sentadoFeliz: 3, sentadoOlhando: 4, pulo: 5 };
/** Índices em `cao-latido`. */
export const C_LATIDO = { late1: 0, late2: 1, fareja: 2, pega: 3, trota: 4, roi: 5 };
/** Índices em `cena-final` (leiturista e cão juntos). */
export const CENA = { mao: 0, carinho: 1, tigela: 2, caminhada: 3 };
/** Índices em `kombi`. */
export const KOMBI = { parada: 0, aberta: 1, comprimida: 2, andando: 3 };

const QUADROS_CORRIDA = 8;
const QUADROS_CAMINHADA = 8;
const QUADROS_GALOPE = 6;
/** Quadros por radiano da fase de perna: a passada fica proporcional à distância percorrida. */
const PASSO_CORRIDA = 0.2546;
const PASSO_CAMINHADA = 0.79;
const PASSO_CAO = 0.18;

const modulo = (n, m) => ((n % m) + m) % m;

export function quadroDeCorrida(fase, passo = PASSO_CORRIDA) {
  return modulo(Math.floor(fase * passo), QUADROS_CORRIDA);
}

export function quadroDeCaminhada(fase, passo = PASSO_CAMINHADA) {
  return modulo(Math.floor(fase * passo), QUADROS_CAMINHADA);
}

export function quadroDeGalope(fase, passo = PASSO_CAO) {
  return modulo(Math.floor(fase * passo), QUADROS_GALOPE);
}

/** Piscadela periódica: 0,16 s de olho fechado a cada 3,4 s. */
export function piscando(tempo) {
  return modulo(tempo, 3.4) > 3.24;
}

/**
 * Quadro do pulo pela velocidade vertical (u/s, positiva subindo) e pela altura do pé (u).
 * Pulo alto: decolagem -> subida -> topo -> queda; pulo baixo (toque curto) usa só o miolo da sequência.
 */
export function quadroDePulo(vy, alt) {
  if (vy > 820) return L_PULO.decolagem;
  if (vy > 500) return L_PULO.subindo;
  if (vy > 180) return L_PULO.quaseTopo;
  if (vy > -180) return L_PULO.topo;
  if (alt < 14) return L_PULO.prestesPisar;
  if (vy > -520) return L_PULO.comecaCair;
  return vy > -900 ? L_PULO.descendo : L_PULO.prestesPisar;
}

/**
 * @param {{pose:string, reacao:(string|null), fase:number, noAr:boolean, vy:number, alt:number, machucado:boolean, amassando:boolean, tempo:number}} o
 * @returns {{folha:string, quadro:number}}
 */
export function escolherQuadroLeiturista(o) {
  if (o.machucado) return { folha: FOLHA.acoesL, quadro: L_ACAO.tropeco };
  const gesto = o.reacao || (o.pose in GESTOS ? o.pose : null);
  if (gesto && (!o.noAr || GESTOS_NO_AR.has(gesto))) return { folha: FOLHA.gestos, quadro: GESTOS[gesto] };
  if (o.noAr) return { folha: FOLHA.pulo, quadro: quadroDePulo(o.vy, o.alt ?? 999) };
  if (o.amassando) return { folha: FOLHA.acoesL, quadro: L_ACAO.agachado };
  switch (o.pose) {
    case 'parado': return { folha: FOLHA.acoesL, quadro: piscando(o.tempo || 0) ? L_ACAO.piscando : L_ACAO.parado };
    case 'vitoria': return { folha: FOLHA.acoesL, quadro: L_ACAO.vitoria };
    case 'ajoelhado': return { folha: FOLHA.acoesL, quadro: L_ACAO.curvado };
    case 'mao': return { folha: FOLHA.cena, quadro: CENA.mao };
    case 'afaga': return { folha: FOLHA.cena, quadro: CENA.carinho };
    case 'tigela': return { folha: FOLHA.cena, quadro: CENA.tigela };
    case 'anda': return { folha: FOLHA.caminhada, quadro: quadroDeCaminhada(o.fase) };
    default: return { folha: FOLHA.corrida, quadro: quadroDeCorrida(o.fase) };
  }
}

/**
 * Reação passageira do menino a um evento da simulação: `{ pose, duracao }` (pose de GESTOS, duração em s) ou null.
 * Leitura perfeita = soco no ar; ouro/anomalia = joinha; leitura comum = escanear; turbo/escudo; latido = olhar para trás.
 */
export function reacaoDoEvento(e) {
  switch (e.tipo) {
    case 'leitura':
      if (e.perfeita) return { pose: 'soco', duracao: 0.4 };
      return e.ouro || e.anomalia ? { pose: 'joinha', duracao: 0.35 } : { pose: 'scan', duracao: 0.16 };
    case 'powerup':
      if (e.qual === 'turbo') return { pose: 'turbo', duracao: 0.45 };
      return e.qual === 'escudo' ? { pose: 'escudo', duracao: 0.4 } : null;
    case 'escudo-bloqueou': return { pose: 'escudo', duracao: 0.45 };
    case 'latido': return { pose: 'olhaTras', duracao: 0.45 };
    default: return null;
  }
}

/** Pose do menino que vem do estágio da partida (e não de um evento): acena para a Kombi que parte, olha o cão chegar, comemora. */
export function poseDoEstagio(estagio, subestagio) {
  if (estagio === 'abertura' && subestagio === 'partida') return 'acena';
  if (estagio === 'abertura' && subestagio === 'cao') return 'olhaTras';
  if (estagio === 'encerramento' && subestagio === 'chegada') return 'festa';
  return 'corre';
}

/** No fim da rota o cão para de correr e espera sentado; fica contente quando o menino entra na Kombi. */
export function caoNoEncerramento(estagio, subestagio) {
  if (estagio !== 'encerramento') return { sentado: false, feliz: false };
  return { sentado: true, feliz: subestagio === 'entrando' || subestagio === 'saida' };
}

/** Com a ameaça alta o menino olha para trás de tempos em tempos (0,3 s a cada 1,8 s). */
export function olhandoParaTras(ameaca, tempo) {
  return ameaca >= 75 && tempo % 1.8 < 0.3;
}

/** Estágio do cão com o osso pelo tempo (s) desde que o osso foi pego; null = acabou. */
export function estagioDoOsso(t) {
  if (t < 0.3) return 0;
  if (t < 0.7) return 1;
  return t < 1.8 ? 2 : null;
}
const QUADRO_DO_OSSO = [C_LATIDO.fareja, C_LATIDO.pega, C_LATIDO.trota];

/**
 * @param {{sentado:boolean, feliz:boolean, latindo:boolean, investindo:boolean, osso:(number|null),
 *   fase:number, tempo:number}} o
 * @returns {{folha:string, quadro:number}}
 */
export function escolherQuadroCao(o) {
  if (o.sentado) {
    const alternar = Math.floor((o.tempo || 0) * 5) % 2 === 0;
    const quadro = o.feliz ? (alternar ? C_ACAO.sentadoFeliz : C_ACAO.sentadoLingua) : C_ACAO.sentadoOlhando;
    return { folha: FOLHA.acoesC, quadro };
  }
  if (o.osso !== undefined && o.osso !== null) return { folha: FOLHA.latido, quadro: QUADRO_DO_OSSO[o.osso] };
  if (o.latindo) return { folha: FOLHA.latido, quadro: Math.floor((o.tempo || 0) * 8) % 2 === 0 ? C_LATIDO.late1 : C_LATIDO.late2 };
  if (o.investindo) return { folha: FOLHA.acoesC, quadro: C_ACAO.pulo };
  return { folha: FOLHA.galope, quadro: quadroDeGalope(o.fase) };
}

/** Quadro (0..n-1 de `quadros`) de uma sequência de duração `duracao` s, no instante `t`. */
export function quadroPorTempo(t, duracao, quadros) {
  const i = Math.floor((Math.max(0, t) / duracao) * quadros.length);
  return quadros[Math.min(quadros.length - 1, i)];
}

/** Sequências com mais de um personagem: folha e quadros (em ordem). A 1ª e 2ª cenas da Kombi só usam 3 quadros. */
export const SEQUENCIAS = {
  descer: { folha: FOLHA.kombiDescer, quadros: [0, 1, 2, 3] },
  entrar: { folha: FOLHA.kombiEntrar, quadros: [1, 2, 3] },
  derrota: { folha: FOLHA.derrota, quadros: [0, 1, 2, 3] }
};

/** Quadro da Kombi sozinha: porta aberta, andando (alterna os dois quadros de rodas) ou parada. */
export function escolherQuadroKombi({ aberta, andando, tempo }) {
  if (aberta) return { folha: FOLHA.kombi, quadro: KOMBI.aberta };
  if (andando) return { folha: FOLHA.kombi, quadro: Math.floor((tempo || 0) * 8) % 2 === 0 ? KOMBI.parada : KOMBI.andando };
  return { folha: FOLHA.kombi, quadro: KOMBI.parada };
}

/** Quadros que já mostram o leiturista e o cão juntos (a cena final desenha só esse). */
export function ehQuadroDeCena(folha) {
  return folha === FOLHA.cena;
}

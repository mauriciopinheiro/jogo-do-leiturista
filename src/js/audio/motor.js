/**
 * @file motor.js
 * @description Motor de áudio sintetizado (Web Audio). O contexto só é criado depois de um gesto
 * do usuário; há compressor no barramento final, canais independentes de música e efeitos e um
 * teto de vozes simultâneas (16 em celular, 32 em computador — CTI §9).
 */

/**
 * @param {{musica:boolean, efeitos:boolean}} preferencias objeto vivo (lido a cada nota)
 * @param {{leve:boolean, contextoDe?:()=>AudioContext|null}} opcoes
 */
export function criarAudio(preferencias, { leve = false, criarContexto } = {}) {
  const limiteVozes = leve ? 16 : 32;
  const fabrica = criarContexto || (() => {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    return AC ? new AC() : null;
  });
  let ctx = null;
  let musica = null;
  let efeitos = null;
  let vozes = [];

  function montar() {
    ctx = fabrica();
    if (!ctx) return;
    musica = ctx.createGain();
    efeitos = ctx.createGain();
    const mestre = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 16;
    compressor.ratio.value = 8;
    mestre.gain.value = 0.72;
    musica.connect(mestre);
    efeitos.connect(mestre);
    mestre.connect(compressor).connect(ctx.destination);
    api.sincronizar();
  }

  const api = {
    get criado() { return ctx !== null; },
    /** Deve ser chamado dentro de um gesto do usuário (toque, clique, tecla). */
    garantir() {
      if (!ctx) montar();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    },
    suspender() { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); },
    retomar() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    sincronizar() {
      if (musica) musica.gain.value = preferencias.musica ? 0.25 : 0;
      if (efeitos) efeitos.gain.value = preferencias.efeitos ? 0.65 : 0;
    },
    /**
     * Toca uma nota curta com envelope (ataque de 4 ms, queda exponencial até zero).
     * @param {number} atraso segundos a partir de agora
     */
    nota(freq, duracao = 0.06, volume = 0.03, tipo = 'sine', deslize = 0, canal = 'efeito', atraso = 0) {
      if (!ctx || ctx.state !== 'running') return;
      if (canal === 'musica' ? !preferencias.musica : !preferencias.efeitos) return;
      const agora = ctx.currentTime;
      vozes = vozes.filter((fim) => fim > agora);
      if (vozes.length >= limiteVozes) return;
      const inicio = agora + atraso;
      const fim = inicio + duracao + 0.02;
      vozes.push(fim);
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, inicio);
      if (deslize) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + deslize), inicio + duracao);
      ganho.gain.setValueAtTime(0.0001, inicio);
      ganho.gain.linearRampToValueAtTime(volume, inicio + 0.004);
      ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
      osc.connect(ganho).connect(canal === 'musica' ? musica : efeitos);
      osc.start(inicio);
      osc.stop(fim);
    }
  };
  return api;
}

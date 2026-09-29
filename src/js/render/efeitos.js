/**
 * @file efeitos.js
 * @description Partículas e textos flutuantes em pools de tamanho fixo (sem alocação por quadro).
 * Traduz eventos da simulação em efeitos. Sem emoji: texto simples desenhado em contorno.
 */

const MAX_PARTICULAS = 56;
const MAX_TEXTOS = 10;

export function criarEfeitos({ reduzirMovimento = false, leve = false } = {}) {
  const limite = leve ? Math.floor(MAX_PARTICULAS / 2) : MAX_PARTICULAS;
  const particulas = Array.from({ length: MAX_PARTICULAS }, () => ({ ativa: false, x: 0, y: 0, vx: 0, vy: 0, vida: 0, total: 1, tam: 2, cor: '#fff' }));
  const textos = Array.from({ length: MAX_TEXTOS }, () => ({ ativa: false, texto: '', x: 0, y: 0, vida: 0, cor: '#fff', grande: false }));
  let ativas = 0;

  function explodir(x, y, cor, quantidade = 10, forte = false) {
    if (reduzirMovimento) return;
    for (const p of particulas) {
      if (quantidade <= 0 || ativas >= limite) break;
      if (p.ativa) continue;
      p.ativa = true;
      p.x = x; p.y = y;
      p.vx = (Math.random() - 0.5) * (forte ? 520 : 360);
      p.vy = -Math.random() * (forte ? 480 : 320) - 40;
      p.total = p.vida = 0.45 + Math.random() * 0.45;
      p.tam = 2.2 + Math.random() * (forte ? 3.4 : 2.4);
      p.cor = cor;
      quantidade--; ativas++;
    }
  }

  function texto(conteudo, x, y, cor = '#ffffff', grande = false) {
    const alvo = textos.find((t) => !t.ativa) || textos.reduce((a, b) => (a.vida < b.vida ? a : b));
    Object.assign(alvo, { ativa: true, texto: conteudo, x, y, vida: 1, cor, grande });
  }

  function atualizar(dt) {
    for (const p of particulas) {
      if (!p.ativa) continue;
      p.vida -= dt;
      if (p.vida <= 0) { p.ativa = false; ativas--; continue; }
      p.vy += 900 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (const t of textos) {
      if (!t.ativa) continue;
      t.vida -= dt * 0.85;
      t.y -= 46 * dt;
      if (t.vida <= 0) t.ativa = false;
    }
  }

  function desenhar(ctx) {
    for (const p of particulas) {
      if (!p.ativa) continue;
      ctx.globalAlpha = Math.max(0, p.vida / p.total);
      ctx.fillStyle = p.cor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.tam, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (const t of textos) {
      if (!t.ativa) continue;
      ctx.globalAlpha = Math.min(1, t.vida * 2.4);
      ctx.font = `900 ${t.grande ? 17 : 14}px Bahnschrift, 'Trebuchet MS', system-ui, sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(8,32,47,0.85)';
      ctx.strokeText(t.texto, t.x, t.y);
      ctx.fillStyle = t.cor;
      ctx.fillText(t.texto, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  return { explodir, texto, atualizar, desenhar };
}

/** Converte um evento da simulação em efeitos visuais. */
export function efeitoDoEvento(efeitos, e, sim, chaoY) {
  const jogador = sim.jogador;
  const px = jogador.x + 22;
  const py = chaoY - jogador.alt - 36;
  switch (e.tipo) {
    case 'leitura': {
      const y = chaoY + e.dy;
      efeitos.explodir(e.x, y, e.ouro ? '#ffd23f' : '#5FDCF2', e.ouro ? 16 : 11, e.ouro);
      efeitos.texto(`+${e.ganho}`, e.x, y - 20, e.ouro ? '#ffe680' : '#e6f7ff', e.ouro);
      if (e.perfeita) { efeitos.texto('COLETA AÉREA PERFEITA!', e.x, y - 42, '#fff3a8', true); efeitos.explodir(e.x, y, '#fff09b', 12, true); }
      else if (e.anomalia) efeitos.texto('ANOMALIA DETECTADA +75', e.x, y - 42, '#b6f36b', false);
      break;
    }
    case 'perdido': efeitos.texto('LEITURA PERDIDA', Math.max(80, e.x), chaoY - 120, '#ff8a9b'); break;
    case 'colisao': efeitos.explodir(px, py, '#ff6b81', 16, true); efeitos.texto(e.numero >= 5 ? 'O CÃO ALCANÇOU!' : `TROPEÇO (${e.numero}/5)`, px, py - 40, '#ff8a9b', true); break;
    case 'escudo-bloqueou': efeitos.explodir(px, py, '#7fb0ff', 18, true); efeitos.texto('ESCUDO BLOQUEOU!', px, py - 40, '#ffe680', true); break;
    case 'impacto-flow': efeitos.explodir(e.x, chaoY + e.dy, '#5FDCF2', 14, true); efeitos.texto('IMPACTO FLOW +250', e.x, chaoY + e.dy - 24, '#5FDCF2', true); break;
    case 'powerup': efeitos.explodir(e.x, chaoY + e.dy, '#ffd23f', 14, true); break;
    case 'pulo': efeitos.explodir(px, chaoY - 2, '#ffffff', 6); break;
    case 'aterrissagem': if (e.forca > 420) efeitos.explodir(px, chaoY - 2, '#dbeafe', 8); break;
    case 'desconto': efeitos.texto(`DESCONTO DE ROTA: −${e.pontos} PTS`, sim.mundo.L / 2, chaoY - 150, '#ff8a9b', true); break;
    default: break;
  }
}

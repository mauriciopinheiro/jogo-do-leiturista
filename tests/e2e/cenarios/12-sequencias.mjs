/**
 * SPEC-2026-005: as sequências com mais de um personagem no navegador real (AC-301..AC-304):
 * o menino descende da Kombi (abertura), corre até ela e entra (encerramento) e o cão o alcança
 * (derrota). Confere que cada sequência muda o que está na tela, que os subestágios andam na ordem
 * e que não há erro de console — com as ilustrações e com elas bloqueadas (reserva vetorial).
 */
import { join } from 'node:path';

const BLOQUEAR_IMAGENS = `(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, get() { return d.get.call(this); }, set() { d.set.call(this, 'data:image/webp;base64,AAAA'); }
  });
})();`;

/** Amostra de pixels da faixa [x0, x1] (unidades) na altura do chão: serve para ver se algo mudou ali. */
const AMOSTRA = `window.__amostra = (x0, x1) => {
  const c = document.getElementById('palco');
  const L = window.__leiturista.renderizador.layout;
  const k = c.width / L.L;
  const d = c.getContext('2d').getImageData(Math.max(0, Math.round(x0 * k)), Math.round((L.chaoY - 120) * k), Math.max(1, Math.round((x1 - x0) * k)), Math.round(170 * k)).data;
  const s = [];
  for (let i = 0; i < d.length; i += 41) s.push(d[i]);
  return s;
}`;

const diferenca = (a, b) => a.reduce((soma, v, i) => soma + Math.abs(v - b[i]), 0) / a.length;

/** Avança a simulação (em passos de `passo` s, no máximo `maximo` s) até a condição sobre `s` (a simulação) valer. */
const avancarAte = (nav, condicao, passo = 0.05, maximo = 30) => nav.avaliar(
  `(() => { const s = window.__leiturista.sim; let t = 0; for (; t < ${maximo} && !(${condicao}); t += ${passo}) window.__robo.avancar(${passo}); return { ok: Boolean(${condicao}), estagio: s.estagio, sub: s.subestagio, t }; })()`);

const estado = (nav) => nav.avaliar(`(() => { const s = window.__leiturista.sim; return { estagio: s.estagio, sub: s.subestagio, visivel: s.jogador.visivel, kx: s.kombi.x, jx: s.jogador.x }; })()`);

async function percorrer(ctx, nav, rotulo, ilustrado) {
  await ctx.instalarPiloto(nav);
  await nav.avaliar(AMOSTRA);
  await nav.avaliar("document.getElementById('btnIniciar').click()");
  // Abertura: a Kombi chega, o menino sai (sequência) e corre até a linha de largada.
  let r = await avancarAte(nav, "s.subestagio === 'saindo'");
  ctx.verificar(r.ok, `${rotulo}: a abertura não chegou ao subestágio "saindo" (${r.estagio}/${r.sub})`);
  let e = await estado(nav);
  ctx.verificar(e.visivel === false, `${rotulo}: durante a saída o menino não deveria ser desenhado à parte`);
  const van = [e.kx, e.kx + 190];
  const antes = await nav.avaliar(`window.__amostra(${van[0]}, ${van[1]})`);
  await nav.avaliar('window.__robo.avancar(0.9)');
  const depois = await nav.avaliar(`window.__amostra(${van[0]}, ${van[1]})`);
  if (ilustrado) ctx.verificar(diferenca(antes, depois) > 2, `${rotulo}: a sequência da saída não mudou nada na tela (${diferenca(antes, depois).toFixed(2)})`);
  await nav.foto(join(ctx.saida, `sequencias-${rotulo}-saindo.png`));
  r = await avancarAte(nav, "s.estagio === 'corrida'");
  ctx.verificar(r.ok, `${rotulo}: a abertura não terminou em corrida (${r.estagio}/${r.sub})`);
  // Encerramento: corre até a porta, entra e a Kombi parte.
  await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 5, ate: (s) => s.estagio === 'encerramento' })");
  r = await avancarAte(nav, "s.subestagio === 'entrando'");
  ctx.verificar(r.ok, `${rotulo}: o encerramento não chegou ao subestágio "entrando" (${r.estagio}/${r.sub})`);
  e = await estado(nav);
  ctx.verificar(e.visivel === false && e.jx >= e.kx + 60, `${rotulo}: ele só entra ao chegar à porta (${e.jx.toFixed(0)} vs ${e.kx.toFixed(0)})`);
  const porta = [e.kx, e.kx + 190];
  const a1 = await nav.avaliar(`window.__amostra(${porta[0]}, ${porta[1]})`);
  await nav.avaliar('window.__robo.avancar(0.8)');
  const a2 = await nav.avaliar(`window.__amostra(${porta[0]}, ${porta[1]})`);
  if (ilustrado) ctx.verificar(diferenca(a1, a2) > 2, `${rotulo}: a sequência de embarque não mudou nada na tela (${diferenca(a1, a2).toFixed(2)})`);
  await nav.foto(join(ctx.saida, `sequencias-${rotulo}-entrando.png`));
  r = await avancarAte(nav, "s.estagio === 'concluida'");
  ctx.verificar(r.ok, `${rotulo}: a rota não terminou (${r.estagio}/${r.sub})`);
}

async function derrota(ctx, nav, rotulo, ilustrado) {
  await nav.avaliar("window.__leiturista.controlador.sairParaMenu && window.__leiturista.controlador.sairParaMenu()");
  await ctx.esperar(200);
  await nav.avaliar("document.getElementById('btnIniciar').click()");
  // A semente da partida é aleatória e um robô parado às vezes vence a rota curta: a ameaça em 100 garante a derrota.
  await nav.avaliar("window.__robo.jogar({ perfil: 'parado', semente: 7, ate: (s) => s.estagio === 'corrida' })");
  await nav.avaliar('window.__leiturista.sim.ameaca = 100');
  const r0 = await avancarAte(nav, "s.estagio === 'derrota'", 0.02, 3);
  ctx.verificar(r0.ok, `${rotulo}: a derrota não começou (${r0.estagio})`);
  const j = (await estado(nav)).jx;
  const faixa = [j - 90, j + 130];
  const a = await nav.avaliar(`window.__amostra(${faixa[0]}, ${faixa[1]})`);
  await nav.avaliar('window.__robo.avancar(1.1)');
  const b = await nav.avaliar(`window.__amostra(${faixa[0]}, ${faixa[1]})`);
  if (ilustrado) ctx.verificar(diferenca(a, b) > 2, `${rotulo}: a sequência da derrota não mudou nada na tela (${diferenca(a, b).toFixed(2)})`);
  await nav.foto(join(ctx.saida, `sequencias-${rotulo}-derrota.png`));
  const r = await avancarAte(nav, "s.estagio === 'fim'");
  ctx.verificar(r.ok, `${rotulo}: a derrota não abriu o resultado (${r.estagio})`);
}

export default {
  nome: 'Sequências: sair da Kombi, embarcar e a derrota (com e sem ilustrações)',
  criterios: ['AC-301', 'AC-302', 'AC-303', 'AC-304'],
  async executar(ctx) {
    for (const [rotulo, ilustrado] of [['ilustrado', true], ['vetorial', false]]) {
      const nav = await ctx.abrir({ largura: 1100, altura: 620, dpr: 1, celular: false, url: ctx.url, scriptInicial: ilustrado ? '' : BLOQUEAR_IMAGENS });
      try {
        await ctx.esperar(1500);
        ctx.verificar(await nav.avaliar('window.__leiturista.ilustracoesProntas()') === ilustrado, `${rotulo}: estado das ilustrações inesperado`);
        await percorrer(ctx, nav, rotulo, ilustrado);
        await derrota(ctx, nav, rotulo, ilustrado);
        ctx.verificar(nav.erros.length === 0, `${rotulo}: erros de console: ${nav.erros.join(' | ')}`);
      } finally { nav.fechar(); }
    }
  }
};

/**
 * SPEC-2026-004: personagens ilustrados (AC-203, AC-204, AC-206).
 * 1) as imagens embutidas carregam e os 5 uniformes ficam visualmente distintos no navegador;
 * 2) a cena final percorre as 5 cenas com as ilustrações, sem erro de console;
 * 3) com as imagens bloqueadas o jogo continua jogável (rota completa + cena final) com o desenho
 *    vetorial de reserva e o console limpo.
 */
import { join } from 'node:path';

const BLOQUEAR_IMAGENS = `(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, get() { return d.get.call(this); },
    set() { d.set.call(this, 'data:image/webp;base64,AAAA'); }
  });
})();`;

/** Lê os pixels da prévia do uniforme (canvas do menu). */
const LER_PREVIA = `(() => {
  const c = document.getElementById('prevUniforme');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  return Array.from(d);
})()`;

const trocarUniforme = (nav, i) => nav.avaliar(
  `(() => { window.__leiturista.gestor.progresso.uniforme = ${i}; window.__leiturista.controlador.atualizarMenu(); })()`);

function diferencaMedia(a, b) {
  let soma = 0;
  for (let i = 0; i < a.length; i++) soma += Math.abs(a[i] - b[i]);
  return soma / a.length;
}

async function percorrerCenaFinal(ctx, nav, rotulo, arquivoFoto) {
  await nav.avaliar('window.__leiturista.controlador.iniciarFinal(true)');
  ctx.verificar(await nav.avaliar('window.__leiturista.controlador.tela') === 'final', `${rotulo}: a cena final não abriu`);
  for (const t of [3.9, 4.2, 4.6]) {
    await nav.avaliar(`window.__robo.avancar(${t})`);
    if (t === 4.6) await nav.foto(join(ctx.saida, arquivoFoto));
  }
  for (let i = 0; i < 6; i++) { await nav.avaliar('window.__robo.avancar(0.7)'); await nav.avaliar('window.__leiturista.controlador.pressionar()'); }
  await ctx.esperar(400);
  ctx.verificar(await nav.avaliar('window.__leiturista.controlador.tela') === 'menu', `${rotulo}: a cena final (vinda do menu) deveria voltar ao menu`);
}

export default {
  nome: 'Personagens ilustrados, uniformes e reserva vetorial',
  criterios: ['AC-203', 'AC-204', 'AC-206', 'REQ-203', 'REQ-204', 'REQ-206'],
  async executar(ctx) {
    const nav = await ctx.abrir({ largura: 1000, altura: 600, dpr: 1, celular: false, url: ctx.url });
    try {
      await ctx.esperar(1500);
      ctx.verificar(await nav.avaliar('window.__leiturista.ilustracoesProntas()'), 'as ilustrações embutidas não carregaram');
      const previas = [];
      for (let i = 0; i < 5; i++) {
        await trocarUniforme(nav, i);
        previas.push(await nav.avaliar(LER_PREVIA));
        ctx.verificar(previas[i].some((v, k) => k % 4 === 3 && v > 0), `uniforme ${i}: a prévia ficou vazia`);
      }
      for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) {
        const d = diferencaMedia(previas[a], previas[b]);
        ctx.verificar(d > 1.5, `uniformes ${a} e ${b} parecidos demais na prévia (diferença ${d.toFixed(2)})`);
      }
      await trocarUniforme(nav, 1);
      await ctx.instalarPiloto(nav);
      await nav.avaliar("document.getElementById('btnIniciar').click()");
      await ctx.esperar(300);
      await nav.avaliar('window.__leiturista.controlador.pressionar()');
      await ctx.esperar(1800);
      await nav.foto(join(ctx.saida, 'ilustracoes-corrida.png'));
      await percorrerCenaFinal(ctx, nav, 'com ilustrações', 'ilustracoes-cena-final.png');
      ctx.verificar(nav.erros.length === 0, `erros de console: ${nav.erros.join(' | ')}`);
    } finally { nav.fechar(); }

    const reserva = await ctx.abrir({ largura: 844, altura: 390, dpr: 2, celular: true, url: ctx.url, scriptInicial: BLOQUEAR_IMAGENS });
    try {
      await ctx.esperar(1500);
      ctx.verificar(!(await reserva.avaliar('window.__leiturista.ilustracoesProntas()')), 'com as imagens bloqueadas o jogo não deveria marcá-las como prontas');
      await ctx.instalarPiloto(reserva);
      await reserva.avaliar("document.getElementById('btnIniciar').click()");
      const r = await reserva.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 5 })");
      ctx.verificar(r.estagio === 'concluida', `reserva vetorial: a rota terminou em "${r.estagio}"`);
      await reserva.foto(join(ctx.saida, 'reserva-vetorial-rota.png'));
      await percorrerCenaFinal(ctx, reserva, 'reserva vetorial', 'reserva-vetorial-cena-final.png');
      ctx.verificar(reserva.erros.length === 0, `reserva vetorial, erros de console: ${reserva.erros.join(' | ')}`);
    } finally { reserva.fechar(); }
  }
};

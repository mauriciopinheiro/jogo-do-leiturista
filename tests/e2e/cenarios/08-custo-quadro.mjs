/**
 * AC-102: custo por quadro com rasterização por CPU (pior caso, sem GPU) e flush forçado do canvas
 * a cada quadro. Não substitui um aparelho físico, mas mede a mesma grandeza na v3 e na v4
 * (v3.4.0 medida em 2026-09-29: desktop 2,4 ms, retrato 2,5 ms, paisagem 7,2 ms, tablet 5,3 ms).
 */

const TELAS = [
  { nome: 'desktop-1920x1080', largura: 1920, altura: 1080, dpr: 1, celular: false },
  { nome: 'notebook-1366x768', largura: 1366, altura: 768, dpr: 1, celular: false },
  { nome: 'celular-retrato-390x844', largura: 390, altura: 844, dpr: 3, celular: true },
  { nome: 'celular-paisagem-844x390', largura: 844, altura: 390, dpr: 3, celular: true },
  { nome: 'tablet-1024x768', largura: 1024, altura: 768, dpr: 2, celular: true }
];

const INJETAR = `(() => { const raf = window.requestAnimationFrame.bind(window); window.__custos = [];
  window.requestAnimationFrame = (cb) => raf((t) => { const a = performance.now(); cb(t);
    const c = document.getElementById('palco'); if (c && c.getContext) { try { c.getContext('2d').getImageData(0, 0, 1, 1); } catch (e) {} }
    window.__custos.push(performance.now() - a); }); })();`;

export default {
  nome: 'Custo por quadro (rasterização por CPU)',
  criterios: ['AC-102', 'REQ-102'],
  async executar(ctx) {
    const medias = {};
    for (const tela of TELAS) {
      const nav = await ctx.abrir({ ...tela, url: ctx.url, semGpu: true, scriptInicial: INJETAR });
      try {
        await ctx.esperar(500);
        await nav.avaliar("document.getElementById('btnIniciar').click()");
        await ctx.esperar(300);
        await nav.avaliar('window.__leiturista.controlador.pressionar()');
        await ctx.esperar(1500);
        await nav.avaliar('window.__custos.length = 0');
        await ctx.esperar(5000);
        const r = await nav.avaliar(`(() => { const a = window.__custos.slice().sort((x, y) => x - y); const n = a.length;
          return { n, media: a.reduce((s, v) => s + v, 0) / n, p95: a[Math.floor(n * 0.95)], max: a[n - 1] }; })()`);
        const canvas = await nav.avaliar('[document.getElementById("palco").width, document.getElementById("palco").height]');
        medias[tela.nome] = r.media;
        ctx.registrar(tela.nome, { mediaMs: +r.media.toFixed(2), p95Ms: +r.p95.toFixed(2), maxMs: +r.max.toFixed(1), quadros: r.n, canvas });
        ctx.verificar(r.n > 200, `${tela.nome}: só ${r.n} quadros em 5 s (o laço não estava rodando)`);
        ctx.verificar(r.media <= 4, `${tela.nome}: custo médio ${r.media.toFixed(2)} ms passa de 4 ms`);
        ctx.verificar(nav.erros.length === 0, `${tela.nome}: erros ${nav.erros.join(' | ')}`);
      } finally { nav.fechar(); }
    }
    const razao = medias['celular-paisagem-844x390'] / medias['celular-retrato-390x844'];
    ctx.registrar('razaoPaisagemRetrato', +razao.toFixed(2));
    ctx.verificar(razao <= 1.5, `paisagem custa ${razao.toFixed(2)}× o retrato (a v3 custava 2,9×)`);
  }
};

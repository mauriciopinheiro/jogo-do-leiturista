/**
 * AC-103 (layout íntegro, alvos de toque ≥44 px, sem rolagem horizontal) e NFR-001 (orçamento
 * de pixels do canvas) nos pontos de quebra da CTI, em retrato e paisagem, celular e computador.
 */
import { join } from 'node:path';

const TELAS = [
  { nome: 'pc-1600x900', largura: 1600, altura: 900, dpr: 1, celular: false },
  { nome: 'pc-1280x720', largura: 1280, altura: 720, dpr: 1, celular: false },
  { nome: 'pc-1080x700', largura: 1080, altura: 700, dpr: 1, celular: false },
  { nome: 'pc-960x600', largura: 960, altura: 600, dpr: 1, celular: false },
  { nome: 'tablet-retrato-820x1180', largura: 820, altura: 1180, dpr: 2, celular: true },
  { nome: 'tablet-paisagem-1180x820', largura: 1180, altura: 820, dpr: 2, celular: true },
  { nome: 'celular-700x900', largura: 700, altura: 900, dpr: 2, celular: true },
  { nome: 'celular-retrato-430x932', largura: 430, altura: 932, dpr: 3, celular: true },
  { nome: 'celular-retrato-360x640', largura: 360, altura: 640, dpr: 2, celular: true },
  { nome: 'celular-paisagem-844x390', largura: 844, altura: 390, dpr: 3, celular: true },
  { nome: 'celular-paisagem-667x375', largura: 667, altura: 375, dpr: 2, celular: true },
  { nome: 'celular-paisagem-932x430', largura: 932, altura: 430, dpr: 3, celular: true }
];

const MEDIR = `(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]'); };
  const botoes = [...document.querySelectorAll('button, summary')].filter(vis).map((b) => {
    const r = b.getBoundingClientRect();
    return { id: b.id || b.className, w: Math.round(r.width), h: Math.round(r.height) };
  });
  const paineis = [...document.querySelectorAll('.painel, .hud')].filter(vis).map((p) => {
    const r = p.getBoundingClientRect();
    return { id: p.id || p.className, esq: Math.round(r.left), dir: Math.round(r.right), topo: Math.round(r.top), base: Math.round(r.bottom) };
  });
  const c = document.getElementById('palco');
  return { botoes, paineis, larg: innerWidth, alt: innerHeight, estouro: document.documentElement.scrollWidth - innerWidth,
    pixels: c.width * c.height, canvas: [c.width, c.height] };
})()`;

function checar(ctx, tela, estado, medida) {
  const rotulo = `${tela.nome}/${estado}`;
  ctx.verificar(medida.estouro <= 0, `${rotulo}: rolagem horizontal de ${medida.estouro}px`);
  for (const b of medida.botoes) {
    ctx.verificar(b.w >= 44 && b.h >= 44, `${rotulo}: alvo pequeno "${b.id}" ${b.w}x${b.h}`);
  }
  for (const p of medida.paineis) {
    ctx.verificar(p.esq >= -1 && p.dir <= medida.larg + 1, `${rotulo}: "${p.id}" fora da largura (${p.esq}..${p.dir} de ${medida.larg})`);
  }
  const orcamento = tela.celular || tela.largura <= 768 ? 2.2e6 : 4.2e6;
  ctx.verificar(medida.pixels <= orcamento, `${rotulo}: canvas ${medida.canvas.join('x')} passa do orçamento`);
}

export default {
  nome: 'Layout, alvos de toque e orçamento de pixels',
  criterios: ['AC-103', 'NFR-001'],
  async executar(ctx) {
    for (const tela of TELAS) {
      const nav = await ctx.abrir({ ...tela, url: ctx.url });
      try {
        await ctx.esperar(500);
        checar(ctx, tela, 'menu', await nav.avaliar(MEDIR));
        await nav.foto(join(ctx.saida, `layout-${tela.nome}-menu.png`));
        await nav.avaliar("document.getElementById('btnAjuda').click()");
        await ctx.esperar(200);
        checar(ctx, tela, 'ajuda', await nav.avaliar(MEDIR));
        await nav.avaliar("document.getElementById('btnAjudaFechar').click()");
        await nav.avaliar("document.getElementById('btnIniciar').click()");
        await ctx.esperar(300);
        await nav.avaliar('window.__leiturista.controlador.pressionar()');
        await ctx.esperar(1500);
        checar(ctx, tela, 'jogo', await nav.avaliar(MEDIR));
        await nav.foto(join(ctx.saida, `layout-${tela.nome}-jogo.png`));
        await nav.avaliar("document.getElementById('btnPausa').click()");
        await ctx.esperar(200);
        checar(ctx, tela, 'pausa', await nav.avaliar(MEDIR));
        ctx.verificar(nav.erros.length === 0, `${tela.nome}: erros de console: ${nav.erros.join(' | ')}`);
      } finally { nav.fechar(); }
    }
    ctx.registrar('telas', TELAS.length);
  }
};

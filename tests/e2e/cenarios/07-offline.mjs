/**
 * AC-111 (parte do navegador): o jogo abre e roda sem nenhuma requisição além do próprio
 * documento, e o arquivo gerado não referencia endereços externos nem tem "sem build" quebrado
 * (CSS e JS embutidos). Limite de 2 MB da CTI.
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export default {
  nome: 'Arquivo único, sem requisições externas',
  criterios: ['AC-111', 'REQ-111', 'NFR-002'],
  async executar(ctx) {
    const arquivo = join(ctx.raiz, 'index.html');
    const html = readFileSync(arquivo, 'utf8');
    ctx.verificar(statSync(arquivo).size <= 2 * 1024 * 1024, 'index.html passou de 2 MB');
    ctx.verificar(!/<link[^>]+rel=["']stylesheet/i.test(html), 'há <link rel=stylesheet> externo');
    ctx.verificar(!/<script[^>]+src=/i.test(html), 'há <script src> externo');
    const externos = (html.match(/https?:\/\/[^\s"'<>)]+/g) || []).filter((u) => u !== 'http://www.w3.org/2000/svg');
    ctx.verificar(externos.length === 0, `endereços externos no arquivo: ${externos.slice(0, 5).join(', ')}`);
    ctx.verificar(!/\beval\s*\(|new Function\s*\(/.test(html), 'uso de eval/new Function');
    ctx.verificar(/v4\.1\.0/.test(html), 'a versão 4.1.0 deve estar no arquivo');

    const nav = await ctx.abrir({ largura: 844, altura: 390, dpr: 2, celular: true, url: ctx.url });
    try {
      await ctx.esperar(600);
      await nav.avaliar("document.getElementById('btnIniciar').click()");
      await ctx.esperar(300);
      await nav.avaliar('window.__leiturista.controlador.pressionar()');
      await ctx.esperar(2500);
      const alheias = nav.requisicoes.filter((u) => !u.startsWith(ctx.servidor.url) && !u.startsWith('data:') && u !== 'about:blank');
      ctx.verificar(alheias.length === 0, `requisições para fora: ${alheias.join(', ')}`);
      const proprias = nav.requisicoes.filter((u) => u.startsWith(ctx.servidor.url));
      ctx.verificar(proprias.length <= 1, `requisições ao servidor: ${proprias.join(', ')}`);
      ctx.registrar('requisicoes', nav.requisicoes.length);
      ctx.registrar('tamanhoKB', Math.round(statSync(arquivo).size / 1024));
      ctx.verificar(nav.erros.length === 0, `erros: ${nav.erros.join(' | ')}`);
    } finally { nav.fechar(); }
  }
};

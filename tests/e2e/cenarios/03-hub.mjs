/**
 * AC-110: o jogo dentro de um iframe do Hub (página de mesma origem) envia exatamente uma
 * mensagem SEMAE_FIM_PARTIDA ao vencer uma rota e nada ao perder, nem fora de iframe.
 */
import { empacotarPiloto } from '../lib/piloto-na-pagina.mjs';

export default {
  nome: 'Integração com o Hub (postMessage)',
  criterios: ['AC-110', 'REQ-109'],
  async executar(ctx) {
    const pilotoJs = JSON.stringify(await empacotarPiloto());
    const nav = await ctx.abrir({ largura: 900, altura: 600, dpr: 1, celular: false, url: `${ctx.servidor.url}/hub.html` });
    try {
      await ctx.esperar(700);
      // registra o destino (targetOrigin) de cada postMessage enviado à página pai
      await nav.avaliar("window.__alvos = []; const original = window.postMessage.bind(window); window.postMessage = (m, alvo, ...resto) => { window.__alvos.push(alvo); return original(m, alvo, ...resto); };");
      const noJogo = (js) => nav.avaliar(`window.frames[0].eval(${JSON.stringify(js)})`);
      await noJogo(`eval(${pilotoJs})`);
      await noJogo("document.getElementById('btnIniciar').click()");
      const vitoria = await noJogo("window.__robo.jogar({ perfil: 'perfeito', semente: 21 })");
      ctx.verificar(vitoria.estagio === 'concluida', `vitória esperada, veio ${vitoria.estagio}`);
      await ctx.esperar(300);
      let recebidas = await nav.avaliar('window.recebidas');
      ctx.verificar(recebidas.length === 1, `mensagens após vitória: ${recebidas.length}`);
      const m = recebidas[0] && recebidas[0].dados;
      if (m) {
        ctx.verificar(m.tipo === 'SEMAE_FIM_PARTIDA', `tipo ${m.tipo}`);
        ctx.verificar(m.jogoId === 'app_jogo_do_leiturista', `jogoId ${m.jogoId}`);
        ctx.verificar(Number.isInteger(m.pontuacao) && m.pontuacao >= 0 && m.pontuacao <= 100, `pontuação ${m.pontuacao}`);
        ctx.verificar(m.vitoria === true && m.duracao > 0 && m.estrelas >= 1 && m.estrelas <= 3, `campos ${JSON.stringify(m)}`);
        ctx.verificar(recebidas[0].origem === ctx.servidor.url, `origem ${recebidas[0].origem}`);
        const alvos = await nav.avaliar('window.__alvos');
        ctx.verificar(alvos.length === 1 && alvos[0] === ctx.servidor.url, `destino da mensagem: ${JSON.stringify(alvos)} (esperado ${ctx.servidor.url}, nunca "*")`);
        ctx.registrar('mensagem', m);
      }
      await noJogo("document.getElementById('btnResMenu').click()");
      await noJogo("document.getElementById('btnIniciar').click()");
      await ctx.esperar(200);
      const derrota = await noJogo("window.__robo.jogar({ perfil: 'parado', semente: 9 })");
      ctx.verificar(derrota.estagio === 'fim', `derrota esperada, veio ${derrota.estagio}`);
      recebidas = await nav.avaliar('window.recebidas');
      ctx.verificar(recebidas.length === 1, `derrota não deve enviar mensagem (total ${recebidas.length})`);
      ctx.verificar(nav.erros.length === 0, `erros: ${nav.erros.join(' | ')}`);
    } finally { nav.fechar(); }

    const sozinho = await ctx.abrir({ largura: 900, altura: 600, dpr: 1, celular: false, url: ctx.url });
    try {
      await ctx.instalarPiloto(sozinho);
      await sozinho.avaliar("document.getElementById('btnIniciar').click()");
      const r = await sozinho.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 4 })");
      ctx.verificar(r.estagio === 'concluida', 'vitória fora do iframe');
      ctx.verificar(sozinho.erros.length === 0, `fora do iframe: erros ${sozinho.erros.join(' | ')}`);
    } finally { sozinho.fechar(); }
  }
};

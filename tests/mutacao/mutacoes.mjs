/**
 * Catálogo de defeitos realistas para a verificação por mutação. Cada item troca `de` por `para`
 * em `arquivo` e indica qual teste (unidade ou e2e) deve acusar o defeito.
 */
export const MUTACOES = [
  {
    id: 'hub-envia-na-derrota', tipo: 'unidade', testes: ['interface.test.js'], arquivo: 'src/js/integracao/portal.js',
    de: 'if (!resumo.vitoria || resumo.infinito) return null;', para: 'if (false) return null;',
    descricao: 'o Hub receberia XP também quando a criança perde'
  },
  {
    id: 'hub-destino-curinga', tipo: 'unidade', testes: ['interface.test.js'], arquivo: 'src/js/integracao/portal.js',
    de: 'janela.parent.postMessage(mensagem, origem);', para: 'janela.parent.postMessage(mensagem, "*");',
    descricao: 'a mensagem iria para qualquer origem (targetOrigin "*")'
  },
  {
    id: 'hub-destino-curinga-e2e', tipo: 'e2e', teste: '03-hub', arquivo: 'src/js/integracao/portal.js',
    de: 'janela.parent.postMessage(mensagem, origem);', para: 'janela.parent.postMessage(mensagem, "*");',
    descricao: 'o mesmo defeito, agora visto no navegador com o Hub simulado'
  },
  {
    id: 'hub-nao-envia-na-vitoria', tipo: 'e2e', teste: '03-hub', arquivo: 'src/js/app/fluxo-resultado.js',
    de: 'notificarPortal(janela, resumo);', para: '',
    descricao: 'o Hub nunca receberia a conclusão da rota (defeito da v3)'
  },
  {
    id: 'giro-ignorado', tipo: 'e2e', teste: '04-giro', arquivo: 'src/js/app/janela.js',
    de: 'redimensionarMundo(sim, layout);', para: '',
    descricao: 'girar o aparelho não atualizaria o mundo do jogo'
  },
  {
    id: 'aba-oculta-nao-pausa', tipo: 'e2e', teste: '04-giro', arquivo: 'src/js/app/controlador.js',
    de: "if (estado.tela === 'jogo') pausar();\n      audio.suspender();", para: 'audio.suspender();',
    descricao: 'voltar de outra aba deixaria o jogo correndo'
  },
  {
    id: 'aviso-de-armazenamento-mudo', tipo: 'e2e', teste: '05-armaz', arquivo: 'src/js/principal.js',
    de: "mensagens.aviso('Não foi possível salvar neste aparelho.", para: "void ('Não foi possível salvar neste aparelho.",
    descricao: 'o armazenamento cheio falharia em silêncio (sem aviso)'
  },
  {
    id: 'assinatura-sempre-valida', tipo: 'unidade', testes: ['persistencia.test.js'], arquivo: 'src/js/persistencia/salvamento.js',
    de: 'return hash === sha256(texto) || hash === sha256LegadoV3(texto);', para: 'return true;',
    descricao: 'um save adulterado seria aceito'
  },
  {
    id: 'assinatura-da-v3-recusada', tipo: 'unidade', testes: ['persistencia.test.js'], arquivo: 'src/js/persistencia/salvamento.js',
    de: 'return hash === sha256(texto) || hash === sha256LegadoV3(texto);', para: 'return hash === sha256(texto);',
    descricao: 'os saves gravados pela v3.4.0 seriam recusados (crianças perderiam o progresso)'
  },
  {
    id: 'compat-v3-real', tipo: 'e2e', teste: '09-compat', arquivo: 'src/js/persistencia/salvamento.js',
    de: 'return hash === sha256(texto) || hash === sha256LegadoV3(texto);', para: 'return hash === sha256(texto);',
    descricao: 'o save real da v3.4.0 seria recusado pela v4 no navegador'
  },
  {
    id: 'canvas-estoura-orcamento', tipo: 'unidade', testes: ['camera.test.js'], arquivo: 'src/js/render/camera.js',
    de: 'if (pixels > ORCAMENTO_PIXELS[perfil]) {', para: 'if (false) {',
    descricao: 'o canvas voltaria a passar de 8 Mpx em celular deitado'
  },
  {
    id: 'botao-pequeno', tipo: 'e2e', teste: '01-layout', arquivo: 'src/css/hud.css',
    de: '.btn-canto {\n  width: 48px;\n  height: 48px;', para: '.btn-canto {\n  width: 36px;\n  height: 36px;',
    descricao: 'o botão de pausa ficaria menor que 44 px'
  },
  {
    id: 'foco-inicial-perdido', tipo: 'e2e', teste: '06-teclado', arquivo: 'src/js/principal.js',
    de: 'el.btnIniciar.focus({ preventScroll: true });', para: '',
    descricao: 'o teclado não teria foco ao abrir o jogo'
  },
  {
    id: 'endereco-externo', tipo: 'e2e', teste: '07-offline', arquivo: 'src/index.html',
    de: '<!--CSS-->', para: '<link rel="preconnect" href="https://fonts.example.com"><!--CSS-->',
    descricao: 'o arquivo passaria a depender de um endereço externo'
  },
  {
    id: 'rua-perdida-trava', tipo: 'unidade', testes: ['campanha.test.js'], arquivo: 'src/js/simulacao/ruas.js',
    de: 'const ruaCompleta = (rua) => rua.lidos + rua.perdidos >= rua.total;', para: 'const ruaCompleta = (rua) => rua.lidos >= rua.total;',
    descricao: 'a rua com um hidrômetro perdido nunca terminaria (defeito da v3)'
  },
  {
    id: 'retomada-perde-hidrometros', tipo: 'unidade', testes: ['retomada.test.js'], arquivo: 'src/js/simulacao/retomada.js',
    de: 'f.proximo = Math.min(total, f.lidos + f.perdidos);', para: 'f.proximo = Math.min(total, f.lidos + f.perdidos + 1);',
    descricao: 'a partida retomada perderia um hidrômetro e a rota nunca fecharia (defeito que o teste achou)'
  },
  {
    id: 'retomada-perde-hidrometros-e2e', tipo: 'e2e', teste: '10-retomada', arquivo: 'src/js/simulacao/retomada.js',
    de: 'f.proximo = Math.min(total, f.lidos + f.perdidos);', para: 'f.proximo = Math.min(total, f.lidos + f.perdidos + 1);',
    descricao: 'o mesmo defeito, visto no fluxo real (sair, recarregar, continuar)'
  },
  {
    id: 'cao-sem-limite', tipo: 'unidade', testes: ['campanha.test.js'], arquivo: 'src/js/simulacao/cao.js',
    de: 'return sim.ameaca >= AMEACA.limite;', para: 'return false;',
    descricao: 'o cão nunca alcançaria o jogador (ninguém perderia)'
  },
  {
    id: 'sprite-subida-e-descida-trocadas', tipo: 'unidade', testes: ['ilustracoes.test.js'], arquivo: 'src/js/render/ilustracoes/quadros.js',
    de: 'o.vy > 240 ? L_ACAO.subindo : L_ACAO.descendo', para: 'o.vy > 240 ? L_ACAO.descendo : L_ACAO.subindo',
    descricao: 'o leiturista subiria com a pose de queda e cairia com a pose de pulo'
  },
  {
    id: 'sprite-nao-espelha', tipo: 'unidade', testes: ['ilustracoes.test.js'], arquivo: 'src/js/render/ilustracoes/quadro.js',
    de: 'if (espelhar) ctx.scale(-1, 1);', para: '',
    descricao: 'na cena final o leiturista andaria de costas (sem virar para a esquerda)'
  },
  {
    id: 'save-com-uniforme-da-v3-recusado', tipo: 'unidade', testes: ['persistencia.test.js'], arquivo: 'src/js/persistencia/salvamento.js',
    de: 'e.selectedSkin < UNIFORMES_DA_V3', para: 'e.selectedSkin < 1',
    descricao: 'quem jogou a v3 com outro uniforme perderia o progresso ao abrir a v4'
  },
  {
    id: 'menu-ainda-troca-uniforme', tipo: 'e2e', teste: '11-ilustr', arquivo: 'src/index.html',
    de: '<button class="btn-icone" id="btnAjuda"', para: '<button class="btn-icone" id="btnUniforme" type="button"><span>Uniforme</span></button><button class="btn-icone" id="btnAjuda"',
    descricao: 'o botão de trocar uniforme voltaria ao menu (o uniforme deve ser um só)'
  },
  {
    id: 'ilustracao-com-falha-derruba-o-jogo', tipo: 'e2e', teste: '11-ilustr', arquivo: 'src/js/render/ilustracoes/atlas.js',
    de: '.catch(() => { estado.falhou = true; });', para: ".catch(() => { throw new Error('imagem'); });",
    descricao: 'se a imagem não carregar (rede, memória), o jogo acusaria erro em vez de usar o desenho vetorial'
  }
];

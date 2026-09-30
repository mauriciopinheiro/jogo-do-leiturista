/**
 * Defeitos realistas da correção de nitidez/leitura (SPEC-2026-006): placas sobrepostas, sprites reamostrados,
 * texto pequeno demais no celular, aviso em cima da área de leitura e cão desproporcional na cena final.
 */
export const MUTACOES_NITIDEZ = [
  {
    id: 'placas-se-sobrepoem', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/simulacao/placas.js',
    de: 'if (conflitos.length === 0) {', para: 'if (true) {',
    descricao: 'placas de ruas curtas seguidas seriam desenhadas umas sobre as outras (ilegíveis)'
  },
  {
    id: 'placa-da-rua-menor-vence', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/simulacao/placas.js',
    de: 'if (nova.total <= Math.max(...conflitos.map((p) => p.total))) return false;', para: 'if (nova.total > Math.max(...conflitos.map((p) => p.total))) return false;',
    descricao: 'na disputa ficaria a rua com menos hidrômetros, e não a mais importante da rota'
  },
  {
    id: 'sprite-em-posicao-fracionaria', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/render/sprites/cache.js',
    de: 'const dx = Math.round(t.a * x + t.c * y + t.e - sprite.oxPx);', para: 'const dx = t.a * x + t.c * y + t.e - sprite.oxPx;',
    descricao: 'itens em movimento seriam reamostrados a cada quadro (tremulação e borrão)'
  },
  {
    id: 'leitura-sem-ampliacao', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/render/leitura.js',
    de: 'return Math.min(maximo, Math.max(1, PIXELS_POR_UNIDADE_ALVO / (k / razaoDePixels)));', para: 'return 1;',
    descricao: 'números dos hidrômetros e nomes das placas ficariam com 6 pixels no celular'
  },
  {
    id: 'leitura-mede-pixel-do-aparelho', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/render/leitura.js',
    de: 'PIXELS_POR_UNIDADE_ALVO / (k / razaoDePixels)', para: 'PIXELS_POR_UNIDADE_ALVO / k',
    descricao: 'celulares 2x/3x contariam pixels do aparelho e não ampliariam o texto (erro da primeira versão)'
  },
  {
    id: 'cao-final-desproporcional', tipo: 'unidade', testes: ['nitidez.test.js'], arquivo: 'src/js/config/constantes.js',
    de: 'export const FATOR_CAO_NA_CENA = 0.68;', para: 'export const FATOR_CAO_NA_CENA = 1;',
    descricao: 'o cão da cena final voltaria a ficar quase do tamanho do menino'
  },
  {
    id: 'aviso-sobre-o-cenario', tipo: 'e2e', teste: '13-nitid', arquivo: 'src/css/hud.css',
    de: 'top: var(--faixa-topo, 74%);', para: 'top: 30%;',
    descricao: 'o aviso da corrida voltaria a cobrir placas e hidrômetros'
  },
  {
    id: 'faixa-sem-posicao', tipo: 'e2e', teste: '13-nitid', arquivo: 'src/js/app/janela.js',
    de: 'posicionarFaixa(janela.document, layout, altura);', para: '',
    descricao: 'o aviso ficaria na posição de reserva do CSS, que não acompanha o chão do aparelho'
  }
];

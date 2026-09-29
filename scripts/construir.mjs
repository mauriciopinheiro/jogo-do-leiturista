/**
 * Constrói o index.html único e autônomo a partir de src/.
 * 1. verifica o limite de 200 linhas dos fontes manuais;
 * 2. empacota os módulos ES (src/js) em um único script (esbuild, IIFE, ES2020, sem minificar),
 *    embutindo os atlas de sprites (src/assets/*.webp) como data URI;
 * 3. embute o CSS e o script no modelo src/index.html.
 * O resultado é determinístico: a mesma entrada gera exatamente o mesmo arquivo.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';
import { verificarLimiteDeLinhas } from './limite-linhas.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const FOLHAS = ['base', 'hud', 'telas', 'menu', 'ajuda', 'responsivo'];
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

console.log('[1/3] Verificando o limite de 200 linhas...');
const violacoes = verificarLimiteDeLinhas(raiz);
if (violacoes.length > 0) {
  for (const v of violacoes) console.error(`ERRO: ${v.arquivo} tem ${v.linhas} linhas`);
  process.exit(1);
}

console.log('[2/3] Empacotando com esbuild...');
const resultado = await build({
  entryPoints: [join(raiz, 'src/js/principal.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  legalComments: 'none',
  loader: { '.webp': 'dataurl' },
  write: false,
  outfile: join(raiz, 'saida-em-memoria.js'),
  logLevel: 'warning'
});
const script = resultado.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

console.log('[3/3] Gerando index.html autônomo...');
const css = FOLHAS.map((nome) => readFileSync(join(raiz, 'src/css', `${nome}.css`), 'utf8').trim()).join('\n\n');
let html = readFileSync(join(raiz, 'src/index.html'), 'utf8');
html = html.replace('<!--CSS-->', () => `<style>\n${css}\n</style>`);
html = html.replace('<!--JS-->', () => `<script>\n${script}\n</script>`);
writeFileSync(join(raiz, 'index.html'), html, 'utf8');

const bytes = statSync(join(raiz, 'index.html')).size;
console.log(`      index.html: ${(bytes / 1024).toFixed(1)} KB`);
if (bytes > TAMANHO_MAXIMO) {
  console.error('ERRO: index.html passou de 2 MB (limite da CTI).');
  process.exit(1);
}
console.log('Build concluído.');

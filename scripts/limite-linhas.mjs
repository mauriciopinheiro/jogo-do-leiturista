/**
 * Conta as linhas físicas dos fontes manuais mantidos por este projeto (src/, scripts/, tests/)
 * e devolve as violações do limite de 200 linhas. O index.html da raiz é artefato gerado. Os
 * arquivos históricos da raiz (v3.0 e test_final*.html) e versoes-preservadas/ não são
 * examinados: são cópias preservadas, não código mantido.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const LIMITE_LINHAS = 200;
const EXTENSOES = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.py']);
const PASTAS_MANTIDAS = ['src', 'scripts', 'tests'];
const IGNORAR = new Set(['node_modules', 'saida', '__pycache__']);

function listar(pasta, raiz, achados) {
  for (const item of readdirSync(pasta, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue;
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) { listar(caminho, raiz, achados); continue; }
    const rel = relative(raiz, caminho).split(sep).join('/');
    const ext = item.name.slice(item.name.lastIndexOf('.'));
    if (EXTENSOES.has(ext) && rel) achados.push(caminho);
  }
  return achados;
}

export function contarLinhas(caminho) {
  const texto = readFileSync(caminho, 'utf8');
  if (texto.length === 0) return 0;
  return texto.split('\n').length - (texto.endsWith('\n') ? 1 : 0);
}

function fontesMantidos(raiz) {
  return PASTAS_MANTIDAS.flatMap((pasta) => listar(join(raiz, pasta), raiz, []));
}

/** @returns {{arquivo:string, linhas:number}[]} */
export function verificarLimiteDeLinhas(raiz) {
  return fontesMantidos(raiz)
    .map((caminho) => ({ arquivo: relative(raiz, caminho).split(sep).join('/'), linhas: contarLinhas(caminho) }))
    .filter((r) => r.linhas > LIMITE_LINHAS);
}

export function arquivosProximosDoLimite(raiz) {
  return fontesMantidos(raiz)
    .map((caminho) => ({ arquivo: relative(raiz, caminho).split(sep).join('/'), linhas: contarLinhas(caminho) }))
    .filter((r) => r.linhas >= 160 && r.linhas <= LIMITE_LINHAS);
}

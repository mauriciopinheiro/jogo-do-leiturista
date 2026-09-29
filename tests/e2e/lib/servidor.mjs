/**
 * Servidor estático mínimo para os testes: serve a raiz do repositório e algumas páginas
 * virtuais (um "hub" falso com iframe para testar o postMessage sem tocar em produção).
 */
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };

const HUB_FALSO = `<!doctype html><meta charset="utf-8"><title>Hub falso</title>
<iframe id="jogo" src="/index.html" style="width:100vw;height:100vh;border:0"></iframe>
<script>window.recebidas = [];
window.addEventListener('message', (e) => window.recebidas.push({ origem: e.origin, dados: e.data }));</script>`;

/** @returns {Promise<{url:string, fechar:()=>void}>} */
export function iniciarServidor(raiz) {
  const servidor = http.createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (caminho === '/hub.html') { res.writeHead(200, { 'content-type': TIPOS['.html'] }); res.end(HUB_FALSO); return; }
    const arquivo = normalize(join(raiz, caminho === '/' ? 'index.html' : caminho));
    if (!arquivo.startsWith(raiz) || !existsSync(arquivo) || !statSync(arquivo).isFile()) { res.writeHead(404); res.end('não encontrado'); return; }
    res.writeHead(200, { 'content-type': TIPOS[extname(arquivo)] || 'application/octet-stream' });
    res.end(readFileSync(arquivo));
  });
  return new Promise((resolve) => {
    servidor.listen(0, '127.0.0.1', () => {
      resolve({ url: `http://127.0.0.1:${servidor.address().port}`, fechar: () => servidor.close() });
    });
  });
}

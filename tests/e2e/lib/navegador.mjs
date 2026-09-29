/**
 * Navegador controlado por CDP (Chrome/Edge headless) para os testes de ponta a ponta.
 * Cada abrir() cria um perfil temporário e uma porta própria; fechar() limpa tudo.
 * Registra erros de console, requisições de rede e diálogos (alert/confirm) sem bloquear.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';

const CANDIDATOS = [
  process.env.NAVEGADOR_E2E,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].filter(Boolean);

export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function obterJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let corpo = '';
      res.on('data', (parte) => { corpo += parte; });
      res.on('end', () => { try { resolve(JSON.parse(corpo)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

export async function abrir({ largura, altura, dpr = 1, celular = false, url, semGpu = false, scriptInicial = '' }) {
  const exe = CANDIDATOS.find((c) => existsSync(c));
  if (!exe) throw new Error('Nenhum Chrome/Edge encontrado (defina NAVEGADOR_E2E).');
  const perfil = mkdtempSync(join(tmpdir(), 'leiturista_cdp_'));
  const porta = 9300 + Math.floor(Math.random() * 600);
  const args = ['--headless=new', `--remote-debugging-port=${porta}`, '--remote-allow-origins=*', `--user-data-dir=${perfil}`,
    '--no-first-run', '--autoplay-policy=no-user-gesture-required', `--window-size=${largura},${altura}`];
  if (semGpu) args.push('--disable-gpu', '--disable-gpu-compositing');
  const proc = spawn(exe, [...args, 'about:blank'], { stdio: 'ignore' });

  let alvo = null;
  for (let i = 0; i < 40 && !alvo; i++) {
    await esperar(250);
    try { alvo = (await obterJson(`http://127.0.0.1:${porta}/json/list`)).find((a) => a.type === 'page'); } catch { /* subindo */ }
  }
  if (!alvo) { proc.kill(); throw new Error('CDP não respondeu'); }

  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pendentes = new Map();
  const nav = { erros: [], avisos: [], requisicoes: [], dialogos: [] };

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { res, rej } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      nav.erros.push(`${d.text} ${d.exception ? d.exception.description : ''}`.trim());
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const texto = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
      if (msg.params.type === 'error') nav.erros.push(`console.error: ${texto}`);
      else if (msg.params.type === 'warning') nav.avisos.push(texto);
    } else if (msg.method === 'Network.requestWillBeSent') {
      nav.requisicoes.push(msg.params.request.url);
    } else if (msg.method === 'Page.javascriptDialogOpening') {
      nav.dialogos.push(msg.params.message);
      enviar('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
    }
  };
  const enviar = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq;
    pendentes.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });

  await enviar('Page.enable');
  await enviar('Runtime.enable');
  await enviar('Network.enable');
  const emular = (l, a, d, c) => enviar('Emulation.setDeviceMetricsOverride', { width: l, height: a, deviceScaleFactor: d, mobile: c });
  await emular(largura, altura, dpr, celular);
  if (celular) await enviar('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (scriptInicial) await enviar('Page.addScriptToEvaluateOnNewDocument', { source: scriptInicial });
  if (url) { await enviar('Page.navigate', { url }); await esperar(1200); }

  Object.assign(nav, {
    enviar,
    async avaliar(expressao) {
      const r = await enviar('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(`avaliar: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
      return r.result.value;
    },
    async foto(arquivo) {
      const r = await enviar('Page.captureScreenshot', { format: 'png' });
      writeFileSync(arquivo, Buffer.from(r.data, 'base64'));
      return arquivo;
    },
    async tocar(x, y, duracao = 60) {
      await enviar('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
      await esperar(duracao);
      await enviar('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    },
    async tecla(key, duracao = 60) {
      const code = key === ' ' ? 'Space' : key.length === 1 ? `Key${key.toUpperCase()}` : key;
      const text = key === 'Enter' ? String.fromCharCode(13) : key.length === 1 ? key : undefined;
      await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text });
      await esperar(duracao);
      await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
    },
    async redimensionar(l, a, d = dpr, c = celular) { await emular(l, a, d, c); await esperar(250); },
    async navegar(novaUrl) { await enviar('Page.navigate', { url: novaUrl }); await esperar(1200); },
    fechar() {
      try { ws.close(); } catch { /* já fechado */ }
      proc.kill();
      setTimeout(() => { try { rmSync(perfil, { recursive: true, force: true }); } catch { /* em uso */ } }, 1500);
    }
  });
  return nav;
}

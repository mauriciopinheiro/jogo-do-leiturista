/**
 * Empacota o piloto de teste (tests/e2e/auxiliar/entrada-robo.js) em um script que o runner
 * injeta na página. Ele expõe window.__robo.jogar()/avancar() e usa o controlador real do jogo.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));

export async function empacotarPiloto() {
  const r = await build({
    entryPoints: [join(aqui, '../auxiliar/entrada-robo.js')],
    bundle: true, format: 'iife', target: 'es2020', write: false, outfile: 'piloto.js', logLevel: 'warning'
  });
  return r.outputFiles[0].text;
}

/** Injeta o piloto e espera o jogo estar pronto. */
export async function instalarPiloto(nav) {
  await nav.avaliar(await empacotarPiloto());
  await nav.avaliar('!!window.__robo && !!window.__leiturista');
}

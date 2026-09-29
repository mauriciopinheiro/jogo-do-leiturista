/**
 * Verificação por mutação: introduz defeitos realistas no código-fonte, reconstrói o jogo e
 * exige que o teste responsável FALHE. Se a bateria passar com o defeito, o teste não protege.
 * Uso: node tests/mutacao/executar.mjs   (restaura os arquivos mesmo se for interrompido)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MUTACOES } from './mutacoes.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const originais = new Map();

function restaurar() {
  for (const [caminho, texto] of originais) writeFileSync(caminho, texto, 'utf8');
  originais.clear();
}
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => { restaurar(); process.exit(130); });

function construir() {
  execFileSync(process.execPath, [join(raiz, 'scripts/construir.mjs')], { cwd: raiz, stdio: 'ignore' });
}

function rodar(comando) {
  const r = spawnSync(process.execPath, comando, { cwd: raiz, encoding: 'utf8', timeout: 280000 });
  return r.status === 0;
}

const filtro = process.argv[2] || '';
let sobreviventes = 0;
try {
  for (const m of MUTACOES.filter((x) => x.id.includes(filtro))) {
    const caminho = join(raiz, m.arquivo);
    const texto = readFileSync(caminho, 'utf8');
    if (!texto.includes(m.de)) { console.log(`PULOU     ${m.id}: trecho não encontrado (o código mudou?)`); sobreviventes++; continue; }
    originais.set(caminho, texto);
    writeFileSync(caminho, texto.replace(m.de, m.para), 'utf8');
    let passou;
    try {
      construir();
      passou = m.tipo === 'unidade'
        ? rodar(['--test', ...m.testes.map((t) => join('tests/unidade', t))])
        : rodar(['tests/e2e/executar.mjs', m.teste]);
    } finally { restaurar(); }
    const detectado = !passou;
    if (!detectado) sobreviventes++;
    console.log(`${detectado ? 'DETECTADA ' : 'SOBREVIVEU'} ${m.id} — ${m.descricao}`);
  }
} finally { restaurar(); construir(); }

console.log(sobreviventes === 0 ? '\nTodas as mutações foram detectadas pelos testes.' : `\n${sobreviventes} mutação(ões) não detectada(s).`);
process.exit(sobreviventes === 0 ? 0 : 1);

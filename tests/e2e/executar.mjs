/**
 * Executor dos testes de ponta a ponta (Chrome/Edge real por CDP).
 * Uso: npm run testar:e2e [filtro]   (o filtro é um trecho do nome do cenário)
 * Pré-requisito: npm run construir (gera o index.html testado).
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { abrir, esperar } from './lib/navegador.mjs';
import { iniciarServidor } from './lib/servidor.mjs';
import { instalarPiloto } from './lib/piloto-na-pagina.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '../..');
const saida = join(aqui, 'saida');
const filtro = process.argv[2] || '';

if (!existsSync(join(raiz, 'index.html'))) {
  console.error('index.html não existe. Rode "npm run construir" antes.');
  process.exit(2);
}
mkdirSync(saida, { recursive: true });

function criarContexto(servidor) {
  const falhas = [];
  const registros = [];
  return {
    servidor, raiz, saida, abrir, esperar, instalarPiloto,
    url: `${servidor.url}/index.html`,
    falhas, registros,
    verificar(condicao, mensagem) { if (!condicao) falhas.push(mensagem); return Boolean(condicao); },
    registrar(chave, valor) { registros.push({ chave, valor }); }
  };
}

const arquivos = readdirSync(join(aqui, 'cenarios')).filter((n) => n.endsWith('.mjs') && n.includes(filtro)).sort();
const servidor = await iniciarServidor(raiz);
const relatorio = [];
let reprovados = 0;

for (const arquivo of arquivos) {
  const cenario = (await import(pathToFileURL(join(aqui, 'cenarios', arquivo)).href)).default;
  const ctx = criarContexto(servidor);
  const inicio = Date.now();
  let erro = null;
  try { await cenario.executar(ctx); } catch (e) { erro = e; ctx.falhas.push(`exceção: ${e.stack || e.message}`); }
  const aprovado = ctx.falhas.length === 0;
  if (!aprovado) reprovados++;
  relatorio.push({ cenario: cenario.nome, criterios: cenario.criterios, aprovado, segundos: Math.round((Date.now() - inicio) / 1000), falhas: ctx.falhas, registros: ctx.registros });
  console.log(`${aprovado ? 'PASSOU ' : 'FALHOU '} ${cenario.nome} [${cenario.criterios.join(', ')}] (${Math.round((Date.now() - inicio) / 1000)} s)`);
  for (const f of ctx.falhas.slice(0, 12)) console.log(`     - ${f}`);
  if (erro && !aprovado) await esperar(200);
}

servidor.fechar();
writeFileSync(join(saida, 'resultado.json'), JSON.stringify({ quando: new Date().toISOString(), relatorio }, null, 2));
console.log(`\n${arquivos.length - reprovados}/${arquivos.length} cenários aprovados. Detalhes: tests/e2e/saida/resultado.json`);
process.exit(reprovados ? 1 : 0);

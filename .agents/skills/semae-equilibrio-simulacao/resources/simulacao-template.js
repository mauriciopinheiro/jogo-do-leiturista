// Template de simulação sem interface — adaptar às regras reais do jogo.
const CONFIG = { ciclos: 120, seed: 12345 };
function rng(seed) { let s = seed >>> 0; return () => ((s = (1664525*s + 1013904223) >>> 0) / 2**32); }
function estadoInicial(){ return { ciclo: 0, recursos: 100, pontuacao: 0, falhou: false }; }
function decidir(estado, aleatorio){ return { acao: aleatorio() < 0.5 ? 'A' : 'B' }; }
function avancar(estado, decisao, aleatorio){
  const prox = structuredClone(estado);
  prox.ciclo += 1;
  // TODO: reutilizar as fórmulas de domínio do jogo.
  return prox;
}
const aleatorio = rng(CONFIG.seed);
let estado = estadoInicial();
const serie = [];
for (let i=0; i<CONFIG.ciclos && !estado.falhou; i++) {
  const decisao = decidir(estado, aleatorio);
  estado = avancar(estado, decisao, aleatorio);
  serie.push({...estado});
}
console.log(JSON.stringify({config: CONFIG, final: estado, serie}, null, 2));

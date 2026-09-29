/**
 * @file medidores.js
 * @description Monta a fila de hidrômetros de uma fase e a contabilidade por rua.
 * A fila é determinística por fase (mesma ordem e mesmos consumos a cada partida).
 */
import { criarLcg } from '../nucleo/prng.js';
import { LIMITE_ANOMALIA } from '../config/constantes.js';

/**
 * Cada hidrômetro guarda o consumo médio dos últimos 3 meses (m³) e a rua a que pertence.
 * ~14% têm consumo alto; os 10% de maior consumo viram hidrômetros "ouro".
 */
export function montarLista(rota, faseIdx) {
  const sorteio = criarLcg(777 + (faseIdx + 1) * 31415);
  const lista = [];
  let ruaIdx = 0;
  let acumulado = rota.ruas[0].hidrometros;
  for (let i = 0; i < rota.totalHidrometros; i++) {
    if (i >= acumulado && ruaIdx < rota.ruas.length - 1) {
      ruaIdx++;
      acumulado += rota.ruas[ruaIdx].hidrometros;
    }
    const alto = sorteio() < 0.14;
    const media = alto ? Math.round(44 + sorteio() * 34) : Math.round(10 + sorteio() * 28);
    lista.push({ indice: i + 1, media3m: media, ouro: false, ruaIdx });
  }
  const quantidadeOuro = Math.max(1, Math.ceil(lista.length * 0.1));
  const porConsumo = lista.map((m, pos) => ({ pos, media: m.media3m })).sort((a, b) => b.media - a.media);
  for (let g = 0; g < quantidadeOuro; g++) lista[porConsumo[g].pos].ouro = true;
  return lista;
}

/** Fila de medidores + contadores por rua de uma fase. */
export function montarFila(rota, faseIdx) {
  return {
    lista: montarLista(rota, faseIdx),
    proximo: 0,
    lidos: 0,
    perdidos: 0,
    porRua: rota.ruas.map((r) => ({ total: r.hidrometros, lidos: 0, perdidos: 0 })),
    concluidas: new Set(),
    recentes: []
  };
}

export function ehAnomalia(medidor) {
  return medidor.media3m > LIMITE_ANOMALIA || medidor.ouro;
}

/** Quantos hidrômetros da fase já foram lidos ou perdidos. */
export function processados(fila) {
  return fila.lidos + fila.perdidos;
}

/** Restam medidores na fila para serem gerados? */
export function filaEsgotada(fila) {
  return fila.proximo >= fila.lista.length;
}

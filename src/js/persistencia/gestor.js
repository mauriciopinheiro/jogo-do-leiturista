/**
 * @file gestor.js
 * @description Dono do progresso do jogador. Grava em marcos (fim de rota, a cada 5 leituras,
 * mudança de opção, página oculta), sempre adiado para fora do quadro de animação e com no
 * máximo uma gravação pendente, para nunca causar engasgo no laço.
 */
import { CHAVE_SAVE, LIMITE_SAVE_BYTES } from '../config/constantes.js';
import { uniformesLiberados, UNIFORMES } from '../config/uniformes.js';
import { carregarProgresso, interpretarSalvamento } from './leitura.js';
import { registrarResultado } from './progresso.js';
import { deEstado } from './progresso.js';
import { montarSalvamento } from './salvamento.js';

/**
 * @param {ReturnType<import('./armazenamento.js').criarArmazenamento>} armazenamento
 * @param {{agendar?:(fn:()=>void, ms:number)=>any, cancelar?:(id:any)=>void}} [relogio]
 */
export function criarGestor(armazenamento, relogio = {}) {
  const agendar = relogio.agendar || ((fn, ms) => setTimeout(fn, ms));
  const cancelar = relogio.cancelar || ((id) => clearTimeout(id));
  const carga = carregarProgresso(armazenamento);
  let pendente = null;
  const gestor = {
    progresso: carga.progresso,
    origem: carga.origem,
    recusado: carga.recusado,
    /** Fotógrafo da partida em curso, definido pela aplicação. */
    fotografarPartida: () => null,

    salvarAgora() {
      if (pendente !== null) { cancelar(pendente); pendente = null; }
      const partida = gestor.fotografarPartida();
      if (partida) gestor.progresso.partidaEmAndamento = partida;
      const texto = JSON.stringify(montarSalvamento(gestor.progresso));
      if (texto.length > LIMITE_SAVE_BYTES) return false;
      return armazenamento.gravar(CHAVE_SAVE, texto);
    },
    /** Pede uma gravação para logo depois do quadro atual; pedidos repetidos se fundem. */
    agendarSalvamento(ms = 350) {
      if (pendente !== null) return;
      pendente = agendar(() => { pendente = null; gestor.salvarAgora(); }, ms);
    },
    /** Conta uma leitura vitalícia. @returns {number|null} índice do uniforme recém-liberado */
    registrarLeitura() {
      const p = gestor.progresso;
      p.leiturasVitalicias += 1;
      if (p.leiturasVitalicias % 5 === 0) gestor.agendarSalvamento();
      const novo = UNIFORMES.findIndex((u) => u.exige === p.leiturasVitalicias && u.exige > 0);
      return novo >= 0 ? novo : null;
    },
    registrarFimDeRota(resumo) {
      const r = registrarResultado(gestor.progresso, resumo);
      gestor.salvarAgora();
      return r;
    },
    limparPartidaSalva() {
      gestor.progresso.partidaEmAndamento = null;
    },
    alternarOpcao(campo) {
      gestor.progresso[campo] = !gestor.progresso[campo];
      gestor.agendarSalvamento(100);
      return gestor.progresso[campo];
    },
    proximoUniforme() {
      const liberados = uniformesLiberados(gestor.progresso.leiturasVitalicias);
      const pos = liberados.indexOf(gestor.progresso.uniforme);
      gestor.progresso.uniforme = liberados[(pos + 1) % liberados.length];
      gestor.agendarSalvamento(100);
      return gestor.progresso.uniforme;
    },
    exportarTexto() {
      const partida = gestor.fotografarPartida();
      if (partida) gestor.progresso.partidaEmAndamento = partida;
      return JSON.stringify(montarSalvamento(gestor.progresso), null, 2);
    },
    /** @returns {{ok:boolean, mensagem?:string}} */
    importarTexto(texto) {
      const r = interpretarSalvamento(texto);
      if (!r.ok) return { ok: false, mensagem: r.mensagem };
      gestor.progresso = deEstado(r.salvamento.estado);
      gestor.salvarAgora();
      return { ok: true };
    }
  };
  return gestor;
}

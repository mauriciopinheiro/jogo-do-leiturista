/**
 * @file resultado.js
 * @description Tela de fim de rota (vitória ou derrota): resumo, medalhas, dica e botões.
 * Todo texto entra no DOM como texto (nunca como HTML).
 */
import { ROTAS_SEMAE } from '../config/rotas.js';
import { formatarInteiro } from '../nucleo/util.js';
import { medalhasDoResumo, dicaDoResumo, ROTULO_NIVEL } from './medalhas.js';

const SIMBOLO = { ouro: '1º', prata: '2º', bronze: '3º', nenhuma: '–' };

function celula(doc, valor, legenda) {
  const d = doc.createElement('div');
  const b = doc.createElement('b');
  b.className = 'dados';
  b.textContent = valor;
  const s = doc.createElement('small');
  s.textContent = legenda;
  d.append(b, s);
  return d;
}

function medalha(doc, m) {
  const d = doc.createElement('div');
  d.className = `medalha ${m.nivel}`;
  const disco = doc.createElement('span');
  disco.className = 'disco';
  disco.textContent = SIMBOLO[m.nivel];
  disco.setAttribute('aria-hidden', 'true');
  const t = doc.createElement('span');
  t.textContent = `${m.nome}: ${ROTULO_NIVEL[m.nivel]}`;
  d.append(disco, t);
  return d;
}

function titulos(resumo) {
  if (resumo.vitoria) {
    const rota = ROTAS_SEMAE[resumo.faseIdx];
    const perdas = resumo.perdidos > 0 ? ` · ${resumo.perdidos} perdido(s) (−${resumo.perdidos * 100} pts)` : ' · Rota 100% lida!';
    return { titulo: `Rota ${rota.fase} concluída!`, sub: `Você completou a rota de ${rota.bairro}. Lidos: ${resumo.leituras}/${resumo.totalRota}${perdas}` };
  }
  if (resumo.infinito) return { titulo: 'Fim do turno infinito', sub: `Você fez ${formatarInteiro(resumo.pontos)} pontos e leu ${resumo.leituras} hidrômetros.` };
  return { titulo: 'O cão alcançou você!', sub: 'Não desanime: respire fundo e tente outra vez.' };
}

/**
 * @param {object} resumo resumo da rota
 * @param {{novoRecorde:boolean, proximaFase:number|null}} extras
 * @returns {{primario:string, secundario:string|null}} ações disponíveis
 */
export function mostrarResultado(el, resumo, extras) {
  const doc = el.resResumo.ownerDocument;
  const { titulo, sub } = titulos(resumo);
  el.resTitulo.textContent = titulo;
  el.resSub.textContent = sub;
  el.resResumo.replaceChildren(
    celula(doc, formatarInteiro(resumo.pontos), 'Pontos'),
    celula(doc, `${resumo.leituras}/${resumo.totalRota}`, 'Hidrômetros'),
    celula(doc, String(resumo.perfeitas), 'Coletas aéreas'),
    celula(doc, String(resumo.comboMax), 'Melhor combo')
  );
  const m = medalhasDoResumo(resumo);
  el.resMedalhas.replaceChildren(medalha(doc, m.leitura), medalha(doc, m.precisao), medalha(doc, m.agilidade));
  el.resResumo.hidden = false;
  el.resMedalhas.hidden = !(resumo.vitoria || resumo.leituras > 0);
  const dica = dicaDoResumo(resumo, extras.novoRecorde);
  el.resDica.hidden = !dica;
  el.resDica.textContent = dica;
  el.resPremios.hidden = true;
  if (resumo.vitoria && !resumo.infinito) {
    const proxima = extras.proximaFase;
    el.btnResPrimario.textContent = proxima ? `Ir para a Fase ${proxima} ▶` : `Jogar a Fase ${resumo.faseIdx + 1} de novo ▶`;
    el.btnResSecundario.textContent = proxima ? `Repetir a Fase ${resumo.faseIdx + 1}` : '';
    el.btnResSecundario.hidden = !proxima;
    return { primario: proxima ? 'proxima' : 'repetir', secundario: proxima ? 'repetir' : null };
  }
  el.btnResPrimario.textContent = 'Tentar novamente ▶';
  el.btnResSecundario.hidden = true;
  return { primario: 'repetir', secundario: null };
}

/** Tela especial depois da retrospectiva final da campanha. */
export function mostrarConquistas(el, meters) {
  const doc = el.resResumo.ownerDocument;
  el.resTitulo.textContent = 'Leiturista Mestre da Rota';
  el.resSub.textContent = `Parabéns! Você concluiu a leitura das 5 rotas (${meters} hidrômetros) e conquistou a amizade do cão companheiro!`;
  el.resResumo.replaceChildren();
  el.resMedalhas.replaceChildren();
  el.resResumo.hidden = true;
  el.resMedalhas.hidden = true;
  el.resDica.hidden = true;
  const itens = ['Conquista: Leiturista Mestre', 'Insígnia: Amigo da Rota', 'Modo liberado: Turno Infinito'];
  el.resPremios.replaceChildren(...itens.map((t) => { const li = doc.createElement('li'); li.textContent = t; return li; }));
  el.resPremios.hidden = false;
  el.resPremios.querySelectorAll('li').forEach((li, i) => setTimeout(() => li.classList.add('visivel'), 120 + i * 200));
  el.btnResPrimario.textContent = 'Rejogar a Fase 5 ▶';
  el.btnResSecundario.textContent = 'Jogar o Modo Infinito ∞';
  el.btnResSecundario.hidden = false;
}

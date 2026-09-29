/**
 * @file hud.js
 * @description HUD em DOM. Só escreve no DOM quando o valor muda (nada de reconstruir árvore
 * nem ler layout dentro do laço de animação).
 */
import { formatarInteiro, formatarMultiplicador } from '../nucleo/util.js';
import { rotuloDaAmeaca } from '../simulacao/cao.js';

export function criarHud(el) {
  const ultimo = {};
  function texto(chave, elemento, valor) {
    if (ultimo[chave] === valor) return;
    ultimo[chave] = valor;
    elemento.textContent = valor;
  }
  function classe(chave, elemento, nome, ligado) {
    if (ultimo[chave] === ligado) return;
    ultimo[chave] = ligado;
    elemento.classList.toggle(nome, ligado);
  }

  return {
    mostrar(sim) {
      el.hud.hidden = false;
      el.controles.hidden = false;
      Object.keys(ultimo).forEach((k) => delete ultimo[k]);
      this.atualizar(sim);
    },
    esconder() {
      el.hud.hidden = true;
      el.controles.hidden = true;
    },
    atualizar(sim) {
      const rota = sim.rotas[sim.faseIdx];
      const rua = rota.ruas[sim.ruaAtual];
      const contagemRua = sim.fila.porRua[sim.ruaAtual];
      texto('selo', el.hudSelo, sim.infinito ? 'Infinito' : `Fase ${sim.faseIdx + 1}`);
      texto('rua', el.hudRua, rua ? rua.nome : 'Rota concluída');
      texto('bairro', el.hudBairro, `${rota.bairro} · Setor ${rota.setor} · Rota ${rota.rota}`);
      texto('pontos', el.hudPontos, formatarInteiro(sim.pontos));
      texto('ruaN', el.hudRuaContagem, `${contagemRua ? contagemRua.lidos : 0}/${contagemRua ? contagemRua.total : 0}`);
      texto('rotaN', el.hudRotaContagem, `${sim.fila.lidos}/${rota.totalHidrometros}`);
      texto('combo', el.hudCombo, sim.combo >= 2 ? `Combo ${sim.combo} ${formatarMultiplicador(sim.mult)}` : '');
      const ameaca = Math.round(sim.ameaca);
      if (ultimo.ameaca !== ameaca) {
        ultimo.ameaca = ameaca;
        el.hudAmeaca.style.width = `${ameaca}%`;
      }
      texto('ameacaTxt', el.hudAmeacaTexto, rotuloDaAmeaca(sim.ameaca));
      classe('perigo', el.hudAmeacaBarra, 'perigo', sim.ameaca >= 40 && sim.ameaca < 75);
      classe('critico', el.hudAmeacaBarra, 'critico', sim.ameaca >= 75);
      const flow = sim.flow.estado === 'ativo' ? Math.round((sim.flow.tempo / 6) * 100) : Math.round(sim.flow.energia);
      if (ultimo.flow !== flow) {
        ultimo.flow = flow;
        el.hudFlowBarra.style.width = `${flow}%`;
      }
      classe('flowPronto', el.hudFlow, 'pronto', sim.flow.estado === 'pronto');
      classe('flowAtivo', el.hudFlow, 'ativo', sim.flow.estado === 'ativo');
    }
  };
}

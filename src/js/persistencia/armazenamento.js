/**
 * @file armazenamento.js
 * @description Acesso ao localStorage que nunca lança exceção. Se o navegador bloquear o
 * armazenamento (modo privado, cota cheia, iframe restrito) o jogo segue funcionando com uma
 * cópia em memória e avisa a interface uma única vez, sem `alert` bloqueante.
 */

/**
 * @param {{ getItem?:Function, setItem?:Function, removeItem?:Function }|null} armazem
 * @param {(motivo:string)=>void} [aoFalhar] chamado na primeira falha de gravação
 */
export function criarArmazenamento(armazem, aoFalhar = () => {}) {
  const memoria = new Map();
  let avisou = false;
  let persistente = Boolean(armazem);

  function falhou(motivo) {
    persistente = false;
    if (avisou) return;
    avisou = true;
    aoFalhar(motivo);
  }

  return {
    get persistente() { return persistente; },
    ler(chave) {
      try {
        const valor = armazem ? armazem.getItem(chave) : null;
        if (valor !== null && valor !== undefined) return valor;
      } catch (erro) {
        falhou(`leitura: ${erro && erro.name}`);
      }
      return memoria.has(chave) ? memoria.get(chave) : null;
    },
    /** @returns {boolean} true se gravou no armazenamento do navegador */
    gravar(chave, valor) {
      memoria.set(chave, valor);
      if (!armazem) return false;
      try {
        armazem.setItem(chave, valor);
        return true;
      } catch (erro) {
        falhou(`gravação: ${erro && erro.name}`);
        return false;
      }
    },
    remover(chave) {
      memoria.delete(chave);
      try { if (armazem) armazem.removeItem(chave); } catch { /* sem armazenamento: nada a remover */ }
    }
  };
}

/** localStorage se acessível; alguns navegadores lançam já ao ler a propriedade. */
export function armazemDoNavegador(janela) {
  try {
    return janela.localStorage || null;
  } catch {
    return null;
  }
}

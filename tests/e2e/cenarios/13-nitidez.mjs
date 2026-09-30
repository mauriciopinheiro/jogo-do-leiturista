/**
 * SPEC-2026-006: nitidez e leitura nas fases avançadas, no navegador real e em vários aparelhos.
 * Jogando a rota inteira da fase 5: nenhuma placa cobre outra (AC-401), os avisos ficam na faixa de asfalto,
 * abaixo do chão da corrida, sem cobrir placa nem item (AC-402), e a placa e os hidrômetros aparecem nas
 * fotos guardadas para conferência visual (AC-403). Sem erro de console.
 */
import { join } from 'node:path';

const APARELHOS = [
  { rotulo: 'celular-em-pe', largura: 390, altura: 844, dpr: 3, celular: true },
  { rotulo: 'celular-deitado', largura: 844, altura: 390, dpr: 3, celular: true },
  { rotulo: 'tablet', largura: 820, altura: 1180, dpr: 2, celular: true },
  { rotulo: 'desktop', largura: 1280, altura: 720, dpr: 1, celular: false }
];

/** Mede, a cada quadro da corrida, placas sobrepostas e o aviso invadindo o céu/cenário acima do chão. */
const AMOSTRADOR = `window.__nitidez = { quadros: 0, pares: 0, simultaneas: 0, avisosVistos: 0, avisosAcimaDoChao: 0 };
window.__medir = (s) => {
  const n = window.__nitidez;
  const lay = window.__leiturista.renderizador.layout;
  n.quadros += 1;
  const ordenadas = [...s.placas].sort((a, b) => a.x - b.x);
  for (let i = 1; i < ordenadas.length; i++) if (ordenadas[i].x - ordenadas[i - 1].x < 360 - 1e-6) n.pares += 1;
  n.simultaneas = Math.max(n.simultaneas, ordenadas.filter((p) => p.x < lay.L && p.x > -260).length);
  const faixa = document.getElementById('faixa');
  if (faixa.classList.contains('visivel') && !faixa.classList.contains('vitoria')) {
    n.avisosVistos += 1;
    if (faixa.getBoundingClientRect().top < lay.chaoY * lay.escala - 1) n.avisosAcimaDoChao += 1;
  }
  return s.estagio === 'concluida';
};`;

async function conferir(ctx, aparelho) {
  const { rotulo, largura, altura, dpr, celular } = aparelho;
  const nav = await ctx.abrir({ largura, altura, dpr, celular, url: ctx.url });
  try {
    await ctx.esperar(1200);
    await ctx.instalarPiloto(nav);
    await nav.avaliar(AMOSTRADOR);
    await nav.avaliar('window.__leiturista.controlador.iniciar(4, false)');
    await ctx.esperar(200);
    await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 3, ate: (s) => s.estagio === 'corrida' })");
    await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 3, ate: (s) => s.placas.some((p) => p.x > 60 && p.x < 300) && s.medidores.some((m) => m.x > 250 && m.x < 500) })");
    await nav.foto(join(ctx.saida, `nitidez-${rotulo}.png`));
    await nav.avaliar("window.__robo.jogar({ perfil: 'perfeito', semente: 3, ate: window.__medir })");
    const n = await nav.avaliar('window.__nitidez');
    ctx.verificar(n.quadros > 600, `${rotulo}: a rota terminou cedo demais (${n.quadros} quadros)`);
    ctx.verificar(n.pares === 0, `${rotulo}: ${n.pares} quadros com placas sobrepostas`);
    ctx.verificar(n.avisosVistos > 0, `${rotulo}: nenhum aviso apareceu para conferir a posição`);
    ctx.verificar(n.avisosAcimaDoChao === 0, `${rotulo}: o aviso cobriu o cenário acima do chão em ${n.avisosAcimaDoChao} quadros`);
    ctx.registrar(`nitidez ${rotulo}`, `${n.quadros} quadros, ${n.simultaneas} placas simultâneas no máximo, ${n.avisosVistos} quadros com aviso`);
    ctx.verificar(nav.erros.length === 0, `${rotulo}: erros de console: ${nav.erros.join(' | ')}`);
  } finally { nav.fechar(); }
}

export default {
  nome: 'Nitidez: placas sem sobreposição e avisos fora da área de leitura (fase 5)',
  criterios: ['AC-401', 'AC-402', 'AC-403'],
  async executar(ctx) {
    for (const aparelho of APARELHOS) await conferir(ctx, aparelho);
  }
};

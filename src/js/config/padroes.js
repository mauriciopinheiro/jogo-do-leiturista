/**
 * @file padroes.js
 * @description Banco declarativo de padrões de percurso (mesmos padrões e medidas da v3.4.0).
 * nivel: dificuldade mínima; velMin/velMax em u/quadro (60 quadros/s); fim: distância até o
 * próximo padrão; itens: medidores ("medidor", dy = altura do centro acima do chão, negativa)
 * e obstáculos (dy = topo do obstáculo relativo ao chão, negativo).
 */

const med = (dx, dy, ouro = false) => ({ tipo: 'medidor', dx, dy, ouro });
const obs = (forma, dx, dy, w, h) => ({ tipo: 'obstaculo', forma, dx, dy, w, h });
const cone = (dx) => obs('cone', dx, -52, 42, 52);
const mangueira = (dx) => obs('mangueira', dx, -22, 92, 22);
const lixeira = (dx) => obs('lixeira', dx, -65, 52, 65);
const poca = (dx) => obs('poca', dx, -14, 96, 14);
const barreira = (dx) => obs('barreira', dx, -74, 70, 74);
const caixote = (dx) => obs('caixote', dx, -58, 58, 58);

const padrao = (id, nivel, velMin, velMax, fim, itens) => ({ id, nivel, velMin, velMax, fim, itens });

export const PADROES = [
  padrao('n0_medidor_baixo', 0, 4.0, 10.0, 120, [med(50, -88)]),
  padrao('n0_medidor_alto', 0, 4.0, 10.0, 120, [med(50, -140)]),
  padrao('n0_cone', 0, 4.0, 10.0, 140, [cone(50)]),
  padrao('n1_mangueira', 1, 4.5, 9.0, 180, [mangueira(50)]),
  padrao('n1_lixeira', 1, 4.5, 9.0, 180, [lixeira(50)]),
  padrao('n1_poca', 1, 4.5, 9.0, 180, [poca(50)]),
  padrao('n1_baixo_alto', 1, 4.5, 9.0, 210, [med(50, -88), med(150, -140)]),
  padrao('n1_dois_baixos', 1, 4.5, 9.0, 210, [med(50, -88), med(150, -88)]),
  padrao('n2_barreira', 2, 5.0, 8.5, 180, [barreira(50)]),
  padrao('n2_caixote', 2, 5.0, 8.5, 180, [caixote(50)]),
  padrao('n2_onda', 2, 5.0, 8.5, 320, [med(50, -88), med(160, -140), med(270, -88)]),
  padrao('n2_escada', 2, 5.0, 8.5, 300, [med(50, -88), med(150, -120), med(250, -150)]),
  padrao('n2_ouro', 2, 5.0, 8.5, 180, [med(50, -95, true)]),
  padrao('n2_dois_cones', 2, 5.0, 8.5, 280, [cone(50), cone(200)]),
  padrao('n3_onda_tripla', 3, 5.5, 8.0, 370,
    [med(50, -88), med(140, -140), med(230, -88), med(320, -140)]),
  padrao('n3_ouro_duplo', 3, 5.5, 8.0, 220, [med(50, -95, true), med(160, -140)]),
  padrao('n3_mangueira_lixeira', 3, 5.5, 8.0, 300, [mangueira(50), lixeira(220)])
];

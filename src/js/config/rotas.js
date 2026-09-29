/**
 * @file rotas.js
 * @description As 5 rotas reais do SEMAE Piracicaba (extraídas do SCI). velocidadeBase é em
 * u/quadro a 60 quadros por segundo (como na v3), convertida por `velocidadeBaseUps`.
 *
 * A Fase 5 lista 15 ruas que somam 84 hidrômetros, mas a rota declara 90. Os 6 restantes ficam na
 * rua sintética "Demais ruas da rota" para que o total oficial e as contagens por rua batam.
 * Pendência de confirmação com o SCI: SPEC-2026-003, Q-001.
 */

const rua = (codigo, nome, hidrometros, sintetica = false) => ({ codigo, nome, hidrometros, sintetica });

export const ROTAS_SEMAE = [
  {
    fase: 1, nomeFase: 'Fase 1 - São Dimas (Inicial)', setor: 36, rota: 129,
    bairro: 'SÃO DIMAS', totalHidrometros: 15, velocidadeBase: 4.5,
    ruas: [rua(5424, 'Rua Ajudante Albano', 8), rua(1487, 'Avenida Holanda', 7)]
  },
  {
    fase: 2, nomeFase: 'Fase 2 - Vila Rezende (Aprendiz)', setor: 13, rota: 157,
    bairro: 'CENTRO / VILA REZENDE', totalHidrometros: 30, velocidadeBase: 4.8,
    ruas: [
      rua(5422, 'Rua Saldanha Marinho', 15),
      rua(2307, 'Travessa Orestes Miglioranza', 11),
      rua(495, 'Travessa Benedito Salustiano Cruz', 4)
    ]
  },
  {
    fase: 3, nomeFase: 'Fase 3 - Bairro dos Alemães (Intermediário)', setor: 44, rota: 207,
    bairro: 'BAIRRO DOS ALEMÃES', totalHidrometros: 45, velocidadeBase: 5.1,
    ruas: [
      rua(5580, 'Rua Rio Branco', 22),
      rua(5582, 'Rua Silva Jardim', 14),
      rua(1687, 'Travessa João Guerra', 6),
      rua(725, 'Travessa Comercial', 3)
    ]
  },
  {
    fase: 4, nomeFase: 'Fase 4 - Jaraguá (Avançado)', setor: 19, rota: 147,
    bairro: 'JARAGUÁ', totalHidrometros: 60, velocidadeBase: 5.4,
    ruas: [
      rua(2013, 'Avenida Maria Teodora', 41),
      rua(2087, 'Rua Maria Nazareth', 10),
      rua(290, 'Rua Antônio Gil de Oliveira', 3),
      rua(1668, 'Rua João Ferreira de Camargo', 2),
      rua(2402, 'Rua Antônio Vieira', 2),
      rua(990, 'Rua Anésia', 2)
    ]
  },
  {
    fase: 5, nomeFase: 'Fase 5 - Recanto do Piracicamirim (Mestre)', setor: 31, rota: 57,
    bairro: 'RECANTO DO PIRACICAMIRIM', totalHidrometros: 90, velocidadeBase: 5.7,
    ruas: [
      rua(981, 'Avenida Aniger Francisco Maria Melillo', 23),
      rua(2780, 'Avenida Sidney Luiz Brajão', 16),
      rua(2131, 'Avenida Mary Nassif Curiacos', 7),
      rua(157, 'Avenida Álvaro Corrêa de Toledo', 6),
      rua(547, 'Avenida Bruno Ferraioli', 5),
      rua(1235, 'Rua Faustino Fernandes de Souza', 5),
      rua(214, 'Rua Ângelo do Amaral', 4),
      rua(2820, 'Rua Tancredo de Almeida Neves', 4),
      rua(3077, 'Rua Zoraide Brasil Vieira', 3),
      rua(1159, 'Rua Elias Zaidan Maluf', 3),
      rua(2105, 'Rua Mário Alexandrino', 3),
      rua(2267, 'Rua Octávio Perecin', 2),
      rua(3591, 'Rua Luiz Gomes de Oliveira', 1),
      rua(3593, 'Rua Fernando Rogério Batista Abreu', 1),
      rua(3592, 'Rua Isaura Sebastião dos Santos', 1),
      rua(null, 'Demais ruas da rota', 6, true)
    ]
  }
];

export const TOTAL_CAMPANHA = ROTAS_SEMAE.reduce((soma, r) => soma + r.totalHidrometros, 0);

/** Velocidade base da rota em u/s. */
export function velocidadeBaseUps(rota) {
  return rota.velocidadeBase * 60;
}

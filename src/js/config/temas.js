/**
 * @file temas.js
 * @description Aparência de cada fase: céu, silhuetas, casas, calçada e asfalto.
 * `ceu` são 4 cores (topo, meio, horizonte, brilho do horizonte). Cada paleta de casa tem
 * parede, detalhe (janelas/toldo), telhado e porta.
 */

const casa = (parede, detalhe, telhado, porta) => ({ parede, detalhe, telhado, porta });

export const TEMAS = [
  {
    nome: 'Entardecer em São Dimas',
    ceu: ['#27408b', '#7a5ca8', '#f4793b', '#ffc98a'],
    astro: { cor: '#fff1c2', halo: 'rgba(255,190,110,0.45)', x: 0.78, y: 0.7, raio: 30 },
    nuvem: 'rgba(255,205,160,0.6)', estrelas: 0,
    longe: '#7b5aa3', medio: '#57468a', janelasAcesas: true,
    casas: [
      casa('#fff3d6', '#f59e0b', '#b45309', '#7c2d12'), casa('#ffe4c4', '#ea580c', '#9a3412', '#431407'),
      casa('#fde9f0', '#e11d48', '#9f1239', '#4c0519'), casa('#e8f0ff', '#2563eb', '#1e3a8a', '#172554'),
      casa('#f4ecff', '#7c3aed', '#5b21b6', '#2e1065'), casa('#ecfccb', '#65a30d', '#3f6212', '#1a2e05')
    ],
    calcada: { topo: '#e7e0d6', corpo: '#d4cabb', junta: '#a99d8a' }, meioFio: '#9c8f7c',
    asfalto: ['#2a2a3a', '#171724'], faixa: '#f5b52e',
    arvore: { copa: '#3f8f4f', copa2: '#2f6f3f', tronco: '#6b4423' }, luzPoste: false
  },
  {
    nome: 'Manhã em Vila Rezende',
    ceu: ['#1d8fdb', '#5fb8ee', '#a9dcf7', '#e6f6ff'],
    astro: { cor: '#fffbe0', halo: 'rgba(255,240,150,0.5)', x: 0.2, y: 0.32, raio: 30 },
    nuvem: 'rgba(255,255,255,0.85)', estrelas: 0,
    longe: '#8ec5e8', medio: '#6aa6d0', janelasAcesas: false,
    casas: [
      casa('#fff7e6', '#0ea5e9', '#0369a1', '#075985'), casa('#fdf2f8', '#db2777', '#9d174d', '#500724'),
      casa('#e0f2fe', '#f97316', '#c2410c', '#7c2d12'), casa('#f0fdf4', '#16a34a', '#166534', '#052e16'),
      casa('#fefce8', '#ca8a04', '#854d0e', '#422006'), casa('#f5f3ff', '#6366f1', '#3730a3', '#1e1b4b')
    ],
    calcada: { topo: '#e5e7eb', corpo: '#d1d5db', junta: '#9ca3af' }, meioFio: '#9ca3af',
    asfalto: ['#374151', '#1f2937'], faixa: '#fbbf24',
    arvore: { copa: '#4ade80', copa2: '#22c55e', tronco: '#78350f' }, luzPoste: false
  },
  {
    nome: 'Parque no Bairro dos Alemães',
    ceu: ['#0b6b53', '#3ea88a', '#9fe3c9', '#e6fbf1'],
    astro: { cor: '#fffde0', halo: 'rgba(255,250,170,0.5)', x: 0.7, y: 0.3, raio: 28 },
    nuvem: 'rgba(240,255,248,0.8)', estrelas: 0,
    longe: '#6fb59a', medio: '#3f8f73', janelasAcesas: false,
    casas: [
      casa('#fef3c7', '#b45309', '#7c2d12', '#451a03'), casa('#ecfdf5', '#059669', '#065f46', '#022c22'),
      casa('#fff1f2', '#e11d48', '#881337', '#4c0519'), casa('#f0f9ff', '#0284c7', '#0c4a6e', '#082f49'),
      casa('#fafaf9', '#78716c', '#44403c', '#1c1917'), casa('#fef9c3', '#a16207', '#713f12', '#422006')
    ],
    calcada: { topo: '#d8f0e1', corpo: '#bfe3cd', junta: '#86b89b' }, meioFio: '#7fae94',
    asfalto: ['#2b3a3f', '#18242a'], faixa: '#f5b52e',
    arvore: { copa: '#22a05a', copa2: '#167a43', tronco: '#5b3a1e' }, luzPoste: false
  },
  {
    nome: 'Crepúsculo no Jaraguá',
    ceu: ['#2a1157', '#6b2a92', '#e0456d', '#ffa5a0'],
    astro: { cor: '#ffe0e6', halo: 'rgba(255,150,170,0.45)', x: 0.24, y: 0.6, raio: 26 },
    nuvem: 'rgba(255,170,190,0.45)', estrelas: 36,
    longe: '#4a2a78', medio: '#331d5a', janelasAcesas: true,
    casas: [
      casa('#f3e8ff', '#a855f7', '#6b21a8', '#3b0764'), casa('#ffe4e6', '#f43f5e', '#9f1239', '#4c0519'),
      casa('#e0e7ff', '#6366f1', '#3730a3', '#1e1b4b'), casa('#fae8ff', '#d946ef', '#86198f', '#4a044e'),
      casa('#fef2f2', '#ef4444', '#991b1b', '#450a0a'), casa('#f1f5f9', '#64748b', '#334155', '#0f172a')
    ],
    calcada: { topo: '#cfc8dd', corpo: '#b3aac9', junta: '#8177a3' }, meioFio: '#7d739c',
    asfalto: ['#1f1a33', '#0d0a1a'], faixa: '#ffb347',
    arvore: { copa: '#2f7a5a', copa2: '#215a42', tronco: '#4a3020' }, luzPoste: true
  },
  {
    nome: 'Dia de vitória no Piracicamirim',
    ceu: ['#0a73c2', '#39a0e6', '#8fd3f5', '#dff3fc'],
    astro: { cor: '#fffbe0', halo: 'rgba(255,240,150,0.55)', x: 0.74, y: 0.28, raio: 32 },
    nuvem: 'rgba(255,255,255,0.9)', estrelas: 0,
    longe: '#7ec0e6', medio: '#4f9bd0', janelasAcesas: false,
    casas: [
      casa('#ffffff', '#f97316', '#c2410c', '#7c2d12'), casa('#fef9c3', '#0ea5e9', '#0369a1', '#0c4a6e'),
      casa('#ffedd5', '#dc2626', '#991b1b', '#450a0a'), casa('#ecfeff', '#0891b2', '#155e75', '#083344'),
      casa('#fdf4ff', '#c026d3', '#86198f', '#4a044e'), casa('#f0fdf4', '#16a34a', '#166534', '#052e16')
    ],
    calcada: { topo: '#f1f5f9', corpo: '#e2e8f0', junta: '#b6c2d0' }, meioFio: '#b6c2d0',
    asfalto: ['#334155', '#1e293b'], faixa: '#fbbf24',
    arvore: { copa: '#34c26b', copa2: '#1f9d55', tronco: '#7a4a24' }, luzPoste: false
  }
];

export function temaDaFase(faseIdx) {
  return TEMAS[faseIdx] || TEMAS[0];
}

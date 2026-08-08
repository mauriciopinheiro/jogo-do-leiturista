---
name: semae-ui-responsividade-acessibilidade
description: "Implementa e revisa identidade visual, componentes, responsividade, acessibilidade e linguagem dos jogos SEMAE. Use em telas, HUD, modais, layouts, mobile, teclado, contraste, ícones e textos."
---

# Skill: UI, responsividade, acessibilidade e linguagem

## Identidade visual

- Fundo petróleo: `#08202F` a `#0F3247`.
- Água: `#17A8CF`.
- Água clara: `#5FDCF2`.
- Alerta/EPI: `#FF9F1C`.
- Erro: `#E04A5F`.
- Sucesso: `#45CF8A`.
- Títulos: `Bahnschrift, "DIN Alternate", "Archivo Narrow", "Trebuchet MS", sans-serif`.
- Texto: `"Segoe UI", Verdana, system-ui, sans-serif`.
- Dados numéricos: `Consolas, "SF Mono", "DejaVu Sans Mono", monospace` — obrigatório para valores numéricos.
- Bordas: 8–14 px em cartões; 999 px em pílulas.
- Marca: assinatura SVG + versão reduzida legível a 32 px.

## Responsividade

O texto diz “cinco” pontos, mas lista seis condições. Até decisão formal, validar todas:
- **>1280:** três colunas — ferramentas, cena, painéis.
- **1280:** laterais estreitadas; cena preservada.
- **1080:** rótulos secundários ocultos; menor densidade textual.
- **960:** uma coluna; cena no topo; cabeçalho fixo; abas em faixa rolável.
- **700:** medidores em grade; touch targets ampliados; cena na largura.
- **430:** marca reduzida ao símbolo; controles compactos; listas de uma coluna.

### Regra estrutural contra overflow

- Todo filho em flex/grid: `min-width: 0`.
- Canvas/tabela/faixa fixa: envolver em container com `max-width: 100%` e rolagem própria quando necessário.
- A página não deve adquirir rolagem horizontal indevida.

## Componentes padrão

1. **HUD:** identidade + medidores com barra + controles de tempo/fase.
2. **Cartão de conteúdo:** cabeçalho em caixa alta + scroll próprio.
3. **Modal de decisão:** origem, título, texto, alternativas explícitas e consequência descrita.
4. **Notificação:** curta, não bloqueante, permanência <=3,5 s.
5. **Legenda de símbolos:** sempre visível ou a um toque quando ícones representam estado/demanda.
6. **Tela inicial:** marca, contexto narrativo, objetivos, instruções e carregamento de progresso.

## Acessibilidade — gates

- Texto: contraste >=4,5:1.
- Elemento gráfico de interface: >=3:1.
- Touch target >=44×44 px.
- `prefers-reduced-motion`: remover/desativar animação decorativa.
- Informação nunca apenas por cor; adicionar ícone/rótulo/texto.
- Interativos operáveis por teclado.
- Foco visível.
- Ícones sem texto com atributos acessíveis (`aria-label`, nome acessível ou equivalente apropriado).
- Linguagem simples em pt-BR adequada à faixa etária da ficha do Hub.

## Testes de UI obrigatórios

Para cada viewport: tela inicial, HUD, menus, modal, listas, tela de ranking (se houver), import/export, notificações e estado de sincronização. Testar retrato/paisagem em celular/tablet; zoom de navegador razoável; navegação somente por teclado; reduced motion; e conteúdo com strings mais longas plausíveis.

## Critério de pronto

Sem corte lateral, sobreposição crítica, texto ilegível, controle inacessível, alvo pequeno, informação somente cromática ou símbolo sem legenda. Todo item deve ter evidência em captura ou checklist de dispositivo.

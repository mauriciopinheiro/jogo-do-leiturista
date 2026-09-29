# 🏃‍♂️ Jogo do Leiturista 3.0 — SEMAE Piracicaba

> **Desenvolvido para SEMAE Piracicaba** | **Versão:** 3.0.0 (Offline Single-File HTML5)  
> **Repositório Oficial:** [github.com/mauriciopinheiro/jogo-do-leiturista](https://github.com/mauriciopinheiro/jogo-do-leiturista)

---

## 🌟 Visão Geral

O **Jogo do Leiturista 3.0 SEMAE** é um jogo arcade de corrida e leitura de hidrômetros desenvolvido em **HTML5 Canvas puro em um único arquivo HTML offline**. 

Na versão 3.0, o jogo integra **rotas reais do banco de dados comercial SCI do SEMAE Piracicaba**, onde o leiturista percorre vias públicas reais, faz a leitura dos hidrômetros da quadra e avança em rotas de escala progressiva a bordo da lendária **Kombi Branca do SEMAE**.

---

## 🗺️ As 5 Fases Reais (Banco de Dados SCI SEMAE)

| Fase | Nome da Rota | Setor / Rota SCI | Bairro Oficial | Total Hidrômetros | Ruas da Rota |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | Rota São Dimas (Inicial) | Setor 36 / Rota 129 | São Dimas | 15 hidrômetros | *Rua Ajudante Albano*, *Avenida Holanda* |
| **Fase 2** | Rota Vila Rezende (Aprendiz) | Setor 13 / Rota 157 | Centro / Vila Rezende | 45 hidrômetros | *Rua Saldanha Marinho*, *Travessa Orestes Miglioranza*, *Travessa Benedito Salustiano Cruz* |
| **Fase 3** | Rota Bairro dos Alemães (Intermediário) | Setor 44 / Rota 207 | Bairro dos Alemães | 95 hidrômetros | *Rua Rio Branco*, *Rua Silva Jardim*, *Travessa João Guerra*, *Travessa Comercial* |
| **Fase 4** | Rota Jaraguá (Avançado) | Setor 19 / Rota 147 | Jaraguá | 150 hidrômetros | *Avenida Maria Teodora*, *Rua Maria Nazareth*, *Rua Antônio Gil de Oliveira*, etc. |
| **Fase 5** | Rota Recanto do Piracicamirim (Mestre) | Setor 31 / Rota 57 | Recanto do Piracicamirim | 230 hidrômetros | *Avenida Aniger Francisco Maria Melillo*, *Avenida Sidney Luiz Brajão*, etc. |

---

## 🚐 Funcionalidades e Mecânicas Únicas

- 🚐 **Animação da Kombi Branca SEMAE**: Cada fase inicia com o desembarque do leiturista vindo da Kombi Branca SEMAE e encerra com o leiturista embarcando na Kombi estacionada na linha de chegada.
- 👕 **Uniforme Oficial Azul SEMAE**: Leiturista estilizado no padrão visual institucional `#1351B4` com faixas refletivas.
- 📍 **HUD em Tempo Real com Ruas Reais**: Exibe o Bairro, Setor/Rota, Rua Atual e Hidrômetros Lidos/Total da Rota. Placas decorativas dinâmicas avisam a entrada em novas vias.
- 💾 **Salvamento Offline com Checagem FNV-1a**: Progresso, melhores marcas e skins salvas localmente com verificação de integridade anti-adulteração.
- 🎵 **Áudio Sintetizado Web Audio API**: Sons de pulo, leitura, combo, alertas e efeitos sem necessidade de assets de áudio externos.

---

## 🚀 Como Executar

Por ser um projeto em arquivo único HTML, basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari ou navegadores mobile):

```bash
# Abrir diretamente no navegador (Windows)
start index.html
```

---

## 📜 Governança SDD & Qualidade

Este repositório obedece ao **SDD (Specification-Driven Development)** do kit de IA CTI/SEMAE. Para validar o projeto:

```bash
python scripts/validate_sdd.py
```

---
*© 2026 SEMAE Piracicaba — Serviço Municipal de Água e Esgoto*

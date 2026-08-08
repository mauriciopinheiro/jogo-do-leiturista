# Regra normativa — Gamificação CTI/SEMAE

Esta regra deve ser **Always On** nos repositórios da frente.

Fonte de autoridade: `docs/especificacao-fonte-v1.1.md` e o DOCX original v1.1. Para qualquer tarefa que altere jogo, Hub, ranking, hospedagem ou publicação, aplique a skill `semae-normas-gamificacao` e as skills de domínio pertinentes.

## Invariantes

- Não publicar sem homologação baseada no Anexo A; reprovação exige correção ou exceção formal da Coordenação.
- Novos jogos: HTML único, autocontido, JS ES2020 sem build/transpilação, Canvas 2D para mundo e DOM para painéis/formulários, SVG inline, Web Audio sintetizado, save JSON versionado, offline completo.
- Proibido CDN/webfont externa, framework novo que exija build, `eval`, `new Function`, HTML externo não sanitizado, rastreamento não declarado, credencial/segredo no cliente e dependência exclusiva de provedor.
- O modo offline é funcionalmente completo. Rede/ranking jamais bloqueia inicialização, fase, mecânica ou partida.
- Dados do jogador devem ser minimizados. Não coletar nome completo, documento, endereço, telefone, e-mail pessoal, imagem ou geolocalização. Ranking: somente apelido, turma, escola, aplicação, pontuação e data; participação opcional e reversível.
- Save local é soberano para progresso. Nuvem guarda pontuação para ranking, não substitui o save local.
- Toda entrada externa é validada; save é parseado com `JSON.parse`, validado campo a campo, limitado em tamanho, assinado e migrado explicitamente sem destruir o anterior.
- Segurança: HTTPS/HSTS, CSP restritiva, enquadramento limitado ao Hub, `nosniff`, referrer policy, permissions policy sem câmera/mic/geolocalização, entrada como texto, sem segredos no cliente.
- Responsividade e acessibilidade são critérios de aceite: contraste, 44×44 px, teclado/foco, reduced motion, nenhuma informação só por cor, legenda de símbolos.
- Desempenho mínimo é gate: 45 FPS computador, 30 FPS celular intermediário, tela inicial <=4 s em 4G, jogável <=2 s após iniciar, memória <=250 MB, save <=100 ms.
- Laço único `requestAnimationFrame`, delta de tempo limitado, sem reconstrução DOM por quadro, pooling/teto de agentes, modo leve, suspensão em aba oculta, rede assíncrona fora do caminho crítico.
- Jogos de gestão/progressão exigem simulação automatizada de uma partida completa antes da homologação.
- Repositório institucional é a fonte única da verdade. README e registro de decisões acompanham a entrega. Código/identificadores/comentários/interface em português do Brasil.
- Cloudflare Pages é o padrão atual; qualquer migração deve cumprir integralmente os critérios de equivalência e portabilidade.

## Comportamento do agente

Antes de implementar, identifique quais itens do Anexo A serão afetados. Depois de implementar, execute auditoria de conformidade e produza evidências. Não declare conformidade sem evidência verificável. Não “corrija” ambiguidades do documento silenciosamente; consulte `docs/AMBIGUIDADES-NORMATIVAS.md` e escale decisões normativas.

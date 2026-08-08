---
name: semae-arquitetura-html-offline
description: "Define a arquitetura obrigatória dos jogos SEMAE: HTML único autocontido, JavaScript ES2020 sem build, Canvas/DOM, SVG inline, Web Audio, operação offline e proibições de dependências. Use ao criar, refatorar ou migrar qualquer aplicação."
---

# Skill: Arquitetura HTML/autocontida/offline

## Arquitetura obrigatória

| Camada | Implementação |
|---|---|
| Empacotamento | um `.html` autocontido com CSS, JS, SVG e dados necessários ao jogo |
| Linguagem | JavaScript ES2020 nativo, sem transpilação |
| Mundo do jogo | Canvas 2D |
| Painéis/formulários | DOM/HTML sem renderização por quadro |
| Vetores | SVG embutido, preferir `<symbol>` + `<use>`; favicon em data URI |
| Áudio | Web Audio API, síntese em tempo real |
| Persistência | JSON versionado em localStorage + export/import |
| Hospedagem | estática e portável |
| Dados online | serviço gerenciado via API somente para ranking/sincronização, fora do caminho crítico |

## Regras de desenho do arquivo único

- Organizar o HTML por seções claras mesmo sem módulos externos: `CONFIG`, estado, utilitários, persistência, áudio, renderização, regras de jogo, UI, integração de ranking, bootstrap.
- Não transformar “arquivo único” em código monolítico sem fronteiras. Use closures/classes/objetos de namespace internos, funções pequenas e comentários em pt-BR.
- Tudo que for necessário para uma partida completa deve existir localmente no HTML.
- Assets grandes permitidos fora do HTML não podem ser requisito funcional nem impedir modo offline.

## Proibições

Bloquear revisão se houver:
- CDN em runtime para bibliotecas ou fontes;
- webfont externa;
- React+JSX, Vue SFC ou qualquer framework que exija build em novo desenvolvimento;
- `eval(...)`;
- `new Function(...)`;
- inserção de HTML proveniente de dado externo sem sanitização; preferência normativa é inserir **texto**, não HTML;
- tracker, pixel publicitário ou coleta comportamental não declarada;
- mídia pesada embutida em base64;
- segredo/token/chave de serviço no cliente;
- dependência de API proprietária de hospedagem necessária para o jogo funcionar.

## Legado React

Versão React existente pode ser mantida apenas até migração. Não ampliar dependência estrutural de build; qualquer evolução significativa deve considerar plano de migração para o padrão HTML nativo e registrar decisão.

## Offline-first obrigatório

### Teste mínimo
1. Limpar/cachear apenas o que é inerente ao arquivo local.
2. Desligar rede antes de abrir.
3. Abrir o HTML.
4. Navegar tela inicial, instruções, carregar progresso local, jogar partida completa, pausar/reiniciar, salvar/exportar.
5. Confirmar que nenhuma tela ou mecânica some.
6. Confirmar que chamadas online não geram modal nem erro fatal.

### Falha de rede durante partida
- timeout curto;
- resultado vai para fila local;
- UI mostra estado discreto de sincronização;
- partida prossegue;
- retry acontece em marco posterior/conexão restaurada;
- id de partida garante idempotência.

## Bootstrap seguro

A inicialização deve criar a experiência local primeiro. Rede é melhoria posterior. Uma sequência recomendada:
1. carregar config embutida;
2. ler/validar save local;
3. construir UI/canvas;
4. aguardar gesto do usuário para áudio;
5. iniciar partida;
6. só então tentar sincronização/consulta de ranking sem bloquear.

## Critério de aceite arquitetural

A aplicação deve sobreviver a cópia por pen drive e continuar utilizável. Se mover o HTML para outro host estático quebrar funcionalidade principal, a arquitetura está em desacordo com a especificação.

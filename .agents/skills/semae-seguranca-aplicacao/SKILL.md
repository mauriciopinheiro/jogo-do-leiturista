---
name: semae-seguranca-aplicacao
description: "Revisa e implementa segurança do jogo cliente SEMAE: transporte, CSP, framing, cabeçalhos, entrada do usuário, dependências, segredos, logs e carregamento seguro."
---

# Skill: Segurança da aplicação

## Controles obrigatórios

### Transporte
HTTPS obrigatório no domínio institucional + HSTS.

### CSP
Política restritiva: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` apenas enquanto o script estiver embutido; sem origens externas não aprovadas. Ajustes devem preservar arquivo único e ser documentados.

### Enquadramento
`frame-ancestors` limitado ao domínio do Hub para impedir incorporação por terceiros.

### Cabeçalhos complementares
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` negando câmera, microfone e geolocalização

### Entrada do usuário
Apelido/textos livres: lista permitida de caracteres, limites de tamanho, normalização apropriada e inserção como texto. Nunca interpolar dado externo em `innerHTML`.

### Dependências
Nenhuma dependência externa em execução. Exceção formal: integridade de sub-recurso obrigatória quando tecnicamente aplicável, além de revisão de CSP/privacidade/offline.

### Segredos
Nenhuma chave, token ou credencial sensível no cliente. Integrações privilegiadas passam por serviço intermediário da CTI.

### Logs
Registrar erros de carregamento/validação sem dado pessoal.

### Identificação institucional
Aplicações na vitrine oficial devem retirar aviso de “sem vínculo” e exibir identificação institucional correta.

## Ameaças a considerar

XSS via save/apelido; HTML injection; prototype pollution via merge ingênuo; abuso de URL; replay/forja de score; exfiltração por CDN; segredo em source; clickjacking; permissões do navegador; logs contendo dados; DoS por arquivo JSON grande; estado adulterado; dependência remota indisponível.

## Revisão de save externo

Use a skill de dados/save. Segurança deve verificar limite antes da leitura, parse seguro, schema, assinatura, migração e renderização apenas textual.

## Revisão de cliente online

Toda resposta do serviço é não confiável. Validar estrutura antes de renderizar. Falhas devem ser não bloqueantes. Não confiar em CORS como autorização.

## Saída do review

Produza achados com severidade `BLOQUEANTE/ALTA/MÉDIA/BAIXA`, cenário, impacto, evidência, correção e requisito da especificação. Qualquer segredo no cliente, execução dinâmica, XSS plausível ou quebra de isolamento é bloqueante.

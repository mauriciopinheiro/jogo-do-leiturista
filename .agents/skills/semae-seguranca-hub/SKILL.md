---
name: semae-seguranca-hub
description: "Revisa segurança do Hub de Educação SEMAE, incluindo OCI IAM, perfis, publicação de URLs, sandbox de jogos, dados de perfil, auditoria, backup, cabeçalhos, rankings e documentação LGPD."
---

# Skill: Revisão de segurança do Hub de Educação

A revisão deve estar concluída antes do lançamento e repetida quando mudanças relevantes afetarem autenticação, autorização, incorporação de jogos, catálogo, ranking ou tratamento de dados.

## Frentes

1. **Autenticação / OCI IAM:** expiração/renovação de sessão; logout efetivo; proteção contra reuso de token; falha de provedor.
2. **Autorização:** privilégio mínimo; separar quem publica, edita ficha e só visualiza; separar administrador e educador.
3. **Publicação de conteúdo:** validar origem; allowlist de domínios; proibir URL arbitrária na vitrine.
4. **Isolamento:** jogos em frame/moldura com sandbox e permissões mínimas, sem alcançar sessão do Hub.
5. **Dados de perfil:** perfil e faixa etária bastam para catálogo; campo adicional precisa de justificativa.
6. **Auditoria:** registrar publicação, alteração e remoção com autor/data e retenção definida.
7. **Backup:** catálogo/configuração com teste de restauração documentado.
8. **Cabeçalhos/transporte:** aplicar controles equivalentes aos da seção 7 no domínio do Hub.
9. **Rankings:** RLS testada, chave pública restrita, rate limit ativo, painel do educador limitado à própria turma.
10. **LGPD:** operações de tratamento + aviso de privacidade revisados com encarregado, incluindo base de turma/escola.

## Testes mínimos

- sessão expira sem deixar ação privilegiada possível;
- logout invalida continuidade prática;
- token antigo/reutilizado não concede acesso indevido;
- educador não acessa administração nem turma alheia;
- usuário de edição não publica se o perfil não permitir;
- URL fora da allowlist é rejeitada;
- frame não obtém permissões de câmera/mic/geolocalização nem acesso indevido ao parent;
- alteração de ficha/publicação aparece na trilha;
- restore de backup é demonstrado;
- endpoint de score forjado não contorna RLS/função/rate limit.

## Gate de lançamento

Qualquer falha de autenticação/autorização, URL arbitrária, escape de sandbox, exposição de dados, chave privilegiada no cliente ou ausência de backup/restauração é bloqueante.

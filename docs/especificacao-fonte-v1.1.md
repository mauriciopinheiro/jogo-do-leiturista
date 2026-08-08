SEMAE PIRACICABA · COORDENADORIA DE TECNOLOGIA E INOVAÇÃO

# Especificação Técnica

# Frente de Desenvolvimento de Gamificação

Padrão de tecnologia, interface, arquivos, segurança, persistência de dados e desempenho para as aplicações educacionais gamificadas do SEMAE Piracicaba, publicadas no Hub de Educação.

| Campo | Conteúdo |
| --- | --- |
| Documento | Especificação Técnica da Frente de Gamificação — CTI/SEMAE |
| Versão | 1.1 |
| Data | 7 de agosto de 2026 |
| Alteração desta versão | Critérios de hospedagem e migração; serviço de dados com rankings por turma e escola; modo offline obrigatório |
| Área responsável | Coordenadoria de Tecnologia da Informação (CTI) |
| Liderança de testes e ajustes | Maurício Pinheiro |
| Novos desenvolvimentos | Equipe de estagiários da CTI |
| Vitrine de publicação | Hub de Educação SEMAE Piracicaba |
| Lançamento da plataforma | 18 de setembro de 2026, com divulgação à imprensa |
| Classificação | Uso interno — documento normativo da frente |

# 1. Objetivo e alcance

Este documento normatiza o desenvolvimento, a revisão e a publicação das aplicações gamificadas do SEMAE Piracicaba. Ele nasce da experiência acumulada nas aplicações já entregues e converte em padrão aquilo que funcionou, além de corrigir o que hoje varia de um jogo para outro.

Aplica-se a toda aplicação gamificada produzida pela CTI ou sob sua supervisão, seja ela educacional, de treinamento interno ou de comunicação institucional, e a toda aplicação já existente que venha a ser republicada no Hub de Educação.

## 1.1 O que motiva a padronização

As aplicações foram construídas em momentos diferentes, com decisões técnicas independentes: há jogos em arquivo único sem dependências, há versão em componente React e há persistência em Google Apps Script com planilhas.

A hospedagem hoje está integralmente no Cloudflare Pages, o que atende bem, mas não há critério objetivo escrito para avaliar uma eventual migração nem para os domínios em uso.

Não existe padrão de salvamento de progresso, o que impede o jogador de retomar de onde parou e impede a CTI de medir uso.

Não há ranking por turma e por escola, que é justamente o que transforma o jogo em atividade de sala e sustenta o interesse ao longo do bimestre.

Sem um critério de desempenho, o mesmo jogo entrega experiências distintas no laboratório de informática de uma escola e no celular de um aluno.

Com a entrada de estagiários na frente, a padronização deixa de ser preferência de estilo e passa a ser condição para revisar código de forma produtiva.

# 2. Governança da frente

A frente de gamificação é conduzida pela CTI e organizada em três papéis permanentes.

| Papel | Responsável | Atribuições |
| --- | --- | --- |
| Liderança de testes e ajustes | Maurício Pinheiro | Conduz a homologação de todas as aplicações, mantém a matriz de dispositivos, aplica o checklist de aceite do Anexo A, registra e prioriza defeitos, executa os ajustes de correção e emite o parecer que autoriza a publicação no Hub. |
| Novos desenvolvimentos | Equipe de estagiários da CTI | Desenvolve novas aplicações e evolui as existentes seguindo esta especificação, sob orientação técnica da coordenação e com revisão obrigatória antes de qualquer publicação. |
| Coordenação e arquitetura | Coordenadoria de Tecnologia da Informação | Mantém esta especificação, define prioridades e o roteiro de conteúdo, aprova exceções técnicas, responde pela segurança da plataforma e pela relação com as áreas demandantes. |

| Regra de publicação Nenhuma aplicação entra no Hub de Educação sem parecer de homologação assinado pela liderança de testes. O parecer é emitido sobre o checklist do Anexo A, e cada item reprovado precisa de correção ou de exceção formal registrada pela coordenação. |
| --- |

## 2.1 Trabalho dos estagiários

A frente é também um espaço de formação. Para que isso funcione sem comprometer a qualidade da entrega, valem quatro regras:

Todo desenvolvimento parte de um modelo de projeto mantido pela CTI, já com a estrutura de arquivos, a folha de estilo padrão e os utilitários de salvamento e áudio.

Nenhum código vai para o ambiente de publicação sem revisão de um servidor efetivo da CTI.

Cada estagiário mantém um registro de decisões técnicas da sua aplicação, com uma linha por decisão relevante, entregue junto com o código.

Entregas parciais são preferíveis a entregas grandes: uma fase jogável e testada vale mais que quatro fases não homologadas.

# 3. Padrão tecnológico

## 3.1 Base obrigatória

| Camada | Padrão adotado | Observação |
| --- | --- | --- |
| Empacotamento | Arquivo HTML único, autocontido | CSS, JavaScript, SVG e dados no mesmo arquivo. Funciona offline e sobrevive a cópia por pen drive na escola. |
| Linguagem | JavaScript ES2020, sem transpilação | Sem etapa de build. O que está no arquivo é o que roda. |
| Renderização | Canvas 2D para o mundo do jogo; DOM para painéis e formulários | Canvas para cena e agentes; HTML para tudo que precisa ser lido, rolado ou preenchido. |
| Gráficos vetoriais | SVG embutido (símbolo + use) | Logotipos, ícones e marcas em SVG inline; favicon em data URI. |
| Áudio | Web Audio API com síntese em tempo real | Trilha e efeitos gerados por código, sem arquivos de mídia. |
| Persistência | JSON versionado em localStorage e exportação em arquivo | Detalhado na seção 6. |
| Hospedagem | Cloudflare Pages, sob domínio institucional | Padrão atual. Migração permitida para serviço equivalente que atenda aos critérios de 3.4. |
| Serviço de dados | Plataforma gerenciada com Postgres e API (Supabase ou equivalente) | Sustenta os rankings por turma e por escola. Detalhado na seção 6. |
| Distribuição | Hub de Educação SEMAE | Ficha no padrão de loja de aplicativos, com teaser, classificação etária e perfis de destino. |

## 3.2 O que não é permitido

Bibliotecas ou fontes carregadas de CDN externa em tempo de execução: criam dependência de rede, risco de indisponibilidade e vazam acesso do usuário para terceiros.

Frameworks que exijam etapa de build (React com JSX, Vue com SFC) em aplicações novas. A versão React existente será mantida apenas até sua migração.

Uso de eval, new Function ou atribuição de HTML não sanitizado vindo de dado externo.

Rastreadores, pixels de publicidade ou qualquer coleta de comportamento não declarada na ficha da aplicação.

Arquivos de mídia pesados embutidos em base64 no HTML: vídeo e imagem grande ficam fora, referenciados pelo Hub.

## 3.3 Estrutura e nomenclatura

Nomes de arquivo e de pasta em minúsculas, com hífen: jogo-laboratorio-em-acao.html.

Versionamento semântico no formato MAIOR.MENOR.CORREÇÃO, declarado em constante no topo do arquivo e exibido no rodapé da tela inicial.

Código, comentários, identificadores e interface em português do Brasil.

Cada aplicação acompanha um README com objetivo pedagógico, público, faixa etária, instruções de teste e histórico de versões.

Repositório institucional da CTI como fonte única da verdade; publicações são geradas a partir dele, nunca o contrário.

## 3.4 Hospedagem e critérios de equivalência

As aplicações estão hospedadas no Cloudflare Pages e essa permanece a plataforma padrão. A migração para outro serviço é permitida — e desejável se houver ganho de custo ou de operação — desde que o candidato atenda a todos os critérios abaixo, verificados e registrados pela coordenação antes da troca.

| Critério | Exigência mínima |
| --- | --- |
| Disponibilidade | Compromisso de 99,9% ao mês, com página pública de estado do serviço. |
| Desempenho | Distribuição em borda com ponto de presença no Brasil; primeiro byte abaixo de 200 ms e tela inicial abaixo de 2 segundos em 4G. |
| Transporte | HTTPS com certificado automático, HSTS e suporte a domínio próprio da autarquia. |
| Cabeçalhos | Configuração livre de cabeçalhos de segurança, incluindo política de conteúdo e restrição de enquadramento. |
| Publicação | Implantação a partir do repositório, com ambiente de pré-visualização e retorno imediato à versão anterior. |
| Independência | Publicação de arquivos estáticos sem etapa proprietária de compilação, para que a saída continue portável. |
| Custo e contrato | Custo previsível e compatível com a modalidade de contratação da autarquia. |
| Registro | Acesso a registros de acesso e de erro, sem dado pessoal do usuário. |

| Independência de fornecedor Como toda aplicação é um arquivo HTML autocontido, a troca de hospedagem se resume a copiar arquivos e apontar o domínio. Essa portabilidade é um requisito de projeto, não uma consequência: nenhuma aplicação pode depender de recurso exclusivo de um provedor para funcionar. |
| --- |

# 4. Padrão de interface

## 4.1 Identidade visual

| Elemento | Padrão |
| --- | --- |
| Paleta base | Fundo petróleo #08202F a #0F3247; água #17A8CF; água clara #5FDCF2; alerta/EPI #FF9F1C; erro #E04A5F; sucesso #45CF8A |
| Tipografia de título | Pilha condensada do sistema: Bahnschrift, DIN Alternate, Archivo Narrow, Trebuchet MS |
| Tipografia de texto | Segoe UI, Verdana, system-ui |
| Tipografia de dados | Consolas, SF Mono, DejaVu Sans Mono — obrigatória para valores numéricos |
| Raio de borda | 8 a 14 px em cartões, 999 px em pílulas |
| Marca | Assinatura da aplicação em SVG, com versão reduzida legível a 32 px |

## 4.2 Responsividade

Os pontos de quebra são fixos para toda a frente, e cada aplicação deve ser verificada nos cinco:

| Ponto de quebra | Comportamento esperado |
| --- | --- |
| Acima de 1280 px | Layout completo em três colunas: ferramentas, cena e painéis. |
| 1280 px | Colunas laterais estreitadas, cena preservada. |
| 1080 px | Rótulos secundários ocultos; densidade de texto reduzida. |
| 960 px | Empilhamento em coluna única, cena no topo, cabeçalho fixo, abas em faixa rolável. |
| 700 px | Medidores em grade, alvos de toque ampliados, cena ajustada à largura da tela. |
| 430 px | Marca reduzida ao símbolo, controles compactos, listas de uma coluna. |

| Regra que evita o defeito mais comum Todo elemento em contêiner flex ou grid recebe min-width: 0, e todo elemento de dimensão fixa — canvas, tabela larga, faixa de medidores — fica dentro de um contêiner com max-width: 100% e rolagem própria. Sem isso, um único filho de largura fixa estica a página inteira e o conteúdo aparece cortado no celular. Esse foi o defeito recorrente nas aplicações já entregues. |
| --- |

## 4.3 Componentes padrão

Cabeçalho de estado (HUD): identidade, medidores com barra de progresso e controles de tempo ou fase.

Cartões de conteúdo com cabeçalho em caixa alta e área de rolagem própria.

Modal de decisão: origem, título, texto e alternativas explícitas com consequência descrita.

Notificações curtas, não bloqueantes, com no máximo três segundos e meio de permanência.

Legenda de símbolos sempre visível ou a um toque, obrigatória em toda aplicação que use ícones para representar estados ou demandas.

Tela inicial com marca, contexto narrativo, objetivos e acesso a instruções e a carregamento de progresso.

## 4.4 Acessibilidade e linguagem

Contraste mínimo de 4,5:1 para texto e 3:1 para elementos gráficos de interface.

Alvo de toque mínimo de 44 por 44 pixels em telas sensíveis.

Suporte a prefers-reduced-motion, desativando animações decorativas.

Nenhuma informação transmitida apenas por cor: sempre acompanhada de ícone, rótulo ou texto.

Elementos interativos operáveis por teclado, com foco visível, e atributos de acessibilidade em ícones sem texto.

Linguagem simples, em português do Brasil, adequada à faixa etária declarada na ficha do Hub.

## 4.5 Áudio

Trilha e efeitos sintetizados em Web Audio, sem arquivos de mídia.

Controles independentes de música e de efeitos, sempre visíveis, com estado indicado.

Início do áudio apenas após interação do usuário, conforme a política dos navegadores.

Nível de referência: pico abaixo de 0,85 e volume médio entre -18 e -21 dBFS, com compressor no barramento final.

Envelopes com rampa até zero e ataque mínimo de 3 ms nas percussões, para eliminar estalos.

Suspensão do contexto de áudio quando a aba perde o foco.

# 5. Tipos e tamanhos de arquivo

Os limites abaixo consideram o acesso pela rede das escolas municipais e por dados móveis do próprio aluno.

| Item | Formato aceito | Limite | Regra |
| --- | --- | --- | --- |
| Aplicação | .html | 2 MB | Arquivo único, autocontido, minificação opcional. |
| Pacote completo | pasta publicada | 8 MB | Inclui imagens e teaser referenciados. |
| Ilustração e ícone | .svg | 150 KB | Formato preferencial; inline quando reutilizado. |
| Imagem rasterizada | .webp, .png | 300 KB por arquivo | JPG somente para fotografia histórica; sem GIF. |
| Fotografia | .jpg | 500 KB | Máximo 1600 px no maior lado, com crédito da fonte. |
| Teaser da ficha | .mp4 H.264 | 20 MB | 1080p, até 30 segundos, hospedado fora do HTML. |
| Vídeo de abertura | .mp4 H.264 | 80 MB | Opcional, carregado sob demanda, nunca bloqueante. |
| Save do jogador | .json | 256 KB | Estrutura da seção 6, exportável pelo usuário. |
| Fonte tipográfica | — | — | Somente fontes do sistema; webfont externa não é permitida. |
| Documentação | .md | — | README por aplicação, versionado junto ao código. |

# 6. Dados, salvamento e carregamento

## 6.1 Princípios

As aplicações atendem estudantes, inclusive crianças e adolescentes. A regra estruturante é a minimização: o jogo guarda o necessário para devolver o progresso ao jogador e nada além disso.

Proibido coletar nome completo, documento, endereço, telefone, e-mail pessoal, imagem ou geolocalização.

Identificação por apelido escolhido pelo jogador e, no uso em sala, por turma e escola — jamais por dado que identifique diretamente a pessoa.

Turma e escola são dados da atividade, não do aluno: servem para agrupar pontuação e não podem ser combinados com qualquer campo que permita chegar a um estudante específico.

Toda coleta declarada na ficha da aplicação no Hub, em linguagem compreensível pela faixa etária de destino.

Base legal, finalidade e prazo de retenção registrados no inventário de tratamento do SEMAE, sob acompanhamento do encarregado de dados.

Ranking e torneio, quando existirem, exibem apenas apelido e pontuação, com opção de participar ou não.

## 6.2 Dois modos obrigatórios

Toda aplicação entrega os dois modos a partir do mesmo arquivo, sem versões separadas para manter:

| Modo | Quando ocorre | Comportamento |
| --- | --- | --- |
| Online | Há rede e o jogador optou por participar do ranking | Progresso salvo localmente e pontuação enviada ao serviço de dados, alimentando os rankings geral, por escola e por turma. |
| Offline | Sem rede, sem autorização de participação ou por escolha do jogador | Jogo completo, sem qualquer perda de conteúdo ou de função. Progresso guardado localmente e exportável em arquivo. Pontuações ficam em fila e sobem quando houver rede. |

| O offline não é uma versão reduzida A rede das escolas municipais cai, e a aula não pode cair junto. Nenhuma tela, fase ou mecânica pode depender de conexão: sem rede, o jogador perde apenas o ranking ao vivo. Aplicação que exibe erro, trava ou esconde conteúdo quando o servidor não responde é reprovada na homologação. |
| --- |

## 6.3 Estrutura do save

Todo salvamento usa o mesmo envelope, o que permite validar, migrar e diagnosticar qualquer aplicação com o mesmo utilitário:

| Campo | Tipo | Função |
| --- | --- | --- |
| app | texto | Identificador da aplicação, em kebab-case. |
| versaoJogo | texto | Versão semântica que gerou o save. |
| versaoEsquema | inteiro | Versão da estrutura de dados, usada na migração. |
| criadoEm | ISO 8601 | Data e hora da gravação. |
| apelido | texto | Identificação escolhida pelo jogador, opcional. |
| turma | texto | Turma informada no uso em sala, opcional. |
| escola | texto | Escola, selecionada em lista fechada mantida pela CTI. |
| estado | objeto | Progresso do jogo, exclusivo de cada aplicação. |
| assinatura | texto | Resumo criptográfico do estado, para detectar adulteração. |

## 6.4 Serviço de dados e rankings

O ranking por turma e por escola é prioridade da frente: é ele que transforma uma boa aplicação em atividade recorrente de sala de aula. Para sustentá-lo, a persistência em Google Apps Script com planilhas será substituída por uma plataforma gerenciada com banco relacional e API — o Supabase é a referência adotada, e qualquer serviço equivalente é aceito desde que atenda aos mesmos requisitos.

| Requisito | Exigência |
| --- | --- |
| Banco de dados | Relacional gerenciado, com esquema versionado em migrações mantidas no repositório. |
| Segurança por linha | Regras de acesso no próprio banco: leitura pública apenas das visões de ranking, gravação somente pela função de envio. |
| Chaves | Somente chave pública de escopo restrito no cliente; chave de serviço jamais embarcada na aplicação. |
| Gravação | Envio por função no servidor que recalcula e valida a pontuação, rejeitando valor impossível para a partida declarada. |
| Limitação de taxa | Teto de envios por apelido e por endereço, com bloqueio progressivo em caso de abuso. |
| Moderação | Apelido filtrado por lista de termos vedados e passível de remoção pelo painel administrativo. |
| Dados | Apenas apelido, turma, escola, aplicação, pontuação e data. Nenhum outro campo é permitido. |
| Retenção e cópia | Prazo de retenção declarado por temporada, com backup diário e teste de restauração documentado. |
| Portabilidade | Exportação completa em formato aberto, para que a troca de fornecedor não implique perda de histórico. |

Enquanto o serviço não estiver em produção, a solução atual em planilha permanece apenas como contingência, sem receber novas aplicações.

## 6.5 Desenho dos rankings

Três escopos obrigatórios: geral, por escola e por turma. O escopo de turma é o que mais mobiliza e deve ser o primeiro exibido quando a turma estiver identificada.

Ranking de escola e de turma calculado por média das melhores pontuações dos participantes, e não por soma, para não premiar a turma apenas por ser maior.

Temporadas com início e fim declarados, permitindo campeonato por bimestre sem que o histórico apague o resultado anterior.

Critério de pontuação documentado na ficha da aplicação, em linguagem que o educador consiga explicar à turma.

Participação opcional e reversível: o jogador escolhe se entra no ranking e pode sair, com remoção do registro.

Painel do educador no Hub com o ranking da própria turma e exportação em planilha para uso pedagógico.

## 6.6 Sincronização

Fila local de resultados pendentes, enviada quando a conexão retorna, sem exigir ação do jogador.

Identificador único por partida, para que reenvio não gere pontuação duplicada.

Envio em segundo plano, jamais bloqueando a jogabilidade; falha de rede não interrompe a partida nem gera alerta modal.

Tempo limite curto nas chamadas, com desistência silenciosa e nova tentativa no próximo marco.

Indicação discreta do estado de sincronização na interface, para que o educador saiba se a turma já pontuou.

## 6.6 Onde o progresso é guardado

Padrão local: localStorage com chave no formato semae.<aplicacao>.v<versaoEsquema>, limitada a 256 KB, com gravação a cada marco relevante e não a cada quadro.

Cópia do jogador: exportação e importação de arquivo .json pela própria interface, que também é o caminho de recuperação quando o navegador limpa o armazenamento.

Uso em sala com ranking: envio ao serviço de dados da seção 6.4, com identificação por apelido, turma e escola, e transporte exclusivamente em HTTPS.

O progresso continua sendo do jogador: a nuvem guarda pontuação para ranking, não substitui o save local.

## 6.8 Carregamento seguro

O carregamento é o ponto onde um arquivo vindo de fora entra na aplicação, e por isso recebe tratamento defensivo:

Análise com JSON.parse dentro de tratamento de erro, nunca com eval.

Validação de esquema campo a campo, com tipo e faixa esperados; qualquer divergência recusa o arquivo com mensagem clara.

Conferência da assinatura: save adulterado é recusado, e a aplicação segue com o progresso local.

Migração explícita entre versões de esquema, com preservação do save anterior antes de qualquer conversão.

Limite de tamanho verificado antes da leitura, para impedir consumo excessivo de memória.

Nenhum conteúdo do save é inserido na página como HTML: apenas como texto.

# 7. Segurança da aplicação

| Controle | Exigência |
| --- | --- |
| Transporte | HTTPS obrigatório, com HSTS habilitado no domínio institucional. |
| Política de conteúdo | CSP restritiva: default-src 'self'; script-src 'self' 'unsafe-inline' apenas enquanto o script for embutido; sem origens externas. |
| Enquadramento | frame-ancestors limitado ao domínio do Hub, para impedir incorporação por terceiros. |
| Cabeçalhos complementares | X-Content-Type-Options: nosniff; Referrer-Policy: strict-origin-when-cross-origin; Permissions-Policy negando câmera, microfone e geolocalização. |
| Entrada do usuário | Apelido e textos livres validados por lista de caracteres permitidos e inseridos como texto, nunca como HTML. |
| Dependências | Sem dependência externa em execução; se houver exceção aprovada, uso obrigatório de integridade de sub-recurso. |
| Segredos | Nenhuma chave, token ou credencial no código do cliente; integrações passam por serviço intermediário da CTI. |
| Registro | Erros de carregamento e falhas de validação registrados sem qualquer dado pessoal. |
| Aviso institucional | Retirada dos avisos de ausência de vínculo com o SEMAE nas aplicações que passarem à vitrine oficial, substituídos pela identificação institucional correta. |

# 8. Revisão de segurança do Hub de Educação

O Hub concentra o acesso às aplicações e, por isso, concentra também o risco. A revisão a seguir precisa estar concluída antes do lançamento.

| Frente | O que revisar |
| --- | --- |
| Autenticação | Fluxo do OCI IAM revisado ponta a ponta: expiração e renovação de sessão, encerramento efetivo no logout, proteção contra reuso de token e tratamento de falha de provedor. |
| Autorização | Perfis do painel administrativo com privilégio mínimo: quem publica, quem edita ficha e quem apenas visualiza; separação clara entre administrador e educador. |
| Publicação de conteúdo | Validação de origem das aplicações incorporadas, com lista de domínios permitidos; nenhuma URL arbitrária pode ser publicada na vitrine. |
| Isolamento | Aplicações carregadas em moldura com sandbox e permissões mínimas, para que uma falha em um jogo não alcance a sessão do Hub. |
| Dados de perfil | Revisão do que é guardado do usuário: perfil e faixa etária bastam para direcionar o catálogo; qualquer campo além disso precisa de justificativa. |
| Trilha de auditoria | Registro de publicação, alteração e remoção de aplicação, com autor e data, retido por prazo definido. |
| Cópia de segurança | Rotina de backup do catálogo e das configurações, com teste de restauração documentado antes do lançamento. |
| Cabeçalhos e transporte | Mesmos controles da seção 7 aplicados ao domínio do Hub. |
| Serviço de rankings | Regras de acesso por linha testadas, chave pública de escopo restrito, limitação de taxa ativa e painel do educador restrito à própria turma. |
| Documentação LGPD | Registro das operações de tratamento e aviso de privacidade publicado, revisados com o encarregado de dados, incluindo a base de turma e escola. |

# 9. Desempenho

Desempenho aqui não é refinamento: um jogo que engasga em sala de aula perde a turma em minutos. Os limites abaixo são critério de aceite, verificados no aparelho de referência definido pela liderança de testes.

| Métrica | Alvo | Mínimo aceitável |
| --- | --- | --- |
| Taxa de quadros em computador | 60 quadros por segundo | 45 quadros por segundo |
| Taxa de quadros em celular intermediário | 45 quadros por segundo | 30 quadros por segundo |
| Tempo até a tela inicial em 4G | 2 segundos | 4 segundos |
| Tempo até jogável após o toque em iniciar | 1 segundo | 2 segundos |
| Memória ocupada pela aba | 150 MB | 250 MB |
| Vozes de áudio simultâneas | 32 em computador | 16 em celular |
| Tempo de gravação do save | imperceptível | 100 milissegundos |

## 9.1 Técnicas obrigatórias

Laço único de animação com requestAnimationFrame e avanço por tempo decorrido, nunca por número de quadros, para que a simulação não acelere em máquina rápida.

Limite superior no tempo decorrido de cada quadro, evitando saltos após a aba voltar do segundo plano.

Redesenho restrito ao canvas: nada de recriar árvore DOM a cada quadro; painéis só são reconstruídos quando o dado muda.

Teto de agentes simultâneos em cena, com reaproveitamento de objetos em vez de criação contínua.

Modo leve automático em telas sensíveis ao toque ou de largura reduzida: menos vozes de áudio, sem reverberação por convolução, menos elementos decorativos e maior janela de áudio.

Suspensão do laço e do áudio quando a aba está oculta.

Nenhuma leitura de propriedade que force recálculo de layout dentro do laço de animação.

Chamadas de rede sempre assíncronas e fora do caminho crítico: consulta de ranking e envio de pontuação nunca seguram a partida nem a tela inicial.

## 9.2 Equilíbrio verificado por simulação

Jogos de gestão e de progressão devem ter seu equilíbrio verificado por simulação automatizada antes da homologação: uma partida completa executada sem interface, registrando indicadores por ciclo. É assim que se descobre, sem depender de sorte em teste manual, que uma meta é inalcançável ou que o jogador quebra no terceiro mês.

# 10. Teste e homologação

## 10.1 Matriz mínima de dispositivos

| Categoria | Configuração de referência |
| --- | --- |
| Computador da rede municipal | Windows com Chrome atualizado, resolução 1366 por 768 |
| Computador da CTI | Windows com Chrome e Edge, resolução 1920 por 1080 |
| Celular Android intermediário | Tela de 6 polegadas, Chrome, retrato e paisagem |
| Celular iOS | Safari em versão corrente |
| Tablet | Uso em sala, retrato e paisagem |
| Rede | Wi-Fi da escola e 4G, com teste em conexão limitada |

## 10.2 Ciclo de homologação

Entrega do desenvolvedor com README, versão declarada e registro de decisões.

Revisão de código por servidor efetivo da CTI, com foco em segurança e persistência.

Bateria de testes conduzida pela liderança de testes sobre o checklist do Anexo A.

Correções e reteste dos itens reprovados.

Parecer de homologação e publicação da ficha no Hub.

Acompanhamento pós-publicação por sete dias, com canal aberto para relato de defeitos.

# 11. Cronograma até o lançamento

O lançamento da plataforma está marcado para 18 de setembro de 2026, com divulgação à imprensa — jornais, rádio e demais veículos. A data é firme, o que torna o congelamento de código inegociável.

| Período | Entrega |
| --- | --- |
| 8 a 15 de agosto | Inventário e diagnóstico das aplicações existentes contra esta especificação; lista de não conformidades por jogo. |
| 18 a 29 de agosto | Adequação técnica das aplicações: segurança, salvamento, desempenho e responsividade. |
| 18 de agosto a 5 de setembro | Implantação do serviço de dados e dos rankings por turma e escola, com migração do que hoje está em planilha. |
| 25 de agosto a 5 de setembro | Revisão de segurança do Hub: autenticação, perfis, isolamento, auditoria, backup e serviço de rankings. |
| 1 a 8 de setembro | Testes integrados na matriz de dispositivos, sob condução da liderança de testes, incluindo ensaio com a rede desligada e com rede instável. |
| 9 a 12 de setembro | Correção dos defeitos bloqueantes e reteste. |
| 12 de setembro | Congelamento de código: a partir daqui, somente correção de defeito crítico. |
| 15 de setembro | Homologação final, ensaio de carga e fechamento do material de imprensa. |
| 16 e 17 de setembro | Publicação, conferência das fichas e ensaio da apresentação. |
| 18 de setembro | Lançamento oficial da plataforma, com divulgação à imprensa. |

| Preparação para a imprensa Até 15 de setembro devem estar prontos: texto de divulgação, captura de tela de cada aplicação, teaser de quinze segundos por jogo, roteiro de demonstração ao vivo com plano alternativo sem internet e definição dos porta-vozes. Toda demonstração pública usa a versão congelada, jamais o ambiente de desenvolvimento. |
| --- |

# Anexo A — Checklist de aceite

Aplicado a cada aplicação antes da publicação. Item reprovado impede a publicação, salvo exceção formal da coordenação.

| Nº | Item verificado |
| --- | --- |
| 1 | Abre em arquivo único, sem requisição externa, com a rede desligada. |
| 2 | Versão declarada no arquivo e visível na tela inicial. |
| 3 | Layout íntegro nos cinco pontos de quebra, sem corte lateral ou rolagem horizontal indevida. |
| 4 | Alvos de toque adequados e operação completa por toque em celular. |
| 5 | Contraste e legibilidade conferidos; nenhuma informação apenas por cor. |
| 6 | Legenda de símbolos presente e correta. |
| 7 | Áudio inicia após interação, com controles independentes e sem estalo ou distorção. |
| 8 | Salvamento e carregamento funcionando, inclusive por arquivo exportado. |
| 9 | Save adulterado e save de versão anterior tratados sem quebra da aplicação. |
| 10 | Nenhum dado pessoal coletado além do declarado na ficha. |
| 11 | Taxa de quadros dentro do mínimo no aparelho de referência. |
| 12 | Tempo de carregamento dentro do limite em 4G. |
| 13 | Ausência de erro no console durante uma partida completa. |
| 14 | Equilíbrio verificado por simulação, quando aplicável. |
| 15 | Textos revisados, sem erro de português e adequados à faixa etária. |
| 16 | Conteúdo técnico e jurídico conferido com a área responsável. |
| 17 | Créditos e fontes de imagem corretos. |
| 18 | Ficha do Hub completa: teaser, descrição, faixa etária, perfis e trilha. |
| 19 | Identificação institucional correta, sem aviso de ausência de vínculo. |
| 20 | README e registro de decisões entregues no repositório. |
| 21 | Partida completa jogada com a rede desligada, sem erro, trava ou perda de conteúdo. |
| 22 | Pontuação enfileirada offline e enviada ao voltar a conexão, sem duplicidade. |
| 23 | Rankings geral, por escola e por turma corretos, com participação opcional e reversível. |
| 24 | Regras de acesso por linha e limitação de taxa testadas contra envio forjado. |
| 25 | Aplicação publicada em pasta portável, sem dependência de recurso exclusivo do provedor. |

# Anexo B — Aplicações em carteira

Situação na data deste documento. As adequações previstas seguem o cronograma da seção 11.

| Aplicação | Natureza | Principal adequação prevista |
| --- | --- | --- |
| Piracicaba: Águas de uma Civilização | Estratégia histórica sobre o saneamento na bacia do PCJ, com mapa por bairros e trilha de viola caipira | Migrar a persistência em planilha para o serviço de dados e reaproveitar seu torneio como base dos rankings por turma e escola; revisar desempenho do mapa em celular |
| Piracity e os desafios aleatórios | Plataforma 2D sobre fraudes em ligação de água | Corrigir responsividade em modo paisagem e adequar controles de toque |
| Laboratório em Ação | Gestão do laboratório de controle de qualidade de uma ETA | Migrar hospedagem para o domínio institucional e retirar o aviso de ausência de vínculo |
| Treinamento LGPD | Capacitação interna em proteção de dados, em formato de coleção e evolução | Adequar identidade visual ao padrão, implantar salvamento e ranking interno por unidade |
| Autarquia: Simulador de Gestão do Saneamento | Simulação de gestão de autarquia municipal, com licitações, controle externo e universalização | Concluir salvamento no padrão, aderir aos rankings e publicar ficha no Hub |
| Hub de Educação SEMAE | Vitrine e distribuição das aplicações por perfil e faixa etária | Revisão de segurança completa conforme a seção 8 e painel de ranking do educador por turma |

Documento mantido pela Coordenadoria de Tecnologia da Informação do SEMAE Piracicaba. Revisões desta especificação seguem o mesmo versionamento das aplicações e são comunicadas à frente antes de entrar em vigor.

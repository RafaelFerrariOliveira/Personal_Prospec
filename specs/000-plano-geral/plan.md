# Implementation Plan: Personal Prospec (plano geral das specs 001 a 010)

**Branch**: `000-plano-geral` (sem branch git; decisão manual) | **Date**: 2026-10-23 | **Spec**: `specs/001-campanhas` a `specs/010-operacao-controle`

**Input**: as 10 specs do projeto, `docs/discovery/validacao-bloqueios.md` e a constituição v1.0.0. Este plano cobre o produto inteiro. Cada spec ganha depois suas tasks (`/speckit-tasks`), na ordem das fases abaixo.

**Escopo desta etapa**: somente plano técnico. Nenhum código, nenhuma instalação, nenhum `/speckit-tasks` nem `/speckit-implement`.

> **Atualização de escopo (2026-11-01)**: a Etapa 1 é só prospecção. As specs 005 (Natasha) e 006 (HERMES) estão adiadas. Tudo neste plano que citar Natasha, HERMES, mensagem, envio ou resposta comercial vale para a etapa seguinte. Detalhes e efeitos em `escopo-etapa-1.md`.

## Summary

Sistema local de uso individual: o Rafael cria uma campanha, o backend pesquisa empresas em segundo plano (Agente Coulson), ele aprova cada lead, a Natasha prepara a mensagem de WhatsApp, ele envia manualmente pelo HERMES e registra o resultado. Banco central de empresas, tarefas, dashboard e operação completam o ciclo.

Abordagem técnica, toda dentro do padrão já decidido (monorepo, backend em camadas, front MVVM):

- **Um único processo de backend** com API HTTP e um `BackgroundService` que consome uma **fila persistente em SQL Server** (sem Hangfire, sem broker). A mesma fila serve pesquisa, pesquisa complementar, mensagem e envio.
- **IA** por uma porta (`IAiResearchClient`) cujo adaptador executa o binário oficial `claude -p` como processo filho, logado pelo Rafael, em diretório vazio, com ferramentas mínimas e saída validada por JSON Schema. Sem chave de API.
- **HERMES** por outra porta (`IMessageDispatchClient`), via webhook local com HMAC, envio sempre disparado por ação humana e executado com tentativa única.
- **Tempo real** por Server-Sent Events (nativo do ASP.NET Core e do navegador, sem dependência nova). O evento só avisa "mudou"; o front busca os dados pelos endpoints normais.
- **Multi-tenant** mantido pela constituição: uma unidade de negócio fixa criada no seed, com `BusinessUnitId` em todas as entidades do produto.

## Technical Context

**Language/Version**: C# 14 / .NET 10 (SDK 10.0.302 pinado) e TypeScript strict / React 19 / Node 22 (já no esqueleto).

**Primary Dependencies**: as do padrão (EF Core 10, FluentValidation, NodaTime, Identity customizado, Argon2 e JwtBearer das notas; Inversify, Zod 4, react-hook-form, styled-components). Candidatas a dependência nova, todas sujeitas a aprovação do Rafael: biblioteca de planilha `.xlsx` (spec 010) e biblioteca de calendário (spec 008). Versões vêm de fonte verificável na hora de instalar, nunca deste plano.

**Storage**: SQL Server (code-first, schema único, sigla ainda [A DEFINIR], hoje `APP`). Base aberta de CNPJ em schema separado, só leitura.

**Testing**: xUnit v3 + Moq + Testcontainers + Respawn + ArchUnitNET no backend; Vitest + Testing Library + Storybook + Playwright no front. Adaptadores de IA e HERMES sempre trocados por fakes nos testes automáticos.

**Target Platform**: computador Windows do Rafael, execução local (`dotnet run` e `npm run dev`). Empacotar como serviço do Windows está fora do escopo.

**Project Type**: aplicação web (backend `backend/`, frontend `frontend/`), uso individual.

**Performance Goals**: os das specs. Pontos de atenção: busca de empresas em segundos para milhares de registros (007 SC-001), dashboard atualizado em até 5 s (009 SC-002), comparação de 50 campanhas em menos de 3 s (009 SC-005), backup de 10 mil empresas em menos de 2 min (010 SC-006).

**Constraints**: custo extra zero (sem chave de API nem serviço pago); limite da assinatura Claude pausa a campanha; WhatsApp só com envio manual e sem reenvio automático; LGPD; tudo local.

**Scale/Scope**: 1 usuário, 1 unidade de negócio, dezenas de campanhas, milhares de empresas, dezenas de leads por campanha.

## Constitution Check

*GATE: passar antes da Fase 0; reavaliado depois do desenho (Fase 1).*

| Princípio | Resultado | Como o plano atende |
|---|---|---|
| I. Camadas do backend | Passa | Entidades anêmicas no Domain, `XxxCommandService` e `XxxQueryService`, notifications, `UnitOfWorkFilter`, mappers manuais. Portas de IA e HERMES são interfaces no ApplicationService; adaptadores na Infra. Sem MediatR, AutoMapper nem Swashbuckle |
| II. MVVM e dados no front | Passa | 5 arquivos por página, Service + Interface + DI + Zod, Redux só global (sessão), estado de feature no controller |
| III. Segurança e tenant | Passa com 1 ponto a decidir | Cookie HttpOnly, CSRF, segredos em user-secrets, `ITenantOwned` em todas as entidades do produto. Ponto: a base de CNPJ é dado de referência global, sem tenant (ver Complexity Tracking) |
| IV. Testes | Passa | Estratégia por camada na seção "Estratégia de testes" |
| V. Simplicidade | Passa com aprovações pendentes | Fila própria em vez de biblioteca; SSE em vez de SignalR; uma tabela de eventos para linha do tempo, histórico e auditoria. Dependência nova só com aprovação |
| VI. Sem invenção | Passa com pendências declaradas | O que depende de teste prático está em "Bloqueios de implementação" e em `research.md`, com critério de liberação. Nada foi assumido como fato |

**Reavaliação pós-desenho**: sem violação nova. Dois pedidos de aceite do Rafael, ambos em Complexity Tracking.

## Decisões que dependem do Rafael

Cada item tem uma recomendação. Enquanto não houver resposta, o plano segue a recomendação.

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Idioma dos identificadores de código (entidades, controllers, rotas) | Inglês no código e nas rotas (`api/Campaign/create_campaign`), pt-BR só na interface e nas mensagens. Segue o exemplo das rules |
| D2 | Biblioteca `.xlsx` para a exportação em Excel | Aprovar uma biblioteca de licença permissiva na hora da spec 010; CSV entra antes, sem dependência |
| D3 | Calendário da spec 008 | Grade mensal e semanal própria, simples, sem dependência (YAGNI). Biblioteca só se a grade não bastar |
| D4 | (removida) Provedor de e-mail da recuperação de senha | Recuperação de senha removida em 2026-11-02; o sistema não envia e-mail |
| D5 | Onde roda o SQL Server | Instância local (instalada ou contêiner). Define o caminho do backup (spec 010) |
| D6 | Importar a base de CNPJ inteira ou filtrada | Importação filtrada por UF e CNAE durante a leitura do arquivo, só do que as campanhas precisam |
| D7 | Sigla do schema SQL | Escolha do Rafael; até lá `APP` |
| D8 | Persistir os `DomainLogger` em tabela (pendência 14 do backend) | Sim: a spec 010 exige logs técnicos consultáveis |

## Bloqueios de implementação (precisam de teste prático, não de opinião)

| Bloqueio | Afeta | Critério para liberar |
|---|---|---|
| B1. Comportamento de `claude -p` sob o plano (assinatura) chamado por um processo .NET | 003, 005, 010 | Spike S0.1 passa: autentica sem `ANTHROPIC_API_KEY`, devolve JSON no esquema pedido, busca na web funciona com as ferramentas restritas e o sinal de limite esgotado é identificável |
| B2. (ADIADO, etapa seguinte) Formato do destino e da resposta do webhook do HERMES | 006 | Spike S0.2 passa: envio de teste a número do próprio Rafael, formato do `chat_id` e corpo da resposta registrados |
| B3. Layout e tamanho dos arquivos abertos de CNPJ | 003 | Spike S0.3 passa: leitura em streaming com filtro por UF e CNAE em tempo aceitável |
| B5. Permissão de escrita do SQL Server na pasta de backup | 010 | Spike S0.5 passa: `BACKUP DATABASE` grava no destino escolhido |

## Arquitetura

### Visão de componentes

```text
Navegador (React) --HTTPS/cookie--> Api (.NET) --> ApplicationService --> Infra --> SQL Server
        ^                              |  \
        |  SSE "mudou"                 |   `-- BackgroundService (worker da fila)
        +------------------------------+          |-- IAiResearchClient       -> processo `claude -p`
                                                  `-- IMessageDispatchClient  -> webhook HERMES (local)
```

- Api e worker no mesmo processo. O worker usa escopo próprio por tarefa e preenche o `ICurrentTenantContext` com o `BusinessUnitId` gravado na tarefa (não há usuário HTTP).
- Pausar, cancelar e retomar campanha são mudanças de estado verificadas pelo worker antes de pegar cada tarefa nova.

### Fila persistente (specs 003, 005, 006, 010)

- Tabela de tarefas com tipo, campanha, empresa, payload, estado (`Pendente`, `Executando`, `Concluida`, `AguardandoNovaTentativa`, `FalhaPersistente`, `Cancelada`), tentativas, próxima tentativa, bloqueio e chave de idempotência única.
- O worker pega uma tarefa por vez com `UPDATE` atômico no estado. **Concorrência inicial 1**, para proteger o limite da assinatura. Configurável depois.
- O resultado da tarefa e a mudança de estado dela gravam na mesma transação: reinício não perde nem duplica (003 SC-004).
- Reinício do processo: tarefas `Executando` voltam a `Pendente`, **exceto** tarefas de envio, que nunca reexecutam e passam a `Resultado inconclusivo` (006 FR-005).
- Tentativas: até 3 para falha recuperável, com espera crescente. Valores de partida, ajustáveis pelas Options. Falha persistente vai para a lista de falhas (010).
- Limite da IA esgotado: a tarefa volta a `Pendente`, a campanha passa a `Pausada` por limite, o usuário é avisado e o progresso fica salvo (003 FR-015).

### IA: porta e adaptador (`claude -p`)

Flags verificadas com `claude --help` e exercitadas no spike S0.1 (versão 2.1.316 instalada em 2026-11-01): `--print`, `--output-format json`, `--json-schema`, `--tools`, `--allowedTools`, `--restricted`, `--setting-sources`, `--strict-mcp-config`, `--no-session-persistence`, `--disable-slash-commands`, `--model`. No modo `-p`, `--tools` sozinho não basta: as ferramentas web são negadas sem `--allowedTools`. A saída validada vem no campo `structured_output`. Resultados em `docs/discovery/spikes-s0-1-e-s0-3.md`.

- **Não usar `--bare`**: a ajuda diz que ele só aceita `ANTHROPIC_API_KEY` ou `apiKeyHelper` e nunca lê OAuth, ou seja, não usa a assinatura.
- O processo filho roda em **diretório vazio e dedicado**, sem `CLAUDE.md` do projeto, sem hooks, sem MCP (`--strict-mcp-config` sem config), com ferramentas mínimas (`--tools` só com busca e leitura web, o que o spike S0.1 confirmar) e **sem Bash nem escrita**.
- O ambiente do processo remove `ANTHROPIC_API_KEY` e variáveis de provedores pagos; o adaptador recusa iniciar se detectar uma delas. Isso impede cobrança por engano.
- Saída sempre com `--json-schema`; a resposta é revalidada no backend (FluentValidation) antes de gravar. Resposta fora do esquema conta como falha recuperável.
- Conteúdo de páginas da web é tratado como dado não confiável (injeção de prompt): o prompt separa instruções de conteúdo, o processo não tem ferramenta capaz de agir fora da leitura, e fatos sem fonte rastreável são descartados.
- O backend nunca lê, copia nem repassa credencial da assinatura: só executa o binário (decisão registrada em `docs/discovery/validacao-bloqueios.md`).

### Pesquisa do Coulson (spec 003)

Desenho em funil (decisão de 2026-11-02): a base filtra e ranqueia sem IA; a IA só enriquece de cima para baixo e para na meta.

1. Tarefa `SearchCompanies` por campanha: consulta a base de CNPJ filtrada por UF, cidade e **CNAE escolhido na campanha**, só **matriz** e só situação **ativa**. Cria uma `Discovery` por candidata com a **pré-pontuação** calculada pelo backend só com dados da base (localização, CNAE, contato presente) e `enrichmentStatus = NaoEnriquecida`. Nenhuma chamada de IA aqui.
2. Tarefa `EnrichCompany`, **uma por vez, da maior pré-pontuação para a menor**: o adaptador de IA recebe os dados já conhecidos (nome, cidade, CNPJ, telefone da base) e procura site e evidências em páginas públicas, devolvendo fatos com URL e data. O contato da base já vale como canal; a IA não precisa achar telefone.
3. Pontuação 0 a 100 calculada **no backend** por regra determinística (aderência de localização, segmento e perfil, quantidade e qualidade de evidências e contatos); a IA fornece evidências, não a nota. Fórmula e pesos de partida em `research.md`. Classes: Alta 80 a 100, Média 50 a 79, Baixa 0 a 49.
4. Duplicidade: só chave forte (CNPJ ou domínio iguais) unifica. Indício fraco não unifica e não gera revisão humana; `DuplicateCandidate` está adiado.
5. Canal válido na Etapa 1: telefone, e-mail corporativo ou site (sem WhatsApp). Só descoberta com canal válido conta para a meta; ao atingir a meta o worker **não enriquece as candidatas restantes** e a campanha vira `Concluída`; fontes esgotadas sem meta informam o déficit, sem ampliar critério.

### Natasha (spec 005, ADIADA: fora da Etapa 1)

- Tarefas `ComplementaryResearch` e depois `GenerateMessage`, só depois da aprovação individual do lead, com chave de idempotência por lead (duplo clique gera uma solicitação).
- A mensagem usa o modelo-base da campanha e **apenas fatos cadastrados com fonte**. O backend valida: todo fato citado precisa existir na tabela de fatos da empresa; links passam por validação de formato; contagem de palavras gera aviso fora de 50 a 100.
- Marcadores do modelo-base de partida: `{empresa}`, `{cidade}`, `{segmento}`. Lista final fechada na spec 005 antes das tasks.

### Envio e resultado (spec 006, ADIADA: fora da Etapa 1)

- A ação "Enviar" faz a transição atômica `Aprovada` para `Enviando` com controle de concorrência (rowversion) e cria uma tarefa de envio com **uma única tentativa**. O segundo clique recebe conflito.
- O worker chama o webhook do HERMES com assinatura HMAC e **30 segundos** de espera. Sucesso informado vira `Enviada`; erro informado vira `Falha no envio`; sem resposta no prazo ou reinício vira `Resultado inconclusivo`.
- Nenhum caminho reenvia sozinho. "Tentar de novo" é ação humana nova (confirmação simples na falha, aviso de duplicidade no inconclusivo).
- "Não contatar" e envio verificam o estado da empresa na mesma transação da mudança de estado, para não haver janela de corrida.

### Tempo real (specs 003, 009)

- Endpoint SSE autenticado por cookie. Um difusor em memória (`Channel`) publica "campanha X mudou", "lista Y mudou", "alerta mudou". Um processo só, então não há broker.
- O front reage ao evento refazendo a consulta do que está na tela. Se a conexão cair, o painel mostra "desatualizado" com botão de atualizar (009 edge case).

### Dados derivados

- Indicadores do dashboard e alertas de tarefa são **consultas calculadas**, sem tabela de agregados (escala pequena). Índices por campanha, estado e data.
- Linha do tempo da empresa, histórico de campanha e histórico de operações usam **uma tabela de eventos** (tipo, origem, empresa e campanha opcionais, data e hora, descrição). Eventos de autenticação (spec 002 FR-012) também.

### Segurança e LGPD

- Auth, cookie, CSRF, tenant e rate limiting seguem as pendências 1 a 9 de `backend/README.md`. Conta única criada por comando de instalação (seed), sem cadastro público; mensagem genérica no login; bloqueio por tentativas (valores das notas: 5 tentativas, 5 minutos).
- Segredos (somente nomes): `ConnectionStrings:DefaultConnection`, `Pepper:Secret`, chaves do JWT, `Hermes:WebhookSecret`. Todas com `ValidateOnStart`, nunca em log.
- LGPD: cada fato guarda fonte e data; "Não contatar" bloqueia envio, mensagem e novo lead; remoção de dados pessoais apaga contatos e mantém só o registro do pedido; a exportação avisa a responsabilidade do usuário.
- CSV e Excel neutralizam valores que começam com `=`, `+`, `-` e `@` (010 FR-011). Logs e exportações passam por redação de segredos e senhas.
- O processo filho de IA e o webhook ficam só em `localhost`. O segredo do HERMES nunca vai para o front.

### Observabilidade

- `DomainLogger` e logs de aplicação persistem em tabela própria (D8) com data, componente, nível, mensagem e id da tarefa, com retenção de partida de 30 dias e aviso antes de limpar (valor a confirmar na spec 010).
- Métricas por tarefa: duração, tentativas, resultado. Alimentam a lista de falhas e o controle de capacidade da IA.
- Estado de capacidade da IA: `Available`, `LimitReached`, `Blocked` (autenticação não permitida), exposto em `Operation`.

## Fases e entregas

| Fase | Conteúdo | Specs | Saída verificável |
|---|---|---|---|
| 0. Spikes | S0.1 `claude -p` pela assinatura; S0.2 webhook HERMES; S0.3 leitura da base de CNPJ; S0.5 backup (o S0.4, e-mail, foi removido). Descartáveis, fora do código do produto | 002, 003, 005, 006, 010 | Bloqueios B1, B2, B3 e B5 liberados, ou decisão nova do Rafael |
| 1. Fundação | Pendências 1 a 9, 15 e 16 do backend (Identity, hash, JWT em cookie, CSRF, tenant, rate limit, seed); pendências 1 a 3 do front (axios, sessão, acesso); infraestrutura do teste de integração | 002 | Login e sair ponta a ponta |
| 2. Campanhas | Entidade Campanha, histórico, estados e transições; formulário guiado; lista e detalhe | 001 | Criar, editar, pausar, retomar e cancelar |
| 3. Fila e Coulson | Tabela e worker da fila; adaptadores de IA e de CNPJ; Empresa, Contato, Fonte, Descoberta; pontuação; duplicidade; SSE | 003 (e base de 007) | Campanha de teste gera leads reais com fonte e nota |
| 4. Aprovação | Lista de leads, decisão, motivo, duplicidade, alerta de contato anterior | 004 | Aprovar e rejeitar com histórico |
| 5. Natasha (ADIADA) | Pesquisa complementar, mensagem, versões, edição, aprovação | 005 | Fora da Etapa 1 |
| 6. Envio e resposta (ADIADA) | Adaptador HERMES, estados do envio, inconclusivo, resposta comercial, "Não contatar" no envio | 006 | Fora da Etapa 1 |
| 7. Banco central e tarefas | Pesquisa, ficha, linha do tempo, arquivar, remoção de dados; tarefas, lista, calendário, alertas | 007, 008 | Fluxo completo de retorno |
| 8. Indicadores | Dashboard em tempo real, taxas, comparação | 009 | Números batem com contagem manual |
| 9. Operação | Falhas, capacidade de IA, logs, histórico, exportação, backup, pipelines | 010 | Backup e exportação conferidos |

**MVP da Etapa 1**: fases 0 (sem o spike S0.2), 1, 2, 3 e 4, porque aí o ciclo "campanha, pesquisa, lead aprovado" fecha. As fases 7 a 9 saem em seguida; o cadastro de empresa da spec 007 nasce já na fase 3. As fases 5 e 6 voltam na etapa seguinte.

## Estratégia de testes

- **Backend unitário**: 1 arquivo por método de service e por endpoint, nome `Metodo_Cenario_ResultadoEsperado`, Builder compartilhado. Máquinas de estado (campanha, lead, mensagem, envio, tarefa) com tabela de transições testada, incluindo transição inválida.
- **Backend integração** (Testcontainers + Respawn + CSRF real): caminho feliz, isolamento de tenant, 403 e, para a fila, reinício simulado sem perda nem duplicidade, pausa no meio, limite de IA esgotado e duplo clique em aprovar e enviar.
- **Adaptadores**: IA e HERMES com fakes nos testes automáticos. Um teste de fumaça opt-in (`[Trait("Category","Manual")]`) roda contra o `claude -p` e o HERMES reais, fora do CI.
- **ArchitectureTest** sempre verde, com regra nova: portas de IA e HERMES só implementadas na Infra.
- **Front**: unit por controller, service e mapper; story com os 5 estados para componente reutilizável; Playwright para o fluxo de campanha até mensagem aprovada com API mockada, e `@real-api` para o login.
- **Segurança**: testes de CSV com fórmula, de log sem segredo, de mensagem de login genérica e de injeção de prompt em conteúdo fake de página.
- Cobertura mínima de 80% na funcionalidade nova.

## Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Limite da assinatura esgota no meio da campanha | Campanha pausa e pode consumir a semana | Concorrência 1, uma consulta por empresa, pausa automática, capacidade visível. Meta de leads realista por campanha |
| "Uso individual comum" da assinatura ser reinterpretado | A rota pode deixar de valer | Isolar atrás de `IAiResearchClient`; trocar o adaptador custa pouco. Rota paga só com autorização do Rafael |
| Restrição do número de WhatsApp (Baileys) | Perda do número | Número dedicado, envio manual, sem lote, volume baixo; risco já aceito na spec 006 |
| Base de CNPJ defasada (atualização mensal) | Empresa fechada ou telefone velho | Guardar a data da base em cada fato; a IA confirma contato na web |
| Injeção de prompt por página maliciosa | Dado falso ou ação indevida | Sem ferramenta de ação, validação de esquema, fato só vale com fonte |
| "Fato comprovado" da Natasha sem rastro | Mensagem com invenção | Validação no backend: todo fato citado aponta para registro com fonte |
| Dados pessoais de sócio na base de CNPJ | LGPD | Só contato corporativo; não importar quadro societário |
| Reinício do servidor durante o envio | Duplicidade | Envio nunca reexecuta; vira inconclusivo |

## Project Structure

### Documentation (this plan)

```text
specs/000-plano-geral/
├── plan.md              # este arquivo
├── research.md          # decisões e alternativas
├── data-model.md        # entidades, estados e índices
├── quickstart.md        # spikes da Fase 0 e validação ponta a ponta
└── contracts/
    ├── api.md           # endpoints por controller
    └── integracoes.md   # claude -p, HERMES, SSE, base de CNPJ
```

### Source Code (repository root)

```text
backend/Src/
├── PersonalProspec.Domain/             entidades, enums de estado, interfaces de repositório
├── PersonalProspec.Infra/              mappings, repositórios, adaptadores (ClaudeCli, HermesWebhook, CnpjOpenData, SqlBackup), migrations
├── PersonalProspec.ApplicationService/ Command/Query services, mappers, DTOs, traces, portas (IAiResearchClient, IMessageDispatchClient), worker da fila
└── PersonalProspec.Api/                controllers, filtros, SSE, middlewares, IoC
backend/Tests/                          UnitTest, IntegrationTest, ArchitectureTest

frontend/
├── business/                           dtos, interfaces, services, mappers, IoC por feature
├── src/pages/                          Login, Campaigns, CampaignForm, CampaignDetail, Leads, Messages, Companies, CompanyDetail, Tasks, Dashboard, Operation
├── src/access/                         política única "usuário autenticado"
└── tests/                              unit, integration, e2e, mocks
```

**Structure Decision**: aplicação web já materializada no repositório (`backend/` e `frontend/`). Nenhum projeto novo na solução. O worker mora no ApplicationService e é registrado pela Api, mantendo a cadeia `Domain <- Infra <- ApplicationService <- Api`.

## Complexity Tracking

| Desvio | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Base de CNPJ em schema separado, sem `BusinessUnitId` (dado público de referência) | É dado aberto e global, não pertence a tenant. Marcar como `ITenantOwned` obrigaria copiar a base por unidade | Copiar para a tabela de empresas por tenant duplica milhões de linhas e perde a atualização mensal. **Pede aceite do Rafael** |
| `UnitOfWorkFilter` com desvio para o login (pendência 9 do backend) | O lockout precisa persistir mesmo quando o login termina com notification | Manter a regra geral: o contador de falhas nunca persistiria. O desvio já consta no padrão; o envio não precisa de desvio porque a chamada ao HERMES é feita pelo worker, fora da requisição |
| Worker de fila próprio | Retomada após reinício, pausa, idempotência e envio sem reexecução, com dependência zero | Hangfire ou Quartz: dependência nova, e o modelo de retentativa automática conflita com a regra de não reenviar |

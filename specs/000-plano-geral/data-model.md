# Data Model: Personal Prospec

> **Escopo (2026-11-01)**: Etapa 1 = só prospecção. Tudo aqui sobre Natasha, HERMES, mensagem, envio e resposta comercial está ADIADO (specs 005 e 006). Ver escopo-etapa-1.md.

**Data**: 2026-10-23 | **Plano**: [plan.md](plan.md)

Convenções: identificadores em inglês (decisão D1, pendente); ids `Guid`; todas as entidades do produto implementam `ITenantOwned` (coluna `BusinessUnitId`) e entram no filtro automático do `ApplicationContext`; datas como `Instant` (NodaTime); estados como enum persistido por texto; entidades anêmicas e `sealed`. Campos listados são os necessários às specs, sem extras.

## Entidades por área

### Acesso (spec 002)

| Entidade | Campos principais | Observações |
|---|---|---|
| User (Identity customizado) | email, senha com hash Argon2id, lockout, contagem de falhas; exigidos pelo Identity: normalizedEmail, securityStamp, lockoutEnabled, roleId, businessUnitId, createdAt | Conta única criada no seed; lookups com `IgnoreQueryFilters()` (padrão) |
| Role | name, normalizedName | Uma role fixa `Administrator` (decisão de 2026-11-02), criada no seed; exigida pelo `RoleStore` do padrão de Identity |
| RefreshToken | hash do token, validade, revogado | Rotação a cada renovação de sessão |

### Campanhas (spec 001)

| Entidade | Campos principais |
|---|---|
| Campaign | name, objective, location (UF e cidades), idealProfile, segment, services, differentials, valueProposition, targetLeadCount, status, aiPausedByLimit, createdAt, updatedAt, rowversion |
| CampaignLocation | campaignId, state (UF), city (cidades escolhidas de lista oficial) |
| CampaignCnae | campaignId, cnae (código de 7 dígitos escolhido na lista oficial; um ou mais por campanha) |
| (eventos) | mudanças de estado e de configuração entram na tabela `Event` (abaixo) |

Regras: nome, objetivo, localização, segmento, ao menos um CNAE e quantidade de leads obrigatórios (mensagem-base adiada com a Natasha); texto só com espaços vale vazio; quantidade inteira positiva até um máximo (valor definido na spec 001 antes das tasks); edição só em Rascunho ou Pausada.

### Empresas e pesquisa (specs 003 e 007)

| Entidade | Campos principais | Observações |
|---|---|---|
| Company | legalName, tradeName, cnpj (opcional, único por unidade quando existe), domain, website, address, city, state, segment, registryStatus (Ativa, Arquivada), doNotContact, doNotContactAt, doNotContactSource, cnpjBaseDate | Cadastro único compartilhado entre campanhas |
| CompanyContact | companyId, kind (Telefone, Email; WhatsApp adiado, e o site fica em `Company.website`), value normalizado, isCorporate, validity, source, retrievedAt, removedAt | Remoção LGPD apaga o valor e mantém o registro do pedido |
| Fact | companyId, discoveryId (opcional), kind, text, sourceUrl, retrievedAt, confirmed | "Fonte consultada" e "informação confirmada". Base do rastro de cada afirmação |
| Discovery (Lead) | campaignId, companyId, score, classification (Alta, Média, Baixa), justification (partes da nota), status (Pendente, Aprovado, Rejeitado), rejectionReason, decidedAt, hasValidChannel, preScore (só base), enrichmentStatus (NaoEnriquecida, Enriquecida), discardReason, rowversion | Único por (campaignId, companyId). Só `hasValidChannel` conta para a meta |
| (ADIADO) DuplicateCandidate | campaignId, leftDiscoveryId, rightDiscoveryId, signal, status (Aguardando, Unificado, MantidoSeparado), decidedAt | Revisão humana de duplicidade fora da Etapa 1 (decisão de 2026-11-02). Não criar tabela nem migration |

### Fila (specs 003, 010)

| Entidade | Campos principais |
|---|---|
| BackgroundTask | type (SearchCompanies, EnrichCompany; adiados: ComplementaryResearch, GenerateMessage, DispatchMessage), campaignId, companyId, discoveryId, payload (JSON), status, attempts, maxAttempts, nextAttemptAt, lockedUntil, failureCause, idempotencyKey (único), createdAt, finishedAt, resolution (Nenhuma, Ignorada, Resolvida) |

`resolution` serve a lista de falhas (010): falha persistente com ação do usuário (tentar de novo cria nova tarefa com nova chave, ignorar, resolver).

### Mensagens e envio (specs 005 e 006): ADIADO, fora da Etapa 1

Não gerar tabelas, migrations nem tasks destas entidades na Etapa 1. Ficam como desenho para a etapa seguinte; as relações (`messageId` na fila e na tarefa comercial) voltam junto.

| Entidade | Campos principais |
|---|---|
| Message | discoveryId, companyId, campaignId, status, lowInfoWarning, currentVersionId, rowversion |
| MessageVersion | messageId, text, author (Natasha, Usuário), createdAt, wordCount |
| MessageFact | messageVersionId, factId (os fatos usados e suas fontes) |
| Dispatch (Envio) | messageId, channel, recipientContactId, status, hermesResult (texto redigido, sem segredo), requestedAt, finishedAt, manualConfirmation, rowversion |
| CommercialResponse | messageId, companyId, campaignId, value (Respondeu, Interessado, SemInteresse, PediuRetorno, SemResposta), recordedAt |
| CommercialResponseHistory | responseId, previousValue, newValue, changedAt |

Índice único: um `Dispatch` ativo (Enviando ou aguardando decisão) por mensagem.

### Tarefas comerciais (spec 008)

| Entidade | Campos principais |
|---|---|
| CommercialTask | companyId, campaignId (opcional), description, dueDate, hasDueTime, status (Pendente, Concluida, Cancelada), cancelReason, completedAt, createdAt |

Alertas ("Próxima do prazo", "Atrasada") são calculados na consulta, sem tabela. Janela de partida: 24 h, em Options.

### Histórico, logs e operação (specs 002, 007, 009, 010)

| Entidade | Campos principais | Observações |
|---|---|---|
| Event | category (Auth, Campaign, Company, Task, Config, DataRemoval; adiados: Message, Dispatch), type, companyId (opcional), campaignId (opcional), description, source, occurredAt | Uma tabela serve linha do tempo, histórico de campanha, histórico de operações e eventos de auth. Nunca guarda senha nem segredo |
| LogEntry | occurredAt, component, level, message, taskId | Logs técnicos separados; mensagens redigidas; retenção em Options |
| BackupRecord | fileName, size, startedAt, finishedAt, result, error | Só metadados |
| Export | não persiste | Arquivo gerado sob demanda |

### Base de CNPJ (spec 003, schema separado, sem tenant, somente leitura)

| Tabela | Campos principais |
|---|---|
| CnpjEstablishment | cnpj, isHeadquarters (indicador matriz/filial, valor de "matriz" a verificar no dado real), tradeName, legalName (vem do arquivo Empresas, ligado pelo CNPJ básico), cnae, state, city (código da Receita, não IBGE), address, phone, email, registrationStatus (02 = ativa), referenceDate |

Layout real a confirmar no spike S0.3. Quadro societário não é importado.

## Estados e transições

```text
Campaign:   Rascunho -> EmExecucao -> Pausada <-> EmExecucao ; EmExecucao -> Concluida ; (Rascunho|EmExecucao|Pausada) -> Cancelada
Lead:       Pendente -> Aprovado | Rejeitado ; Aprovado <-> Rejeitado (por ação explícita, registrada)
(ADIADO) Message:    Pendente -> AguardandoRevisao -> Aprovada | Rejeitada ; Aprovada -> AguardandoRevisao (se editada) ; Rejeitada -> nova versão -> AguardandoRevisao ; (FalhaNoEnvio|Inconclusivo) -> Descartada ; DoNotContact -> Descartada
(ADIADO) Dispatch:   Enviando -> Enviada | FalhaNoEnvio | ResultadoInconclusivo ; FalhaNoEnvio -> Enviando (confirmação simples) ; Inconclusivo -> Enviando (aviso de duplicidade) | Enviada (manual)
Task fila:  Pendente -> Executando -> Concluida | AguardandoNovaTentativa -> Pendente | FalhaPersistente ; qualquer -> Cancelada
Task comercial: Pendente -> Concluida | Cancelada
```

Regras que cruzam entidades:

- Pausar campanha: o worker não pega tarefa nova da campanha; a tarefa em execução termina e grava.
- Cancelar campanha: tarefas pendentes viram `Cancelada`; dados coletados permanecem.
- "Não contatar": `Company.doNotContact = true`; novas descobertas dessa empresa não entram e o lead pendente dela não pode ser aprovado (004 FR-009). Descartar mensagens aprovadas e encerrar leads com o motivo "Não contatar" volta com a spec 006.
- Aprovar lead grava a decisão uma única vez (`rowversion` no `Discovery`) e não cria tarefa na fila na Etapa 1. A pesquisa complementar volta com a spec 005.
- Alerta de empresa já tratada (007 FR-006): consulta sobre `Discovery` da mesma `companyId` em outra campanha com status Aprovado ou Rejeitado. Sem tabela nova.
- Remoção de dados pessoais: apaga `CompanyContact.value` de pessoa física e registra `Event` do tipo `DataRemoval`; `Fact` com dado pessoal é anonimizado.

## Índices de partida

- `Company`: (BusinessUnitId, cnpj) único filtrado; domain; normalized name; city.
- `CompanyContact`: (BusinessUnitId, value normalizado).
- `Discovery`: (campaignId, companyId) único; (campaignId, status, score desc).
- `Discovery`: (campaignId, enrichmentStatus, preScore desc) para o worker pegar a próxima candidata a enriquecer.
- `BackgroundTask`: (status, nextAttemptAt); idempotencyKey único; (campaignId, status).
- `Event`: (companyId, occurredAt); (campaignId, occurredAt).
- `LogEntry`: (occurredAt, level); taskId.
- Pesquisa de empresa por nome, CNPJ, site, telefone, e-mail e cidade sem acento: coluna normalizada ou collation insensível a acento e caixa; decisão na hora da task.

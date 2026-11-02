# Implementation Plan: Campanhas de prospecção (spec 001)

**Branch**: `001-campanhas` (sem branch git; decisão manual) | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: `spec.md` desta pasta e o plano geral em `specs/000-plano-geral/`. Este plano NÃO repete o plano geral: recorta o que a spec 001 usa e registra as decisões específicas dela. Escopo da Etapa 1 em `specs/000-plano-geral/escopo-etapa-1.md`.

**Escopo desta etapa**: somente plano e artefatos de desenho. Nenhum código, nenhuma instalação, nenhum `/speckit-tasks`.

## Summary

Criar, editar, listar e controlar campanhas de prospecção: formulário guiado em etapas com resumo, estados (Rascunho, Em execução, Pausada, Concluída, Cancelada), transições validadas, histórico de mudanças e a tela "Agente de IA iniciado" (FR-015). É a Fase 2 do plano geral. A entidade `Campaign` é a base das specs 003 (pesquisa) e 004 (aprovação).

Abordagem, toda dentro do padrão já decidido:

- **Backend**: entidade `Campaign` anêmica com `ITenantOwned`, `CampaignCommandService` (criar, editar, iniciar, pausar, retomar, cancelar) e `CampaignQueryService` (lista paginada, detalhe, histórico), notifications com `CampaignTrace`, mappers manuais, 1 controller.
- **Histórico**: reaproveita a tabela `Event` (categoria `Campaign`), sem tabela nova.
- **Duplo clique (FR-013)**: o servidor gera o `Id` da campanha. O front gera uma chave de idempotência (`requestId`, Guid) ao abrir o formulário e a envia em `create_campaign`; repetir "Salvar" com a mesma chave não cria segunda campanha. Repetir "Iniciar" cai em transição inválida.
- **Listas de apoio** (UF, municípios, CNAE): endpoints de leitura, dados de referência sem tenant.
- **Frontend**: páginas `Campaigns`, `CampaignForm` (criar e editar), `CampaignDetail` e `CampaignStarted`; `CampaignService` e `ReferenceService`; componente `statusBadge` com story; hook `useInfiniteScrollQuery` (pendência 5 do front).

## Fontes (leia na ordem)

| Assunto | Arquivo |
|---|---|
| Entidades `Campaign`, `CampaignLocation`, `CampaignCnae`, `Event` | `specs/000-plano-geral/data-model.md` |
| Endpoints `Campaign` | `specs/000-plano-geral/contracts/api.md` (detalhado em [contracts/api.md](contracts/api.md)) |
| Padrões reais do código | `backend/Src/` (ver `AuthenticationController`, `ServiceBase`, `Event`) e `frontend/src/` (ver `Login`, `AppHeader`) |
| Protótipo e divergências | `docs/discovery/prototipo-vs-specs.md` |
| Rules | `.claude/rules/backend/` e `.claude/rules/frontend/` |

## Technical Context

Os da constituição e do plano geral: C# 14 / .NET 10 (SDK 10.0.302), EF Core 10 + SQL Server, FluentValidation, NodaTime; React 19, TypeScript strict, Vite 8, Inversify, Zod 4, react-hook-form, styled-components, axios.

**Pacotes novos**: nenhum. FluentValidation, react-hook-form e `@hookform/resolvers` já fazem parte da stack da constituição; confirmar no `csproj` e no `package.json` se já estão instalados (se faltar algum, entra pedido de aprovação na task, nunca instalação silenciosa).

**Dados de referência (arquivos novos no repositório, dados públicos da Receita, instantâneo de 2026-10)**: `cnae.tsv` (1.358 CNAE) e `municipios.tsv` (5.571 municípios com UF e código da Receita), gerados nos spikes S1.1 e S1.2 (ver `docs/discovery/spikes-s1-1-e-s1-2-referencias.md`).

## Decisões deste plano

| # | Decisão | Efeito |
|---|---|---|
| P1 | O servidor gera o `Id`; o front envia só uma chave de idempotência (`requestId`) em `create_campaign`, gravada em `Campaign.RequestId` com índice único por unidade | Resolve o duplo clique mantendo o padrão do servidor gerar o id. Decidido pelo Rafael em 2026-11-02 (rejeitou o id gerado no front). Depois de salvar, o front vai à lista, sem precisar do id |
| P2 | Iniciar muda o estado e registra o evento; o enfileiramento da pesquisa entra na spec 003, dentro da mesma transação | A spec 001 é testável sozinha. Até a 003 existir, "Em execução" não dispara pesquisa real |
| P3 | Pausar e cancelar mudam o estado na hora; a tarefa em andamento termina e grava mesmo com a campanha já pausada | Cumpre FR-007 e FR-010. O worker (spec 003) confere o estado antes de pegar cada tarefa |
| P4 | Dados de referência (UF, municípios, CNAE) sem `BusinessUnitId` | Mesma lógica da base de CNPJ no plano geral (Complexity Tracking). Pede aceite do Rafael |
| P5 | Histórico de edição guarda os nomes dos campos alterados, não os valores antigos e novos | FR-014 pede mudança com data e hora; valores longos engordariam a tabela sem ganho |
| P6 | "Concluída" só é atribuída pela spec 003; esta spec só valida a transição `Em execução` para `Concluída` | Evita implementar regra que pertence à pesquisa |

## Valores de partida (sem fonte; ajustáveis em `CampaignOptions` no `appsettings.json`)

| Valor | Partida | Fonte |
|---|---|---|
| Máximo de leads por campanha (FR-003) | 500 | Valor meu, sem fonte. O Rafael ajusta |
| Tamanho máximo de nome | 120 | Valor meu, sem fonte |
| Tamanho máximo de objetivo | 500 | Valor meu, sem fonte |
| Tamanho máximo de perfil ideal, serviços, diferenciais e proposta de valor | 1000 cada | Valor meu, sem fonte |
| Tamanho máximo de segmento | 120 | Valor meu, sem fonte |
| Máximo de CNAE por campanha | 20 | Valor meu, sem fonte |
| Máximo de cidades por campanha | 30 | Valor meu, sem fonte |
| Tamanho de página da lista | 10 (máximo 30, do `PageParams`) | Código existente |

## Bloqueios de implementação (spikes curtos antes das tasks de referência)

| Bloqueio | Critério para liberar |
|---|---|
| S1.1 Fonte da lista de municípios por UF | **Concluído em 2026-11-02**: UF e código vêm de `Estabelecimentos` (3 prefixos de 24 MB cobriram os 5.572 códigos da tabela `Municipios`, sem conflito de UF); nomes da Receita, em maiúsculas e sem acento. Detalhes em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md` |
| S1.2 Arquivo de CNAE | **Concluído em 2026-11-02**: `Cnaes.zip` lido, placeholder `8888888` retirado, 1.358 CNAE em `cnae.tsv` (UTF-8, tabulação). Detalhes em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md` |

## Constitution Check

| Princípio | Resultado | Como o plano atende |
|---|---|---|
| I. Camadas do backend | Passa | `Campaign` anêmica e `sealed` no Domain; `CampaignCommandService` herda `ServiceBase` e devolve `bool`; `CampaignQueryService` separado; erro de negócio vira notification; mapper manual; sem MediatR, AutoMapper nem Swashbuckle |
| II. MVVM e dados no front | Passa | 5 arquivos por página, `CampaignService` com interface, DI e Zod, estado de feature no controller, Redux só para sessão |
| III. Segurança e tenant | Passa com 1 ponto a aceitar | `Campaign` implementa `ITenantOwned`; `businessUnitId` entra no predicado; `GetById` responde igual para "não existe" e "é de outro tenant". Ponto: P4 (referência sem tenant) |
| IV. Testes | Passa | 1 arquivo por método de service e por endpoint, integração com tenant e 403, ver "Estratégia de testes" |
| V. Simplicidade | Passa | Sem pacote novo, sem tabela de histórico nova, sem biblioteca de formulário em etapas (estado de etapa no controller) |
| VI. Sem invenção | Passa | Valores sem fonte marcados; as listas de referência foram verificadas em dados reais (spikes S1.1 e S1.2) |

**Reavaliação pós-desenho**: sem violação nova. P1 e P4 foram respondidos pelo Rafael em 2026-11-02 (ver Clarifications).

## Clarifications

### Session 2026-11-02 (Rafael respondeu a T001)

- Q: O id da campanha pode ser gerado no front? → A: Não. O servidor gera o `Id`. Para o duplo clique (FR-013) usa-se uma chave de idempotência `requestId`, decisão tomada por mim a partir da resposta; o Rafael pode preferir outra proteção.
- Q: UF, municípios e CNAE sem `BusinessUnitId` (P4)? → A: Sim, aceito.
- Q: Valores de partida de `CampaignOptions`? → A: Servem (500 leads, 20 CNAE, 30 cidades, nome 120, objetivo 500, textos longos 1000).

## Estratégia de testes

- **Backend unitário**: 1 arquivo por método dos dois services; tabela de transições da máquina de estado testada inteira (cada par válido e cada par inválido); validação com texto só com espaços, limites de tamanho, quantidade zero, negativa e acima do máximo; Builder compartilhado; controller com teste de metadata por reflection (`[Authorize]`, rate limit, tipos de resposta).
- **Backend integração** (Testcontainers + Respawn + CSRF real): 1 arquivo por endpoint com caminho feliz, isolamento de tenant (campanha de outra unidade responde como inexistente), 401 e 403; `create_campaign` repetido com o mesmo `requestId` cria uma só; `start_campaign` repetido devolve notification; edição fora de Rascunho e Pausada recusada.
- **ArchitectureTest** sempre verde.
- **Front**: unit por controller (passos do formulário, dados mantidos ao voltar, bloqueio de duplo clique, erros 400/401/500/rede), por service e por DTO; story do `statusBadge` com os 5 estados; Playwright mockado do fluxo criar, iniciar, pausar, editar, retomar e cancelar.
- Cobertura mínima de 80% na funcionalidade nova.

## Project Structure

### Documentation (this feature)

```text
specs/001-campanhas/
├── spec.md
├── plan.md              # este arquivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
backend/Src/
├── PersonalProspec.Domain/             Campaign, CampaignLocation, CampaignCnae, Cnae, Municipality, ECampaignStatus, ICampaignRepository, IReferenceRepository
├── PersonalProspec.Infra/              mappings, repositórios, seed de referência, migration
├── PersonalProspec.ApplicationService/ CampaignCommandService, CampaignQueryService, ReferenceQueryService, CampaignTrace, DTOs, mappers
└── PersonalProspec.Api/                CampaignController, ReferenceController, CampaignOptions, IoC
backend/Tests/                          UnitTest, IntegrationTest, ArchitectureTest

frontend/
├── business/                           dtos, interfaces, services (Campaign, Reference), IoC, enum de estado
├── src/pages/                          Campaigns, CampaignForm, CampaignDetail, CampaignStarted
├── src/components/                     statusBadge, cnaeSearchInput
├── src/hooks/                          useInfiniteScrollQuery
└── tests/                              unit, e2e, mocks
```

**Structure Decision**: aplicação web já materializada; nenhum projeto novo na solução.

## Complexity Tracking

| Desvio | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Coluna `RequestId` (chave de idempotência do front) em `Campaign` | Dá idempotência ao "Salvar" sem mudar quem gera o `Id` nem o retorno `bool` | Só desabilitar o botão: não cobre duplo clique rápido nem duas abas |
| UF, municípios e CNAE sem `BusinessUnitId` | São dados públicos e globais; por unidade duplicariam a lista | Marcar como `ITenantOwned`: obriga copiar a lista para cada unidade. **Pede aceite do Rafael**, junto com o mesmo desvio da base de CNPJ |

## Notas de implementação (2026-11-02)

- `CampaignRepository.UpdateAsync` só chama `SaveChanges`: a campanha chega rastreada por `FindByIdAsync`, e o `rowversion` protege a concorrência (conflito vira 409 no `GlobalExceptionMiddleware`).
- `ReferenceRepository` não herda `RepositoryBase<T>` porque atende duas entidades de referência sem tenant (`Cnae` e `Municipality`); segue `sealed` e implementa a interface do Domain.
- FKs de `CampaignLocation` e `CampaignCnae` para `Campaign` com `DeleteBehavior.NoAction`, como manda a rule; a troca de filhos na edição apaga e regrava explicitamente na mesma gravação.
- "Iniciar" exige `Rascunho` e "Retomar" exige `Pausada` como estado de origem, além da tabela de transições.

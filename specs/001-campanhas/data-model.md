# Data Model: Campanhas (spec 001)

**Data**: 2026-11-02 | **Plano**: [plan.md](plan.md)

Convenções do projeto: ids `Guid`; datas `Instant` (NodaTime) com `InstantConverter`; schema `APP`; entidades anêmicas e `sealed`; enums persistidos por texto; colunas em snake_case (como `Event` e `User`). Identificadores em inglês, rótulos pt-BR só na interface.

## Entidades

### Campaign (`ITenantOwned`)

| Campo | Tipo | Regra |
|---|---|---|
| Id | Guid, `init` | Gerado pelo servidor; chave primária |
| RequestId | Guid | Chave de idempotência enviada pelo front em `create_campaign`; índice único (`BusinessUnitId`, `RequestId`) |
| Name | string | Obrigatório, trim, máx. 120 |
| Objective | string | Obrigatório, trim, máx. 500 |
| IdealProfile | string? | Opcional, máx. 1000 |
| Segment | string | Obrigatório, trim, máx. 120 |
| Services | string? | Opcional, máx. 1000 |
| Differentials | string? | Opcional, máx. 1000 |
| ValueProposition | string? | Opcional, máx. 1000 |
| TargetLeadCount | int | Obrigatório, inteiro de 1 até `CampaignOptions.MaxTargetLeadCount` |
| Status | `ECampaignStatus` | `Draft`, `Running`, `Paused`, `Completed`, `Cancelled` |
| CreatedAt | Instant, `init` | Por `IClock` |
| UpdatedAt | Instant | Atualizado a cada mudança |
| BusinessUnitId | Guid, `init` | Tenant |
| RowVersion | byte[] | Controle de concorrência |

Obrigatórios pela spec (FR-002): nome, objetivo, localização, segmento, ao menos um CNAE e quantidade de leads. Perfil ideal, serviços, diferenciais e proposta de valor são opcionais (a spec não os exige). Texto só com espaços vale vazio (FR-003).

### CampaignLocation (`ITenantOwned`)

| Campo | Tipo | Regra |
|---|---|---|
| Id | Guid | |
| CampaignId | Guid | FK para `Campaign`, remoção em cascata |
| State | string(2) | UF da lista fixa de 27 |
| MunicipalityCode | string(4) | Código do município na Receita (o mesmo usado em `Estabelecimentos`); existente em `Municipality` e pertencente à UF informada |
| BusinessUnitId | Guid | Tenant |

Pelo menos 1 linha por campanha; todas as cidades da mesma UF (a spec fala em estado e cidade, ou mais de uma cidade). Máx. 30 por campanha. Cidade repetida na mesma campanha é recusada.

### CampaignCnae (`ITenantOwned`)

| Campo | Tipo | Regra |
|---|---|---|
| Id | Guid | |
| CampaignId | Guid | FK para `Campaign`, remoção em cascata |
| CnaeCode | string(7) | Código existente em `Cnae` |
| BusinessUnitId | Guid | Tenant |

Pelo menos 1 por campanha, máx. 20, sem repetição.

### Referência (sem tenant, somente leitura, carregada por seed)

| Entidade | Campos | Observação |
|---|---|---|
| Cnae | Code (string(7), chave), Description (até 159 caracteres na fonte) | 1.358 linhas, de `Cnaes.zip` da Receita (spike S1.2), sem o placeholder `8888888`; seed `cnae.tsv` |
| Municipality | Code (string(4), chave), State (UF, char(2)), Name (até 32 caracteres na fonte) | 5.571 linhas, seed `municipios.tsv` (spike S1.1); nomes em maiúsculas e sem acento, como na Receita; busca sem acento |

Seed idempotente chamado pelo `MigrateDatabaseAsync`, junto do seed existente.

### Event (já existe)

Passa a ter chave estrangeira `CampaignId` para `Campaign` (coluna já existe, hoje sem FK), `DeleteBehavior.NoAction`. `CompanyId` segue sem FK até a spec 007. Categoria `Campaign` (valor já existe em `EEventCategory`).

Tipos de evento (campo `Type`): `CampaignCreated`, `CampaignUpdated` (a descrição lista os nomes dos campos alterados), `CampaignStarted`, `CampaignPaused`, `CampaignResumed`, `CampaignCancelled`. `Source` = `Campaign`. A descrição nunca contém dado sensível; só nomes de campo e o estado de origem e destino.

## Estados e transições

```text
Draft ---start---> Running ---pause---> Paused ---resume---> Running
Running ---(spec 003)---> Completed
Draft | Running | Paused ---cancel---> Cancelled
```

| De | Iniciar | Pausar | Retomar | Cancelar | Editar |
|---|---|---|---|---|---|
| Draft | sim | não | não | sim | sim |
| Running | não | sim | não | sim | não |
| Paused | não | não | sim | sim | sim |
| Completed | não | não | não | não | não |
| Cancelled | não | não | não | não | não |

Transição inválida devolve notification `EMessage` com o estado atual, e o front mostra a mensagem. Completed e Cancelled são finais (spec 001, edge case).

## Índices

- `Campaign`: (BusinessUnitId, Status, CreatedAt desc) para a lista com filtro; PK por Id.
- `CampaignLocation`: (CampaignId); (CampaignId, State, MunicipalityCode) único.
- `CampaignCnae`: (CampaignId, CnaeCode) único.
- `Event`: o índice (CampaignId, OccurredAt) previsto no plano geral entra aqui.
- `Cnae`: PK por Code; busca por descrição normalizada.
- `Municipality`: (State, Name normalizado).

## Regras que cruzam entidades

- Edição só em Draft ou Paused; ao editar, trocar localização e CNAE é "apagar e regravar" as linhas filhas na mesma transação.
- Cancelar não apaga nada: dados coletados e histórico ficam (FR-010).
- A remoção física de campanha não existe nesta spec.

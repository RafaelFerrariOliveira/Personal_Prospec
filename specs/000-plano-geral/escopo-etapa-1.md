# Escopo da Etapa 1: somente prospecção

**Decisão**: Rafael Ferrari, 2026-11-01. Nesta primeira etapa o produto faz apenas a prospecção: achar, qualificar e aprovar empresas. Geração de mensagem e envio (manual ou automático) ficam para a etapa seguinte.

## Dentro da Etapa 1

| Spec | Tema | Ajuste feito |
|---|---|---|
| 001 | Campanhas | Sem mensagem-base (campo, FR-005 e regra de iniciar exigindo modelo). Novo campo CNAE (um ou mais, escolhido por busca na lista oficial; obrigatório) |
| 002 | Acesso e conta | Sem mudança |
| 003 | Pesquisa e qualificação (Coulson) | Funil: a base ranqueia sem IA e a IA enriquece de cima para baixo até a meta (FR-017). Só matriz e ativa (FR-018). CNAE vem da campanha, sem sugestão de IA (FR-019). Contato da base conta como canal (FR-020). Canal = telefone, e-mail ou site, sem WhatsApp. Duplicidade só por chave forte, sem revisão humana |
| 004 | Aprovação e rejeição de leads | Aprovar só registra a decisão; não dispara mensagem (FR-006, SC-003, SC-004). Saiu a revisão manual de duplicidades (User Story 3, FR-010, SC-005) |
| 007 | Banco central de empresas | Ficha e linha do tempo sem mensagens e envios; alerta passa a ser "já tratada em outra campanha" (pendente de confirmação) |
| 008 | Tarefas comerciais | Tarefa só manual; sem oferta a partir de "Pediu retorno" (FR-003); sem vínculo com mensagem |
| 009 | Indicadores e dashboard | Só encontradas, qualificadas, aprovadas, rejeitadas e taxa de aprovação; sem taxas de envio, resposta e interesse |
| 010 | Operação, falhas, exportação e backup | Falhas só de pesquisa; sem exportar mensagens; FR-003 reservado |

## Fora da Etapa 1 (adiado, spec preservada)

| Spec | Tema |
|---|---|
| 005 | Pesquisa complementar e mensagens (Natasha) |
| 006 | Envio via HERMES e resultado comercial |

Os IDs removidos (001 FR-005, 008 FR-003, 009 FR-004b, FR-005, FR-006, 010 FR-003) ficam reservados com a marca "Fora da Etapa 1", para a etapa seguinte reaproveitar a numeração.

## Regras que continuam valendo

- "Não contatar" (007 FR-008) continua como marcação manual da empresa e como proteção LGPD. Nesta etapa ela só bloqueia aprovar o lead (004 FR-009) e mostra o aviso; o bloqueio de envio volta com a spec 006.
- Remoção de dados pessoais a pedido do titular (007 FR-009) continua.
- Nenhuma ação automática de contato com a empresa existe nesta etapa.

## Decisões confirmadas

- 2026-11-01, Rafael: o alerta de contato anterior (007 US3/FR-006, 004 FR-008) vale para empresa com lead aprovado ou rejeitado em outra campanha. Sem registro manual de "já contatei" na Etapa 1.

- 2026-11-02, Rafael: simplificação do Coulson aplicada (funil, contato da base como canal, sem WhatsApp, CNAE por lista, só matriz, duplicidade só por chave forte, prompt com dados conhecidos). Risco aceito: contato da base pode estar defasado ou ser de pessoa física em MEI.

## Pendências abertas

- Valor do indicador matriz/filial que significa "matriz" na base de CNPJ: verificar no dado real antes de implementar a regra de só matriz.
- Canal oficial da base de CNPJ (share do Nextcloud) e layout oficial em PDF: ver `docs/discovery/spikes-s0-1-e-s0-3.md`.
- Decisão sobre concorrência 1 no Coulson (cerca de 51 s por empresa na chamada de IA): aberta.

## Efeito no plano (`plan.md`)

- Fases 5 (Natasha) e 6 (Envio e resposta) saem do MVP.
- MVP da Etapa 1 = fases 0 (sem S0.2), 1, 2, 3 e 4: login, campanha, Coulson com leads reais e aprovação. Fases 7 a 9 (banco central, tarefas, indicadores, operação) seguem em seguida.
- Bloqueio B2 (HERMES) e a porta `IMessageDispatchClient` ficam adiados. B1 (`claude -p`) continua, só para o Coulson (003) e a capacidade de IA (010).
- `data-model.md`, `contracts/api.md`, `contracts/integracoes.md`, `research.md` e `quickstart.md` foram revisados em 2026-11-01. O que é de mensagem, envio e resposta comercial está em blocos marcados "ADIADO" e não gera tabela, endpoint, porta, spike nem task na Etapa 1. O restante vale como está.

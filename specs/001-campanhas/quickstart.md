# Quickstart: validação da spec 001 (campanhas)

**Data**: 2026-11-02 | **Plano**: [plan.md](plan.md)

Guia para provar que a spec 001 funciona de ponta a ponta quando estiver implementada. Sem código de produto aqui.

## Pré-requisitos

- Spec 002 funcionando: Api e front sobem, login funciona, `secrets.json` preenchido (nomes das chaves em `backend/README.md`).
- Spikes S1.1 e S1.2 concluídos (listas de municípios e de CNAE carregadas pelo seed).
- Docker disponível para os testes de integração.

## Subir o ambiente

Backend, a partir de `backend/Src/`: `dotnet run --project PersonalProspec.Api --launch-profile https` (a primeira subida aplica a migration e o seed).

Frontend, a partir de `frontend/`: `npm run dev` e abrir `http://localhost:5173`.

Verificações automáticas: `dotnet test ../PersonalProspec.slnx` em `backend/Src/`; `npm run format`, `npm run lint`, `npm run ts:check`, `npm run test:unit` e `npm run build` em `frontend/`.

## Roteiro manual

| # | Cenário | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Nova campanha com todas as etapas preenchidas e salvar | Campanha em "Rascunho", confirmação exibida | US1 |
| 2 | Avançar uma etapa com campo obrigatório vazio | Campo indicado, nada registrado | US1, SC-002 |
| 3 | Voltar a uma etapa anterior | Dados digitados mantidos | US1 |
| 4 | Preencher só espaços em um campo obrigatório | Tratado como vazio | FR-003 |
| 5 | Quantidade de leads 0, negativa e acima do máximo | Recusada com mensagem clara | FR-003 |
| 6 | Dois cliques rápidos em "Salvar" | Uma só campanha na lista | FR-013 |
| 7 | Iniciar uma campanha em Rascunho | "Em execução", tela "Agente de IA iniciado" e depois o detalhe | US2, FR-015 |
| 8 | Dois cliques rápidos em "Iniciar" | Uma só execução; o segundo pedido recusado | FR-013 |
| 9 | Pausar uma campanha em execução | "Pausada"; nenhuma tarefa nova inicia depois | US2, SC-003 |
| 10 | Tentar editar com a campanha em execução | Recusado, mensagem pede para pausar antes | US2, FR-009 |
| 11 | Editar com a campanha pausada e salvar | Alteração gravada e evento no histórico | US2, FR-014 |
| 12 | Retomar | "Em execução"; nunca retoma sozinha | US2, SC-004 |
| 13 | Cancelar e confirmar | "Cancelada"; dados e histórico preservados | US2, FR-010 |
| 14 | Tentar iniciar uma campanha cancelada | Recusado | Edge case |
| 15 | Lista com campanhas em estados diferentes, filtrar por estado | Só as do estado escolhido, mais recentes primeiro | US3 |
| 16 | Lista vazia | Mensagem e ação de criar a primeira | US3 |
| 17 | Abrir o detalhe de uma campanha | Configuração completa, estado e histórico | US3, SC-005 |
| 18 | Abrir o detalhe de uma campanha de outra unidade (teste de integração) | Responde como inexistente | Constituição III |

Os cenários 7, 9, 12 e 13 verificam o estado e o histórico. A pesquisa real de empresas só passa a existir com a spec 003; antes disso, "Em execução" não busca nada, e o cenário 9 confere apenas a mudança de estado.

## Teste de fumaça de concorrência (automatizado)

`create_campaign` com o mesmo `requestId` duas vezes em paralelo e `start_campaign` duas vezes em paralelo: exatamente uma campanha e exatamente uma transição para "Em execução" no histórico.

# Feature Specification: Tarefas comerciais

**Feature Branch**: `008-tarefas-comerciais`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Criar tarefas comerciais para retornos, com prazo, descrição e status; lista de tarefas e calendário; alertas internos para tarefas próximas do prazo e atrasadas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e acompanhar tarefas de retorno (Priority: P1)

O usuário cria uma tarefa ligada a uma empresa (e, se houver, à campanha), com descrição e prazo. A tarefa nasce como "Pendente" e pode ser concluída ou cancelada. Na Etapa 1 a tarefa é sempre criada manualmente (não há resposta comercial registrada no sistema).

**Why this priority**: sem acompanhamento, os retornos pedidos pelos clientes se perdem.

**Independent Test**: criar uma tarefa manualmente, concluí-la e cancelar outra.

**Acceptance Scenarios**:

1. **Given** uma empresa, **When** o usuário cria uma tarefa com descrição e prazo, **Then** ela é registrada como "Pendente", ligada à empresa, e aparece na linha do tempo da empresa.
2. **Given** uma tarefa "Pendente", **When** o usuário a conclui, **Then** o estado passa a "Concluída" com data e hora.
3. **Given** uma tarefa "Pendente", **When** o usuário a cancela, **Then** o estado passa a "Cancelada" e o motivo é opcional.

### User Story 2 - Ver tarefas em lista e em calendário (Priority: P2)

O usuário vê as tarefas em uma lista (filtrável por estado, prazo e empresa) e em um calendário por dia, semana e mês.

**Why this priority**: organiza o dia de trabalho comercial.

**Independent Test**: com tarefas em datas variadas, abrir a lista, filtrar, e abrir o calendário.

**Acceptance Scenarios**:

1. **Given** tarefas criadas, **When** o usuário abre a lista, **Then** vê descrição, empresa, prazo e estado, ordenadas pelo prazo mais próximo.
2. **Given** a lista, **When** filtra por estado ou empresa, **Then** só as correspondentes aparecem.
3. **Given** o calendário, **When** o usuário escolhe um período, **Then** vê as tarefas nos dias dos prazos e pode abrir cada uma.

### User Story 3 - Receber alertas de prazo (Priority: P2)

O sistema avisa dentro do próprio sistema sobre tarefas próximas do prazo e atrasadas.

**Why this priority**: evita esquecer retornos prometidos.

**Independent Test**: criar tarefas com prazos próximo e vencido e conferir os alertas.

**Acceptance Scenarios**:

1. **Given** uma tarefa "Pendente" com prazo dentro da janela de aviso, **When** o usuário abre o sistema, **Then** vê um alerta de "Próxima do prazo".
2. **Given** uma tarefa "Pendente" com prazo vencido, **When** o usuário abre o sistema, **Then** vê um alerta de "Atrasada".
3. **Given** uma tarefa concluída ou cancelada, **When** o usuário abre o sistema, **Then** não há alerta dela.

### Edge Cases

- Prazo no passado ao criar: o sistema avisa e pede confirmação.
- Editar prazo ou descrição registra a alteração no histórico.
- Empresa arquivada com tarefa pendente: a tarefa continua visível e alertando até ser resolvida.
- Empresa marcada "Não contatar" (spec 007): novas tarefas de retorno de contato são avisadas, mas permitidas para outras ações (por exemplo, registrar a retirada de dados).
- Muitas tarefas atrasadas: o alerta mostra a contagem e leva à lista filtrada, sem poluir a tela.
- Tarefas sem empresa não existem: toda tarefa é ligada a uma empresa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar uma tarefa comercial com descrição, prazo e empresa obrigatórios, e campanha opcional.
- **FR-002**: O sistema MUST manter os estados "Pendente", "Concluída" e "Cancelada", com data e hora de cada mudança.
- **FR-003**: Fora da Etapa 1 (oferta de tarefa a partir de "Pediu retorno", depende da resposta comercial da spec 006). O ID fica reservado.
- **FR-004**: O sistema MUST listar as tarefas ordenadas pelo prazo mais próximo e permitir filtrar por estado, prazo e empresa.
- **FR-005**: O sistema MUST apresentar as tarefas em calendário por dia, semana e mês.
- **FR-006**: O sistema MUST exibir alertas internos para tarefas "Pendentes" próximas do prazo e atrasadas.
- **FR-007**: O sistema MUST permitir editar descrição e prazo, registrando cada alteração no histórico.
- **FR-008**: O sistema MUST mostrar as tarefas na ficha e na linha do tempo da empresa.
- **FR-009**: O sistema MUST avisar sobre prazo no passado ao criar ou editar.
- **FR-010**: O sistema MUST NOT enviar mensagens nem contatar a empresa automaticamente por causa de uma tarefa.

### Key Entities *(include if feature involves data)*

- **Tarefa comercial**: descrição, prazo, estado, empresa, campanha opcional, datas de criação e de conclusão.
- **Alerta de tarefa**: aviso interno derivado do prazo ("Próxima do prazo" ou "Atrasada").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário cria uma tarefa em menos de 30 segundos.
- **SC-002**: 100% das tarefas "Pendentes" vencidas aparecem como atrasadas na abertura do sistema.
- **SC-003**: 100% das tarefas dentro da janela de aviso geram alerta.
- **SC-004**: 0 tarefas concluídas ou canceladas geram alerta.
- **SC-005**: O usuário localiza uma tarefa específica na lista ou no calendário em menos de 15 segundos.

## Assumptions

- Alertas são internos ao sistema (sem e-mail, push nem WhatsApp).
- A janela de "próxima do prazo" é de 24 horas, ajustável no plano.
- Prazo é data (com hora opcional); fuso horário é o do computador do usuário.
- Tarefas recorrentes, subtarefas e responsáveis diferentes não existem (uso individual).

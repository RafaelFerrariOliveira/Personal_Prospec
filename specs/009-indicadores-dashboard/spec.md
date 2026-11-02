# Feature Specification: Indicadores e dashboard

**Feature Branch**: `009-indicadores-dashboard`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Dashboard com as etapas da prospecção e o progresso em tempo real; comparação de campanhas em tabela, com filtros por período, status e segmento; indicadores de empresas encontradas, qualificadas, aprovadas e rejeitadas e taxa de aprovação. (Etapa 1: mensagens enviadas e as taxas de envio, resposta e interesse comercial foram adiadas com as specs 005 e 006.)"

## Clarifications

### Session 2026-10-23

- Q: Qual deve ser o cálculo da taxa de aprovação de leads? → A: Aprovados ÷ (aprovados + rejeitados); leads pendentes não entram.
- Adiadas para a etapa seguinte (valem quando as specs 005 e 006 voltarem ao escopo): taxa de envio = mensagens "Enviada" ÷ mensagens aprovadas; taxa de interesse = "Interessado" ÷ respostas registradas; respostas registradas = Respondeu, Interessado, Sem interesse e Pediu retorno ("Sem resposta" não conta).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acompanhar o andamento das campanhas em tempo real (Priority: P1)

O usuário abre o dashboard e vê, para a campanha escolhida, as etapas da prospecção (pesquisa e aprovação de leads) com o progresso de cada uma, atualizado sem recarregar a página, além do que exige a sua atenção agora (leads aguardando decisão, falhas, tarefas atrasadas).

**Why this priority**: o usuário precisa saber onde está o trabalho e o que depende dele.

**Independent Test**: acompanhar uma campanha em execução e conferir que os números mudam sozinhos e que as pendências aparecem.

**Acceptance Scenarios**:

1. **Given** uma campanha em execução, **When** o usuário abre o dashboard, **Then** vê cada etapa com o estado e a contagem de itens concluídos e pendentes.
2. **Given** o dashboard aberto, **When** o Coulson encontra uma nova empresa, **Then** os números são atualizados sem ação do usuário.
3. **Given** itens que aguardam o usuário, **When** abre o dashboard, **Then** vê os atalhos para leads pendentes, falhas e tarefas atrasadas.
4. **Given** uma campanha pausada ou concluída, **When** o usuário a abre, **Then** vê o estado final e o déficit, se houver.

### User Story 2 - Medir os resultados com indicadores (Priority: P1)

Para cada campanha e para o conjunto, o usuário vê os indicadores: empresas encontradas, qualificadas, aprovadas e rejeitadas, e taxa de aprovação. Ao tocar em um indicador, vê a definição do cálculo.

**Why this priority**: mostra se a prospecção está dando resultado e onde melhorar.

**Independent Test**: montar uma campanha com números conhecidos e conferir cada indicador contra o cálculo manual.

**Acceptance Scenarios**:

1. **Given** uma campanha com dados, **When** o usuário abre os indicadores, **Then** vê as quatro contagens e a taxa de aprovação.
2. **Given** leads aprovados, rejeitados e pendentes, **When** a taxa de aprovação é calculada, **Then** é aprovados divididos por (aprovados mais rejeitados), sem contar os pendentes.
3. **Given** denominador zero, **When** uma taxa seria calculada, **Then** o valor exibido é "sem dados" e não um número enganoso.
4. **Given** um indicador, **When** o usuário o abre, **Then** vê a definição do cálculo e a lista de itens que o compõem.

### User Story 3 - Comparar campanhas em tabela (Priority: P2)

O usuário compara campanhas lado a lado em uma tabela com os indicadores, filtrando por período, status e segmento e ordenando por qualquer coluna.

**Why this priority**: ajuda a decidir quais perfis e abordagens funcionam melhor.

**Independent Test**: com várias campanhas, filtrar por período, status e segmento, ordenar e conferir os valores.

**Acceptance Scenarios**:

1. **Given** várias campanhas, **When** o usuário abre a comparação, **Then** vê uma linha por campanha com os indicadores.
2. **Given** a tabela, **When** filtra por período, status e segmento, **Then** só as campanhas correspondentes aparecem e os totais refletem o filtro.
3. **Given** a tabela, **When** ordena por uma coluna, **Then** a ordem muda e é mantida na sessão.

### Edge Cases

- Campanha sem dados mostra zeros e "sem dados" nas taxas, sem erros.
- Atualização em tempo real interrompida (conexão local caiu): o dashboard avisa que está desatualizado e oferece atualizar.
- Decisões do usuário que mudam depois (aprovar ou rejeitar de novo) atualizam as taxas.
- Campanha cancelada continua nos indicadores, identificada pelo status.
- Muitos períodos: o filtro de período aceita intervalo livre e atalhos (últimos 7, 30 e 90 dias).
- Uma mesma empresa em duas campanhas conta uma vez em cada campanha e uma vez no total geral de empresas, sem dupla contagem.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir o dashboard com as etapas da prospecção e o progresso de cada uma para a campanha selecionada.
- **FR-002**: O sistema MUST atualizar o progresso em tempo real, sem recarregar a página, e avisar quando a atualização estiver interrompida.
- **FR-003**: O sistema MUST destacar o que aguarda o usuário: leads pendentes, falhas e tarefas atrasadas, com atalho para cada lista.
- **FR-004**: O sistema MUST calcular e exibir: empresas encontradas, qualificadas, aprovadas e rejeitadas, e taxa de aprovação.
- **FR-004a**: A taxa de aprovação MUST ser aprovados divididos por (aprovados mais rejeitados), ignorando leads pendentes.
- **FR-004b**: Fora da Etapa 1 (taxa de envio). O ID fica reservado.
- **FR-005**: Fora da Etapa 1 (taxa de resposta). O ID fica reservado.
- **FR-006**: Fora da Etapa 1 (taxa de interesse). O ID fica reservado.
- **FR-007**: O sistema MUST exibir "sem dados" quando o denominador de uma taxa for zero.
- **FR-008**: O sistema MUST mostrar a definição de cada indicador e a lista de itens que o compõem.
- **FR-009**: O sistema MUST comparar campanhas em tabela, com filtros por período, status e segmento e ordenação por coluna.
- **FR-010**: O sistema MUST refletir imediatamente nos indicadores qualquer alteração de decisão do usuário (aprovar, rejeitar, unificar).
- **FR-011**: O sistema MUST permitir exportar a tabela de comparação respeitando os filtros (ver spec de operação).

### Key Entities *(include if feature involves data)*

- **Indicador**: contagem ou taxa com nome, definição, valor e itens de origem.
- **Etapa da prospecção**: fase do fluxo (pesquisa e aprovação de leads) com estado e contagens.
- **Comparação de campanhas**: conjunto de campanhas com os indicadores e os filtros aplicados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das campanhas de teste, os indicadores batem com a contagem manual.
- **SC-002**: Mudanças no andamento aparecem no dashboard em até 5 segundos, sem recarregar.
- **SC-003**: O usuário identifica o que depende dele (pendências) em até 10 segundos após abrir o dashboard.
- **SC-004**: Em 100% dos casos de denominador zero, a taxa exibe "sem dados".
- **SC-005**: A comparação de até 50 campanhas carrega e responde a filtros em menos de 3 segundos.

## Assumptions

- Definição da taxa de aprovação confirmada na seção Clarifications. As definições de envio, resposta e interesse ficam guardadas para a etapa seguinte.
- Gráficos detalhados, previsões e metas ficam fora desta feature.
- O tempo real vale para o computador do usuário (uso local); não há multiusuário.

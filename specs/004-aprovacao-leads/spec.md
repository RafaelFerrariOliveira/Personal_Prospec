# Feature Specification: Aprovação e rejeição de leads

**Feature Branch**: `004-aprovacao-leads`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Solicitar aprovação ou rejeição individual de cada lead qualificado, registrar obrigatoriamente o motivo da rejeição, listar os leads ordenados inicialmente pela maior pontuação com ordenação configurável. (Etapa 1: sem revisão humana de duplicidades, decisão de 2026-11-02.)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisar a lista de leads e aprovar ou rejeitar cada um (Priority: P1)

O usuário abre a lista de leads qualificados de uma campanha, ordenada pela maior pontuação, vê para cada um os dados principais, a justificativa e as fontes, e aprova ou rejeita individualmente. Rejeitar exige informar o motivo. Aprovar marca o lead como pronto para abordagem; na Etapa 1 o fluxo termina aí, sem gerar nem enviar mensagem.

**Why this priority**: é a barreira humana obrigatória entre a pesquisa automática e qualquer contato comercial.

**Independent Test**: com leads qualificados, aprovar um, rejeitar outro com motivo, tentar rejeitar sem motivo e conferir os estados e o registro.

**Acceptance Scenarios**:

1. **Given** leads qualificados, **When** o usuário abre a lista, **Then** os vê ordenados da maior para a menor pontuação, com classificação, canal de contato e resumo da justificativa.
2. **Given** um lead, **When** o usuário o abre, **Then** vê dados cadastrais, contatos, pontuação com justificativa, fontes com data e o histórico da empresa.
3. **Given** um lead "Pendente", **When** o usuário aprova, **Then** ele passa a "Aprovado", com data e hora, e nenhuma mensagem é gerada.
4. **Given** um lead "Pendente", **When** o usuário rejeita sem informar o motivo, **Then** a rejeição é recusada e o motivo é exigido.
5. **Given** um lead, **When** o usuário rejeita informando o motivo, **Then** ele passa a "Rejeitado" e o motivo fica registrado com data e hora.

### User Story 2 - Ordenar, filtrar e decidir em sequência (Priority: P2)

O usuário muda a ordenação (por pontuação, nome, cidade ou classificação) e filtra por classificação e por estado do lead (Pendente, Aprovado, Rejeitado).

**Why this priority**: acelera a revisão em campanhas com muitos leads.

**Independent Test**: ordenar e filtrar a lista e conferir o resultado.

**Acceptance Scenarios**:

1. **Given** a lista de leads, **When** o usuário escolhe outra ordenação, **Then** a lista é reordenada e a escolha é mantida durante a sessão.
2. **Given** a lista, **When** filtra por classificação "Alta", **Then** só leads Alta aparecem.
3. **Given** todos os leads decididos, **When** o usuário abre a lista, **Then** vê o resumo de aprovados e rejeitados.

### User Story 3 - Resolver possíveis duplicidades (FORA DA ETAPA 1)

Adiada em 2026-11-02. Na Etapa 1 a duplicidade é tratada só por chave forte (CNPJ ou domínio) na pesquisa, sem tela de revisão (ver specs 003 e 007). Texto original preservado no histórico do repositório; a história volta se a revisão manual for necessária.

### Edge Cases

- Um lead aprovado não é rejeitado nem reaprovado por engano: mudar a decisão exige ação explícita e fica registrado no histórico.
- Duplo clique em "Aprovar" registra uma única aprovação.
- Lead cuja empresa foi marcada "não contatar" depois da descoberta não pode ser aprovado e mostra o aviso.
- Lead cuja empresa já foi tratada em outra campanha mostra o alerta com data, campanha e histórico; o usuário decide se aprova (critério do alerta em pendência na spec 007).
- Lista vazia (nenhum lead qualificado ainda) mostra mensagem apropriada e o andamento da pesquisa.
- Rejeição em massa não existe: cada lead é decidido individualmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST listar os leads qualificados da campanha, ordenados inicialmente pela maior pontuação, com classificação, canal de contato e resumo da justificativa.
- **FR-002**: O sistema MUST permitir ordenar por pontuação, nome, cidade e classificação, e filtrar por classificação e por estado do lead.
- **FR-003**: O sistema MUST exibir o detalhe do lead com dados cadastrais, contatos, pontuação, justificativa, fontes com data e histórico da empresa.
- **FR-004**: O sistema MUST exigir decisão individual de cada lead: aprovar ou rejeitar.
- **FR-005**: O sistema MUST exigir o motivo para rejeitar e registrá-lo com data e hora.
- **FR-006**: O sistema MUST, ao aprovar um lead, registrar a aprovação uma única vez e disponibilizar o lead aprovado para consulta e exportação. Pesquisa complementar e mensagem ficam fora da Etapa 1.
- **FR-007**: O sistema MUST permitir mudar uma decisão somente por ação explícita, registrando a mudança no histórico.
- **FR-008**: O sistema MUST mostrar o alerta de empresa já tratada em outra campanha (data, campanha, histórico) e deixar o usuário decidir, conforme a spec 007.
- **FR-009**: O sistema MUST impedir a aprovação de lead cuja empresa esteja marcada "não contatar".
- **FR-010**: Fora da Etapa 1 (revisão manual de duplicidades). O ID fica reservado.
- **FR-011**: O sistema MUST NOT aprovar nem rejeitar nada de forma automática.

### Key Entities *(include if feature involves data)*

- **Lead**: empresa qualificada em uma campanha, com estado (Pendente, Aprovado, Rejeitado), pontuação, classificação, decisão, motivo da rejeição e datas.
- **Decisão sobre lead**: registro da aprovação ou rejeição, com motivo, data e hora e histórico de mudanças.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das rejeições têm motivo registrado.
- **SC-002**: O usuário decide um lead em menos de 30 segundos quando a justificativa e as fontes estão visíveis.
- **SC-003**: Nenhum lead passa a "Aprovado" sem decisão explícita do usuário.
- **SC-004**: Duplo clique em "Aprovar" gera exatamente uma aprovação registrada.
- **SC-005**: Fora da Etapa 1 (decisão do usuário em duplicidades ambíguas). O ID fica reservado.

## Assumptions

- Uso individual: o usuário que decide é o único usuário do sistema.
- O estado "Pendente" se aplica a todo lead qualificado ainda sem decisão.
- Mensagem e envio são passos posteriores, adiados para a etapa seguinte (specs 005 e 006, fora da Etapa 1).
- Os leads rejeitados saem da lista ativa da campanha, mas permanecem consultáveis e no histórico da empresa.
- Reverter uma rejeição ou aprovação é possível, com registro, pois o usuário pode ter errado.

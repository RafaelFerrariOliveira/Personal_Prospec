# Feature Specification: Campanhas de prospecção

**Feature Branch**: `001-campanhas`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Criar campanha por formulário guiado definindo objetivo, localização, perfil de empresa ideal, segmento, CNAE, serviços, diferenciais, proposta de valor, e quantidade de leads. Permitir iniciar, pausar, retomar e cancelar campanhas, alterar configurações somente quando pausada, e consultar a lista e o detalhe das campanhas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e salvar uma campanha por formulário guiado (Priority: P1)

O usuário abre "Nova campanha" e percorre um formulário em etapas: identificação (nome e objetivo), onde prospectar (localização), quem prospectar (perfil de empresa ideal, segmento e um ou mais CNAE escolhidos por busca na lista oficial), o que oferecer (serviços, diferenciais e proposta de valor), e quanto buscar (quantidade de leads). Ao final ele revisa o resumo e salva. A campanha fica registrada no estado "Rascunho".

**Why this priority**: sem campanha configurada não há prospecção. É o ponto de partida de todo o fluxo e já entrega valor: o perfil comercial fica registrado.

**Independent Test**: preencher todas as etapas, salvar, e confirmar que a campanha aparece como "Rascunho" com todos os dados informados.

**Acceptance Scenarios**:

1. **Given** o formulário guiado aberto, **When** o usuário preenche todas as etapas e salva, **Then** a campanha é registrada no estado "Rascunho" e uma confirmação é exibida.
2. **Given** uma etapa com campo obrigatório vazio, **When** o usuário tenta avançar ou salvar, **Then** o campo faltante é indicado e nada é registrado.
3. **Given** o formulário parcialmente preenchido, **When** o usuário volta a uma etapa anterior, **Then** os dados já digitados são mantidos.

### User Story 2 - Controlar a execução da campanha (Priority: P2)

O usuário inicia uma campanha em "Rascunho", pode pausá-la, retomá-la ou cancelá-la. Ao pausar, nenhuma nova tarefa é iniciada, mas a tarefa em andamento termina e salva o resultado. A retomada só acontece por ação do usuário. As configurações só podem ser alteradas com a campanha pausada (ou em rascunho).

**Why this priority**: dá controle sobre o consumo de tempo e de IA e evita trabalho indesejado, mas depende de a campanha existir.

**Independent Test**: iniciar uma campanha, pausá-la durante a execução, confirmar que a tarefa em andamento termina e nenhuma nova começa, alterar uma configuração, retomar e depois cancelar.

**Acceptance Scenarios**:

1. **Given** uma campanha em "Rascunho" válida, **When** o usuário inicia, **Then** ela passa para "Em execução" e a pesquisa de empresas é disparada.
2. **Given** uma campanha "Em execução" com tarefa em andamento, **When** o usuário pausa, **Then** a tarefa atual termina e salva o resultado, nenhuma nova tarefa inicia e o estado passa a "Pausada".
3. **Given** uma campanha "Pausada", **When** o usuário altera configurações e salva, **Then** as alterações valem para as tarefas seguintes.
4. **Given** uma campanha "Em execução", **When** o usuário tenta alterar configurações, **Then** o sistema recusa e informa que é preciso pausar antes.
5. **Given** uma campanha "Pausada", **When** o usuário retoma, **Then** ela volta a "Em execução"; ela nunca retoma sozinha.
6. **Given** uma campanha não finalizada, **When** o usuário cancela e confirma, **Then** o estado passa a "Cancelada", o histórico e os dados já coletados são preservados e nenhuma tarefa nova inicia.

### User Story 3 - Consultar campanhas e seu detalhe (Priority: P3)

O usuário vê a lista de campanhas com nome, segmento, localização, estado e data, e abre uma campanha para ver a configuração completa, o estado e o resumo do andamento.

**Why this priority**: facilita acompanhar o que existe, mas não bloqueia o fluxo principal.

**Independent Test**: com campanhas em estados diferentes, abrir a lista, filtrar por estado e abrir uma campanha para conferir os dados.

**Acceptance Scenarios**:

1. **Given** campanhas criadas, **When** o usuário abre a lista, **Then** vê cada campanha com nome, segmento, localização, estado e data de criação, da mais recente para a mais antiga.
2. **Given** a lista, **When** o usuário filtra por estado, **Then** só as campanhas daquele estado aparecem.
3. **Given** nenhuma campanha, **When** o usuário abre a lista, **Then** vê uma mensagem de lista vazia com a ação de criar a primeira.

### Edge Cases

- Campos preenchidos só com espaços são tratados como vazios.
- Duplo clique em "Salvar" ou "Iniciar" registra uma única campanha e uma única execução.
- Quantidade de leads zero, negativa ou acima do máximo permitido é recusada com mensagem clara.
- Pausar quando já não há tarefa em andamento passa direto para "Pausada".
- Cancelar durante uma tarefa em andamento: a tarefa termina e salva o resultado, sem iniciar outra.
- Campanha concluída ou cancelada não pode ser iniciada novamente; o usuário cria uma nova campanha (a duplicação fica fora desta feature).
- Falha ao salvar mostra erro claro, mantém os dados digitados e não registra campanha incompleta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar uma campanha por formulário guiado em etapas, informando nome, objetivo, localização, perfil de empresa ideal, segmento, CNAE, serviços, diferenciais, proposta de valor e quantidade de leads.
- **FR-002**: O sistema MUST exigir os campos obrigatórios (nome, objetivo, localização, segmento, ao menos um CNAE e quantidade de leads), indicando cada campo faltante e mantendo os dados já digitados.
- **FR-003**: O sistema MUST tratar texto só com espaços como vazio, limitar o tamanho dos campos e validar a quantidade de leads como número inteiro positivo dentro de um máximo definido.
- **FR-004**: O sistema MUST registrar a campanha salva no estado "Rascunho", com data e hora de criação, e exibir o resumo para revisão antes de salvar.
- **FR-005**: Fora da Etapa 1 (mensagem-base da campanha, adiada com as specs 005 e 006). O ID fica reservado para a etapa seguinte.
- **FR-006**: O sistema MUST permitir iniciar uma campanha válida em "Rascunho", mudando o estado para "Em execução" e disparando a pesquisa de empresas.
- **FR-007**: O sistema MUST permitir pausar uma campanha "Em execução": não iniciar novas tarefas, deixar a tarefa em andamento terminar e salvar o resultado, e passar para "Pausada".
- **FR-008**: O sistema MUST retomar uma campanha "Pausada" somente por ação explícita do usuário.
- **FR-009**: O sistema MUST permitir alterar configurações somente com a campanha em "Rascunho" ou "Pausada", recusando a alteração nos demais estados com mensagem clara.
- **FR-010**: O sistema MUST permitir cancelar uma campanha não finalizada, após confirmação, preservando o histórico e os dados já coletados e impedindo novas tarefas.
- **FR-011**: O sistema MUST manter os estados de campanha "Rascunho", "Em execução", "Pausada", "Concluída" e "Cancelada", exibidos na lista e no detalhe, e MUST impedir transições inválidas.
- **FR-012**: O sistema MUST listar as campanhas com nome, segmento, localização, estado e data de criação, permitir filtrar por estado e abrir o detalhe com a configuração completa.
- **FR-013**: O sistema MUST impedir registros e execuções duplicados quando "Salvar" ou "Iniciar" forem acionados mais de uma vez seguida.
- **FR-014**: O sistema MUST registrar no histórico cada mudança de estado e cada alteração de configuração, com data e hora.
- **FR-015**: O sistema MUST, ao iniciar uma campanha, mostrar uma tela de acompanhamento ("Agente de IA iniciado") com o nome, a meta e a localização da campanha e um atalho para o detalhe, e levar o usuário ao detalhe em seguida (decisão de 2026-11-02).

### Key Entities *(include if feature involves data)*

- **Campanha**: pedido de prospecção. Atributos: nome, objetivo, localização, perfil de empresa ideal, segmento, CNAE (um ou mais), serviços, diferenciais, proposta de valor, quantidade de leads, estado, datas. Relaciona-se com as empresas descobertas e os leads aprovados.
- **Histórico da campanha**: registro de mudanças de estado e de configuração, com data e hora.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário cria e salva uma campanha completa em menos de 5 minutos.
- **SC-002**: Em 100% das tentativas com campo obrigatório vazio, nenhuma campanha é registrada e o campo faltante é indicado.
- **SC-003**: Em 100% das pausas, nenhuma nova tarefa inicia depois do pedido e a tarefa em andamento termina com o resultado salvo.
- **SC-004**: Nenhuma campanha retoma sem ação do usuário.
- **SC-005**: O usuário encontra e abre uma campanha existente em até 3 interações a partir da lista.

## Assumptions

- Uso individual: uma pessoa usa o sistema (ver spec de acesso); campanhas não são compartilhadas.
- Localização é informada como estado e cidade (ou mais de uma cidade), escolhidos de listas oficiais para evitar grafias diferentes.
- Segmento e perfil de empresa ideal são texto livre; a lista de segmentos ainda não existe.
- CNAE é escolhido pelo usuário em busca sobre a lista oficial (cerca de 1.358 códigos, tabela de apoio da base de CNPJ). A IA não sugere CNAE (decisão de 2026-11-02).
- "Concluída" é atribuída pela pesquisa quando a quantidade de leads é atingida ou as fontes se esgotam; os detalhes estão na spec de pesquisa.
- Duplicar, arquivar ou excluir campanhas fica fora desta feature.
- Escopo da Etapa 1 (2026-11-01): somente prospecção. A mensagem-base da campanha e tudo que depende dela (Natasha, HERMES) ficam para a etapa seguinte; ver `specs/000-plano-geral/escopo-etapa-1.md`.
- Esta spec substitui a primeira versão da spec 001 (apenas criar e listar), por decisão de 2026-10-22.

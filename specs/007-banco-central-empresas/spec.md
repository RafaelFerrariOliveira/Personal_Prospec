# Feature Specification: Banco central de empresas

**Feature Branch**: `007-banco-central-empresas`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Manter um cadastro compartilhado de empresas entre campanhas, sem duplicar automaticamente empresas já existentes. Pesquisar por nome, CNPJ, site, telefone, e-mail ou cidade, com filtros por segmento e situação do registro. Cada empresa mostra dados e contatos, pontuação e justificativa, fontes e datas, campanhas, tarefas e linha do tempo completa. Empresas arquivadas saem das listas ativas, mas continuam consultáveis. Alertar quando a empresa já aparecer em outra campanha. (Etapa 1: sem mensagens e resultados de contato, adiados com as specs 005 e 006.)"

## Clarifications

### Session 2026-11-01

- Q: Na Etapa 1 não há envio registrado pelo sistema. Qual é o critério do alerta de contato anterior? → A: Empresa com lead aprovado ou rejeitado em outra campanha. Não haverá registro manual de "já contatei" nesta etapa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar e pesquisar empresas do banco central (Priority: P1)

O usuário abre o banco central e pesquisa por nome, CNPJ, site, telefone, e-mail ou cidade, refinando por segmento e por situação do registro (ativa ou arquivada).

**Why this priority**: o banco é a memória comercial do sistema, e consultá-lo é o que evita retrabalho.

**Independent Test**: com empresas cadastradas, pesquisar por cada campo e filtrar por segmento e situação.

**Acceptance Scenarios**:

1. **Given** empresas cadastradas, **When** o usuário pesquisa por nome, CNPJ, site, telefone, e-mail ou cidade, **Then** vê as empresas que correspondem, sem diferenciar maiúsculas, acentos nem formatação de CNPJ e telefone.
2. **Given** a lista, **When** filtra por segmento ou situação, **Then** só as empresas correspondentes aparecem.
3. **Given** nenhum resultado, **When** a pesquisa termina, **Then** o usuário vê uma mensagem clara e a opção de limpar os filtros.

### User Story 2 - Ver a ficha completa e a linha do tempo da empresa (Priority: P1)

Ao abrir uma empresa, o usuário vê dados cadastrais e contatos, a pontuação e a justificativa, as fontes e datas de pesquisa, as campanhas relacionadas, as tarefas comerciais e uma linha do tempo cronológica completa de tudo o que aconteceu.

**Why this priority**: dá o contexto para decidir se aborda, quando e como.

**Independent Test**: abrir uma empresa que passou por descoberta, aprovação e tarefa, e conferir que cada evento aparece na ordem correta.

**Acceptance Scenarios**:

1. **Given** uma empresa, **When** o usuário abre a ficha, **Then** vê as seções de dados, contatos, qualificação, fontes, campanhas e tarefas.
2. **Given** a ficha, **When** o usuário abre a linha do tempo, **Then** vê todos os eventos (descobertas, decisões, tarefas, arquivamento) em ordem cronológica, com data, hora e origem.
3. **Given** uma empresa em várias campanhas, **When** o usuário abre a ficha, **Then** vê a pontuação e o resultado de cada campanha separadamente.

### User Story 3 - Ser alertado sobre empresa já tratada em outra campanha (Priority: P1)

Sempre que uma empresa já tratada (aprovada ou rejeitada) em outra campanha aparece em uma campanha ou lead, o sistema mostra o alerta com a data, a campanha e o histórico. O usuário decide se quer seguir.

**Why this priority**: evita abordagens repetidas e constrangedoras.

**Independent Test**: aprovar uma empresa em uma campanha, descobri-la em outra e conferir o alerta com os dados corretos.

**Acceptance Scenarios**:

1. **Given** uma empresa aprovada ou rejeitada em uma campanha, **When** ela aparece em outra campanha, **Then** o alerta mostra a data da decisão anterior, a campanha e o resumo do histórico.
2. **Given** o alerta, **When** o usuário decide seguir, **Then** o lead continua o fluxo normal e a decisão fica registrada.
3. **Given** o alerta, **When** o usuário decide não abordar, **Then** o lead é rejeitado com o motivo registrado.

### User Story 4 - Arquivar empresas e proteger dados de contato (Priority: P2)

O usuário arquiva empresas que não quer mais ver nas listas ativas. Elas continuam consultáveis. A pedido do titular, o usuário também registra "Não contatar" ou remove os dados pessoais de contato, mantendo apenas o registro de que o pedido ocorreu.

**Why this priority**: mantém as listas limpas e atende à LGPD.

**Independent Test**: arquivar e desarquivar uma empresa; remover dados de contato e conferir que o histórico mantém o registro do pedido sem os dados.

**Acceptance Scenarios**:

1. **Given** uma empresa ativa, **When** o usuário a arquiva, **Then** ela sai das listas ativas e continua disponível por pesquisa e pelo filtro "Arquivadas".
2. **Given** uma empresa arquivada, **When** o usuário a desarquiva, **Then** ela volta às listas ativas e a mudança fica no histórico.
3. **Given** um pedido do titular, **When** o usuário remove os dados pessoais de contato, **Then** os dados são apagados e o histórico guarda só que houve o pedido, a data e a ação.

### Edge Cases

- Uma empresa descoberta que já existe (mesmo CNPJ ou domínio) é reaproveitada, nunca duplicada automaticamente.
- Só chave forte (CNPJ ou domínio) reaproveita a empresa. Indício fraco (nome parecido, telefone igual) não unifica e, na Etapa 1, não gera revisão humana (decisão de 2026-11-02).
- Empresa sem CNPJ é identificada por domínio, telefone ou e-mail; a ausência do CNPJ não impede o cadastro.
- Empresa com contato marcado "Não contatar" mostra o aviso em todas as telas onde aparecer.
- Arquivar uma empresa com tarefa pendente avisa o usuário e pergunta o que fazer com a tarefa.
- Pesquisa com muitos resultados é paginada.
- Dois contatos iguais em empresas diferentes (telefone de contabilidade compartilhado) não unificam as empresas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter um cadastro único de empresas compartilhado entre campanhas e MUST reaproveitar a empresa existente em vez de criar duplicata.
- **FR-002**: O sistema MUST pesquisar por nome, CNPJ, site, telefone, e-mail e cidade, ignorando maiúsculas, acentos e formatação.
- **FR-003**: O sistema MUST permitir filtrar por segmento e por situação do registro (ativa, arquivada).
- **FR-004**: O sistema MUST exibir na ficha: dados cadastrais e contatos; pontuação e justificativa; fontes e datas de pesquisa; campanhas relacionadas; tarefas comerciais; e a linha do tempo.
- **FR-005**: O sistema MUST manter a linha do tempo cronológica completa, com data, hora e origem de cada evento.
- **FR-006**: O sistema MUST mostrar o alerta de empresa já tratada em outra campanha (data, campanha e histórico) onde a empresa aparecer e deixar a decisão ao usuário. "Já tratada" significa lead aprovado ou rejeitado em outra campanha; não há registro manual de contato na Etapa 1.
- **FR-007**: O sistema MUST permitir arquivar e desarquivar empresas, ocultando as arquivadas das listas ativas e mantendo-as consultáveis.
- **FR-008**: O sistema MUST permitir registrar "Não contatar" e MUST exibir esse aviso em todas as telas da empresa.
- **FR-009**: O sistema MUST permitir remover os dados pessoais de contato de uma empresa a pedido do titular, mantendo no histórico apenas o registro do pedido, a data e a ação.
- **FR-010**: O sistema MUST guardar para cada dado a origem e a data de consulta.
- **FR-011**: O sistema MUST paginar as listas e responder à pesquisa em tempo adequado para milhares de empresas.
- **FR-012**: O sistema MUST permitir editar manualmente dados e contatos de uma empresa, registrando a alteração no histórico.

### Key Entities *(include if feature involves data)*

- **Empresa**: razão e nome fantasia, CNPJ (quando houver), site e domínio, endereço e cidade, segmento, situação do registro, marcação "Não contatar".
- **Contato comercial**: telefone ou e-mail (WhatsApp volta com a spec 006), com origem, data e validade.
- **Evento da linha do tempo**: acontecimento ligado à empresa, com tipo, data, hora e origem.
- **Pedido do titular**: registro de "Não contatar" ou de remoção de dados, com data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário encontra uma empresa pelo nome, CNPJ ou telefone em menos de 10 segundos.
- **SC-002**: 0 empresas duplicadas são criadas automaticamente quando CNPJ ou domínio coincidem.
- **SC-003**: 100% das empresas já tratadas em outra campanha mostram o alerta com data, campanha e histórico.
- **SC-004**: A linha do tempo mostra 100% dos eventos registrados, em ordem cronológica.
- **SC-005**: Depois da remoção de dados pessoais, 0 dados pessoais de contato permanecem visíveis.

## Assumptions

- Uso individual: todas as empresas pertencem ao único usuário do sistema.
- "Situação do registro" refere-se a ativa ou arquivada; a situação cadastral na Receita é um dado da empresa, mostrado à parte.
- O contato corporativo (telefone e e-mail da empresa) é o padrão; dados pessoais de pessoas físicas são limitados ao que for estritamente necessário e podem ser removidos a pedido.
- Excluir definitivamente uma empresa inteira não faz parte desta feature; arquivar e remover dados pessoais cobrem a necessidade.
- A decisão sobre o que conta como "mesma empresa" (regras de duplicidade) segue a spec de pesquisa do Coulson.

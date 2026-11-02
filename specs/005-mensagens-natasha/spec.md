# Feature Specification: Pesquisa complementar e mensagens (Agente Natasha)

**Feature Branch**: `005-mensagens-natasha`

**Created**: 2026-10-22

**Status**: Adiada (fora da Etapa 1, decisão de 2026-11-01). Spec preservada sem alteração para a etapa seguinte; não gerar plano nem tarefas dela agora. Ver `specs/000-plano-geral/escopo-etapa-1.md`.

**Input**: User description: "Após a aprovação individual de um lead, a Agente Natasha pesquisa informações complementares sobre a empresa, usa o contexto da campanha e os dados comprovados e prepara uma mensagem comercial personalizada em português, curta (50 a 100 palavras), a partir do modelo-base editável da campanha, sinalizando quando houver poucas informações e nunca inventando fatos. O usuário revisa, edita, aprova ou rejeita a mensagem."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receber uma mensagem personalizada para cada lead aprovado (Priority: P1)

Quando o usuário aprova um lead, a Natasha pesquisa mais sobre aquela empresa, cruza com o contexto da campanha (serviços, diferenciais, proposta de valor) e com os dados comprovados, e prepara uma mensagem de WhatsApp em português, curta e direta, a partir do modelo-base da campanha.

**Why this priority**: entrega o resultado esperado do sistema: uma mensagem pronta para revisão, personalizada com base em fatos.

**Independent Test**: aprovar um lead com dados suficientes e conferir a mensagem gerada (tamanho, idioma, uso do modelo-base, fatos citados com fonte).

**Acceptance Scenarios**:

1. **Given** um lead recém-aprovado, **When** a Natasha termina, **Then** existe uma mensagem em português com cerca de 50 a 100 palavras, baseada no modelo-base da campanha.
2. **Given** a pesquisa complementar, **When** a mensagem cita um fato sobre a empresa, **Then** esse fato consta nos dados comprovados ou nas fontes da pesquisa complementar, visíveis ao usuário.
3. **Given** a mensagem gerada, **When** o usuário a abre, **Then** vê também os fatos e as fontes que embasaram a personalização.

### User Story 2 - Revisar, editar, aprovar ou rejeitar a mensagem (Priority: P1)

O usuário lê a mensagem, edita o texto (incluindo adicionar informações e links), e aprova ou rejeita. Só uma mensagem aprovada fica pronta para o envio manual. Aprovar a mensagem não envia nada.

**Why this priority**: o usuário precisa ter controle total do que será dito em seu nome.

**Independent Test**: editar o texto, adicionar um link, aprovar; em outro lead, rejeitar; conferir estados e que nada foi enviado.

**Acceptance Scenarios**:

1. **Given** uma mensagem "Aguardando revisão", **When** o usuário edita o texto e adiciona um link, **Then** a versão editada substitui a gerada, e ambas ficam no histórico.
2. **Given** uma mensagem revisada, **When** o usuário aprova, **Then** ela passa a "Aprovada" e fica disponível para a ação manual de envio, sem ser enviada.
3. **Given** uma mensagem, **When** o usuário rejeita, **Then** ela passa a "Rejeitada", é preservada, e o usuário pode pedir uma nova versão.
4. **Given** uma mensagem aprovada, **When** o usuário a edita de novo, **Then** ela volta a "Aguardando revisão" e precisa de nova aprovação.

### User Story 3 - Ser avisado quando faltam informações (Priority: P2)

Quando a empresa tem poucos dados confiáveis, a mensagem sai mais genérica e vem sinalizada com o aviso "poucas informações para personalização", sem inventar necessidades, problemas ou fatos.

**Why this priority**: evita mensagens com informações falsas, que prejudicam a imagem do usuário.

**Independent Test**: aprovar um lead com dados mínimos e conferir o aviso e a ausência de fatos inventados.

**Acceptance Scenarios**:

1. **Given** um lead com poucos dados, **When** a mensagem é gerada, **Then** ela exibe o aviso de poucas informações e usa só o que é comprovado.
2. **Given** qualquer lead, **When** a mensagem é gerada, **Then** ela não afirma necessidades, problemas, números ou eventos da empresa que não estejam nos dados comprovados.

### Edge Cases

- Mensagem fora da faixa de 50 a 100 palavras: o sistema avisa o usuário, que decide se mantém.
- Campos do modelo-base sem dado correspondente: o marcador não pode aparecer vazio nem quebrado na mensagem; o texto é ajustado ou o campo é sinalizado.
- A pesquisa complementar falha: nova tentativa limitada e, persistindo, o lead fica com "Mensagem pendente" e entra na lista de falhas.
- Link adicionado pelo usuário em formato inválido é sinalizado antes de aprovar.
- Aprovação duplicada gera uma única mensagem aprovada.
- Empresa marcada "não contatar" depois da aprovação do lead: nenhuma mensagem é preparada e o usuário é avisado.
- Campanha pausada: a mensagem em preparação termina e as seguintes só começam quando a campanha for retomada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST iniciar a pesquisa complementar e a preparação da mensagem somente após a aprovação individual do lead.
- **FR-002**: O sistema MUST executar essas tarefas em segundo plano, com fila persistente, tentativas limitadas e registro de falhas, nos mesmos termos da pesquisa de empresas.
- **FR-003**: O sistema MUST preparar uma mensagem em português usando o modelo-base editável da campanha, o contexto da campanha e os dados comprovados da empresa.
- **FR-004**: O sistema MUST manter a mensagem curta e direta, com aproximadamente 50 a 100 palavras, e avisar quando fugir dessa faixa.
- **FR-005**: O sistema MUST NOT inventar necessidades, problemas ou fatos sobre a empresa; todo fato citado MUST estar nos dados comprovados ou nas fontes da pesquisa complementar.
- **FR-006**: O sistema MUST exibir, junto da mensagem, os fatos usados e as respectivas fontes.
- **FR-007**: O sistema MUST sinalizar "poucas informações para personalização" quando os dados comprovados forem insuficientes.
- **FR-008**: O sistema MUST permitir ao usuário editar o texto, adicionar informações e links, e manter o histórico das versões (gerada e editadas).
- **FR-009**: O sistema MUST permitir aprovar ou rejeitar a mensagem; apenas mensagens aprovadas ficam disponíveis para o envio manual.
- **FR-010**: O sistema MUST voltar a mensagem para "Aguardando revisão" quando ela for editada depois de aprovada.
- **FR-011**: O sistema MUST permitir pedir uma nova versão de uma mensagem rejeitada, preservando as anteriores.
- **FR-012**: O sistema MUST NOT enviar nenhuma mensagem nesta etapa.
- **FR-013**: O sistema MUST validar o formato dos links adicionados antes da aprovação.

### Key Entities *(include if feature involves data)*

- **Pesquisa complementar**: informações adicionais da empresa, cada uma com fonte, link e data de consulta.
- **Mensagem**: texto para uma empresa de uma campanha, com estado (Aguardando revisão, Aprovada, Rejeitada, Pendente), versões, aviso de poucas informações e fatos usados.
- **Versão da mensagem**: texto gerado ou editado, com autor (Natasha ou usuário) e data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das mensagens geradas estão em português e citam apenas fatos com fonte visível.
- **SC-002**: Pelo menos 90% das mensagens ficam entre 50 e 100 palavras sem edição do usuário.
- **SC-003**: Nenhuma mensagem é preparada para um lead sem aprovação, e nenhuma é enviada nesta etapa.
- **SC-004**: O usuário revisa e aprova uma mensagem em menos de 2 minutos.
- **SC-005**: 100% das mensagens com poucos dados exibem o aviso.

## Assumptions

- A Natasha usa o mesmo mecanismo de IA e as mesmas fontes públicas descritas na spec de pesquisa (uso pessoal da assinatura, sem custo extra); quando a capacidade se esgota, a campanha pausa.
- A mensagem é apenas texto para WhatsApp; imagens, áudios e anexos ficam fora.
- Os marcadores do modelo-base (por exemplo, nome da empresa, cidade, segmento) são definidos no plano.
- Verificar se um fato é "comprovado" é responsabilidade do sistema (rastrear à fonte); a revisão final é sempre do usuário.
- Rejeitar uma mensagem não exige motivo, ao contrário da rejeição de lead.

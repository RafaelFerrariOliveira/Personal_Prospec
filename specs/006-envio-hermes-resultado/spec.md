# Feature Specification: Envio via HERMES e resultado comercial

**Feature Branch**: `006-envio-hermes-resultado`

**Created**: 2026-10-22

**Status**: Adiada (fora da Etapa 1, decisão de 2026-11-01). Spec preservada sem alteração para a etapa seguinte; não gerar plano nem tarefas dela agora. Ver `specs/000-plano-geral/escopo-etapa-1.md`.

**Input**: User description: "O envio ocorre somente após aprovação explícita do usuário e acionamento manual da ação de envio pelo HERMES. Registrar o resultado informado pela integração; em falha ou resultado inconclusivo, não reenviar automaticamente e preservar mensagem e registro para decisão humana, evitando duplicidade. Permitir registrar manualmente a resposta comercial (Respondeu, Interessado, Sem interesse, Pediu retorno, Sem resposta)."

## Clarifications

### Session 2026-10-23

- Q: Em "Falha no envio", a nova tentativa exige o aviso de duplicidade? → A: Não; exige só confirmação simples. O aviso de duplicidade com confirmação explícita vale apenas para "Resultado inconclusivo".
- Q: O que acontece com a mensagem e o lead ao escolher "Descartar"? → A: A mensagem fica "Descartada" e é preservada no histórico; o lead volta ao usuário, que decide entre preparar nova mensagem ou rejeitá-lo.
- Q: O que acontece com as mensagens aprovadas e não enviadas ao registrar "Não contatar"? → A: Passam a "Descartada" (preservadas no histórico) e os leads em andamento da empresa são encerrados com o motivo "Não contatar".
- Q: Em quanto tempo um envio sem resposta do HERMES vira "Resultado inconclusivo"? → A: 30 segundos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar manualmente uma mensagem aprovada (Priority: P1)

Para uma mensagem aprovada, o usuário aciona a ação "Enviar" e confirma. O sistema entrega o pedido ao HERMES, que faz o envio pelo WhatsApp, e registra o resultado informado.

**Why this priority**: fecha o fluxo comercial, com o controle manual obrigatório.

**Independent Test**: com uma mensagem aprovada, enviar e conferir o resultado; tentar enviar uma mensagem não aprovada e conferir a recusa.

**Acceptance Scenarios**:

1. **Given** uma mensagem "Aprovada", **When** o usuário aciona "Enviar" e confirma, **Then** o pedido de envio é feito uma única vez e o estado passa a "Enviando".
2. **Given** um envio concluído, **When** o HERMES informa sucesso, **Then** o estado passa a "Enviada" com data e hora e o resultado informado.
3. **Given** uma mensagem que não está "Aprovada", **When** o usuário tenta enviar, **Then** a ação não está disponível.
4. **Given** qualquer situação, **When** nenhuma ação de envio foi acionada, **Then** o sistema não envia mensagem alguma sozinho.

### User Story 2 - Tratar falha ou resultado inconclusivo sem duplicar envio (Priority: P1)

Se o HERMES informar erro ou não confirmar o resultado, o sistema não reenvia automaticamente. A mensagem e o registro são preservados e o usuário decide: conferir manualmente no WhatsApp e marcar como enviada, tentar de novo ou descartar.

**Why this priority**: evita o pior erro possível em prospecção: mandar a mesma mensagem duas vezes ao mesmo contato.

**Independent Test**: simular falha e resultado inconclusivo, conferir que não há reenvio automático e que as opções de decisão aparecem; tentar enviar de novo uma mensagem em estado inconclusivo.

**Acceptance Scenarios**:

1. **Given** um envio que falhou, **When** o resultado chega, **Then** o estado passa a "Falha no envio", nenhum reenvio automático ocorre e o motivo informado é registrado.
2. **Given** um envio sem confirmação, **When** passam 30 segundos sem resposta do HERMES, **Then** o estado passa a "Resultado inconclusivo" e o sistema pede decisão humana.
3. **Given** "Resultado inconclusivo", **When** o usuário escolhe "Tentar de novo", **Then** o sistema avisa o risco de duplicidade e exige confirmação explícita.
4. **Given** "Falha no envio", **When** o usuário escolhe "Tentar de novo", **Then** o sistema pede confirmação simples, sem aviso de duplicidade, e faz um único novo pedido de envio.
5. **Given** "Falha no envio" ou "Resultado inconclusivo", **When** o usuário escolhe "Descartar", **Then** a mensagem passa a "Descartada", fica preservada no histórico e o lead volta ao usuário para preparar nova mensagem ou rejeitá-lo.
6. **Given** "Resultado inconclusivo", **When** o usuário marca "Enviada manualmente", **Then** o estado passa a "Enviada" com a indicação de confirmação manual.

### User Story 3 - Registrar a resposta comercial (Priority: P2)

Depois do envio, o usuário registra manualmente o que aconteceu: Respondeu, Interessado, Sem interesse, Pediu retorno ou Sem resposta. "Pediu retorno" oferece criar a tarefa de retorno.

**Why this priority**: gera o histórico e os indicadores comerciais.

**Independent Test**: registrar cada tipo de resposta em mensagens enviadas e conferir o histórico, a oferta de tarefa em "Pediu retorno" e a alteração posterior.

**Acceptance Scenarios**:

1. **Given** uma mensagem "Enviada", **When** o usuário registra uma resposta comercial, **Then** ela fica ligada à mensagem, à empresa e à campanha, com data e hora.
2. **Given** "Pediu retorno", **When** o usuário registra, **Then** o sistema oferece criar uma tarefa de retorno com prazo e descrição.
3. **Given** uma resposta registrada, **When** o usuário a altera, **Then** a mudança e a resposta anterior ficam no histórico.

### User Story 4 - Respeitar o pedido de não contato (Priority: P2)

Se a empresa pedir para não ser contatada, o usuário registra "Não contatar". A empresa deixa de receber novas mensagens e de entrar em novos leads.

**Why this priority**: cumpre a LGPD e protege a reputação do usuário.

**Independent Test**: marcar uma empresa como "Não contatar" e conferir que novos envios, novos leads e novas mensagens são bloqueados.

**Acceptance Scenarios**:

1. **Given** uma empresa, **When** o usuário registra "Não contatar" com a data e a origem do pedido, **Then** o envio e a preparação de novas mensagens para ela são bloqueados.
2. **Given** uma empresa com mensagens aprovadas e ainda não enviadas, **When** o usuário registra "Não contatar", **Then** essas mensagens passam a "Descartada", ficam preservadas no histórico e os leads em andamento da empresa são encerrados com o motivo "Não contatar".
3. **Given** uma empresa "Não contatar", **When** uma campanha nova a descobre, **Then** ela não entra nos leads.

### Edge Cases

- Duplo clique em "Enviar" gera um único pedido de envio.
- O sistema é reiniciado durante o envio: o estado fica "Resultado inconclusivo" até a decisão humana; nunca reenvia ao reiniciar.
- HERMES indisponível: o envio não inicia, a mensagem permanece "Aprovada" e o usuário é avisado.
- A mensagem foi editada depois de aprovada: volta para revisão e não pode ser enviada até nova aprovação.
- Empresa com dois contatos válidos: o usuário escolhe o canal e o destinatário antes de enviar.
- O contato da empresa muda entre a aprovação e o envio: o envio usa o canal confirmado na tela.
- Resposta registrada para mensagem que não foi enviada é recusada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST enviar somente mensagens aprovadas, e somente quando o usuário acionar e confirmar a ação de envio.
- **FR-002**: O sistema MUST fazer o envio pela integração com o HERMES e MUST registrar o resultado informado por ela, com data e hora.
- **FR-003**: O sistema MUST permitir escolher o canal e o destinatário da empresa antes de enviar.
- **FR-004**: O sistema MUST impedir envio duplicado: um segundo pedido sobre a mesma mensagem enquanto o primeiro não tiver resultado final é recusado.
- **FR-005**: O sistema MUST NOT reenviar automaticamente em caso de falha, resultado inconclusivo ou reinicialização.
- **FR-006**: O sistema MUST manter os estados "Aprovada", "Enviando", "Enviada", "Falha no envio", "Resultado inconclusivo" e "Descartada", e preservar a mensagem e o registro em falhas.
- **FR-007**: O sistema MUST oferecer ao usuário, nos estados de falha e inconclusivo, as opções "Marcar como enviada manualmente", "Tentar de novo" (confirmação simples em "Falha no envio"; aviso de duplicidade e confirmação explícita em "Resultado inconclusivo") e "Descartar" (mensagem "Descartada", preservada no histórico, com o lead devolvido ao usuário para nova mensagem ou rejeição).
- **FR-008**: O sistema MUST permitir registrar a resposta comercial: Respondeu, Interessado, Sem interesse, Pediu retorno e Sem resposta, e MUST manter o histórico das alterações.
- **FR-009**: O sistema MUST oferecer a criação de tarefa de retorno ao registrar "Pediu retorno".
- **FR-010**: O sistema MUST permitir registrar "Não contatar" para uma empresa, com data e origem do pedido, bloqueando novos envios, novas mensagens e novos leads, descartando as mensagens aprovadas e não enviadas e encerrando os leads em andamento da empresa com o motivo "Não contatar".
- **FR-011**: O sistema MUST registrar no histórico da empresa cada envio, resultado, resposta e decisão manual.
- **FR-012**: O sistema MUST avisar o usuário, sem tentar contornar, quando o HERMES estiver indisponível.

### Key Entities *(include if feature involves data)*

- **Envio**: tentativa de entrega de uma mensagem aprovada, com estado, destinatário, canal, resultado informado pela integração, data e hora e decisões humanas.
- **Resposta comercial**: classificação registrada manualmente (Respondeu, Interessado, Sem interesse, Pediu retorno, Sem resposta), com data e histórico.
- **Pedido de não contato**: marcação da empresa com data e origem do pedido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhuma mensagem é enviada sem aprovação e sem acionamento manual do usuário (0 envios automáticos).
- **SC-002**: Em 100% das falhas e dos resultados inconclusivos, nenhum reenvio ocorre sem confirmação explícita.
- **SC-003**: Em 100% dos casos de duplo clique, no máximo um pedido de envio é feito.
- **SC-004**: O usuário envia uma mensagem aprovada em até 3 interações.
- **SC-005**: Nenhuma empresa "Não contatar" recebe mensagem depois do registro.

## Assumptions

- O HERMES é o Hermes Agent (Nous Research) com o WhatsApp pareado em número dedicado pelo usuário. A documentação não detalha o formato do destino nem a resposta do pedido de envio: esses pontos precisam ser testados na prática e definidos no plano antes da implementação (ver `docs/discovery/validacao-bloqueios.md`).
- A integração com o HERMES é local, no computador do usuário.
- O risco de restrição do número no WhatsApp por mensagens para quem não conversou antes é conhecido e aceito pelo usuário, que controla o volume e aprova cada envio. O sistema não tem envio em massa.
- O envio é uma mensagem de texto individual; resposta do cliente é registrada manualmente, sem leitura automática do WhatsApp.
- O tempo limite para considerar um envio inconclusivo é de 30 segundos sem resposta do HERMES.

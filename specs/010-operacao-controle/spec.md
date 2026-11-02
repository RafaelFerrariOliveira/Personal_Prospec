# Feature Specification: Operação, falhas, exportação e backup

**Feature Branch**: `010-operacao-controle`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Lista de falhas para revisão manual, logs técnicos separados (data, componente, nível, mensagem e identificador da tarefa), histórico de operações comerciais e mudanças relevantes, controle do uso de IA dentro da assinatura sem custos extras, backup manual do banco solicitado pelo usuário e exportação para CSV e Excel respeitando filtros e campos selecionados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisar as falhas e agir sobre elas (Priority: P1)

O usuário abre a lista de falhas (pesquisa) com a causa, a tarefa, a empresa, a campanha, as tentativas feitas e a data. Para cada falha, ele escolhe: tentar de novo, ignorar ou marcar como resolvida.

**Why this priority**: o processamento é automático e em segundo plano; sem a lista, falhas silenciosas escondem trabalho que não foi feito.

**Independent Test**: provocar falhas persistentes, abrir a lista, tentar de novo uma delas e ignorar outra.

**Acceptance Scenarios**:

1. **Given** uma falha persistente após as tentativas automáticas, **When** o usuário abre a lista, **Then** ela aparece com causa, tarefa, empresa, campanha, tentativas e data.
2. **Given** uma falha, **When** o usuário escolhe "Tentar de novo", **Then** a tarefa volta à fila uma única vez e a ação fica registrada.
3. **Given** uma falha, **When** o usuário a ignora ou resolve, **Then** ela sai da lista de pendentes e permanece no histórico.

### User Story 2 - Controlar o uso da IA sem custo extra (Priority: P1)

O usuário acompanha o estado da capacidade de IA. Se o limite da assinatura se esgotar, as campanhas em execução pausam sozinhas, preservam o progresso e o usuário é avisado. Nada pago é ativado sem autorização explícita.

**Why this priority**: é uma restrição central do projeto: não gerar cobrança extra.

**Independent Test**: simular o esgotamento da capacidade e conferir a pausa, a preservação do progresso e o aviso; confirmar que nenhuma chave de API ou serviço pago é usado.

**Acceptance Scenarios**:

1. **Given** a capacidade de IA esgotada, **When** uma tarefa precisa da IA, **Then** a campanha é pausada, o progresso é preservado e o usuário recebe o aviso com a causa.
2. **Given** a campanha pausada por limite, **When** o usuário retoma depois, **Then** o trabalho continua do ponto salvo.
3. **Given** qualquer situação, **When** a IA indisponível, **Then** o sistema não ativa chave de API nem serviço pago por conta própria.
4. **Given** uma IA autenticada de forma não permitida, **When** o sistema detecta, **Then** a integração é interrompida e o bloqueio é apresentado ao usuário.

### User Story 3 - Consultar logs técnicos e o histórico de operações (Priority: P2)

O usuário (ou quem der suporte) consulta os logs técnicos, separados do histórico comercial, filtrando por data, componente, nível e identificador da tarefa. O histórico de operações comerciais e de mudanças relevantes mostra quem fez o quê e quando.

**Why this priority**: permite entender e corrigir problemas sem misturar com a visão comercial.

**Independent Test**: gerar eventos de vários níveis, filtrar os logs e conferir que nenhuma credencial aparece.

**Acceptance Scenarios**:

1. **Given** eventos técnicos, **When** o usuário abre os logs, **Then** vê data, componente, nível, mensagem e identificador da tarefa de cada registro.
2. **Given** os logs, **When** filtra por nível, componente, período ou tarefa, **Then** só os registros correspondentes aparecem.
3. **Given** qualquer log ou mensagem de erro, **When** exibido, **Then** não contém senha, token, chave nem credencial.
4. **Given** uma mudança relevante (decisão, mudança de estado, edição de configuração), **When** ocorre, **Then** entra no histórico de operações com data e hora.

### User Story 4 - Exportar dados e fazer backup (Priority: P2)

O usuário exporta listas (leads, empresas, tarefas, comparação de campanhas) para CSV e Excel, respeitando os filtros aplicados e os campos que escolher. Também solicita um backup do banco quando quiser.

**Why this priority**: permite usar os dados fora do sistema e proteger o trabalho; ambos sob demanda.

**Independent Test**: aplicar um filtro, escolher campos, exportar nos dois formatos e conferir o conteúdo; solicitar um backup e conferir o arquivo.

**Acceptance Scenarios**:

1. **Given** uma lista filtrada, **When** o usuário exporta para CSV ou Excel com campos escolhidos, **Then** o arquivo contém somente as linhas filtradas e as colunas escolhidas.
2. **Given** a exportação, **When** o arquivo é aberto, **Then** acentos e números aparecem corretamente.
3. **Given** o pedido de backup, **When** o usuário confirma, **Then** o sistema gera um arquivo de backup do banco no local escolhido e informa o resultado.
4. **Given** nenhum pedido do usuário, **When** o tempo passa, **Then** nenhum backup é feito automaticamente.

### Edge Cases

- Exportação de lista vazia gera arquivo só com os cabeçalhos e avisa o usuário.
- Exportação grande: o usuário vê o andamento e pode cancelar.
- Dados exportados incluem dados pessoais de contato: o usuário é lembrado da responsabilidade (LGPD) ao exportar.
- Backup sem espaço em disco ou sem permissão: erro claro, sem apagar backups anteriores.
- Falha em fila persiste após reinício: a lista de falhas se mantém.
- Logs crescem sem limite: há retenção definida e o usuário é avisado antes de limpeza.
- Valor iniciado por "=", "+", "-" ou "@" em campo exportado é neutralizado para evitar execução de fórmulas no Excel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST registrar falhas persistentes (após tentativas automáticas) e MUST listá-las com causa, tarefa, empresa, campanha, tentativas e data.
- **FR-002**: O sistema MUST permitir, para cada falha, tentar de novo, ignorar ou marcar como resolvida, registrando a ação.
- **FR-003**: Fora da Etapa 1 (regra de não reenviar mensagem por retentativa, depende da spec 006). O ID fica reservado.
- **FR-004**: O sistema MUST pausar as campanhas em execução, preservar o progresso e avisar o usuário quando a capacidade de uso da IA se esgotar.
- **FR-005**: O sistema MUST NOT ativar chave de API, serviço pago nem outro modo de cobrança sem autorização explícita do usuário.
- **FR-006**: O sistema MUST interromper a integração com a IA e apresentar o bloqueio ao usuário quando o modo de autenticação não for permitido.
- **FR-007**: O sistema MUST manter logs técnicos separados do histórico comercial, com data, componente, nível, mensagem e identificador da tarefa, e permitir filtrá-los.
- **FR-008**: O sistema MUST NOT registrar nem exibir senhas, tokens, chaves ou credenciais em logs, mensagens de erro ou exportações.
- **FR-009**: O sistema MUST manter o histórico de operações comerciais e mudanças relevantes, com data e hora.
- **FR-010**: O sistema MUST exportar listas para CSV e Excel, respeitando filtros e campos selecionados, com codificação correta de acentos.
- **FR-011**: O sistema MUST neutralizar valores que possam ser interpretados como fórmula nas exportações.
- **FR-012**: O sistema MUST gerar backup do banco somente quando o usuário solicitar, informar o resultado e MUST NOT apagar backups anteriores.
- **FR-013**: O sistema MUST definir e informar a retenção dos logs.

### Key Entities *(include if feature involves data)*

- **Falha**: ocorrência persistente com causa, tarefa, empresa, campanha, tentativas, estado (Pendente, Ignorada, Resolvida) e datas.
- **Registro técnico (log)**: data, componente, nível, mensagem e identificador da tarefa.
- **Histórico de operações**: evento comercial ou mudança relevante com data, hora e descrição.
- **Exportação**: arquivo gerado a partir de uma lista com filtros e campos escolhidos.
- **Backup**: arquivo de cópia do banco com data, tamanho e resultado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das falhas persistentes aparecem na lista de falhas.
- **SC-002**: Quando a capacidade de IA se esgota, 100% das campanhas em execução pausam sem perder resultado já salvo.
- **SC-003**: 0 serviços pagos são ativados sem autorização explícita.
- **SC-004**: 0 credenciais aparecem em logs, mensagens de erro ou arquivos exportados.
- **SC-005**: O arquivo exportado corresponde em 100% aos filtros e campos escolhidos.
- **SC-006**: O usuário gera um backup em menos de 2 minutos para uma base de até 10 mil empresas.

## Assumptions

- Decisão de 2026-10-22: a IA roda pelo uso local e pessoal do Claude Code oficial na assinatura existente, sem chave de API (ver `docs/discovery/validacao-bloqueios.md`). Se uma rota paga for autorizada no futuro, terá limite máximo por campanha e limite mensal global, com pausa automática no primeiro limite e preservação do progresso.
- Quem opera o sistema é o único usuário; "suporte" significa o próprio usuário consultando os logs.
- O backup é uma cópia completa do banco em um arquivo; a restauração não faz parte desta feature (fica documentada como procedimento).
- A retenção padrão dos logs é definida no plano.
- Exportação em Excel gera arquivo de planilha comum (uma aba por lista); modelos formatados ficam fora.

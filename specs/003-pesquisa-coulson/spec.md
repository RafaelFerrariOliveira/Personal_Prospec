# Feature Specification: Pesquisa e qualificação de empresas (Agente Coulson)

**Feature Branch**: `003-pesquisa-coulson`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Ao iniciar a campanha, o Agente Coulson pesquisa empresas em fontes permitidas (priorizando fontes oficiais e autorizadas), identifica empresas e contatos comerciais, registra fontes, links, datas e informações confirmadas, calcula uma pontuação de 0 a 100 explicada com evidências, classifica em Alta, Média e Baixa, evita duplicidades por chave forte, descarta da lista de leads as empresas sem canal de contato, respeita a quantidade de leads, informa o déficit sem expandir critérios e trata falhas com tentativas limitadas. O processamento é assíncrono e sobrevive a reinicializações."

## Clarifications

### Session 2026-11-02

- Q: Como o Coulson reduz o número de chamadas de IA? → A: Funil. As candidatas vêm da base de CNPJ já ranqueadas por regra fixa (sem IA); a IA enriquece da mais aderente para a menos e para ao atingir a meta.
- Q: O contato que já vem da base de CNPJ conta como canal válido? → A: Sim. A IA entra para site e evidências, não para achar telefone. Risco aceito: a base é mensal e pode trazer contato defasado ou de pessoa física em MEI.
- Q: WhatsApp conta como canal na Etapa 1? → A: Não. Sem envio, o canal válido é telefone, e-mail corporativo ou site.
- Q: Quem define o CNAE? → A: O usuário, escolhendo na lista oficial no formulário da campanha (spec 001). A IA não sugere CNAE.
- Q: Quais estabelecimentos são candidatos? → A: Somente a matriz de cada empresa (a verificar no dado real qual valor do indicador matriz/filial significa matriz).
- Q: Como tratar duplicidade? → A: Só chave forte (CNPJ ou domínio) unifica; indício fraco não unifica e não gera revisão humana na Etapa 1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descobrir e qualificar empresas da campanha (Priority: P1)

Ao iniciar a campanha, o Coulson pesquisa empresas que combinam com o perfil (localização, segmento, perfil ideal), registra de onde veio cada informação e dá a cada empresa uma pontuação de 0 a 100, com a explicação baseada em evidências. As empresas são classificadas em Alta (80 a 100), Média (50 a 79) e Baixa (0 a 49).

**Why this priority**: é o coração do sistema: transforma o perfil da campanha em uma lista de candidatos qualificados e rastreáveis.

**Independent Test**: iniciar uma campanha com perfil conhecido e conferir que surgem empresas com fonte, link, data de consulta, pontuação, classificação e justificativa.

**Acceptance Scenarios**:

1. **Given** uma campanha iniciada, **When** o Coulson pesquisa, **Then** cada empresa encontrada fica registrada com dados cadastrais, contatos, fontes, links e data de consulta.
2. **Given** uma empresa encontrada, **When** o Coulson a qualifica, **Then** ela recebe pontuação de 0 a 100, classificação (Alta, Média ou Baixa) e justificativa com as evidências usadas.
3. **Given** uma informação não confirmada, **When** ela é registrada, **Then** aparece marcada como não confirmada e não entra como evidência da pontuação.
4. **Given** uma pontuação exatamente nos limites (49, 50, 79, 80), **When** classificada, **Then** cai na faixa correta definida.

### User Story 2 - Respeitar a quantidade de leads e os canais de contato (Priority: P1)

Só entram na lista de leads da campanha empresas qualificadas com ao menos um canal de contato válido (telefone, e-mail corporativo ou site), incluindo o contato que já vem da base de CNPJ. Empresas sem canal ficam no histórico de descoberta, mas fora dos leads e fora da contagem. As candidatas são ordenadas pela base, sem IA, e a IA enriquece da mais aderente para a menos, parando quando a quantidade pedida é atingida. Se as fontes se esgotarem antes, o sistema informa o déficit e resume as fontes consultadas, sem ampliar os critérios por conta própria.

**Why this priority**: evita lista inútil e consumo desnecessário, e cumpre exatamente o que o usuário pediu.

**Independent Test**: rodar com quantidade pequena e conferir a parada; rodar com perfil raro e conferir o déficit e o resumo de fontes.

**Acceptance Scenarios**:

1. **Given** uma empresa sem telefone, e-mail corporativo nem site, **When** é qualificada, **Then** permanece no histórico de descoberta e não entra nos leads nem na contagem.
2. **Given** a quantidade de leads atingida, **When** o último lead qualificado é registrado, **Then** a pesquisa termina e a campanha passa a "Concluída".
3. **Given** fontes esgotadas com leads abaixo da meta, **When** a pesquisa termina, **Then** o sistema mostra o déficit e as fontes consultadas, e não amplia localização, segmento nem critérios sozinho.
4. **Given** candidatas vindas da base, **When** a pesquisa começa, **Then** elas são ordenadas por regra fixa sem uso de IA, e a IA é chamada da mais aderente para a menos, uma empresa por vez.
5. **Given** a meta atingida no meio da lista de candidatas, **When** o último lead qualificado é registrado, **Then** nenhuma chamada de IA é feita para as candidatas restantes.

### User Story 3 - Evitar duplicidades e acompanhar o progresso (Priority: P2)

O Coulson reconhece empresas repetidas por CNPJ ou domínio (chave forte) e as unifica. Indício fraco (nome parecido, telefone igual) não unifica nem gera revisão humana na Etapa 1. O usuário acompanha em tempo real as fontes consultadas, empresas encontradas, qualificadas, descartadas e erros.

**Why this priority**: evita contatar a mesma empresa duas vezes e dá confiança no andamento.

**Independent Test**: pesquisar com fontes que retornam a mesma empresa de formas diferentes e conferir a unificação por chave forte, que as parecidas sem chave em comum continuam separadas, e o painel de progresso.

**Acceptance Scenarios**:

1. **Given** duas descobertas com o mesmo CNPJ ou domínio, **When** processadas, **Then** viram um único registro de empresa com as duas fontes.
2. **Given** duas descobertas parecidas sem CNPJ nem domínio em comum, **When** processadas, **Then** continuam como empresas separadas, sem unificação e sem revisão humana.
3. **Given** a pesquisa em andamento, **When** o usuário abre a campanha, **Then** vê fontes consultadas, empresas encontradas, qualificadas, descartadas e erros, atualizados sem recarregar a página.

### User Story 4 - Continuar após falhas e reinicializações (Priority: P2)

Falhas recuperáveis (por exemplo, fonte indisponível) geram novas tentativas limitadas. Falhas persistentes são registradas para revisão manual. Se o sistema for desligado ou reiniciado no meio da pesquisa, nada se perde e a execução continua do ponto salvo.

**Why this priority**: a pesquisa é longa e roda em segundo plano no computador do usuário; precisa ser confiável.

**Independent Test**: simular falha temporária de fonte e reinício do sistema durante a pesquisa e conferir a retomada sem duplicar nem perder resultados.

**Acceptance Scenarios**:

1. **Given** uma falha recuperável, **When** a tarefa falha, **Then** o sistema tenta novamente até o limite e registra cada tentativa.
2. **Given** o limite de tentativas esgotado, **When** a falha persiste, **Then** ela é registrada na lista de falhas com a causa, e a campanha segue com as demais tarefas.
3. **Given** o sistema reiniciado durante a pesquisa, **When** volta a funcionar, **Then** as tarefas pendentes continuam sem repetir resultados já salvos, respeitando o estado da campanha (uma campanha pausada permanece pausada).
4. **Given** a capacidade de uso da IA esgotada, **When** a pesquisa tenta continuar, **Then** a campanha é pausada, o progresso é preservado e o usuário é avisado.

### Edge Cases

- Fonte indisponível ou que muda de formato: a tarefa falha com registro e as demais fontes continuam.
- Empresa baixada ou inativa na fonte: registrada com a situação, qualificada de acordo e sinalizada.
- Dado de contato sem formato válido não conta como canal válido.
- Duas descobertas com mesmo nome em cidades diferentes não são tratadas como duplicadas automaticamente.
- Campanha pausada ou cancelada durante a pesquisa: a tarefa em andamento termina e nenhuma nova inicia.
- Empresa já existente no banco central é reaproveitada, sem criar duplicata, e o alerta de empresa já tratada em outra campanha é exibido (ver spec de banco central).
- Só o estabelecimento matriz é candidato; filiais não entram como empresas separadas.
- Contato da base de CNPJ defasado: o lead entra com a data de referência da base visível; a defasagem é risco aceito (ver Clarifications).
- Empresas marcadas como "não contatar" nunca entram nos leads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST iniciar a pesquisa de empresas quando a campanha for iniciada e MUST executá-la em segundo plano, sem prender o usuário.
- **FR-002**: O sistema MUST pesquisar apenas em fontes permitidas, priorizando fontes oficiais e autorizadas; no MVP, a base aberta de CNPJ e páginas públicas da web, sem login nem redes sociais.
- **FR-003**: O sistema MUST registrar, para cada empresa, dados cadastrais, contatos comerciais, fontes, links, data de consulta e informações confirmadas, distinguindo o que não foi confirmado.
- **FR-004**: O sistema MUST calcular uma pontuação de compatibilidade de 0 a 100 para cada empresa e MUST apresentar a justificativa com as evidências usadas.
- **FR-005**: O sistema MUST classificar como Alta (80 a 100), Média (50 a 79) ou Baixa (0 a 49).
- **FR-006**: O sistema MUST manter no histórico de descoberta as empresas sem telefone, e-mail corporativo nem site, sem incluí-las nos leads nem na contagem.
- **FR-007**: O sistema MUST contar para a meta apenas leads qualificados com ao menos um canal de contato válido.
- **FR-008**: O sistema MUST encerrar a pesquisa ao atingir a quantidade de leads definida e passar a campanha para "Concluída".
- **FR-009**: O sistema MUST, quando as fontes se esgotarem sem atingir a meta, informar o déficit e resumir as fontes consultadas, sem ampliar critérios automaticamente.
- **FR-010**: O sistema MUST unificar empresas repetidas por chave forte (CNPJ ou domínio) e MUST NOT unificar nem encaminhar para revisão humana os casos de indício fraco na Etapa 1.
- **FR-011**: O sistema MUST exibir o progresso em tempo real: fontes consultadas, empresas encontradas, qualificadas, descartadas e erros.
- **FR-012**: O sistema MUST fazer tentativas automáticas limitadas para falhas recuperáveis, registrar cada tentativa e registrar as falhas persistentes para revisão manual.
- **FR-013**: O sistema MUST manter as tarefas em fila persistente e MUST retomar do ponto salvo após reinicialização, sem repetir resultados nem alterar o estado da campanha.
- **FR-014**: O sistema MUST respeitar pausa e cancelamento: não iniciar tarefas novas e deixar a tarefa em andamento terminar e salvar.
- **FR-015**: O sistema MUST pausar a campanha e preservar o progresso quando a capacidade de uso da IA se esgotar, avisando o usuário, e MUST NOT ativar nenhum serviço pago por conta própria.
- **FR-016**: O sistema MUST NOT incluir nos leads empresas marcadas como "não contatar".
- **FR-017**: O sistema MUST ordenar as candidatas vindas da base de CNPJ por regra fixa, sem IA, e MUST chamar a IA da mais aderente para a menos, uma por vez, parando ao atingir a meta.
- **FR-018**: O sistema MUST considerar candidatas apenas os estabelecimentos matriz e apenas os de situação cadastral ativa.
- **FR-019**: O sistema MUST usar os CNAE escolhidos na campanha para filtrar a base e MUST NOT pedir à IA que sugira CNAE.
- **FR-020**: O sistema MUST aceitar como canal válido o telefone ou e-mail vindo da base de CNPJ, registrando a origem e a data de referência da base.

### Key Entities *(include if feature involves data)*

- **Descoberta**: empresa encontrada em uma campanha, com a pontuação, classificação, justificativa e o motivo de inclusão ou descarte.
- **Empresa**: cadastro compartilhado entre campanhas (detalhado na spec de banco central).
- **Contato comercial**: telefone, e-mail corporativo ou site de uma empresa, com validade e origem (base de CNPJ ou web).
- **Fonte consultada**: origem de uma informação, com link, data de consulta e se foi confirmada.
- **Tarefa de pesquisa**: unidade de trabalho em segundo plano, com estado, tentativas e resultado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das empresas exibidas têm ao menos uma fonte com link e data de consulta.
- **SC-002**: 100% das pontuações têm justificativa visível com as evidências.
- **SC-003**: Nenhuma empresa sem canal de contato válido aparece na lista de leads nem entra na contagem da meta.
- **SC-004**: Após reinicializar o sistema no meio da pesquisa, 0 resultados são perdidos e 0 são duplicados.
- **SC-005**: Quando a meta não é atingida, o usuário vê o déficit e as fontes consultadas em até 1 minuto após o fim da pesquisa.
- **SC-006**: Duplicidades claras não geram mais de um registro por empresa em 100% dos casos testados.

## Assumptions

- Decisão de 2026-10-22: a IA roda pelo uso local e pessoal do Claude Code oficial, dentro da assinatura existente, sem chave de API e sem custo extra. Se o limite se esgotar, a campanha pausa (ver FR-015). Detalhes e riscos em `docs/discovery/validacao-bloqueios.md`.
- Fontes do MVP: base aberta de CNPJ (atualização mensal, pode estar defasada) e pesquisa em páginas públicas da web feita pela IA. Google Places, LinkedIn e redes sociais ficam fora, salvo nova decisão.
- A pontuação combina aderência a localização, segmento e perfil ideal, e qualidade e quantidade de evidências e contatos; a fórmula exata é definida no plano.
- O número máximo de tentativas, os intervalos entre elas e o tempo limite por tarefa são definidos no plano.
- LGPD: a finalidade é prospecção comercial B2B; cada dado guarda a origem e a data (rastreabilidade); dados pessoais de contato são limitados ao necessário (por exemplo, contato corporativo).
- A aprovação ou rejeição individual dos leads está na spec de aprovação de leads. A revisão humana de duplicidades ambíguas foi adiada.
- Medição do spike S0.1 (2026-11-01): cerca de 51 s por empresa na chamada de IA. O funil existe para reduzir o número dessas chamadas; o ganho depende de quantas candidatas a base traz por campanha e não foi medido.

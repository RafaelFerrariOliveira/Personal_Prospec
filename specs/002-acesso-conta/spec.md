# Feature Specification: Acesso e conta do usuário

**Feature Branch**: `002-acesso-conta`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Autenticação com e-mail e senha, proteção adequada de senhas, tratamento de erros sem expor credenciais."

## Clarifications

### Session 2026-11-02

- Q: O bloqueio temporário pode revelar que o e-mail existe? → A: Sim, só quando a conta existe e está bloqueada; credencial inválida usa sempre a mesma mensagem genérica. SC-003 emendado.
- Q: A recuperação de senha por e-mail faz parte do sistema? → A: Não. Foi removida por decisão do Rafael em 2026-11-02: não há link de recuperação nem envio de e-mail. As respostas anteriores sobre e-mail e link perderam efeito.
- Q: A troca de senha pelo usuário faz parte do sistema? → A: Não. Foi removida por decisão do Rafael em 2026-11-02, junto com a recuperação. A senha só muda por intervenção direta do dono nos dados (apagar a conta e rodar o seed de novo).
- Q: Valores da regra de senha, bloqueio, link e sessão? → A: Senha mínima de 8 e bloqueio de 5 tentativas por 5 minutos (notas do padrão); sessão de 30 minutos de inatividade é valor de partida sem fonte, ajustáveis em configuração (ver `plan.md`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar e sair do sistema (Priority: P1)

O usuário acessa o sistema, informa e-mail e senha e entra. Sem estar autenticado, ele não vê nenhuma campanha, empresa ou mensagem. Ele pode sair a qualquer momento.

**Why this priority**: todo dado comercial do sistema (empresas, contatos, mensagens) é sensível e só pode ser visto por quem tem acesso.

**Independent Test**: tentar abrir uma página interna sem entrar (é redirecionado ao login), entrar com credenciais corretas e sair.

**Acceptance Scenarios**:

1. **Given** um usuário não autenticado, **When** ele tenta abrir qualquer página interna, **Then** é levado à tela de entrada.
2. **Given** credenciais corretas, **When** o usuário entra, **Then** acessa o sistema e permanece autenticado enquanto a sessão for válida.
3. **Given** e-mail ou senha incorretos, **When** o usuário tenta entrar, **Then** vê uma mensagem genérica de falha, sem indicar qual dos dois está errado.
4. **Given** um usuário autenticado, **When** ele sai, **Then** a sessão termina e as páginas internas voltam a exigir entrada.

### User Story 2 - (removida em 2026-11-02)

A recuperação de senha por e-mail foi removida do escopo. A numeração das histórias foi mantida para não quebrar as referências das tasks.

### User Story 3 - (removida em 2026-11-02)

A troca de senha foi removida do escopo, assim como a recuperação. A numeração foi mantida para não quebrar as referências das tasks.

### Edge Cases

- Várias tentativas de entrada com falha em sequência bloqueiam temporariamente novas tentativas, com mensagem clara do tempo de espera.
- Senha fora das regras (tamanho mínimo) é recusada com a regra explicada.
- Sessão expirada durante o uso leva à tela de entrada sem perder dados já salvos.
- E-mail com letras maiúsculas ou espaços nas pontas é normalizado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exigir autenticação por e-mail e senha para acessar qualquer dado ou tela interna.
- **FR-002**: O sistema MUST responder a credenciais inválidas com mensagem genérica, sem revelar qual campo está errado nem se o e-mail existe.
- **FR-003**: O sistema MUST bloquear temporariamente novas tentativas após uma sequência de falhas de entrada, informando o tempo de espera.
- **FR-004**: O sistema MUST permitir sair, encerrando a sessão.
- **FR-005**: O sistema MUST expirar a sessão por inatividade e exigir nova entrada.
- **FR-006**: (removido em 2026-11-02: recuperação de senha por e-mail fora do escopo; numeração mantida)
- **FR-007**: (removido em 2026-11-02: sem troca de senha; numeração mantida)
- **FR-008**: (removido em 2026-11-02: troca de senha fora do escopo; numeração mantida)
- **FR-009**: O sistema MUST aplicar uma regra mínima de senha (tamanho mínimo) e explicá-la ao usuário.
- **FR-010**: O sistema MUST proteger as senhas de modo que nem o próprio sistema nem quem acesse os dados consiga lê-las.
- **FR-011**: O sistema MUST mostrar mensagens de erro sem expor credenciais, caminhos internos ou detalhes técnicos.
- **FR-012**: O sistema MUST registrar no histórico as entradas, falhas de entrada, saídas, com data e hora, sem registrar a senha.

### Key Entities *(include if feature involves data)*

- **Conta do usuário**: e-mail, senha protegida, estado do bloqueio temporário e datas relevantes.
- **Sessão**: período autenticado do usuário, com início, última atividade e validade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário entra em menos de 15 segundos com credenciais corretas.
- **SC-002**: Em 100% das tentativas sem autenticação, nenhum dado comercial é exibido.
- **SC-003**: Em 100% dos casos de credencial inválida (e-mail inexistente ou senha errada), a mensagem é idêntica e não permite descobrir se o e-mail existe. O bloqueio temporário por conta (FR-003) pode revelar que a conta existe; risco aceito em uso individual local (decisão de 2026-11-02).
- **SC-004**: (removido em 2026-11-02 junto com a recuperação de senha; numeração mantida)
- **SC-005**: Nenhuma senha aparece legível em telas, mensagens de erro ou registros.

## Assumptions

- Uso individual: existe uma única conta, criada na instalação inicial do sistema; não há cadastro público nem perfis de acesso.
- O sistema roda no computador do usuário e não envia e-mail. Quem esquecer a senha não tem fluxo de recuperação no sistema: o acesso perdido exige intervenção direta do dono nos dados, e esse procedimento fica fora desta feature.
- Autenticação em dois fatores, login social e vários usuários ficam fora desta feature.
- Regras exatas (tamanho mínimo, número de tentativas, tempo de bloqueio e validade da sessão) são definidas no plano.

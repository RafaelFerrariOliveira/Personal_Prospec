# Research: Personal Prospec

> **Escopo (2026-11-01)**: Etapa 1 = só prospecção. Tudo aqui sobre Natasha, HERMES, mensagem, envio e resposta comercial está ADIADO (specs 005 e 006). Ver escopo-etapa-1.md.

**Data**: 2026-10-23 | **Plano**: [plan.md](plan.md)

Formato: Decisão, Racional, Alternativas. Itens marcados "A validar" dependem de spike da Fase 0 e não são fatos.

## R1. Execução da IA

- **Decisão**: processo filho `claude -p` com `--output-format json`, `--json-schema`, `--tools` mínimo, `--setting-sources` vazio de projeto, `--strict-mcp-config`, `--no-session-persistence` e `--disable-slash-commands`, em diretório vazio dedicado.
- **Racional**: é a única rota que a documentação de compliance permite sem custo extra (binário oficial, sem modificação, logado pelo Rafael). As flags existem na versão 2.1.309 instalada (conferido por `claude --help`).
- **Fato importante**: `--bare` NÃO serve, porque a própria ajuda diz que ele não lê OAuth nem keychain e só aceita `ANTHROPIC_API_KEY` ou `apiKeyHelper`.
- **Alternativas rejeitadas**: chamada HTTP à API com o token da assinatura (proibido pelos termos); chave de API (custo, exige autorização); Agent SDK em processo do backend (mesmo enquadramento de "serviço construído sobre o Claude", exige chave de API).
- **Resultado do S0.1 (2026-11-01, ver `docs/discovery/spikes-s0-1-e-s0-3.md`)**: itens 1, 2, 3, 5 e 6 validados (ferramentas `WebSearch` e `WebFetch` exigem `--allowedTools` no modo `-p`; saída no campo `structured_output`; cerca de 51 s por empresa; filho isolado com `--setting-sources ""`). Item 4 (sinal de limite esgotado) segue pendente. Lista original:
  1. Autenticação pelo login existente, com `ANTHROPIC_API_KEY` ausente.
  2. Quais nomes de ferramenta de busca e leitura web ficam disponíveis com `--tools` ou `--restricted`, e se `WebSearch` e `WebFetch` funcionam no modo restrito.
  3. Estrutura exata do JSON de resultado com `--output-format json` e onde fica o campo da saída validada por esquema.
  4. Código de saída e texto quando o limite do plano esgota (sem isso, a detecção de limite é suposição).
  5. Tempo e consumo por empresa, para dimensionar a meta de leads por campanha.
  6. Se um diretório vazio basta para o processo não carregar `CLAUDE.md` e regras do usuário em `~/.claude`, ou se preciso de `--setting-sources` e `--system-prompt` explícitos.

## R2. Fila de tarefas

- **Decisão**: tabela SQL + `BackgroundService` com claim atômico, concorrência 1.
- **Racional**: o requisito é retomar após reinício sem repetir resultado, pausar sem perder o que está em andamento (e, na etapa seguinte, nunca reexecutar envio). Uma tabela própria faz tudo isso sem dependência nova (constituição V) e sem retentativa automática embutida, que conflita com o envio.
- **Alternativas**: Hangfire e Quartz (dependência, retentativa automática difícil de desligar só para envio); fila em memória (perde estado no reinício); SQL Server Service Broker (complexidade sem ganho).
- **Parâmetros de partida** (Options, ajustáveis): 3 tentativas, espera de 1, 5 e 15 minutos, tempo limite de 5 minutos por tarefa de pesquisa. Esses valores são meus de partida, sem fonte, a calibrar no spike S0.1. O limite de 30 segundos por envio (spec 006) fica adiado com o envio.

## R3. Tempo real

- **Decisão**: Server-Sent Events com evento "mudou" e refetch pelo endpoint normal.
- **Racional**: o fluxo é só servidor para navegador; `EventSource` é nativo, usa o cookie da sessão e não exige pacote no front nem no back. Atende o limite de 5 s (009 SC-002).
- **Alternativas**: SignalR (exige pacote no front, WebSocket bidirecional que não é necessário); polling (mais simples, mas atrasa e gasta consulta; fica como fallback quando a conexão cai).
- **A validar**: comportamento do `EventSource` com o proxy do Vite e reconexão com cookie.

## R4. Fonte de empresas (base aberta de CNPJ)

- **Decisão**: importação em streaming, filtrada por UF e CNAE, para um schema separado e somente leitura; guardar a data de referência da base.
- **Racional**: a base completa tem cerca de 8 GB compactados (fonte secundária) e atualização mensal; importar tudo é desproporcional para uso individual.
- **CNAE**: o usuário escolhe um ou mais CNAE por busca na lista oficial (tabela de apoio da base, cerca de 1.358 códigos) no formulário da campanha. A IA não sugere CNAE (decisão de 2026-11-02; substitui a proposta anterior de sugestão por IA com confirmação).
- **A validar (S0.3)**: layout dos arquivos, codificação, separador, tamanho real descompactado, tempo de varredura, e se a distribuição oficial é a fonte certa (o plano não assume URL nem formato).
- **Privacidade**: não importar quadro societário. Telefone e e-mail da base são do estabelecimento, mas podem ser de pessoa física em MEI; tratar como dado pessoal e marcar a origem.

## R5. Pontuação de compatibilidade

- **Decisão**: regra determinística no backend, 0 a 100, composta por: localização (0 a 25), segmento (0 a 30), aderência ao perfil ideal (0 a 20), qualidade dos contatos (0 a 15) e quantidade e qualidade de evidências (0 a 10). Justificativa gerada listando a contribuição de cada parte.
- **Racional**: nota reproduzível e testável; a IA só fornece evidências. Os pesos são valores de partida meus, sem fonte, para o Rafael ajustar. A spec 003 deixa a fórmula para o plano.
- **Pré-pontuação (funil, 2026-11-02)**: antes de qualquer chamada de IA, cada candidata recebe uma pré-nota calculada só com dados da base, na mesma escala 0 a 100 e com as partes que a base permite (localização, CNAE, contato presente). A IA enriquece em ordem decrescente da pré-nota e para na meta. Pesos de partida meus, sem fonte; o ganho de tempo depende de quantas candidatas a base traz por campanha e não foi medido.
- **Alternativas**: nota dada pela IA (não reproduzível, difícil de testar, SC-002 exige justificativa auditável).

## R6. Duplicidade de empresas

- **Decisão**: identidade forte por CNPJ ou domínio normalizado unifica. Indício fraco (telefone igual, nome parecido) não unifica e não gera revisão humana na Etapa 1 (decisão de 2026-11-02; `DuplicateCandidate` adiado). Só estabelecimentos matriz entram como candidatos, o que evita a maior parte das duplicidades de filial.
- **Racional**: telefone compartilhado por contabilidade é caso real previsto na spec 007; unificar sozinho junta empresas diferentes.
- **Normalização**: CNPJ só dígitos; domínio sem `www` e em minúsculas; telefone em formato E.164 (pesquisa 007 ignora formatação).

## R7. Máquinas de estado

Cada estado é um enum no Domain, com tabela de transições validada no service. Transição inválida vira notification, nunca exceção.

| Entidade | Estados |
|---|---|
| Campanha | Rascunho, EmExecucao, Pausada, Concluida, Cancelada |
| Lead (Descoberta) | Pendente, Aprovado, Rejeitado (mais descartada por falta de canal, fora da lista de leads) |
| Mensagem (ADIADO) | AguardandoRevisao, Aprovada, Rejeitada, Descartada (e Pendente enquanto é gerada) |
| Envio (ADIADO) | Aprovada, Enviando, Enviada, FalhaNoEnvio, ResultadoInconclusivo |
| Tarefa da fila | Pendente, Executando, Concluida, AguardandoNovaTentativa, FalhaPersistente, Cancelada |
| Tarefa comercial | Pendente, Concluida, Cancelada |

Observação (adiada, vale ao retomar as specs 005 e 006) sobre inconsistência entre specs: a spec 005 lista o estado "Pendente" da mensagem sem defini-lo, e a spec 006 usa "Aprovada" tanto para a mensagem quanto como estado inicial do envio. O plano trata "Aprovada" como estado da mensagem e cria o `Dispatch` ao enviar. Vale esclarecer na spec 005.

## R8. Controle de concorrência

- **Decisão**: `rowversion` nas entidades com transição disputável (Campanha, Lead, Tarefa da fila; Mensagem e Envio na etapa seguinte) e índices únicos de idempotência (campanha + empresa; na etapa seguinte também lead + tipo de tarefa e mensagem + envio ativo).
- **Racional**: duplo clique em Salvar, Iniciar e Aprovar precisa gerar um único efeito (001 FR-013, 004 SC-004); o duplo clique em Enviar (006 SC-003) volta com a spec 006.

## R9. Exportação

- **Decisão**: CSV em UTF-8 com BOM e separador `;` (abre acentuado e com número correto no Excel em português), gerado em streaming; XLSX só quando a biblioteca for aprovada (D2).
- **Racional**: 010 FR-010 pede acentos corretos; BOM e separador resolvem o Excel pt-BR. Neutralização de fórmula por prefixo de apóstrofo em valores iniciados por `=`, `+`, `-` e `@`.
- **A validar**: o separador padrão na máquina do Rafael (configuração regional).

## R10. Backup

- **Decisão**: `BACKUP DATABASE` em arquivo, com nome por data e hora, executado fora de transação, em pasta configurada. Nunca sobrescreve nem apaga backup anterior.
- **Racional**: a spec pede cópia completa sob demanda, sem restauração pela interface.
- **Restrição**: o arquivo é gravado pelo serviço do SQL Server, então a pasta precisa existir para ele. Se o SQL Server rodar em contêiner, o caminho é do contêiner. Depende de D5 e do spike S0.5. O hook `block-remote-database` do projeto continua valendo.

## R11. Parâmetros de acesso (recuperação de senha removida)

- **Decisão**: a recuperação de senha por e-mail foi removida em 2026-11-02; o sistema não envia e-mail e não usa MailKit.
- **Racional**: uso individual local. Esquecida a senha, o caminho é apagar a conta no banco e rodar o seed de novo (plano da spec 002).
- **Parâmetros de partida**: senha mínima 8 e bloqueio de 5 tentativas em 5 minutos (valores das notas do padrão); sessão por inatividade de 30 minutos são valores meus de partida, sem fonte.

## R12. Contrato com o front

Segue o padrão do projeto: rotas `api/<Controller>/<acao_snake_case>`, ids Guid, paginação `{ items, totalCount, pageNumber, pageSize, totalPages }`, cookie HttpOnly, header `X-CSRF-TOKEN`. SSE é GET e dispensa CSRF. Detalhes em [contracts/api.md](contracts/api.md).

## R13. Identidade visual

Não definida. As telas usam só tokens neutros do design system do esqueleto até o Rafael entregar um Style Guide (constituição VI).

## Itens fora do plano

Natasha, HERMES, geração e envio de mensagem de qualquer tipo (adiados para a etapa seguinte), envio automático, mensagens em lote, leitura automática de respostas, multiusuário, LinkedIn e redes sociais, Google Places, empacotamento como serviço do Windows, restauração de backup pela interface, 2FA, gráficos e metas.

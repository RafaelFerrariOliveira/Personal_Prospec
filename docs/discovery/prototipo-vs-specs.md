# Protótipo x specs (Etapa 1)

Data: 2026-11-02. Fonte do protótipo: `Prototipo/Prototipo/Prototipo/` (README, `Main.dc.html`, `CompanyCard.dc.html`, `canvas.json`). Fonte das specs: `specs/001` a `010` e `specs/000-plano-geral/escopo-etapa-1.md`.

Limite da análise: o protótipo não abre fora do canvas do Claude (falta o `support.js`), então a leitura foi feita no texto e no script de `Main.dc.html`, sem ver as telas renderizadas. Itens marcados "a confirmar" dependem de olhar o canvas.

## 1. Telas do protótipo e as specs que as cobrem

| Tela do protótipo | Spec | Situação |
|---|---|---|
| Login | 002 | Cobre e-mail, senha, erro genérico. Traz dois itens fora da spec (ver conflitos 1 e 2) |
| Home (visão geral) | 009 | Cobre parte. Mostra total de campanhas, empresas encontradas, em andamento e qualificadas |
| Campanhas (lista) | 001 | Cobre nome, objetivo, estado, encontradas de meta, data e ação "Visualizar". Falta filtro por estado (a confirmar) |
| Nova campanha | 001 | Cobre parte dos campos, com divergências (conflitos 6 a 9) |
| Agente de IA iniciado | 001, 003 | Tela de transição após salvar. Sem equivalente nas specs |
| Detalhes da campanha | 001, 003, 004 | Cobre cartões, progresso, pausar, retomar, iniciar, cancelar com confirmação, lista de empresas e filtros |
| Painel lateral da empresa | 004 | Cobre justificativa, informações relevantes, contatos, fontes, aprovar, rejeitar e desfazer |
| Empresas (todas as campanhas) | 007 | Cobre só a lista. Falta quase tudo do banco central (seção 3) |
| Configurações (perfil) | nenhuma | Sem spec (conflito 2) |

## 2. Conflitos entre o protótipo e as specs

Cada item precisa de uma decisão do Rafael: ajustar o protótipo ou emendar a spec.

| # | Tema | Protótipo | Spec | Sugestão |
|---|---|---|---|---|
| 1 | Recuperação de senha | Link "Esqueci minha senha" e aviso de e-mail enviado | Recuperação removida em 2026-11-02 | Remover do protótipo |
| 2 | Perfil e "Manter conectado" | Tela de Configurações com nome, e-mail, empresa e "Salvar alterações"; caixa "Manter conectado" no login | Conta única, sem edição de perfil nem troca de e-mail; sessão expira por inatividade (FR-005) | Remover a tela de perfil e a caixa, ou abrir spec nova se forem desejadas |
| 3 | Faixa de pontuação | Alta a partir de 75, Média de 50 a 74, Baixa abaixo de 50; "qualificada" = 75 ou mais | Alta 80 a 100, Média 50 a 79, Baixa 0 a 49 (003 FR-005) | Escolher um limite. A spec está validada e testável; o protótipo é de demonstração |
| 4 | Iniciar a pesquisa | Salvar a nova campanha já inicia o agente | Salvar cria "Rascunho"; "Iniciar" é ação separada (001 FR-004 e FR-006) | Seguir a spec, com tela de resumo antes de salvar |
| 5 | Rejeitar empresa | Um clique em "Rejeitar", sem motivo | Motivo obrigatório (004 FR-005, SC-001) | Seguir a spec: pedir o motivo |
| 6 | Campo CNAE | Ausente | Obrigatório, um ou mais, escolhido na lista oficial (001 FR-001 e FR-002) | Acrescentar ao formulário |
| 7 | Campo proposta de valor | Ausente | Faz parte do formulário (001 FR-001) | Acrescentar |
| 8 | Localização | Texto livre, obrigatório | Estado e cidade escolhidos de listas oficiais (001, premissas) | Trocar por seleção |
| 9 | Formulário | Página única | "Formulário guiado em etapas" com resumo para revisão antes de salvar (001 FR-001 e FR-004) | Dividir em etapas, ou emendar a spec para aceitar página única |
| 10 | Contatos da empresa | Mostra site, telefone, WhatsApp, e-mail e LinkedIn | Canal válido é telefone, e-mail ou site; sem WhatsApp na Etapa 1; LinkedIn fora do MVP (003 FR-020, escopo da Etapa 1) | Tirar WhatsApp e LinkedIn do painel |
| 11 | Rótulos de estado | Campanha "Em andamento"; lead "Pendente de análise", "Aprovada", "Rejeitada" | Campanha "Em execução"; lead "Pendente", "Aprovado", "Rejeitado" | Padronizar. Sugiro os rótulos da spec, mas é questão de texto |
| 12 | Quantidade de empresas | "Quantidade máxima de empresas" | Quantidade de leads qualificados com canal válido, até um máximo definido (001 FR-003, 003 FR-007) | Renomear para "Quantidade de leads" |
| 13 | Nome do produto | "Prospect AI" | "Personal Prospec" | Decidir o nome oficial |

## 3. O que as specs pedem e o protótipo não mostra

| Spec | Falta no protótipo |
|---|---|
| 003 | Progresso por fonte consultada, empresas descartadas e erros; déficit da meta com resumo das fontes; aviso de pausa por limite da IA |
| 004 | Data de consulta em cada fonte; histórico da empresa; ordenação por nome, cidade e classificação; filtro por classificação (a confirmar); alerta de contato anterior |
| 007 | Pesquisa por nome, CNPJ, site, telefone, e-mail e cidade; filtros de segmento e situação; ficha completa; linha do tempo; arquivar e desarquivar; "Não contatar"; remoção de dados pessoais; edição manual |
| 008 | Tela de tarefas (lista e calendário), alertas de prazo, criação manual |
| 009 | Aprovadas, rejeitadas e taxa de aprovação; pendências de falhas e tarefas atrasadas; comparação de campanhas em tabela com filtros e ordenação; aviso de atualização interrompida; "sem dados" quando o denominador é zero; definição de cada indicador |
| 010 | Lista de falhas com tentar de novo, ignorar e resolver; estado da capacidade de IA; logs técnicos; histórico de operações; exportação CSV e Excel; backup |
| 002 | Mensagem de bloqueio por tentativas com o tempo de espera; tratamento de sessão expirada |

Fora da Etapa 1 e sem tela, como esperado: mensagens da Natasha (005) e envio e resultado comercial (006).

## 4. O que o protótipo traz de bom e as specs ainda não dizem

- Tela de transição "Agente de IA iniciado" com acompanhamento. Se o Rafael gostar, vira requisito na spec 001 ou 003.
- Empresa nova aparecendo a cada 4 segundos na lista, com aviso "o agente está buscando a próxima empresa". A spec 009 (SC-002) pede até 5 segundos; combina.
- Cartão de empresa com avatar de iniciais, barra de pontuação e faixa colorida. Define o componente de lista da spec 004.
- "Desfazer decisão" no painel, que cumpre 004 FR-007.

## 5. Identidade visual

O protótipo usa índigo (`#4338CA`), verde, âmbar e rosa para estados, e a fonte Inter. Nenhum token foi criado no front, porque a identidade visual segue `[A DEFINIR]` no `CLAUDE.md` e na constituição. Enquanto o Rafael não confirmar que este é o Style Guide oficial, o front usa só tokens neutros.

## 6. Decisões pedidas ao Rafael

1. O protótipo é a referência oficial de identidade visual (cores, fonte, nome)? Sim ou não.
2. Faixa de pontuação: manter 80 (spec) ou adotar 75 (protótipo)?
3. Perfil e "Manter conectado": remover do protótipo ou abrir spec nova?
4. Formulário de campanha: em etapas com resumo (spec) ou página única (protótipo)?
5. Nome do produto: "Personal Prospec" ou "Prospect AI"?
6. A tela "Agente de IA iniciado" entra como requisito?

As specs só mudam depois das respostas. Nada foi alterado nas specs, no código nem no protótipo.

## 7. Respostas do Rafael (2026-11-02) e o que foi feito

| # | Decisão | Efeito |
|---|---|---|
| 1 | Protótipo é a identidade visual oficial | Registrado no `CLAUDE.md`; paleta e fonte em `frontend/src/extensions/designSystem/` (`colors.ts`, `themes.ts`) |
| 2 | Pontuação Alta de 75 a 100 | Spec 003 emendada (Alta 75 a 100, Média 50 a 74, Baixa 0 a 49) |
| 3 | Remover perfil e "Manter conectado" | Nenhuma spec muda; o protótipo é arquivo do Rafael e não foi editado |
| 4 | Formulário em etapas com resumo | Spec 001 já está assim; sem mudança |
| 5 | Nome Personal Prospec | Sem mudança |
| 6 | Tela "Agente de IA iniciado" vira requisito | Spec 001 ganhou o FR-015 |

Itens 1, 3, 5 e 6 do protótipo (recuperação de senha, perfil, CNAE e proposta de valor ausentes, localização livre, rejeição sem motivo, WhatsApp e LinkedIn, iniciar ao salvar) continuam como ajustes a fazer no protótipo, conforme a seção 2.

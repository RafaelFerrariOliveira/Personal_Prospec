# Research: Campanhas (spec 001)

**Data**: 2026-11-02 | **Plano**: [plan.md](plan.md)

Formato: Decisão, Racional, Alternativas. Itens "A validar" dependem de spike e não são fatos.

## R1. Idempotência de "Salvar" e "Iniciar" (FR-013)

- **Decisão** (revisada em 2026-11-02 após o Rafael recusar o id gerado no front): o servidor gera o `Id`. O front gera uma chave de idempotência (`requestId`, Guid) ao abrir o formulário e a envia em `create_campaign`. A coluna `Campaign.RequestId` tem índice único por unidade. O servidor trata a chave repetida assim: mesmo tenant e mesmos dados, devolve sucesso sem criar outra; mesma chave com dados diferentes, notification de conflito. "Iniciar" repetido cai na transição inválida (`Em execução` para `Em execução`) e vira notification, nunca segunda execução. `rowversion` na `Campaign` protege dois pedidos simultâneos.
- **Racional**: o botão desabilitado no front não basta para o requisito (duplo clique rápido, duas abas). A chave primária já é única, então não precisa de tabela nem coluna de idempotência.
- **Alternativas**: id gerado no front (rejeitado pelo Rafael); só desabilitar o botão (não cobre duplo clique rápido nem duas abas); deduplicar por nome e janela de tempo (frágil, bloqueia campanhas legítimas com mesmo nome). Depois de salvar, o front vai à lista, então não é preciso devolver o id.

## R2. Lista de municípios por UF

- **Decisão** (spike S1.1 concluído em 2026-11-02): UF como lista fixa de 27 no código; municípios em `municipios.tsv` (código da Receita de 4 dígitos, UF e nome), carregado por seed e identificado pelo código da Receita. É o mesmo código que a pesquisa da spec 003 usa em `Estabelecimentos`, sem conversão.
- **Racional**: a spec exige escolher de listas oficiais. A tabela `Municipios` da Receita não traz a UF e tem 241 nomes repetidos, então a UF foi obtida em `Estabelecimentos`: 3 prefixos de 24 MB deram UF para os 5.572 códigos, nenhum em mais de uma UF. Detalhes em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md`.
- **Alternativas**: lista do IBGE por UF (exigiria casar o código do IBGE com o da Receita, e a Receita não oferece essa tabela); derivar o par na importação da spec 003 (acoplaria a 001 à importação).
- **Limites**: os nomes vêm em maiúsculas e sem acento (`SAO PAULO DE OLIVENCA`), como na Receita; o seed é um instantâneo de 2026-10; o código `9707` (exterior) foi retirado.
- **Resultado**: 5.571 municípios em 27 UF (DF com 1), nome mais longo com 32 caracteres.

## R3. CNAE

- **Decisão**: tabela `Cnae` (código de 7 dígitos e descrição) carregada por seed a partir do arquivo `Cnaes` da base da Receita (cerca de 1.358 linhas, confirmado no spike S0.3). Busca no servidor por código ou parte da descrição, sem acento e sem diferenciar caixa, limitada a 20 resultados.
- **Racional**: lista pequena e estável; busca no servidor evita baixar tudo no front e reaproveita a mesma tabela na spec 003 para filtrar a base de CNPJ.
- **Alternativas**: embutir a lista no front (duplica a fonte); sugerir CNAE por IA (decisão de 2026-11-02: a IA não sugere).
- **Resultado (S1.2, 2026-11-02)**: arquivo lido em Latin-1, 1.359 linhas; o placeholder `8888888` ("Atividade Econônica não informada") foi retirado do seed, ficando 1.358 CNAE em `cnae.tsv` (UTF-8, tabulação, porque várias descrições têm `;`). Descrição mais longa: 159 caracteres.

## R4. Máquina de estados

Transições (tabela única no Domain, validada no service; transição inválida vira notification):

| De | Para | Quem dispara |
|---|---|---|
| Rascunho | Em execução | Usuário (iniciar) |
| Em execução | Pausada | Usuário (pausar) |
| Pausada | Em execução | Usuário (retomar) |
| Em execução | Concluída | Spec 003 (não é ação do usuário) |
| Rascunho, Em execução, Pausada | Cancelada | Usuário (cancelar com confirmação) |

Concluída e Cancelada são finais. Editar: só em Rascunho ou Pausada (FR-009).

## R5. Pausa com tarefa em andamento (FR-007)

- **Decisão**: a campanha vira "Pausada" imediatamente; o worker confere o estado antes de pegar cada tarefa nova; a tarefa em andamento termina e grava o resultado mesmo que a campanha já esteja Pausada ou Cancelada.
- **Racional**: o usuário vê o estado correto na hora e nenhum trabalho pago em limite da assinatura é jogado fora. Implementação do worker na spec 003.
- **Consequência para a 001**: nenhum estado intermediário "Pausando". Se o Rafael quiser mostrar "terminando a tarefa atual", é emenda de spec.

## R6. Edição de campanha pausada

Editar grava os campos e registra um evento com os nomes dos campos alterados. As alterações valem para as tarefas seguintes (spec 001, cenário 3 da história 2). Quantidade de leads menor que a já qualificada não é tratada aqui: regra pertence à spec 003 (provável: a campanha conclui na retomada).

## R7. Formulário em etapas no front

- **Decisão**: um único `useForm` no controller com `zodResolver`, e um índice de etapa no `useState` do controller. Cada etapa valida só os campos dela antes de avançar; voltar mantém os dados.
- **Racional**: reaproveita react-hook-form da stack, sem biblioteca de wizard (constituição V). O mesmo schema Zod serve ao formulário e ao envio (rule `forms-validation.md`).
- **Etapas** (da spec): identificação (nome, objetivo), localização, perfil (perfil ideal, segmento, CNAE), oferta (serviços, diferenciais, proposta de valor), quantidade de leads, resumo.
- **Estado do rascunho local**: não persiste antes de "Salvar". Recarregar a página perde o que não foi salvo; a spec não pede rascunho automático.

## R8. Listas e scroll

A lista de campanhas usa `useInfiniteScrollQuery`, ainda não criado (pendência 5 do `frontend/README.md`); entra nesta spec porque é a primeira lista paginada. Filtro por estado reinicia a lista e cancela a requisição em andamento (rule `infinite-scroll-pagination.md`).

## R9. Tela "Agente de IA iniciado" (FR-015)

Página `CampaignStarted` com nome, meta e localização, mensagem de que a pesquisa começou e botão para o detalhe; redireciona sozinha ao detalhe depois de alguns segundos (valor de partida: 3 segundos, valor meu, sem fonte). Mostra o mesmo conteúdo mesmo que a pesquisa real só exista na spec 003. Não mostra empresas encontradas nesta spec.

## R10. Resumo do andamento no detalhe (US3)

O detalhe da campanha mostra configuração, estado e histórico. Os contadores de empresas encontradas, qualificadas e pendentes dependem das specs 003 e 004; até lá o detalhe mostra o estado e "pesquisa ainda não executada" sem inventar número. O contrato já reserva o bloco `progress` como opcional.

## R11. Identidade visual

Segue o protótipo oficial (decisão de 2026-11-02): tokens em `frontend/src/extensions/designSystem/`. Rótulos de estado da spec: Rascunho, Em execução, Pausada, Concluída, Cancelada. Divergências do protótipo estão em `docs/discovery/prototipo-vs-specs.md`.

## Itens fora do plano

Duplicar, arquivar e excluir campanhas; rascunho automático do formulário; mensagem-base (Etapa 2); pesquisa real (spec 003); contadores de andamento (specs 003 e 004).

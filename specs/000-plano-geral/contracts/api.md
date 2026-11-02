# Contrato da API: Personal Prospec

> **Escopo (2026-11-01)**: Etapa 1 = só prospecção. Tudo aqui sobre Natasha, HERMES, mensagem, envio e resposta comercial está ADIADO (specs 005 e 006). Ver ../escopo-etapa-1.md.

**Data**: 2026-10-23 | **Plano**: [../plan.md](../plan.md)

Contrato de partida, para orientar as tasks. Nomes sujeitos à decisão D1 (inglês no código e nas rotas; estados aparecem como rótulos pt-BR só na interface). O OpenAPI gerado é a fonte final depois da implementação.

## Regras gerais

- Rota: `api/<Controller>/<acao_snake_case>`. Leitura com GET, escrita com POST, PUT e DELETE. Ids `Guid`.
- Autenticação por cookie HttpOnly. Escrita exige header `X-CSRF-TOKEN`. Exceções anônimas: login e token CSRF.
- Paginação: `{ items, totalCount, pageNumber, pageSize, totalPages }` com `pageNumber` e `pageSize` na query.
- Erro de negócio: 400 com lista de notifications; 403 quando a chave é de tenant; 404 igual para "não existe" e "é de outro tenant"; 409 para conflito de concorrência (duplo clique, estado mudou).
- Resposta de escrita: `bool` no padrão do projeto; o id criado sai pelo header ou por consulta posterior, conforme o padrão das notas (a confirmar na hora da task).
- Nenhuma resposta, log ou mensagem de erro contém segredo, senha ou stack trace.

## Endpoints por controller

### Authentication (002)

| Método | Rota | Objetivo |
|---|---|---|
| POST | `api/Authentication/generate_access_token` | Entrar com e-mail e senha (mensagem genérica em falha) |
| POST | `api/Authentication/logout` | Encerrar sessão |
| POST | `api/Authentication/refresh_token` | Renovar sessão |
| GET | `api/Antiforgery/token` | Token CSRF |
| GET | `api/Authentication/get_session` | Estado da sessão para o bootstrap do front |

### Campaign (001)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Campaign/get_all_with_pagination_campaign` | Lista com filtro por estado |
| GET | `api/Campaign/get_by_id_campaign` | Detalhe com configuração completa |
| POST | `api/Campaign/create_campaign` | Salvar em Rascunho |
| PUT | `api/Campaign/update_campaign` | Editar (Rascunho ou Pausada) |
| POST | `api/Campaign/start_campaign` | Iniciar e disparar a pesquisa |
| POST | `api/Campaign/pause_campaign` | Pausar |
| POST | `api/Campaign/resume_campaign` | Retomar (só por ação do usuário) |
| POST | `api/Campaign/cancel_campaign` | Cancelar com confirmação |
| GET | `api/Campaign/get_history_campaign` | Histórico de estados e configuração |
| GET | `api/Campaign/search_cnae_campaign` | Busca na lista oficial de CNAE (código ou texto) para o formulário; sem chamada de IA |
| GET | `api/Campaign/get_progress_campaign` | Progresso da pesquisa (fontes, encontradas, qualificadas, descartadas, erros, déficit) |

### Lead (003, 004)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Lead/get_all_with_pagination_lead` | Leads da campanha, ordenação e filtros |
| GET | `api/Lead/get_by_id_lead` | Detalhe com justificativa, fontes e histórico |
| POST | `api/Lead/approve_lead` | Aprovar (registra uma única aprovação; nenhuma mensagem é gerada na Etapa 1) |
| POST | `api/Lead/reject_lead` | Rejeitar com motivo obrigatório |
| POST | `api/Lead/change_decision_lead` | Mudar decisão por ação explícita |
| (ADIADO) GET | `api/Lead/get_duplicates_lead` | Possíveis duplicidades. Fora da Etapa 1 |
| (ADIADO) POST | `api/Lead/resolve_duplicate_lead` | Unificar ou manter separado. Fora da Etapa 1 |

### Message (005) e Dispatch (006): ADIADO, fora da Etapa 1

Não implementar nenhum destes endpoints na Etapa 1. Ficam como contrato de partida para a etapa seguinte.

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Message/get_all_with_pagination_message` | Mensagens por campanha e estado |
| GET | `api/Message/get_by_id_message` | Texto, versões, fatos e fontes |
| PUT | `api/Message/edit_message` | Nova versão editada (volta a Aguardando revisão) |
| POST | `api/Message/approve_message` | Aprovar (valida links e palavras) |
| POST | `api/Message/reject_message` | Rejeitar |
| POST | `api/Message/request_new_version_message` | Nova versão após rejeição |
| POST | `api/Dispatch/send_message` | Enviar mensagem aprovada (transição atômica; um pedido) |
| POST | `api/Dispatch/retry_dispatch` | Tentar de novo (confirmação simples na falha; aviso de duplicidade no inconclusivo) |
| POST | `api/Dispatch/mark_sent_manually_dispatch` | Marcar como enviada manualmente |
| POST | `api/Dispatch/discard_dispatch` | Descartar |
| POST | `api/Response/register_response` | Registrar resposta comercial |
| PUT | `api/Response/change_response` | Alterar resposta (guarda a anterior) |

### Company (007)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Company/get_all_with_pagination_company` | Pesquisa por nome, CNPJ, site, telefone, e-mail e cidade; filtros de segmento e situação |
| GET | `api/Company/get_by_id_company` | Ficha completa |
| GET | `api/Company/get_timeline_company` | Linha do tempo |
| PUT | `api/Company/update_company` | Edição manual com histórico |
| POST | `api/Company/archive_company` | Arquivar |
| POST | `api/Company/unarchive_company` | Desarquivar |
| POST | `api/Company/register_do_not_contact_company` | Não contatar (data e origem) |
| POST | `api/Company/remove_personal_data_company` | Remoção de dados pessoais a pedido do titular |

### CommercialTask (008)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/CommercialTask/get_all_with_pagination_commercial_task` | Lista por estado, prazo e empresa |
| GET | `api/CommercialTask/get_calendar_commercial_task` | Tarefas por período (dia, semana, mês) |
| GET | `api/CommercialTask/get_alerts_commercial_task` | Próximas do prazo e atrasadas |
| POST | `api/CommercialTask/create_commercial_task` | Criar |
| PUT | `api/CommercialTask/update_commercial_task` | Editar descrição e prazo |
| POST | `api/CommercialTask/complete_commercial_task` | Concluir |
| POST | `api/CommercialTask/cancel_commercial_task` | Cancelar |

### Dashboard (009)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Dashboard/get_overview_dashboard` | Etapas, progresso e pendências da campanha |
| GET | `api/Dashboard/get_indicators_dashboard` | Quatro contagens (encontradas, qualificadas, aprovadas, rejeitadas) e a taxa de aprovação, com definição e itens de origem |
| GET | `api/Dashboard/get_campaign_comparison_dashboard` | Comparação com filtros de período, estado e segmento e ordenação |

Fórmula da Etapa 1 (spec 009 após clarificação): aprovação = aprovados ÷ (aprovados + rejeitados). Adiadas com as specs 005 e 006: envio = enviadas ÷ aprovadas; resposta = respostas registradas ÷ enviadas; interesse = Interessado ÷ respostas registradas. Denominador zero devolve "sem dados" (valor nulo, não zero).

### Operation (010)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Operation/get_failures_operation` | Lista de falhas |
| POST | `api/Operation/retry_failure_operation` | Tentar de novo (nova tarefa de pesquisa, uma única vez) |
| POST | `api/Operation/ignore_failure_operation` | Ignorar |
| POST | `api/Operation/resolve_failure_operation` | Marcar como resolvida |
| GET | `api/Operation/get_ai_capacity_operation` | Estado da capacidade de IA |
| GET | `api/Operation/get_logs_operation` | Logs técnicos com filtros |
| GET | `api/Operation/get_history_operation` | Histórico de operações |
| POST | `api/Operation/create_backup_operation` | Backup sob demanda |
| GET | `api/Operation/get_backups_operation` | Backups feitos |
| GET | `api/Export/export_csv` | Exporta lista com filtros e campos escolhidos |
| GET | `api/Export/export_xlsx` | Idem em Excel (depende da decisão D2) |

### Stream (003, 009)

| Método | Rota | Objetivo |
|---|---|---|
| GET | `api/Stream/subscribe_events` | SSE: eventos `campaign_changed`, `list_changed`, `alert_changed`, sem dados sensíveis, só ids |

## Contrato no front

- `ApiControllers` (enum em `business/api/api.controllers.ts`) ganha um valor por controller acima.
- Um Service por controller, com interface, símbolo e container Inversify; DTOs Zod por endpoint; `ZGuid` para ids.
- Datas chegam em ISO 8601 (`Instant`); a tela formata no fuso do computador (008 premissa).
- Taxas chegam como `number | null`; `null` mostra "sem dados".

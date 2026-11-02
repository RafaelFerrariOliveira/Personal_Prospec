# Contratos de integração: Personal Prospec

> **Escopo (2026-11-01)**: Etapa 1 = só prospecção. Tudo aqui sobre Natasha, HERMES, mensagem, envio e resposta comercial está ADIADO (specs 005 e 006). Ver ../escopo-etapa-1.md.

**Data**: 2026-10-23 | **Plano**: [../plan.md](../plan.md)

Interfaces internas (portas) e o que se sabe das integrações externas. O que não está documentado aparece como "A validar" e depende de spike da Fase 0.

## 1. Porta de IA: `IAiResearchClient`

Fica no ApplicationService; o adaptador `ClaudeCliClient` fica na Infra.

| Operação | Entrada | Saída |
|---|---|---|
| `FindCompanyEvidenceAsync` | dados já conhecidos da empresa (nome, CNPJ, cidade, telefone e e-mail da base, domínio se houver), perfil da campanha. Uma empresa por chamada | lista de fatos `{ kind, text, sourceUrl, retrievedAt }` e contatos candidatos |
| `ComplementaryResearchAsync` (ADIADO, spec 005) | empresa aprovada | fatos adicionais com fonte |
| `GenerateMessageAsync` (ADIADO, spec 005) | modelo-base, contexto da campanha, fatos com id | texto da mensagem e ids dos fatos usados |

Resultado de toda operação: `Success(payload)`, `RecoverableFailure(motivo)`, `LimitReached` ou `Blocked(motivo)`. O adaptador nunca lança exceção para limite ou bloqueio.

Regras do adaptador:

- Executa o binário `claude.exe` direto (não o `claude.cmd`, que passaria os argumentos por `cmd`) em modo `--print` com `--output-format json` e `--json-schema` por operação, em diretório vazio, com `--tools "WebSearch,WebFetch"` **e** `--allowedTools "WebSearch" "WebFetch"` (sem o segundo as ferramentas são negadas no modo `-p`), sem MCP, sem sessão persistida, `--setting-sources ""`.
- Lê o resultado no campo `structured_output` do JSON de retorno, não no texto de `result`.
- Remove do ambiente do processo `ANTHROPIC_API_KEY` e variáveis de outros provedores pagos; se existirem no ambiente do backend, retorna `Blocked` e a capacidade de IA fica `Blocked`.
- Entrega o prompt por entrada padrão, nunca por argumento de linha de comando (evita vazar conteúdo em lista de processos).
- Tempo limite por chamada; ao estourar, `RecoverableFailure`.
- Não registra o prompt completo nem a saída em log, só tamanhos, duração e resultado.
- A saída é revalidada no backend; fato sem `sourceUrl` ou com URL malformada é descartado.

**Validado no S0.1 (2026-11-01)**: autenticação sem chave, nomes das ferramentas web (`WebSearch`, `WebFetch`), campo `structured_output`, isolamento de configuração do usuário, chamada a partir do .NET, cerca de 51 s por empresa. **Ainda a validar**: sinal de limite esgotado (código de saída e texto), `--restricted` junto com a busca web, desligar a memória do processo filho, consumo real contra o limite da assinatura. Ver `docs/discovery/spikes-s0-1-e-s0-3.md`.

## 2. Porta de envio: `IMessageDispatchClient` (ADIADO, spec 006, fora da Etapa 1)

Não criar a porta, o adaptador nem o spike S0.2 na Etapa 1. Desenho preservado para a etapa seguinte.

Adaptador `HermesWebhookClient` na Infra.

| Operação | Entrada | Saída |
|---|---|---|
| `SendAsync` | destino, texto, id do envio (para correlação) | `Accepted`, `Failed(motivo)` ou `Timeout` |

O que a documentação do HERMES afirma (registrado em `docs/discovery/validacao-bloqueios.md`): `POST http://host:8644/webhooks/<rota>` com assinatura HMAC, entrega em `whatsapp` com `deliver_extra.chat_id`, `deliver_only: true` envia sem IA e devolve 200 ou 502, limite padrão de 30 requisições por minuto por rota.

Regras do adaptador:

- Uma única tentativa por pedido. Espera máxima de 30 segundos; ao estourar, `Timeout`, que vira "Resultado inconclusivo".
- Assinatura HMAC com segredo `Hermes:WebhookSecret` (user-secrets), nunca em log.
- Apenas `localhost`. HERMES indisponível: `Failed("indisponível")`, o envio não inicia e a mensagem permanece Aprovada (006 FR-012).
- Idempotência: o id do envio vai no corpo; mesmo assim o sistema não reenvia por conta própria.

**A validar (S0.2)**: formato do `chat_id` do WhatsApp, corpo e código de resposta no modo de entrega sem IA, o que 200 garante (aceito para entrega ou entregue), e como o HERMES informa falha posterior. Sem isso, "sucesso informado" da spec 006 não tem definição técnica.

## 3. Fonte de empresas: `ICompanySourceClient`

Adaptador `CnpjOpenDataSource` na Infra, lendo o schema separado.

| Operação | Entrada | Saída |
|---|---|---|
| `SearchAsync` | UF, cidades, CNAE da campanha (só matriz e só ativa), página | estabelecimentos candidatos com telefone e e-mail da base e a data da base. A pré-pontuação e a ordenação são feitas no backend, sem IA |
| `ImportAsync` | arquivo local, filtro de UF e CNAE | contagem importada |

**A validar (S0.3)**: layout e codificação dos arquivos, onde obter a distribuição oficial, tempo de importação filtrada.

## 4. Tempo real: SSE

- Conexão `GET api/Stream/subscribe_events`, `Content-Type: text/event-stream`, cookie de sessão, sem corpo.
- Eventos: `campaign_changed { campaignId }`, `list_changed { list }`, `alert_changed {}`. Sem dado de negócio no evento.
- Reconexão automática do `EventSource`; ao reconectar o front refaz as consultas visíveis. Falha prolongada mostra "desatualizado".
- Um difusor em memória; sem persistência de eventos (o front sempre pode reconsultar).

## 5. Backup

- `IDatabaseBackup` (Infra): `CreateAsync(destino)` devolve caminho, tamanho e resultado; fora de transação; nunca apaga arquivos existentes.

## 6. Redação de dados sensíveis

Todo log, evento e exportação passa por um redator central que mascara: senha, token, `Authorization`, cookie, chave de API, segredo de webhook. Regra testada (spec 010 SC-004).

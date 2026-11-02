# Quickstart: validação do Personal Prospec

> **Escopo (2026-11-01)**: Etapa 1 = só prospecção. Tudo aqui sobre Natasha, HERMES, mensagem, envio e resposta comercial está ADIADO (specs 005 e 006). Ver escopo-etapa-1.md.

**Data**: 2026-10-23 | **Plano**: [plan.md](plan.md)

Guia para provar que o plano é executável, sem código de produto. Parte 1 são os spikes que liberam os bloqueios B1, B3 e B5 (o B2, do HERMES, está adiado). Parte 2 é o roteiro de validação ponta a ponta para quando as fases estiverem implementadas.

Regra de todos os spikes: scripts descartáveis ficam fora de `backend/` e `frontend/` (por exemplo, na pasta de rascunho da sessão), sem segredo no repositório, e o resultado vai para `docs/discovery/` como registro.

## Parte 1: spikes da Fase 0

### S0.1 `claude -p` pela assinatura (libera B1)

Pré-requisito: Claude Code logado pelo Rafael; `ANTHROPIC_API_KEY` ausente do ambiente.

1. Chamar `claude --print` com `--output-format json` num diretório vazio, prompt simples, e confirmar que responde usando a assinatura (sem erro de chave).
2. Repetir com `--json-schema` e conferir o formato do JSON de retorno.
3. Pedir uma pesquisa curta na web com `--tools` restrito e conferir quais ferramentas de busca ficam disponíveis; repetir com `--restricted`.
4. Rodar a partir de um processo .NET (`Process.Start`, entrada por stdin) e conferir autenticação, codificação UTF-8 e tempo.
5. Medir tempo e consumo percebido por empresa em 5 empresas reais.
6. Registrar como o limite esgotado se manifesta (código de saída e texto), sem forçar o esgotamento da conta: usar a documentação e o primeiro caso real, e marcar como pendente se não ocorrer.

Aceite: itens 1 a 4 funcionam; itens 5 e 6 viram números e observações no registro.

### S0.2 Webhook do HERMES (libera B2): ADIADO, fora da Etapa 1

Não executar na Etapa 1. Roteiro preservado para a etapa seguinte.

Pré-requisito: Hermes Agent instalado, WhatsApp pareado em número dedicado, rota de webhook com `deliver: whatsapp` e `deliver_only`.

1. Configurar a rota e o segredo HMAC (segredo fora do repositório).
2. Enviar uma mensagem de teste a um número do próprio Rafael e registrar o formato do `chat_id` que funcionou.
3. Registrar corpo e código HTTP da resposta em sucesso e com destino inválido.
4. Parar o gateway e registrar o comportamento do POST (para o caso "indisponível").

Aceite: formato do destino e semântica da resposta documentados em `docs/discovery/`.

### S0.3 Base de CNPJ (libera B3)

1. Localizar a distribuição oficial vigente e registrar a URL real encontrada, tamanho e data de referência.
2. Ler os arquivos em streaming, filtrando por uma UF e uma lista de CNAE, e medir o tempo.
3. Registrar o layout (colunas usadas, codificação, separador) para o mapeamento.

Aceite: importação filtrada de uma UF em tempo que o Rafael considere aceitável.

### S0.5 Backup (libera B5)

Executar `BACKUP DATABASE` de um banco de teste no destino escolhido (D5). Aceite: arquivo gerado e legível.

## Parte 2: validação ponta a ponta (depois das fases)

Pré-requisitos: backend e frontend rodando, `dotnet user-secrets` com as chaves necessárias, IA real ou fake conforme o teste.

| # | Cenário | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Entrar, sair, errar senha 5 vezes | Mensagem genérica e bloqueio com tempo | 002 |
| 2 | Criar campanha incompleta e completa | Campo faltante indicado e dados mantidos; Rascunho salvo | 001 |
| 3 | Iniciar campanha, pausar no meio, retomar | Nenhuma tarefa nova após pausar; retomada só por ação | 001, 003 |
| 4 | Reiniciar o backend durante a pesquisa | Sem perda nem duplicidade de resultado | 003 |
| 5 | Meta não atingida | Déficit e fontes consultadas exibidos | 003 |
| 5b | Meta atingida no meio da lista de candidatas | As candidatas restantes ficam como NaoEnriquecida, sem chamada de IA; campanha Concluída | 003 |
| 5c | Candidatas da base | Só matriz e ativa, em ordem de pré-pontuação; telefone da base já conta como canal | 003 |
| 6 | Aprovar com duplo clique | Uma única aprovação registrada; nenhuma mensagem gerada | 004 |
| 7 | Rejeitar sem motivo | Recusado | 004 |
| 8 | Marcar empresa como "Não contatar" e tentar aprovar o lead dela | Aprovação recusada com aviso; novas descobertas dela não entram | 004, 007 |
| 9 | Empresa aprovada ou rejeitada reaparece em outra campanha | Alerta com data, campanha e histórico | 007 |
| 10 | Criar tarefa manual, concluir, cancelar e deixar uma vencer | Estados corretos; alerta de próxima do prazo e de atrasada | 008 |
| 11 | Campanha com números conhecidos | Quatro contagens e a taxa de aprovação batem com a conta manual; denominador zero mostra "sem dados" | 009 |
| 12 | Limite de IA simulado no fake | Campanha pausa com progresso preservado e aviso | 010 |
| 13 | Exportar CSV com valor `=1+1` | Valor neutralizado | 010 |
| 14 | Pedir backup | Arquivo gerado; nenhum anterior apagado | 010 |

Cenários de mensagem, envio e resposta comercial (antigos 8 a 11 e 13, specs 005 e 006) ficam adiados para a etapa seguinte.

### Comandos de verificação

Backend, a partir de `backend/Src/`: `dotnet build ../PersonalProspec.slnx` e `dotnet test ../PersonalProspec.slnx`.

Frontend, a partir de `frontend/`: `npm run format`, `npm run lint`, `npm run ts:check`, `npm run test:unit` e `npm run build`.

Antes de concluir cada fase: acionar `back-architecture-auditor` e `front-architecture-auditor`.

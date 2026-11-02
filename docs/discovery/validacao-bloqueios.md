# Validação dos bloqueios técnicos (antes do plano)

Data da pesquisa: 2026-10-22. Fontes oficiais lidas por página; o que não está documentado fica marcado como "não documentado" e NÃO deve ser assumido nas specs e no plano.

## 1. IA: Claude pela assinatura

**Fonte**: https://code.claude.com/docs/en/legal-and-compliance (seção "Authentication and credential use") e https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan

| Fato | Situação |
|---|---|
| OAuth da assinatura é destinado ao uso comum do Claude Code e apps nativos da Anthropic | Documentado |
| Quem constrói produto ou serviço que usa o Claude (inclusive Agent SDK) deve usar chave de API do Console | Documentado |
| Proibido rotear requisições por credenciais Free/Pro/Max, oferecer login Claude.ai no próprio app, coletar, guardar ou intermediar token de sessão | Documentado |
| Quem entra na assinatura no binário do Claude Code sem modificação continua permitido | Documentado |
| `claude -p` e Agent SDK logados com o plano consomem os limites da assinatura (ajuste pausado em 2026-06-15) | Documentado na ajuda |
| Limites anunciados do Pro e Max pressupõem "uso individual comum" do Claude Code e do Agent SDK | Documentado |
| Se `ANTHROPIC_API_KEY` estiver definida, o Claude Code usa API paga e não a assinatura | Documentado |

**Conclusão**: a única rota sem custo extra e dentro dos termos é o backend executar o **binário oficial `claude -p`, sem modificação, logado pelo próprio Rafael** (uso pessoal, local). O backend NÃO pode ler, copiar nem repassar o token. Chamar a API HTTP com token de assinatura é proibido. Riscos a aceitar: (a) enquadramento como "uso individual comum" em fila contínua de background é interpretação, não garantia; (b) o limite da assinatura pode esgotar no meio de uma campanha, então o sistema precisa pausar e preservar progresso; (c) a Anthropic pode mudar o termo sem aviso. Se o Rafael quiser garantia contratual, o caminho é chave de API (pago) e isso exige autorização explícita.

## 2. HERMES

**Fontes**: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp, .../messaging/, .../messaging/webhooks, .../messaging/open-webui

| Fato | Situação |
|---|---|
| WhatsApp via bridge Baileys (QR), não a API oficial; risco de restrição da conta; doc desaconselha automação para quem não escreveu primeiro | Documentado |
| Webhook de entrada: `POST http://host:8644/webhooks/<rota>`, assinatura HMAC (V2 recomendada), entrega em `whatsapp` com `deliver_extra.chat_id`; `deliver_only: true` envia sem IA e devolve 200 ou 502; limite padrão 30 req/min por rota | Documentado |
| API server OpenAI-compatível em `127.0.0.1:8642` (`/v1/chat/completions`, `/v1/responses`), chave `API_SERVER_KEY`; roda o agente com todas as ferramentas no host | Documentado; não diz se envia WhatsApp |
| Formato do `chat_id` do WhatsApp, resposta do POST em modo agente, envio a número arbitrário | Não documentado |

**Conclusão**: tecnicamente existe uma porta para o backend pedir o envio (webhook com `deliver_only`), mas o formato do destino e a garantia de entrega não estão documentados e precisam de teste prático. Resultado inconclusivo nunca reenvia sozinho (regra do Rafael).

## 3. Fontes de pesquisa do Coulson

| Fonte | Situação |
|---|---|
| Google Places API (New): Text Search Pro US$ 32 por 1.000 (5.000 grátis/mês); telefone e site sobem a chamada para Enterprise, US$ 35 por 1.000 (1.000 grátis/mês) | Fonte secundária; conferir na página oficial de preços do Google antes de contratar. É serviço pago além da cota grátis, exige autorização do Rafael |
| Base aberta de CNPJ (Receita): atualização mensal, ~8 GB compactados, traz endereço, telefone, e-mail, CNAE, porte; pode estar defasada | Fonte secundária; não verifiquei limite da BrasilAPI |
| LinkedIn e redes sociais | Termos de uso restringem coleta automatizada; fora do padrão "fonte autorizada" |
| Pesquisa livre na web | Possível, mas sem garantia de contato válido; precisa registrar fonte e data |

**Conclusão**: "APIs oficiais e fontes autorizadas" aponta para base de CNPJ (grátis) e Google Places (grátis só até a cota). LinkedIn e raspagem ficam de fora até o Rafael decidir.

## Decisões do Rafael (2026-10-22)

- IA: backend executa o `claude -p` oficial, local, logado pelo Rafael, sem tocar no token; sem chave de API e sem custo extra. Esgotar o limite da assinatura pausa a campanha e preserva o progresso.
- Fontes do Coulson no MVP: base aberta de CNPJ e pesquisa web pública feita pela IA, com fonte e data registradas. Google Places, LinkedIn e redes sociais ficam fora.
- O texto "Planejamento técnico com Spec Kit" substitui o Discovery anterior (login por e-mail e senha, banco central de empresas, tarefas, indicadores e envio manual via HERMES).

## 4. Meta WhatsApp Business (referência)

Cobrança por mensagem entregue, primeiro contato só com template aprovado, categoria marketing paga e exige consentimento. Fase 1 usa envio assistido, custo zero. Fonte: https://developers.facebook.com/docs/whatsapp/pricing

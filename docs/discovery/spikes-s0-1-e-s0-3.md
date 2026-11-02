# Resultado dos spikes S0.1 (claude -p) e S0.3 (base de CNPJ)

Data: 2026-11-01. Scripts descartáveis rodaram fora do repositório (pasta de rascunho da sessão). Nenhum dado pessoal nem segredo foi gravado aqui; o que foi lido da base de CNPJ aparece só como contagem e padrão mascarado.

## S0.1: `claude -p` pela assinatura (bloqueio B1)

Ambiente: Claude Code 2.1.316 (o plano citava 2.1.309). `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_BASE_URL` e as variáveis de Bedrock e Vertex estavam ausentes (só a presença foi conferida, nunca o valor).

| # | Item do plano | Resultado |
|---|---|---|
| 1 | Autentica pela assinatura, sem chave | **Passou.** Chamada simples em diretório vazio respondeu em 6,6 s. O campo `modelUsage` mostra `provider: firstParty`; o `total_cost_usd` vem com `costBasis: list` (preço de tabela, não cobrança) |
| 2 | `--json-schema` e formato do retorno | **Passou.** A saída validada fica no campo **`structured_output`** do JSON de retorno (o campo `result` traz o mesmo conteúdo em texto) |
| 3 | Busca web com ferramentas restritas | **Passou com um ajuste.** Em modo `-p`, `--tools "WebSearch,WebFetch"` sozinho NÃO basta: as chamadas são negadas por permissão (`permission_denials`) e o resultado vem vazio. Funcionou com `--tools "WebSearch,WebFetch" --allowedTools "WebSearch" "WebFetch"` |
| 4 | Chamada a partir de processo .NET | **Passou.** `Process.Start` do `claude.exe` com prompt por stdin, UTF-8 sem BOM, `ArgumentList` com o JSON Schema (sem problema de aspas), variáveis de chave removidas do ambiente. Retorno `exit=0`, acentos íntegros (São Paulo, Ribeirão Preto, Taubaté), 5,4 s |
| 5 | Tempo e consumo por empresa | Ver tabela abaixo |
| 6 | Sinal de limite esgotado | **Pendente.** Não foi forçado nem encontrado documentação durante o spike. Fica para o primeiro caso real; até lá a detecção de `LimitReached` do adaptador é suposição |
| extra | Isolamento de configuração | **Passou.** Com `--setting-sources ""` em diretório vazio, o processo filho respondeu que não vê `CLAUDE.md`, regras, memória nem skills do Rafael |

### Medição por empresa (5 empresas públicas, busca web com saída estruturada)

| Empresa | Turnos | Tempo | Tokens de saída | Fatos | Fatos sem URL |
|---|---|---|---|---|---|
| Magazine Luiza | 10 | 64 s | 2.519 | 7 | 0 |
| Localiza | 8 | 47 s | 2.584 | 10 | 0 |
| Natura | 10 | 56 s | 2.175 | 5 | 0 |
| Cacau Show | 7 | 45 s | 2.096 | 6 | 0 |
| Sicredi | 8 | 40 s | 2.394 | 7 | 0 |

Média de 51 s por empresa. Com concorrência 1 (decisão do plano), uma campanha de 50 empresas candidatas leva cerca de 43 minutos. O consumo real contra o limite da assinatura **não foi medido** (o campo de custo é preço de tabela); só o número de tokens (cerca de 26 a 45 mil de contexto por chamada, quase todo de cache).

Limites desta medição: as 5 empresas são grandes e bem indexadas. Empresa pequena, o alvo real do Coulson, tende a ter menos fontes e pode levar mais turnos ou voltar com menos fatos.

### Observações que mudam o plano

1. **Permissão de ferramenta é obrigatória no modo `-p`.** O adaptador precisa passar `--allowedTools` além de `--tools`. Atualizar `contracts/integracoes.md` e `research.md` (R1).
2. **`--restricted` existe** na 2.1.316: remove Bash, PowerShell e ferramentas que executam código, e também o `WebFetch` a menos que `--tools` o cite; ignora arquivos de configuração do usuário e do projeto. Não foi testado em combinação com a busca web.
3. **`--bare` continua inadequado**, como o plano já previa (só aceita chave de API).
4. **O modelo padrão do processo filho foi `claude-opus-5-5`.** Se a pesquisa não precisar dele, `--model` permite escolher outro; o impacto no limite da assinatura não foi medido.
5. **O filho recebe o e-mail da conta e as instruções do sistema de memória** mesmo com `--setting-sources ""`. Não há nenhuma ferramenta de escrita habilitada no adaptador, então não é risco de gravação, mas vale confirmar se existe configuração para desligar a memória do filho.
6. **O modelo registrou limitações sozinho** (por exemplo, site oficial com HTTP 403 e telefone vindo de fonte de terceiros). O prompt do Coulson deve exigir esse campo, porque a regra "fato só vale com fonte" depende dele. Fonte de terceiros (agregador) é aceitável como "fonte consultada", mas não como "informação confirmada"; decisão de regra a confirmar na spec 003.
7. `--max-budget-usd` existe só com `--print`, mas é orçamento em dólar de API; não serve para proteger o limite da assinatura.

## S0.3: base aberta de CNPJ (bloqueio B3)

### Onde está a distribuição vigente

| Endereço | Resultado em 2026-11-01 |
|---|---|
| Página gov.br de dados públicos do CNPJ | `403 Forbidden` por `curl` e erro de conexão pelo WebFetch. Não foi possível ler a página oficial |
| `dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/` | Sem conexão (host resolve, porta 443 não conecta em 21 s). Citado por terceiros como o endereço mensal |
| `arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/` | `404`. Caminho antigo, não usar |
| Nextcloud em `arquivos.receitafederal.gov.br` (share público) | **Funciona.** Pastas mensais de `2023-05` até `2026-10`; a mais recente foi gerada em 13/10/2026 |

O identificador do share público usado foi `YggdBLfdninEJX9`. Ele veio de menções de terceiros e da minha memória, **não de uma página oficial lida** (a página gov.br estava bloqueada). O domínio é da Receita Federal e o conteúdo é o esperado (Empresas, Estabelecimentos, Sócios, Simples, Cnaes, Municípios, Motivos, Naturezas, Países, Qualificações), mas a confirmação de que é o canal oficial vigente é pendência.

Pasta 2026-10: 10 arquivos de Estabelecimentos (`Estabelecimentos0` com 2.172 MB e os demais com 320 a 353 MB, cerca de 5,5 GB no total), 10 de Empresas (cerca de 1,3 GB), 10 de Sócios, Simples (296 MB) e as tabelas de apoio pequenas. Total compactado da pasta: cerca de 7,4 GB.

### Layout confirmado em dados reais

- CSV sem cabeçalho, separador `;`, campos entre aspas, codificação **Latin-1 (ISO-8859-1)**. Ler como UTF-8 corrompe acentos.
- `Estabelecimentos`: **30 colunas** (288.629 de 288.630 linhas do prefixo lido; a outra é a última linha, truncada pelo download parcial). Posições conferidas por padrão de dígitos: CNPJ básico (8), ordem (4), dígito verificador (2), situação cadastral na coluna 5 (`02` = ativa), CNAE principal na coluna 11 (7 dígitos), UF na coluna 19, município na 20 (código da Receita, **não** o do IBGE), DDD e telefone nas colunas 21 e 22, e-mail na 27.
- A **razão social não está em Estabelecimentos**. Fica em `Empresas`, ligada pelo CNPJ básico. Quem quiser a razão social precisa importar também `Empresas`.
- Tabelas de apoio: `Cnaes` (1.358 linhas, código de 7 dígitos e descrição) e `Municipios` (5.571 linhas, código de 4 dígitos da Receita e nome).
- Layout oficial em PDF não foi obtido (mesma barreira do gov.br). A leitura acima vale para o mês 2026-10; a Receita já mudou caminho e layout em janeiro de 2026 segundo terceiros, então o leitor precisa falhar claramente se o número de colunas mudar.

### Desempenho da leitura filtrada

Leitor em .NET (`DeflateStream` + `StreamReader` Latin-1, filtro por UF, situação e prefixo de CNAE) sobre o prefixo de 17,7 MB baixado:

- 288.629 linhas, cerca de 57 MB descomprimidos, em 1,4 s, ou **cerca de 39 MB/s** (compressão de cerca de 3,2x).
- No prefixo: 45.493 ativas; filtro `SP` + CNAE `6201*` ativa = 52 estabelecimentos, 49 com telefone e 38 com e-mail.
- Extrapolação (não medida): os 10 arquivos de Estabelecimentos somariam cerca de 17,6 GB descomprimidos, ou cerca de 7,5 minutos de leitura.

### O gargalo é a rede, não a leitura

Download medido do servidor da Receita: 55 a 128 KB/s por conexão. Com 3 conexões em paralelo o total foi de cerca de 208 KB/s, então o limite é por conexão. A 128 KB/s, os 5,5 GB de Estabelecimentos levariam cerca de 12 h; com mais conexões cai, mas não foi testado além de 3.

### Observações que mudam o plano

1. **Importação filtrada (D6) continua a recomendação, mas a baixa é a parte cara.** Baixar tudo uma vez por mês, em paralelo e em segundo plano, é viável; baixar sob demanda por campanha não é.
2. **O arquivo mensal pode ser baixado uma vez e reaproveitado.** Guardar a data de referência da pasta (`2026-10`) em cada fato (já previsto em `Company.cnpjBaseDate`).
3. **Importar também `Empresas`** para a razão social, ou aceitar listar só pelo nome fantasia (que estava vazio na primeira linha lida).
4. **A base traz telefone e e-mail de pessoa física** em MEI. A marcação de origem e o tratamento como dado pessoal previstos no `research.md` (R4) continuam valendo.

## O que ficou pendente

| Item | Para fechar B1 ou B3 |
|---|---|
| S0.1 item 6 | Sinal de limite esgotado (código de saída e texto): primeiro caso real |
| S0.1 | Testar `--restricted` junto com a busca web; testar desligar a memória do processo filho; medir consumo real contra o limite da assinatura (hoje só se conhece tokens e preço de tabela) |
| S0.3 | Confirmar o canal oficial (share e página gov.br) e obter o layout oficial em PDF; testar mais de 3 conexões; medir leitura de um arquivo completo; importar `Empresas` e `Municipios` para o banco |
| Decisão | Concorrência 1 no Coulson dá cerca de 43 min por 50 empresas: aceitável para o Rafael? |

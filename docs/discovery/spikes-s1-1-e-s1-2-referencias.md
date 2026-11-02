# Spikes S1.1 e S1.2: listas de municípios e de CNAE

Data: 2026-11-02. Spec 001 (campanhas), bloqueios S1.1 (municípios por UF) e S1.2 (CNAE). Fonte: o mesmo share público da Receita Federal usado no spike S0.3 (pasta mensal `2026-10`), lido por WebDAV. Como no S0.3, o canal oficial vigente segue sem confirmação por página oficial (a página gov.br estava bloqueada); o domínio é da Receita e o conteúdo é o esperado.

## S1.2: CNAE

- Arquivo: `Cnaes.zip` (22 KB). CSV sem cabeçalho, separador `;`, campos entre aspas, Latin-1, linhas `"código de 7 dígitos";"descrição"`.
- Conteúdo: 1.359 linhas, todas no padrão, códigos únicos. Uma delas é o placeholder `8888888` ("Atividade Econônica não informada", com erro de grafia na fonte). Foi retirada do seed por não ser uma escolha válida. Sobram **1.358** CNAE, o mesmo número que o spike S0.3 tinha contado como tabela de apoio.
- Descrição mais longa: 159 caracteres. Nenhuma descrição contém tabulação, mas várias contêm `;`, por isso o seed usa **tabulação** como separador.
- Resultado: `backend/Src/PersonalProspec.Infra/ORM/Seeds/Data/cnae.tsv` (UTF-8, `código<TAB>descrição`, 1.358 linhas).

## S1.1: municípios por UF

### O que a Receita oferece

- `Municipios.zip` (43 KB): 5.572 linhas, `"código de 4 dígitos";"nome"`, Latin-1, códigos únicos. **Não traz a UF.** Inclui o código `9707` "EXTERIOR".
- 241 nomes se repetem entre municípios diferentes, então não dá para descobrir a UF só pelo nome.
- A UF está em `Estabelecimentos` (índice 19, base 0) junto com o código do município (índice 20, base 0). Os índices do spike S0.3 também são base 0 ("coluna 19" e "coluna 20"), e foram confirmados aqui ao ler os dados reais.

### Como o par UF e município foi obtido

Leitura dos primeiros 24 MB de cada um de `Estabelecimentos1`, `Estabelecimentos2` e `Estabelecimentos3` (cerca de 990 mil linhas lidas no total), juntando os pares (município, UF):

| Prefixo lido | Linhas | Municípios com UF, acumulado |
|---|---|---|
| Estabelecimentos1 | 375.488 | 5.485 de 5.572 |
| Estabelecimentos2 | 289.354 | 5.554 |
| Estabelecimentos3 | 324.581 | **5.572** |

- **Todos os 5.572 códigos** ganharam UF, **nenhum** ficou em mais de uma UF, e nenhum código de estabelecimento ficou sem nome na tabela.
- UFs encontradas: as 27 (26 estados e o DF) mais `EX` (exterior). O código `9707` é o exterior e foi retirado do seed.
- Resultado: `backend/Src/PersonalProspec.Infra/ORM/Seeds/Data/municipios.tsv` (UTF-8, `código<TAB>UF<TAB>nome`, **5.571** linhas). Nome mais longo: 32 caracteres. Por UF: AC 22, AL 102, AM 62, AP 16, BA 417, CE 184, DF 1, ES 78, GO 246, MA 217, MG 853, MS 79, MT 142, PA 144, PB 223, PE 185, PI 224, PR 399, RJ 92, RN 167, RO 52, RR 15, RS 497, SC 295, SE 75, SP 645, TO 139.

### Consequências

1. O código do município do seed é o **código da Receita**, o mesmo que a pesquisa da spec 003 usa para filtrar `Estabelecimentos`. Não é o código do IBGE e não precisa de conversão.
2. Os nomes vêm **em maiúsculas e sem acento** (`SAO PAULO DE OLIVENCA`), como na Receita. A tela de escolha mostra assim. Um nome com acento exigiria outra fonte e um casamento por nome que a Receita não permite sem a UF; fica como melhoria futura, sem impacto no filtro.
3. O seed é um **instantâneo de 2026-10**. Município novo ou código alterado exige refazer o spike com uma pasta mais recente. O leitor da spec 003 deve falhar claramente se encontrar um código de município que não esteja na tabela.
4. O seed foi derivado de prefixos, e a ausência de conflito vale para esses 990 mil registros. A pasta completa não foi lida; pelo critério usado, 100% dos códigos da tabela oficial foram cobertos.

## Limites desta verificação

- O canal oficial vigente (página gov.br e layout em PDF) continua sem confirmação, como no S0.3.
- Os arquivos são dados públicos do cadastro de CNPJ; os seeds contêm só códigos, nomes e UF, sem dado de empresa nem pessoal.
- Os arquivos temporários baixados (cerca de 72 MB) foram apagados.

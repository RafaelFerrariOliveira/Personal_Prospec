# Alinhamento visual do frontend ao protótipo

**Data**: 2026-11-02 | **Decisão do Rafael**: fazer agora, antes da spec 003; a Home mostra só os indicadores que já existem.

**Referência visual**: `Prototipo/Prototipo/Prototipo/Main.dc.html` e `CompanyCard.dc.html` (ignorados pelo git; abrem só no canvas do Claude, então a leitura é pelo HTML e pelos estilos embutidos). Divergências de requisito já decididas estão em `docs/discovery/prototipo-vs-specs.md` e valem sobre o protótipo.

**Escopo**: só visual e estrutura de tela. Nenhum requisito novo, nenhum endpoint novo, nenhum pacote npm novo. As regras do front (MVVM, tokens, testes) continuam valendo.

## Regras deste trabalho

- O nome exibido é **Personal Prospec** (não "Prospect AI").
- Não entram no sistema: tela de Configurações e perfil, "Manter conectado", "Esqueci minha senha", o aviso "Ambiente de demonstração", WhatsApp e LinkedIn.
- Itens do menu que dependem de outras specs (Empresas) não aparecem até a spec existir.
- Cores, medidas, raios, tamanhos de fonte e sombras vêm do protótipo e viram tokens em `src/extensions/designSystem/`; nada de hex ou px solto nos componentes.
- Indicadores de empresas (encontradas, qualificadas, pendentes) só entram com as specs 003 e 004; até lá não aparecem na Home e o detalhe mantém "A pesquisa ainda não foi executada".
- A fonte Inter é carregada como no protótipo (Google Fonts no `index.html`).

## Tarefas

- [X] V001 Extrair do protótipo os tokens que faltam (cores da escala neutra, raios, tamanhos de fonte, pesos, sombras e espaçamentos usados) para `colors.ts` e `themes.ts`, sem inventar valor.
- [X] V002 Carregar a fonte Inter no `index.html` como o protótipo faz e aplicar `theme.fontFamily`, a cor de texto e o fundo da página como estilo global.
- [X] V003 Estrutura do app: trocar o cabeçalho (`appHeader`) por um menu lateral (`src/components/sidebar/`, MVVM) com a marca, os itens Home e Campanhas (via `canShowMenuItem`), o e-mail do usuário e o botão Sair; `AuthRequiredRoutes` renderiza menu e conteúdo como no protótipo. Atualizar testes e story.
- [X] V004 Login no padrão do protótipo: marca, cartão central, título e subtítulo, campos, botão; sem os itens fora do escopo.
- [X] V005 Home "Visão geral": cartões de total de campanhas e campanhas em execução (dados reais da lista), ação "Nova campanha" e "Campanhas recentes" com "Ver todas".
- [X] V006 Lista de campanhas em tabela no padrão do protótipo (nome e segmento, localização, estado, data, ação Visualizar), com filtro, estado vazio e scroll infinito preservados.
- [X] V007 Formulário de campanha com o visual de seções do protótipo, mantendo as 6 etapas e o resumo.
- [X] V008 Detalhe da campanha no padrão do protótipo: navegação "Campanhas / nome", cabeçalho com estado, objetivo, localização, segmento e data, cartão de andamento com as ações e confirmação de cancelamento no próprio cartão; histórico no mesmo estilo.
- [X] V009 Tela "Agente de IA iniciado" no padrão do protótipo.
- [X] V010 Componentes compartilhados no padrão do protótipo: `statusBadge`, seletores de município e CNAE, botões e campos.
- [X] V011 Verificações: format, lint, ts:check, test:coverage, build e test:e2e verdes; acionar o `front-architecture-auditor` e corrigir o que ele apontar.

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/feedback-sigilo-somente-leitura.md". Não editar aqui: editar a origem e rodar o script. -->

Ao pedir para montar memória a partir dos projetos, o Rafael disse: "não exponha nenhum segredo, nem mude nada no projeto" (2026-10-19).

**Why:** Projetos corporativos com ambientes HML/PRD; segredo ou config de ambiente não pode vazar para memória, docs ou serviços externos, e análise não deve gerar diff no repositório.
**How to apply:** Não ler nem citar valores de `appsettings.*`, `*.pfx`, user-secrets, connection strings ou variáveis de pipeline: registrar só nomes de opções (ex.: `PepperOptions.Secret`). Em tarefas de análise/documentação, trabalhar somente em leitura no repo e gravar saídas fora dele (memória/scratchpad), salvo pedido explícito. Relacionado: [backend-regra-segredos](../backend/backend-regra-segredos.md).

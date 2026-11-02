---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-cicd-azure-iis.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Pipeline do [padrao-projeto-csharp](./padrao-projeto-csharp.md).

- Dois pipelines YAML em `Src/`: HML (branch `hml`) e PRD (branch `main`), ambos usando o template `Src/build-test-dotnet.yml`.
- Template: restore → build → teste unitário (cobertura) → publish → artifact; SDK pinado; resultados de teste publicados mesmo com falha (`succeededOrFailed()`).
- HML: `CI → IntegrationTests (gate de aprovação manual) → CD`. PRD: `CI → CD`.
- Deploy IIS: `FileTransform@2` (appsettings no zip) + tasks `IISWebAppManagement/DeploymentOnMachineGroup`, app pool `No Managed Code` (out-of-process via ASP.NET Core Module).

**Armadilhas já ocorridas:**
- `projectPath` tem que apontar p/ o `*.Api.csproj`, nunca p/ o csproj de teste (já aconteceu: publicaria o projeto errado).
- Ao copiar pipeline HML↔PRD, conferir `folderPath` do `FileTransform` p/ o artefato do ambiente certo.
- `dotnet ef database update` contra ambientes reais exige confirmação; recomendado um hook `PreToolUse` no `.claude/settings.json` do projeto bloqueando comandos que referenciem HML/PRD.

**Why:** Pipeline em produção do Rafael; os erros acima são silenciosos (a task não necessariamente falha).
**How to apply:** Usar como modelo em backends novos com deploy IIS; sempre revisar `projectPath`/`folderPath`. Não registrar variáveis/segredos de pipeline ([feedback-sigilo-somente-leitura](../geral/feedback-sigilo-somente-leitura.md)).

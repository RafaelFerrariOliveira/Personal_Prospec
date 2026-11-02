---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-testes-padrao.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Testes do [padrao-projeto-csharp](./padrao-projeto-csharp.md). Código-modelo: [backend-codigo-testes](./backend-codigo-testes.md).

**Projetos:** `UnitTest` · `IntegrationTest` (referencia `UnitTest` p/ reaproveitar builders) · `ArchitectureTest` (referencia todas as camadas).

**Granularidade de arquivo (regra fixa)**
- Domain (validation, extension…) → 1 arquivo cobrindo todos os métodos do arquivo-fonte
- Mapper → 1 arquivo por mapper
- Service → 1 `Setup` por Command/Query + 1 arquivo **por método**
- Controller → 1 arquivo **por endpoint** (+ `FullCycle.cs` opcional ponta a ponta)
- Pastas de teste espelham a árvore do código.

**Convenções:** `Metodo_Cenario_ResultadoEsperado`; `[Trait("Categoria", "...")]`; Builders `XxxBuilderTest` (`NewObject()` + `WithXxx()`) em `UnitTest/Builders/`, nunca duplicados.

**Integração**
- `WebApplicationFactory<Program>` + Testcontainers (SQL Server) + migrations + seed validado com query real (fail-fast com mensagem clara).
- Imagem `rapidfort/microsoft-sql-server-2019-ib`: a rede corporativa bloqueia o MCR (`mcr.microsoft.com`).
- Respawn entre testes, preservando tabelas semeadas.
- `TestAuthHandler` (claims via headers `X-Test-*`) p/ testar role/tenant sem login real.
- CSRF exercitado de verdade (`GET /api/antiforgery/token` → header `X-CSRF-TOKEN`), não simulado.
- Rate limit neutralizado e e-mail substituído por fake no host de teste.
- Teste de role via reflection em Controller (UnitTest) valida só metadata; enforcement real vem do IntegrationTest.

**Arquitetura (ArchUnitNET)**: regras de dependência entre camadas + Main Sequence Distance por camada (Domain 0.6, App 0.25, Infra 0.25, Api 0.1). Ao depurar falha, olhar o `Distance` numérico: a descrição textual da zona usa limiar fixo 0.3 (bug conhecido).

**Why:** Padrão definido pelo Rafael para todo projeto C#; dá localização previsível e cobertura real de segurança.
**How to apply:** Gerar/revisar testes seguindo esta granularidade. Não sugerir migrar o `ArchitectureTest` p/ xUnit v3 sem confirmar suporte do pacote ArchUnitNET. Ver [backend-arquitetura-referencia](./backend-arquitetura-referencia.md).

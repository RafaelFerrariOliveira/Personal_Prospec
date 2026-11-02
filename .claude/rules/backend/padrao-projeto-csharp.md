---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/padrao-projeto-csharp.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**Padrão de Projeto C#:** padrão obrigatório para todo backend .NET do Rafael, independente do produto ou cliente. Definido em 2026-10-19 a partir de um backend em produção e desvinculado de qualquer projeto específico.

## Placeholders usados nas notas

| Placeholder | Significado |
|---|---|
| `Projeto` | Nome da solução (`Projeto.slnx`, namespaces `Projeto.Domain`, `Projeto.Infra`, `Projeto.ApplicationService`, `Projeto.Api`) |
| `APP` | Sigla do schema SQL do sistema |
| `Customer`, `Order`, `OrderItem` | Entidades de exemplo |
| `Policy.Administrator`, `Policy.Manager`, `Policy.Viewer` | Roles de exemplo |
| `<Projeto>-Hml-VG`, `<Projeto>-Prd-VG` | Variable groups de exemplo no Azure DevOps |

## Notas do padrão (ordem de leitura)

1. [backend-arquitetura-referencia](./backend-arquitetura-referencia.md): camadas e padrões transversais
2. [backend-stack-ferramentas](./backend-stack-ferramentas.md): ferramentas e versões de referência
3. [backend-estrutura-pastas](./backend-estrutura-pastas.md): árvore de pastas e checklist por entidade nova
4. Código-modelo por camada: [backend-codigo-domain](./backend-codigo-domain.md), [backend-codigo-infra](./backend-codigo-infra.md), [backend-codigo-application](./backend-codigo-application.md), [backend-codigo-api](./backend-codigo-api.md), [backend-codigo-testes](./backend-codigo-testes.md)
5. Segurança: [backend-seguranca-identity](./backend-seguranca-identity.md) e [backend-regra-segredos](./backend-regra-segredos.md)
6. Qualidade e entrega: [backend-testes-padrao](./backend-testes-padrao.md) e [backend-cicd-azure-iis](./backend-cicd-azure-iis.md)

**Why:** O Rafael pediu (2026-10-19) que as memórias não fiquem vinculadas a um projeto: elas são o padrão de projeto C# dele, reaproveitável em qualquer sistema.
**How to apply:** Em qualquer backend C#, criar estrutura e código a partir destas notas trocando os placeholders. Se um projeto existente divergir do padrão, apontar a divergência e perguntar antes de alinhar. Não registrar nome de cliente, produto ou dado de projeto nas notas do padrão.

---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-seguranca-identity.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Autenticação, autorização e multi-tenant do [padrao-projeto-csharp](./padrao-projeto-csharp.md). Segredos: [backend-regra-segredos](./backend-regra-segredos.md).

**Identity customizado**
- `User`/`Role` são POCOs no Domain (não herdam `IdentityUser`). Acoplamento ao pacote de Identity fica só no Infra.
- `UserStore`/`RoleStore` implementados à mão; `AddIdentityCore<User>()` + `AddUserStore/AddRoleStore`: **nunca** `IdentityDbContext` nem `AddEntityFrameworkStores`.
- Lookups do Identity no `UserStore` usam `.IgnoreQueryFilters()` (login ainda não tem tenant).
- Senha: só tamanho mínimo 8, sem regra de composição: força vem de Argon2id + lockout (5 tentativas / 5 min). Decisão deliberada; não "fortalecer" sem pedido.

**Hash de senha**: `ArgonTwoPasswordHasher<T>` (Argon2id + pepper HMAC-SHA256), parâmetros versionados por byte no início do hash, rehash transparente. Nunca remover versão antiga do mapa sem confirmar que não sobrou hash dela no banco.

**Tokens**
- Access e refresh **só em cookie** (HttpOnly, Secure, SameSite=Strict): nunca no corpo da resposta.
- Cookie de refresh com `Path` restrito ao endpoint de refresh.
- Refresh token: valor cru vai pro cliente, banco guarda só hash; expiração em coluna própria checada na query; rotação (revoga ao logar/refrescar).
- Validação de access token sempre por `ValidateToken` (assinatura/issuer/audience): `ReadJwtToken` sozinho nunca basta.
- Logout = revogar no banco **e** apagar cookies.
- Expiração vem de uma única opção de config (não duplicar número).

**CSRF**: Synchronizer Token via **middleware** (não filter), header `X-CSRF-TOKEN`; ignora métodos seguros e `[AllowAnonymous]`; roda antes de CORS/RateLimiter/Auth.

**Multi-tenant (`BusinessUnitId`)**
- Entidade com coluna própria implementa `ITenantOwned` → filtro aplicado automaticamente pelo `ApplicationContext` via reflection.
- Entidade que chega ao tenant por navegação → filtro em `ApplyIndirectTenantQueryFilters`.
- **Nunca** `HasQueryFilter` manual no Mapping; **nunca** a mesma entidade nas duas listas (o segundo filtro substitui o primeiro → vazamento entre tenants).
- Tenant vem de claim no JWT → `TenantContextMiddleware` (serviço scoped injetado no `InvokeAsync`, não no construtor).
- GetById devolve o mesmo resultado (200 + `null`) para "não existe" e "é de outro tenant": evita enumeração.
- Exceção deliberada: `UnitOfWorkFilter` no login não faz rollback por notification (senão o lockout nunca persistiria).

**Why:** Decisões já testadas em produção; várias são contraintuitivas e "corrigi-las" abre vulnerabilidade.
**How to apply:** Em qualquer backend novo com login/multi-tenant, partir deste desenho. Registrar apenas **nomes** de opções (ex.: `PepperOptions.Secret`), nunca valores (ver [feedback-sigilo-somente-leitura](../geral/feedback-sigilo-somente-leitura.md)).

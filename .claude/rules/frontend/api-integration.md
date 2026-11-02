---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/api-integration.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Integração com API (axios)

## Instância única

`axios/axios.instance.ts` — `AxiosBuilder` monta UMA instância (`http`) com
`baseUrl`, `withJsonContentType()`, `haveCredentials()` (envia cookie
httpOnly) e a cadeia de middlewares, nessa ordem:

```
correlationIdHandler → loggingHandler → csrfHandlerMiddleware →
cookieSessionRefreshMiddleware → messageHandlerMiddlware → sessionHandlerMiddleware
```

Nenhum Service cria instância própria de axios — sempre importa `http` de
`@axios/axios.instance` (ou recebe via `BaseService`, ver `services-di-ioc.md`).
Exceção documentada: `axios/viaCep.instance.ts` — instância separada só pra
API pública de CEP (ViaCEP), que não leva cookie/CSRF do backend.

## Autenticação

- Access/refresh token **nunca** tocam JavaScript — ficam em cookie
  httpOnly setado pelo backend (ver `security-identity.md`/
  `security-frontend.md` do backend e `security-frontend.md` deste
  template)
- `sessionHandlerMiddleware` (interceptor de resposta): em 401 sem
  `_skipAuthRedirect`, chama `clearSession()`; em resposta 2xx de
  `/Authentication/generate_access_token` ou `/Login/change_token`, chama
  `markSessionActive()`
- `cookieSessionRefreshMiddleware` faz o refresh de sessão via cookie quando
  necessário — nunca reimplementar refresh manual num Service

## CSRF

- `csrfHandlerMiddleware` injeta o header CSRF em toda requisição de
  escrita, lendo o token do Redux (`selectCsrfToken`)
- `fetchCsrfToken()` (`axios/antiforgery/fetchCsrfToken.ts`) busca o token em
  `ApiControllers.Antiforgery}/token` e despacha `setCsrfToken` — chamado no
  bootstrap de sessão, nunca repetido manualmente por feature
- Toda tela que faz POST/PUT/DELETE depende do token já estar no Redux —
  nunca assumir que existe sem o bootstrap ter rodado

## Erros

- `messageHandlerMiddlware` centraliza toast/mensagem de erro padrão — um
  Service não precisa (e não deve) mostrar toast de erro genérico ele mesmo,
  só tratar casos específicos de UX (ex: mensagem de validação de campo)
- `BaseService.execute` já loga e relança (`rethrow: true`) — controller de
  página trata o `catch` só quando tem uma ação de UI específica pra aquele
  erro (ex: mostrar modal), nunca só pra "engolir" o erro

## Proibido

- `localStorage`/`sessionStorage` pra guardar token
- Chamar API sem passar pela instância `http` (sem `withCredentials`, cookie
  não é enviado)
- Criar novo middleware de autenticação/CSRF por feature — a cadeia em
  `axios.instance.ts` já cobre toda requisição
- Service não documentado que ignora `signal`/`AbortSignal` em chamada que
  pode ser cancelada por navegação (ver assinatura padrão em
  `services-di-ioc.md`)

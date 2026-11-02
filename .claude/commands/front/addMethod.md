# /front:addMethod

Ao receber este comando, executar sem explorar o projeto. Resolver o Service e a Interface a partir do `servico:` informado (caminhos relativos a `frontend/`).

```
front:addMethod
servico: [IXxxService / business/application/service/xxx.service.ts]
metodo:  [nome(params): retorno]
acao:    [verbo_acao_entidade, igual à rota snake_case do controller C#]
```

Adicionar o método na interface e na implementação seguindo `.claude/rules/frontend/services-di-ioc.md` (sempre `this.execute`/`this.validateResponse`, `{ signal?: AbortSignal }`), sem alterar os métodos existentes.

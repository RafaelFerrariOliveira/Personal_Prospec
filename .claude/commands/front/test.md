# /front:test

Ao receber este comando, gerar o teste em `frontend/tests/<tipo>/` espelhando o caminho do arquivo testado (`.claude/rules/frontend/tests-pattern.md`), nunca ao lado do arquivo fonte.

```
front:test
arquivo:    [caminho do arquivo a testar, em frontend/]
tipo:       [unit|integration]
cenarios:   [happy path, erro, edge case, ou "padrão" para os obrigatórios de tests-pattern.md]
```

Mock só na fronteira (Service injetado), nunca `axios` direto em teste de controller. Ao terminar: rodar o teste gerado dentro de `frontend/` (se as dependências estiverem instaladas) e confirmar que passa.

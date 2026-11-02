# /front:feature

Ao receber este comando, executar `/front:service` e depois `/front:page` em sequência, sem parar, aplicando `.claude/rules/frontend/`. Para features grandes, preferir os comandos separados com `/compact` entre eles, ou a skill `front-gen-feature` (com perguntas guiadas).

```
front:feature [NomeFeature]
rota:       [path] [publica|privada]
menu:       [chave de permissionKeys, se tiver item de menu]
metodos:    [listPaginated, getById, register, update, delete, ...]
controller: [nome em ApiControllers]
```

Ao terminar: listar todos os arquivos criados e, se `frontend/node_modules` existir, rodar `npm run ts:check` dentro de `frontend/`.

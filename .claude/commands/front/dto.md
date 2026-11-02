# /front:dto

Ao receber este comando, gerar o(s) schema(s) Zod sem pedir confirmação. Aplicar `.claude/rules/frontend/dtos-e-validacao.md`.

```
front:dto [NomeFeature]
tipo:   [request|response|ambos]
campos: [campo: tipo, campo?: tipo, ...]
```

Gerar `ZNomeFeatureXxxSchema` + `export type TNomeFeatureXxx = z.infer<typeof ZNomeFeatureXxxSchema>` em `frontend/business/application/dtos/{request,response}/nomeFeature.request.ts` ou `.response.ts`. Id vindo do backend é Guid: usar `ZGuid` de `business/application/validation/apiResponseSchemas.ts` (baseado em `z.guid()`, nunca `z.uuid()`: o Guid sequencial do EF Core nem sempre segue a variante RFC). Se já existir Service para a feature, lembrar de ajustar a assinatura do método correspondente.

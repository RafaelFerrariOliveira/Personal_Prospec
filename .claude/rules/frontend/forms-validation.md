---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/forms-validation.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Formulários (react-hook-form + zod)

## Padrão

- `useForm` com `resolver: zodResolver(ZXxxFormSchema)` — schema sempre em
  `business/application/dtos/request/xxx.request.ts` (o MESMO schema usado
  pelo Service pra montar o request, ver `dtos-e-validacao.md`), nunca um
  schema de form separado do schema de request
- Form grande (mais de ~8 campos) divide em subcomponentes dentro de
  `components/` da própria feature, cada um recebendo `control`/`register`
  via props — nunca um único arquivo de 300+ linhas de JSX de form
- `FormProvider`/`useFormContext` quando o form é composto de vários
  subcomponentes que precisam do mesmo `control`

## Exemplo mínimo

```tsx
const { control, handleSubmit, formState: { errors } } = useForm<TXxxRegisterRequest>({
   resolver: zodResolver(ZXxxRegisterRequestSchema),
   defaultValues,
});
```

- Erro de campo: sempre `errors.campo?.message`, nunca string de erro
  hardcoded na view
- Submit: handler fica no `.controller.tsx` da feature/form (chama o
  Service via `useInjection`), nunca no `.view.tsx`

## Loading/disabled durante submit

Todo botão de submit reflete `formState.isSubmitting` (ou estado próprio de
loading do controller) — nunca permite duplo submit.

## Proibido

- Schema de validação de form duplicado do schema de request do Service —
  um diverge do outro com o tempo
- Validação manual (`if (!value) setError(...)`) em vez de regra no schema
  Zod
- Form não controlado (`ref` direto em input sem `register`/`Controller`)

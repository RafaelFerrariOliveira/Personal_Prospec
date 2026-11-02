---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/solid.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# SOLID aplicado ao frontend

## Single Responsibility
- `.view.tsx` só renderiza; `.controller.tsx` só orquestra lógica; Service só
  fala com a API; Mapper só converte formato — nunca misturar
  responsabilidade entre esses arquivos

## Open/Closed
- Variante visual nova de um componente existente (`Button` com `$style`
  novo) estende a prop, não duplica o componente inteiro

## Liskov Substitution
- Toda implementação de `IXxxService` tem que poder substituir qualquer
  outra sem quebrar quem a usa — se um método precisa de comportamento
  muito diferente, é outra interface, não um `if` escondido

## Interface Segregation
- `IXxxService` expõe só os métodos que a feature realmente usa — não criar
  uma mega-interface genérica de CRUD que toda feature implementa sem usar
  metade

## Dependency Inversion
- Controller de página/componente depende de `IXxxService` (interface),
  nunca de `XxxService` (classe concreta) — a ligação concreta só existe em
  `xxx.container.ts` (ver `services-di-ioc.md`)

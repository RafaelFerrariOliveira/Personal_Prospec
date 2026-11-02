---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/infinite-scroll-pagination.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Scroll Infinito — Páginas e Inputs

Padrão único pra qualquer lista que consome um Service com método de
paginação (`listPaginated`, por baixo chamando o endpoint
`get_all_with_pagination_xxx` — ver `services-di-ioc.md`) e precisa carregar
mais itens ao chegar perto do fim, seja uma tabela/grid de página inteira ou
o dropdown de um input de busca (`inputAutoComplete`/`multiSelect`).

## Hook compartilhado: `useInfiniteScrollQuery`

Um único hook em `src/hooks/useInfiniteScrollQuery.ts`, reaproveitado por
página e por input — nunca duplicar a lógica de acumular página por
feature.

```ts
// src/hooks/useInfiniteScrollQuery.ts
interface UseInfiniteScrollQueryParams<TItem, TFilters> {
   fetchPage: (
      params: { pageNumber: number; pageSize: number; filters: TFilters },
      options: { signal: AbortSignal },
   ) => Promise<{ items: TItem[]; totalPages: number; pageNumber: number }>;
   filters: TFilters;        // reinicia a lista quando muda (ex: termo de busca)
   pageSize?: number;        // default 20
   enabled?: boolean;        // ex: só busca quando o dropdown abre
}

interface UseInfiniteScrollQueryResult<TItem> {
   items: TItem[];
   isLoadingFirstPage: boolean;
   isLoadingMore: boolean;
   hasMore: boolean;
   error: unknown;
   loadMore: () => void;     // chamado pelo sentinel/scroll handler
   reload: () => void;       // refaz da página 1 (ex: botão "tentar de novo")
}
```

### Regras do hook

- Estado interno: `items`, `pageNumber` atual, `totalPages`, flags de
  loading separadas pro primeiro carregamento (`isLoadingFirstPage`,
  mostra skeleton) e pros seguintes (`isLoadingMore`, mostra spinner no
  rodapé da lista — nunca re-renderiza a lista inteira como skeleton)
- `hasMore = pageNumber < totalPages` — `loadMore()` é no-op se `hasMore`
  for `false` ou se já houver uma página carregando (`isLoadingMore`) —
  trava contra disparo duplicado de scroll/observer
- Mudança em `filters` (ex: termo de busca) **reseta** `items`/`pageNumber`
  pra 1, cancela a requisição em andamento (`AbortController` — todo
  Service já aceita `{ signal?: AbortSignal }`, ver `services-di-ioc.md`) e
  busca de novo — nunca concatena resultado de filtro diferente na lista
  acumulada
- Erro em `loadMore` (página 2+) mantém os itens já carregados na tela e
  expõe `error` pra UI mostrar "falhou ao carregar mais, tentar de novo" —
  nunca descarta os itens já exibidos por causa de falha na página seguinte
- Erro na primeira página segue o tratamento padrão de
  `services-di-ioc.md`/`api-integration.md` (propagar, controller decide a
  UI de erro)
- Em `filters` com termo de busca livre: debounce (300ms) aplicado **antes**
  do hook, no controller que monta `filters` — o hook em si não debounce,
  só reage à mudança de valor

## Uso em página/grid (lista de tela inteira)

Chamado dentro do `.controller.tsx` da página (ver
`mvvm-pages-components.md`) — nunca no `.view.tsx`:

```ts
// NomeFeature.controller.tsx
const xxxService = useInjection<IXxxService>(XxxServiceSymbol);

const { items, isLoadingFirstPage, isLoadingMore, hasMore, loadMore, error } =
   useInfiniteScrollQuery({
      fetchPage: ({ pageNumber, pageSize, filters }, { signal }) =>
         xxxService.listPaginated({ pageNumber, pageSize, ...filters }, { signal }),
      filters: appliedFilters,
   });
```

### Sentinel (view)

Detecção de "chegou perto do fim" é sempre via `IntersectionObserver` num
elemento sentinel no fim da lista — nunca listener de `scroll` manual
(`onScroll`/`window.addEventListener('scroll', ...)`) calculando
`scrollTop`/`scrollHeight` à mão.

```tsx
// NomeFeature.view.tsx
<ul>
   {items.map((item) => <ItemRow key={item.id} item={item} />)}
   {hasMore && <div ref={sentinelRef} data-testid="infinite-scroll-sentinel" />}
   {isLoadingMore && <Loading isLoading />}
</ul>
```

O `ref` do sentinel e o `IntersectionObserver` ficam num hook de apoio
(`useIntersectionObserver` ou inline no `.controller.tsx`), chamando
`loadMore()` no callback — view só recebe `sentinelRef` como prop, nunca
instancia o observer ela mesma (ver `mvvm-pages-components.md`: view é
apresentação pura).

## Uso em input com busca paginada (`inputAutoComplete`/`multiSelect`)

Mesmo hook, com duas diferenças:

- `enabled: isDropdownOpen` — não busca nada enquanto o dropdown está
  fechado; reabrir com o mesmo termo reaproveita o estado se ainda válido,
  recarrega do zero se o componente foi desmontado
- Scroll infinito dentro do **container do dropdown** (não da página) — o
  `IntersectionObserver` usa `root: dropdownContainerRef.current`, nunca o
  viewport da página
- `filters` inclui o termo digitado (já debounced no controller do input,
  igual à regra geral acima)

```tsx
// inputAutoComplete.controller.tsx
const { items, isLoadingMore, hasMore, loadMore } = useInfiniteScrollQuery({
   fetchPage: ({ pageNumber, pageSize, filters }, { signal }) =>
      xxxService.listPaginated({ pageNumber, pageSize, search: filters.search }, { signal }),
   filters: { search: debouncedSearchTerm },
   enabled: isOpen,
});
```

## Checklist

- [ ] Nenhuma lista nova com scroll infinito reimplementa acumulação de
      página na mão — sempre via `useInfiniteScrollQuery`
- [ ] Detecção de fim de lista via `IntersectionObserver` num sentinel,
      nunca cálculo manual de `scrollTop`
- [ ] `loadMore` travado contra chamada duplicada (`hasMore` +
      `isLoadingMore` checados antes de disparar)
- [ ] Mudança de filtro cancela requisição em andamento (`AbortSignal`) e
      reinicia da página 1 — nunca mistura itens de filtros diferentes
- [ ] Erro em página 2+ preserva os itens já carregados
- [ ] Busca livre sempre debounced no controller antes de entrar em
      `filters`
- [ ] Input com dropdown usa `root` do `IntersectionObserver` = container
      do dropdown, nunca o viewport da página

## Proibido

- `onScroll` manual com cálculo de `scrollHeight - scrollTop <= clientHeight`
  — sempre `IntersectionObserver`
- `loadMore` chamado sem checar `hasMore`/`isLoadingMore` antes
- Resetar a lista acumulada inteira pra mostrar skeleton ao carregar a
  página 2+ (skeleton é só na primeira carga — depois disso, spinner
  pontual no rodapé)
- Duplicar a lógica de paginação acumulada dentro do `.controller.tsx` de
  cada feature em vez de usar `useInfiniteScrollQuery`

# Selector

Selectors derive state from boxes or other selectors.

```ts
import { selector } from 'amos';

const selectCountLabel = selector((select) => {
  return `Count: ${select(countBox)}`;
});
```

Call a selector factory to create a selector, then pass it to `select` or `useSelector`.

```ts
const label = store.select(selectCountLabel());
```

## Selector Arguments

Selectors can accept arguments.

```ts
const selectTodoTitle = selector((select, id: number) => {
  return select(todoMapBox.getIn(id, 'title'));
});

select(selectTodoTitle(1));
```

The arguments are stored on the selector object. Devtools and cache keys can use them.

## Composing Selectors

Selectors receive the same `select` function as the store.

```ts
const selectCurrentUser = selector((select) => {
  return select(userMapBox.getItem(select(currentUserIdBox)));
});
```

This makes selectors easy to compose without a global root-state type.

## Equality

Selectors can define equality for React updates.

```ts
const selectUserSummary = selector(
  (select, id: number) => {
    const user = select(userMapBox.getItem(id));
    return { id: user.id, name: user.name };
  },
  { equal: shallowEqual },
);
```

Uncached selectors use their `equal` function when `useSelector` decides whether to re-render.

## Cache

Set `cache: true` for expensive selectors or selectors that return reusable objects.

```ts
const selectVisibleTodos = selector(
  (select) => {
    const status = select(todoStatusFilterBox);
    const ids = select(selectUserTodoList());

    return ids.filter((id) => {
      const todo = select(todoMapBox.getItem(id));
      return status === 'All' || todo.completed === (status === 'Completed');
    });
  },
  { cache: true },
);
```

Cached selectors track which boxes and selectors they selected. Amos reuses the cached result while
those dependencies are equal.

## Row Loading

Box selectors can declare which persisted row they read.

```ts
select(todoMapBox.getItem(id));
```

For `MapBox`, `getItem(id)` declares that it loads row `id`. The persistence enhancer can hydrate
that row lazily.

You usually only need to think about `loadRow` when creating custom boxes.

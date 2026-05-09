# Cache

Selectors can opt into dependency-tracked caching.

```ts
const selectVisibleTodos = selector(
  (select) => {
    const filter = select(todoStatusFilterBox);
    const ids = select(selectUserTodoList());

    return ids.filter((id) => {
      const todo = select(todoMapBox.getItem(id));
      return filter === 'All' || todo.completed === (filter === 'Completed');
    });
  },
  { cache: true },
);
```

## How It Works

When a cached selector runs, Amos records every box and selector it selected. On a later select,
Amos checks whether those dependencies still have equal values. If they do, Amos returns the cached
result.

This is useful for selectors that:

- do non-trivial computation
- allocate new objects or shape instances
- combine several boxes
- are read by many components

## Equality

For cached selectors, Amos uses the selector's `equal` function to preserve the previous result when
a recomputation produces an equivalent value.

```ts
const selectSummary = selector(
  (select) => ({
    count: select(todoListBox).length,
    filter: select(todoStatusFilterBox),
  }),
  {
    cache: true,
    equal: shallowEqual,
  },
);
```

For boxes and cached selectors, dependency comparison uses strict identity. For uncached selectors
in React, `useSelector` uses the selector's `equal` function.

## Cache Keys

Selector arguments are part of the cache key.

```ts
const selectTodo = selector(
  (select, id: number) => {
    return select(todoMapBox.getItem(id));
  },
  { cache: true },
);

select(selectTodo(1));
select(selectTodo(2));
```

These are separate cached reads.

## When Not To Cache

Do not cache selectors that are cheap and return primitives unless caching makes the calling code
clearer. Also be careful with function arguments. A selector that accepts a new callback every
render will usually miss the cache.

```ts
// Usually not worth caching.
const selectIsOpen = selector((select) => select(openBox));
```

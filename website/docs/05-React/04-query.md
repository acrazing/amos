# Query

`useQuery` dispatches an action and tracks its async status.

```tsx
const [todos, result] = useQuery(loadTodos(userId));

if (result.isPending()) {
  return <Loading />;
}

if (result.isRejected()) {
  return <ErrorView error={result.error} />;
}

return <TodoList todos={todos} />;
```

## Query Result

The second tuple value is a `QueryResult`.

```ts
result.status; // 'pending' | 'fulfilled' | 'rejected'
result.value;
result.error;

result.isPending();
result.isFulfilled();
result.isRejected();
```

If the action is not bound to a selector, the first tuple value is the fulfilled action result.

## Selectable Actions

For data that is stored in Amos boxes, bind the action to a selector.

```ts
const loadTodos = action(async (dispatch, select, userId: number) => {
  const todos = await api.getTodos(userId);
  dispatch(todoMapBox.mergeAll(todos));
}).select(selectVisibleTodos);
```

Then `useQuery` returns selected store state as the first tuple value.

```tsx
const [visibleTodos, result] = useQuery(loadTodos(userId));
```

This lets UI keep showing the current selected state while a refresh is pending.

## Re-Dispatching

`useQuery` computes a key from the action and its conflict key. When the key changes, the hook
dispatches again.

```ts
const loadTodos = action(fetchTodos, {
  conflictKey: (select, userId: number) => userId,
});
```

## Suspense

Use `useSuspenseQuery` when you want React Suspense semantics.

```tsx
function Todos({ userId }: { userId: number }) {
  const todos = useSuspenseQuery(loadTodos(userId));
  return <TodoList todos={todos} />;
}
```

If pending, it throws the promise. If rejected, it throws the error. If fulfilled, it returns the
value.

Use it inside `<Suspense>` and an error boundary.

## SSR Notes

When using query state with SSR, give actions stable `key` values.

```ts
const loadUser = action(fetchUser, {
  key: 'users/loadUser',
  conflictKey: (select, userId) => userId,
});
```

This lets Amos match server-rendered query state on the client.

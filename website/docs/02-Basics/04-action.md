# Action

Actions are dispatchable workflows. They receive `dispatch`, `select`, and their own arguments.

```ts
import { action } from 'amos';

const addTodo = action(async (dispatch, select, title: string) => {
  const todo = await api.createTodo({
    userId: select(currentUserIdBox),
    title,
  });

  dispatch([todoMapBox.mergeItem(todo), userTodoListBox.unshiftIn(todo.userId, todo.id)]);
});
```

Dispatch an action by calling the action factory.

```ts
await dispatch(addTodo('Write docs'));
```

## When To Use Actions

Use actions for:

- async work
- updating several boxes together
- reading current state before deciding what to dispatch
- workflows that should appear as one debug action

Use box mutations directly for simple local updates.

## Return Values

`dispatch(action())` returns whatever the action actor returns.

```ts
const loadUser = action(async () => {
  return api.getUser();
});

const user = await dispatch(loadUser());
```

If an action dispatches a mutation and returns it, the dispatch result is the mutation result.

## Batched Updates

Actions can dispatch arrays.

```ts
dispatch([todoMapBox.mergeItem(todo), userTodoListBox.unshiftIn(todo.userId, todo.id)]);
```

The store notifies subscribers once after the root dispatch completes.

## Conflict Policy

Actions support a leading concurrency mode.

```ts
const loadTodos = action(
  async (dispatch, select, userId: number) => {
    return api.getTodos(userId);
  },
  {
    conflictPolicy: 'leading',
    conflictKey: (select, userId) => userId,
  },
);
```

When a matching action is already pending, Amos returns the existing promise instead of starting
another one.

The default policy is `always`.

## Selectable Actions

Bind an action to a selector or box with `.select`.

```ts
const getTodoList = action(async (dispatch, select) => {
  const todos = await api.getTodos(select(currentUserIdBox));
  dispatch(todoMapBox.mergeAll(todos));
}).select(selectVisibleTodos);
```

`useQuery` uses the bound selector to return useful store state while the action is pending or after
it completes.

## Type Labels

The `type` option labels actions for devtools.

```ts
const signIn = action(async () => {}, {
  type: 'users/signIn',
});
```

You can write it manually or use the Amos compiler transformer.

# Batch

Amos supports batched dispatch and batched select by default.

```ts
dispatch([countBox.add(1), modalOpenBox.close()]);

const [count, modalOpen] = select([countBox, modalOpenBox]);
```

This behavior comes from the built-in batch enhancer.

## Batched Dispatch

When you dispatch an array, Amos dispatches each item in order and returns an array of results.

```ts
const [nextCount, nextOpen] = dispatch([countBox.add(1), modalOpenBox.close()]);
```

Subscribers are notified once after the root dispatch completes.

```ts
store.subscribe(() => {
  console.log('called once');
});

store.dispatch([countBox.add(1), countBox.add(1)]);
```

This is useful when one workflow updates several boxes.

## Batched Select

You can select an array of boxes or selectors.

```ts
const [userId, filter, visibleTodos] = select([
  currentUserIdBox,
  todoStatusFilterBox,
  selectVisibleTodos(),
]);
```

The return type preserves tuple order.

## Batch Inside Actions

Actions often use batched dispatch to keep related updates together.

```ts
const addTodo = action(async (dispatch, select, title: string) => {
  const todo = await api.createTodo(title);

  dispatch([todoMapBox.mergeItem(todo), userTodoListBox.unshiftIn(todo.userId, todo.id)]);
});
```

The action still appears as the root dispatch in devtools, with nested mutations inside it.

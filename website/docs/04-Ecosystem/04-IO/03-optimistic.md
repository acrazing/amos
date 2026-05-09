# Optimistic

:::warning Experimental

The optimistic enhancer is currently a placeholder.

:::

The public API exists:

```ts
import { withOptimistic } from 'amos';
```

But the implementation currently returns a pass-through store enhancer. It does not yet record,
rollback, or reconcile optimistic mutations.

For now, write optimistic workflows manually in actions:

```ts
const renameTodo = action(async (dispatch, select, id: number, title: string) => {
  const previous = select(todoMapBox.getItem(id));

  dispatch(todoMapBox.mergeItem(id, { title }));

  try {
    await api.renameTodo(id, title);
  } catch (error) {
    dispatch(todoMapBox.setItem(id, previous));
    throw error;
  }
});
```

This page will need to be rewritten when `withOptimistic` is implemented.

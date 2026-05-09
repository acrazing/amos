# Dispatch

Use `useDispatch` to dispatch mutations, actions, and signals from React.

```tsx
import { useDispatch } from 'amos/react';

function CounterButton() {
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(countBox.add(1))}>+</button>;
}
```

`useDispatch` returns `store.dispatch`.

## Dispatching Actions

```tsx
function AddTodoForm() {
  const dispatch = useDispatch();

  async function submit(title: string) {
    await dispatch(addTodo(title));
  }
}
```

The return value is the action result, so you can `await` async actions.

## Dispatching Arrays

```tsx
dispatch([filterBox.setState('All'), modalOpenBox.close()]);
```

Array dispatch is batched by the store. React subscribers update once after the root dispatch
finishes.

## Stable Reference

`useDispatch` returns the dispatch function from the current store. If the store instance does not
change, the dispatch function is stable.

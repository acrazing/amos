# Select

Use `useSelector` to read Amos state in React.

```tsx
const count = useSelector(countBox);
```

You can select boxes, selectors, or arrays.

```tsx
const label = useSelector(selectCountLabel());
const [count, open] = useSelector([countBox, modalOpenBox]);
```

## Dependency Tracking

During render, `useSelector` records what you select. After store updates, the component re-renders
only if one of those dependencies changes.

```tsx
function TodoItem({ id }: { id: number }) {
  const todo = useSelector(todoMapBox.getItem(id));
  return <div>{todo.title}</div>;
}
```

This component depends on the selected todo row, not the whole application state.

## Selector Function Form

Call `useSelector()` with no argument to get a select function.

```tsx
function TodoSummary() {
  const select = useSelector();

  const ids = select(selectVisibleTodos());
  const count = ids.length;

  return <span>{count}</span>;
}
```

Every read through that function during render is tracked.

## Equality

Boxes compare by strict identity. Selectors can define custom equality.

```ts
const selectSummary = selector(
  (select) => ({
    count: select(todoListBox).length,
  }),
  { equal: shallowEqual },
);
```

Use selector equality or caching when derived values allocate objects.

## Effects And Event Handlers

Reads outside render are not tracked for re-rendering.

```tsx
const select = useSelector();

function logCurrent() {
  console.log(select(countBox));
}
```

This is fine for event handlers, but render output should read during render so React can subscribe
correctly.

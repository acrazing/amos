# Box

A box is a state node with a unique key and typed operations.

```ts
const countBox = numberBox('count');
const userBox = objectBox('user', { id: 0, name: '' });
```

## Choosing A Box

Pick the box that matches the state structure.

```ts
numberBox('count');
boolBox('modal.open');
arrayBox<string>('names');
objectBox('settings', { theme: 'system' });
listBox<number>('todo.ids');
mapBox('names.byId', 0, '');
recordBox('user', UserRecord);
recordMapBox('todos', TodoRecord, 'id');
listMapBox('todos.byUser', 0, 0);
mapMapBox('matrix', 'row', 'column', 0);
```

Each box exposes mutations and selectors that match the shape. A `NumberBox` has `add`; a
`RecordMapBox` has `mergeItem`; a `ListMapBox` has `pushIn`.

## Initial State

Boxes define their initial state.

```ts
const countBox = numberBox('count', 10);
```

Some boxes accept constructors or infer-only arguments for TypeScript.

```ts
class TodoRecord extends Record<Todo>({
  id: 0,
  title: '',
  completed: false,
}) {}

const todoMapBox = recordMapBox('todos', TodoRecord, 'id');
```

## Updating State

Box methods create mutations.

```ts
dispatch(countBox.add(1));
dispatch(userBox.set('name', 'Ada'));
dispatch(todoMapBox.mergeItem({ id: 1, title: 'Write docs' }));
```

The base `setState` mutation is available on every box.

```ts
dispatch(countBox.setState(0));
dispatch(countBox.setState((count) => count + 1));
dispatch(countBox.setState()); // reset to initial state
```

## Selecting State

Pass a box to `select` to read its full state.

```ts
const count = select(countBox);
```

Box-specific selector methods derive smaller values.

```ts
const title = select(todoMapBox.getIn(1, 'title'));
const exists = select(todoMapBox.hasItem(1));
```

## Configuring Boxes

Use `config` for box options such as persistence.

```ts
const settingsBox = objectBox('settings', {
  theme: 'system',
}).config({
  persist: { version: 1 },
});
```

Use `setInitialState` when you want to derive or extend the initial state.

```ts
const userMapBox = recordMapBox('users', UserRecord, 'id').setInitialState((state) => {
  return state.mergeItem({ id: 1, name: 'Amos' });
});
```

## Responding To Signals

Boxes can subscribe to signals and update themselves.

```ts
userMapBox.subscribe(signOutSignal, (state, event) => {
  return event.keepData ? state : state.deleteItem(event.userId);
});
```

This is useful for cleanup and cross-module events.

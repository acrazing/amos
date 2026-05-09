# Concepts

Amos is built around a small set of concepts: store, box, mutation, selector, action, and signal.

## Store

The store owns application state.

```ts
const store = createStore();
```

It has four public methods:

```ts
store.select(countBox);
store.dispatch(countBox.add(1));
store.snapshot();
store.subscribe(() => {});
```

Most applications use the store through React hooks, but the store itself has no React dependency.

## Box

A box is a named state node.

```ts
const countBox = numberBox('count');
```

The key must be unique. The box decides:

- how the state is initialized
- which mutations can update it
- which selectors can read derived values
- whether and how it can be persisted

Boxes are decentralized. You do not define one central reducer or one central state schema.

## Mutation

A mutation is a dispatchable object created by a box method.

```ts
dispatch(countBox.add(1));
dispatch(countBox.setState(10));
```

Mutations are synchronous. They receive the current state for one box and return the next state for
that box.

## Selector

A selector derives a value from boxes or other selectors.

```ts
const selectDouble = selector((select) => {
  return select(countBox) * 2;
});

select(selectDouble());
```

Selectors are explicit objects. They can carry debug labels, equality functions, cache options, and
persistence row-loading metadata.

## Action

An action is a dispatchable function with access to `dispatch` and `select`.

```ts
const incrementLater = action(async (dispatch, select, amount: number) => {
  await delay(100);
  dispatch(countBox.add(amount));
});
```

Actions are the right place for async work, coordination across boxes, and workflows that dispatch
several mutations.

## Signal

A signal is a dispatchable event.

```ts
const signOutSignal = signal<{ userId: number }>('user.signOut');

signOutSignal.subscribe((dispatch, select, data) => {
  dispatch(currentUserIdBox.setState(0));
});

dispatch(signOutSignal({ userId: 1 }));
```

Signals decouple modules. One feature can publish that something happened, and other boxes or
modules can react without importing the original action.

## Shapes

Amos ships immutable data structures such as `List`, `Map`, `Record`, `RecordMap`, `ListMap`, and
`MapMap`.

Boxes use these shapes to expose state-specific methods.

```ts
const todosBox = recordMapBox('todos', TodoRecord, 'id');

dispatch(todosBox.mergeItem({ id: 1, title: 'Read docs' }));
select(todosBox.getItem(1));
```

This is the main Amos design difference: instead of writing one-off reducers for each state node,
you pick a box whose operations match the state structure.

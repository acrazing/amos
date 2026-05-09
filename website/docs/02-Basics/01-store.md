# Store

The store is the runtime container for Amos state.

```ts
import { createStore } from 'amos';

const store = createStore();
```

In React apps, you usually create one store and pass it to `<Provider />`.

```tsx
<Provider store={store}>
  <App />
</Provider>
```

## Selecting State

Use `select` to read a box or selector.

```ts
const count = store.select(countBox);
const label = store.select(selectCountLabel());
```

Selecting a box mounts it lazily. On first select, Amos stores the box initial state in the store
snapshot.

```ts
const countBox = numberBox('count', 1);

store.snapshot(); // {}
store.select(countBox); // 1
store.snapshot(); // { count: 1 }
```

## Dispatching Updates

Use `dispatch` to apply mutations, actions, and signals.

```ts
store.dispatch(countBox.add(1));
store.dispatch(loadUser(1));
store.dispatch(signOutSignal({ userId: 1 }));
```

Dispatch returns the value produced by the dispatchable. A mutation returns the new box state. An
action returns whatever its actor returns.

## Batch Dispatch And Select

Arrays are supported by the built-in batch enhancer.

```ts
store.dispatch([countBox.add(1), openBox.close()]);

const [count, open] = store.select([countBox, openBox]);
```

Subscribers are notified once after the root dispatch finishes.

## Snapshot

```ts
const snapshot = store.snapshot();
```

The snapshot is the internal state object keyed by box key. Treat it as read-only. It is useful for
SSR, persistence, debugging, and tests.

## Subscribe

```ts
const unsubscribe = store.subscribe(() => {
  console.log(store.snapshot());
});

unsubscribe();
```

The listener runs after a root dispatch completes. Nested dispatches do not notify until control
returns to the root dispatch.

## Store Options

```ts
const store = createStore({
  name: 'My app',
  devtools: true,
  preloadedState: {
    count: 10,
  },
});
```

`name` labels the store in devtools.

`devtools` controls Redux DevTools integration.

`preloadedState` is JSON-like state keyed by box key. Amos converts it back to the shape of the
initial state when a box mounts.

## Custom Enhancers

You can pass store enhancers after options.

```ts
const store = createStore({}, withPersist({ storage }));
```

Amos applies its built-in enhancers first, then your custom enhancers.

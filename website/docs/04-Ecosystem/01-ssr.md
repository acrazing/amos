# SSR

Amos supports server rendering through store snapshots and preloaded state.

The basic pattern is:

1. create a store on the server
2. dispatch or select the data needed for the page
3. serialize `store.snapshot()`
4. create a client store with `preloadedState`

## Server

```tsx
const store = createStore();

await store.dispatch(loadCurrentUser());
await store.dispatch(loadTodos());

const html = renderToString(
  <Provider store={store}>
    <App />
  </Provider>,
);

const state = store.snapshot();
```

The snapshot is JSON-like when your state shapes implement `toJSON`, as Amos shapes do.

## Client

```ts
const store = createStore({
  preloadedState: window.__AMOS_STATE__,
});
```

When a box first mounts, Amos checks `preloadedState` for the box key and converts the value back
with the shape of the box initial state.

## Query State

`useQuery` stores query state in an internal `amos.queries` box. Fulfilled and rejected query
results can be serialized. Pending query results are omitted from JSON output.

For SSR with `useQuery`, give actions stable keys.

```ts
const loadUser = action(
  async (dispatch, select, userId: number) => {
    const user = await api.getUser(userId);
    dispatch(userMapBox.mergeItem(user));
    return user;
  },
  {
    key: 'users/loadUser',
    conflictKey: (select, userId) => userId,
  },
);
```

The `key` lets Amos match server query state to the same action on the client.

## Per-Request Stores

Create a new store per request. Do not share a server store between users.

Boxes are module-level definitions, but store state belongs to a store instance. That makes it safe
to reuse box definitions across requests as long as each request creates its own store.

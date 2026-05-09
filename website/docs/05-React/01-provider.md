# Provider

React apps use `<Provider />` to put an Amos store in context.

```tsx
import { createStore } from 'amos';
import { Provider } from 'amos/react';

const store = createStore();

export function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
```

All Amos React hooks read this context.

## Store Lifetime

For client-only apps, create the store once at module scope.

```ts
const store = createStore();
```

For SSR, create one store per request on the server and one hydrated store on the client.

## Missing Provider

`useStore`, `useDispatch`, `useSelector`, and query hooks throw if they are used outside
`<Provider />`.

This is intentional: hooks need a specific store instance.

## Multiple Stores

You can nest providers if you intentionally want separate stores.

```tsx
<Provider store={outerStore}>
  <Shell />
  <Provider store={innerStore}>
    <Preview />
  </Provider>
</Provider>
```

Hooks use the nearest provider.

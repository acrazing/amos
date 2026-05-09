# Setup

Amos is published as a single package:

```bash npm2yarn
npm install amos
```

The default entry exports the store, core primitives, built-in boxes, shapes, persistence, and
utilities.

```ts
import { createStore, numberBox, selector } from 'amos';
```

React bindings live in a subpath:

```ts
import { Provider, useDispatch, useSelector } from 'amos/react';
```

## TypeScript

Amos is written in TypeScript and works best with strict typing enabled. The library exposes typed
boxes and selectors, so most application state types flow from the box definition.

```ts
const countBox = numberBox('count');

const selectLabel = selector((select) => {
  return `Count: ${select(countBox)}`;
});
```

## React

Create one store and pass it to `<Provider />`.

```tsx
import { createStore } from 'amos';
import { Provider } from 'amos/react';
import { createRoot } from 'react-dom/client';

const store = createStore();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

## Devtools

Amos can talk to a Redux DevTools-compatible browser extension.

```ts
const store = createStore({
  name: 'My app',
  devtools: true,
});
```

If `devtools` is omitted, Amos enables devtools only when `NODE_ENV` is `development` and a
compatible extension is present.

## Compiler Transformers

Actions and selectors accept a `type` option used by devtools and debugging. You can write it
manually:

```ts
const loadUser = action(async () => {}, {
  type: 'users/loadUser',
});
```

Amos also includes Babel and TypeScript transformers that add `type` from the variable name.

```ts
import { amosBabelPlugin } from 'amos/babel';
import { createAmosTransformer } from 'amos/typescript';
```

For example, the transformer can turn:

```ts
const loadUser = action(async () => {});
```

into:

```ts
const loadUser = action(async () => {}, { type: 'loadUser' });
```

The repository uses the TypeScript transformer in Jest and the Rollup build with the prefix `amos/`.

## Persistence Storage

If you use persistence, install no extra Amos package. Choose a storage engine and pass
`withPersist` when creating the store.

```ts
import { createStore, IDBStorage, withPersist } from 'amos';

const store = createStore(
  {},
  withPersist({
    storage: new IDBStorage('app', 'persist'),
  }),
);
```

See [Persistence](../04-Ecosystem/02-persistence.md) for the guide and
[Persistence API](../08-API/03-persistence.md) for storage details.

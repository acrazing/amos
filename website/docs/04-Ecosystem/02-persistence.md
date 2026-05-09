# Persistence

Persistence is provided by the `withPersist` store enhancer.

```ts
import { createStore, IDBStorage, withPersist } from 'amos';

const store = createStore(
  {},
  withPersist({
    storage: new IDBStorage('app', 'persist'),
  }),
);
```

## Opting Boxes In

By default, persistence follows each box's `persist` option.

```ts
const settingsBox = objectBox('settings', {
  theme: 'system',
}).config({
  persist: { version: 1 },
});
```

If you pass `includes`, it decides which boxes are persisted.

```ts
const store = createStore(
  {},
  withPersist({
    storage,
    includes: (box) => !box.key.startsWith('ui.'),
  }),
);
```

`excludes` has priority over `includes`.

Internal boxes whose keys start with `amos.` are not persisted.

## Lazy Hydration

Persisted boxes hydrate lazily when selected.

```ts
const settings = select(settingsBox);
```

If the box has no preloaded state and has not been hydrated yet, Amos schedules a hydrate operation.

You can also wait for hydration explicitly:

```ts
await dispatch(hydrate([settingsBox]));
```

## Row-Level Hydration

Map-like boxes are table boxes. They can persist and hydrate rows independently.

```ts
const todoMapBox = recordMapBox('todos', TodoRecord, 'id').config({
  persist: { version: 1 },
});

const todo = select(todoMapBox.getItem(todoId));
```

`getItem(todoId)` tells persistence which row is being read. Amos can hydrate just that row instead
of the whole map.

You can explicitly hydrate rows:

```ts
await dispatch(hydrate([[todoMapBox, todoId]]));
await dispatch(hydrate([[todoMapBox, [1, 2, 3]]]));
```

## Versions And Migrations

Persisted values include a version.

```ts
const userBox = recordBox('user', UserRecord).config({
  persist: {
    version: 2,
    migrate: action((dispatch, select, version, row, state) => {
      if (version === 1) {
        return { ...state, displayName: state.name };
      }
      return state;
    }),
  },
});
```

Migration returns JSON-like state. Amos then restores it through the box initial state shape.

## Storage Engines

Built-in engines:

- `MemoryStorage` for tests
- `SimpleStorage` for Web Storage or AsyncStorage-style drivers
- `IDBStorage` for IndexedDB
- `SQLiteStorage` for SQLite-style async drivers

See [Persistence API](../08-API/03-persistence.md) for constructor details.

# Persistence

```ts
import {
  hydrate,
  IDBStorage,
  MemoryStorage,
  SimpleStorage,
  SQLiteStorage,
  withPersist,
  type PersistOptions,
  type StorageEngine,
} from 'amos';
```

The persistence API is implemented by `amos-persist`. It adds lazy hydration and automatic
persistence to a store through a store enhancer.

## `withPersist`

```ts
function withPersist(options: PersistOptions & { storage: StorageEngine }): StoreEnhancer;
```

Adds persistence to a store.

```ts
const store = createStore(
  {},
  withPersist({
    storage: new SimpleStorage('amos:', localStorage),
  }),
);
```

Persistence is opt-in per box unless `includes` is provided.

```ts
const settingsBox = objectBox('settings', {
  theme: 'system',
}).config({
  persist: { version: 1 },
});
```

When a persisted box is selected, Amos schedules hydration if needed. When the store changes, Amos
schedules persistence of changed values.

## `PersistOptions`

```ts
interface PersistOptions {
  storage: StorageEngine;
  includes?: (box: Box) => boolean;
  excludes?: (box: Box) => boolean;
  onError: (error: unknown) => void;
}
```

`storage` is the persistence backend.

`includes` decides whether a box should be persisted. If omitted, Amos persists boxes whose
`box.persist` option is set.

`excludes` has priority over `includes`.

`onError` receives async hydration/persistence errors. `withPersist` defaults to logging
`[Amos]: failed to persist.`

Boxes with `persist: false` are never persisted. Internal boxes whose keys start with `amos.` are
also skipped.

## `BoxPersistOptions`

```ts
interface BoxPersistOptions<S> {
  version: number;
  migrate?: ActionFactory<[version: number, row: ID, state: any]>;
}
```

`version` is stored with the persisted value. When the stored version differs from the current
version, Amos calls `migrate` if present.

The migration action should return JSON-like state that can be merged into the box state by
`fromJS`; it should not return a live state instance directly.

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

## `hydrate`

```ts
const hydrate: ActionFactory<[keys: readonly PersistKey<any>[]], Promise<void>>;
```

Ensures that boxes or table rows have been hydrated.

```ts
await dispatch(hydrate([settingsBox]));
await dispatch(hydrate([[todoMapBox, 123]]));
await dispatch(hydrate([[todoMapBox, [1, 2, 3]]]));
```

`hydrate` requires `withPersist`; otherwise it throws `persist middleware is not enabled`.

## Persist Keys

```ts
type PersistRowKey<T> = readonly [box: Box<T>, rows: ID | ID[]];
type PersistKey<T> = Box<T> | PersistRowKey<T>;
```

For normal boxes, pass the box. For table boxes, pass `[box, rowId]` or `[box, rowIds]`.

## Table Boxes

Boxes can expose `table` options so persistence stores rows separately. `MapBox` and boxes derived
from it provide table options automatically.

When a selector defines `loadRow`, `withPersist` can hydrate only that row:

```ts
select(todoMapBox.getItem(todoId));
```

For `MapBox`, this corresponds to storage keys like:

```txt
todos:123
```

The whole table prefix is represented by a trailing delimiter:

```txt
todos:
```

## `StorageEngine`

```ts
interface StorageEngine {
  init?(): Promise<void>;
  getMulti(items: readonly string[]): Promise<readonly (PersistValue | null)[]>;
  getPrefix(prefix: string): Promise<readonly PersistEntry[]>;
  setMulti(items: readonly PersistEntry[]): Promise<void>;
  deleteMulti(items: readonly string[]): Promise<void>;
  deletePrefix(prefix: string): Promise<void>;
}
```

Storage engines read and write persisted entries.

```ts
type PersistValue = readonly [version: number, value: any];
type PersistEntry = readonly [key: string, version: number, value: any];
```

## `MemoryStorage`

```ts
class MemoryStorage implements StorageEngine;
```

Stores data in an in-memory object. Useful for tests.

```ts
const storage = new MemoryStorage();
```

## `SimpleStorage`

```ts
class SimpleStorage implements StorageEngine {
  constructor(prefix: string, driver: SimpleStorageDriver);
}
```

Wraps Web Storage-compatible and React Native AsyncStorage-compatible drivers.

```ts
const storage = new SimpleStorage('amos:', localStorage);
```

### `SimpleStorageDriver`

```ts
interface SimpleStorageDriver {
  length?: number;
  getItem(key: string): ValueOrPromise<string | null>;
  setItem(key: string, value: string): ValueOrPromise<void>;
  removeItem(key: string): ValueOrPromise<void>;
  key?(index: number): string | null;
  getAllKeys?(): ValueOrPromise<readonly string[]>;
}
```

`getAllKeys` is used when available. Otherwise `length` and `key(index)` are used to scan keys by
prefix.

## `IDBStorage`

```ts
class IDBStorage implements StorageEngine {
  constructor(database: string, table: string);
}
```

Stores data in IndexedDB. `init()` opens the database and creates an object store with key path
`key`.

```ts
const storage = new IDBStorage('amos', 'persist');
```

## `SQLiteStorage`

```ts
interface SQLiteDatabase {
  runAsync(sql: string, values?: any[]): Promise<void>;
  getAllAsync<T>(sql: string, values?: any[]): Promise<T[]>;
}

class SQLiteStorage implements StorageEngine {
  constructor(database: string, table: string, open: (db: string) => Promise<SQLiteDatabase>);
}
```

Stores data in SQLite. `init()` opens the database, enables WAL mode, and creates the persistence
table if it does not exist.

```ts
const storage = new SQLiteStorage('app.db', 'amos_persist', openDatabaseAsync);
```

The table contains:

```sql
key TEXT PRIMARY KEY,
version INTEGER NOT NULL,
value TEXT
```

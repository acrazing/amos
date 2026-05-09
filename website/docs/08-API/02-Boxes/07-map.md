# Map

```ts
import { Map, mapBox, type MapBox } from 'amos';
```

`MapBox` stores an Amos `Map`, a typed immutable key/value structure. It is also the base for
`RecordMapBox`, `ListMapBox`, and `MapMapBox`.

```ts
const userNameBox = mapBox('users.names', 0, '');

dispatch(userNameBox.setItem(1, 'Ada'));
dispatch(userNameBox.setAll({ 2: 'Grace' }));
select(userNameBox.getItem(1));
```

## `Map`

```ts
class Map<K extends ID, V> {
  constructor(readonly defaultValue: V);
}
```

Methods:

```ts
toJSON(): Record<K, V>;
fromJS(state: JSONState<Record<K, V>>): this;
size(): number;
hasItem(key: K): boolean;
getItem(key: K): V;
reset(data: PartialRecord<K, V>): this;
setItem(key: K, item: V): this;
setAll(items: PartialDictionary<K, V> | ArraySource<Entry<K, V>>): this;
mergeItem(key: K, props: WellPartial<V>): this;
mergeAll(items: PartialDictionary<K, WellPartial<V>> | ArraySource<Entry<K, WellPartial<V>>>): this;
updateItem(key: K, updater: (v: V) => V): this;
updateAll(updater: (v: V, key: ToString<K>) => V): this;
deleteItem(key: K): this;
deleteAll(keys: Iterable<K> | readonly K[]): this;
clear(): this;
entries(): IterableIterator<[ToString<K>, V]>;
keys(): IterableIterator<ToString<K>>;
values(): IterableIterator<V>;
```

`getItem` returns `defaultValue` when the key is missing.

`mergeItem` and `mergeAll` are intended for non-array object values. Built-in objects such as `Date`
and native `Map` are not deeply merged.

```ts
function implementMapDelegations<T, PT = {}>(
  ctor: Constructor<T, any[]>,
  mutations: Record<string, 'get' | 'set'>,
  parent?: Constructor<PT, any[]>,
): void;
```

`implementMapDelegations` is the helper used by `RecordMap`, `ListMap`, and `MapMap` to create
methods such as `setIn`, `getIn`, and `deleteItemIn`. A delegated mutation reads the child value,
calls the child method, then writes it back. A delegated selector reads the child value and returns
the child method result.

## `mapBox`

```ts
function mapBox<K, V>(key: string, inferKey: K, defaultValue: V): MapBox<Map<IDOf<K>, V>>;
```

`inferKey` is used for TypeScript inference. The runtime default value for missing items is
`defaultValue`.

## Mutations

```ts
setItem(key: K, item: V): Mutation<Map<K, V>>;
setAll(items: PartialDictionary<K, V> | ArraySource<Entry<K, V>>): Mutation<Map<K, V>>;
mergeItem(key: K, props: WellPartial<V>): Mutation<Map<K, V>>;
mergeAll(items: PartialDictionary<K, WellPartial<V>> | ArraySource<Entry<K, WellPartial<V>>>): Mutation<Map<K, V>>;
updateItem(key: K, updater: (v: V) => V): Mutation<Map<K, V>>;
updateAll(updater: (v: V, key: string) => V): Mutation<Map<K, V>>;
deleteItem(key: K): Mutation<Map<K, V>>;
deleteAll(keys: Iterable<K> | readonly K[]): Mutation<Map<K, V>>;
clear(): Mutation<Map<K, V>>;
reset(data: PartialRecord<K, V>): Mutation<Map<K, V>>;
```

## Selectors

```ts
getItem(key: K): Selector<any, V>;
hasItem(key: K): Selector<any, boolean>;
size(): Selector<[], number>;
```

`getItem` declares `loadRow`, so persistence can hydrate the requested row before or while it is
selected.

## Persistence

`MapBox` is configured as a table box:

```ts
table: {
  toRows: (state) => state.toJSON(),
  hasRow: (state, key) => state.hasItem(key),
  getRow: (state, key) => state.getItem(key),
  hydrate: (state, rows) => state.setAll(state.fromJS(rows).toJSON()),
}
```

That allows `withPersist` to store and hydrate individual map entries.

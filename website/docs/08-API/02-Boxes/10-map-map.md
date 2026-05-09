# MapMap

```ts
import { Map, MapMap, mapMapBox, type MapMapBox } from 'amos';
```

`MapMapBox` stores a `MapMap`, a map whose values are Amos `Map` instances. Use it for two-level
keyed state.

```ts
const matrixBox = mapMapBox('matrix', 'row', 'column', 0);

dispatch(matrixBox.setItemIn('a', 'x', 1));
dispatch(matrixBox.updateItemIn('a', 'x', (value) => value + 1));
select(matrixBox.getItemIn('a', 'x')); // 2
```

## `MapMap`

```ts
class MapMap<K extends ID, M extends Map<any, any>> extends Map<K, M>
```

`MapMap` supports all `Map` methods and delegated inner-map methods. Methods ending in `In` operate
on the inner map at the outer key.

Mutation-style delegated methods:

```ts
setItemIn(outerKey, innerKey, value): this;
setAllIn(outerKey, items): this;
mergeItemIn(outerKey, innerKey, props): this;
mergeAllIn(outerKey, items): this;
updateItemIn(outerKey, innerKey, updater): this;
updateAllIn(outerKey, updater): this;
deleteItemIn(outerKey, innerKey): this;
deleteAllIn(outerKey, innerKeys): this;
clearIn(outerKey): this;
resetIn(outerKey, data): this;
```

Selector-style delegated methods:

```ts
getItemIn(outerKey, innerKey): V;
hasItemIn(outerKey, innerKey): boolean;
sizeIn(outerKey): number;
entriesIn(outerKey): IterableIterator<[string, V]>;
keysIn(outerKey): IterableIterator<string>;
valuesIn(outerKey): IterableIterator<V>;
```

`setItem` and `setAll` accept inner `Map` instances, plain dictionaries, or arrays of entries.
Non-map values are converted by resetting the default inner map.

## `mapMapBox`

```ts
function mapMapBox<KO, KI, V>(
  key: string,
  outerKey: KO & ID,
  innerKey: KI & ID,
  defaultValue: V,
): MapMapBox<MapMap<IDOf<KO>, Map<IDOf<KI>, V>>>;
```

`outerKey` and `innerKey` are used for TypeScript inference. `defaultValue` is the inner map default
value.

## Mutations

`MapMapBox` includes `MapBox` mutations and the delegated `In` mutations listed above.

```ts
setItemIn(outerKey: KO, innerKey: KI, value: V): Mutation<MapMap<KO, Map<KI, V>>>;
updateItemIn(outerKey: KO, innerKey: KI, updater: (value: V) => V): Mutation<MapMap<KO, Map<KI, V>>>;
deleteItemIn(outerKey: KO, innerKey: KI): Mutation<MapMap<KO, Map<KI, V>>>;
clearIn(outerKey: KO): Mutation<MapMap<KO, Map<KI, V>>>;
```

## Selectors

```ts
getItemIn(outerKey: KO, innerKey: KI): Selector<any, V>;
hasItemIn(outerKey: KO, innerKey: KI): Selector<any, boolean>;
sizeIn(outerKey: KO): Selector<any, number>;
```

# Object

```ts
import { objectBox, type ObjectBox } from 'amos';
```

`ObjectBox` stores a readonly plain object and provides shallow object updates.

```ts
const settingsBox = objectBox('settings', {
  theme: 'system',
  compact: false,
});

dispatch(settingsBox.set('compact', true));
dispatch(settingsBox.mergeState({ theme: 'dark' }));
select(settingsBox.get('theme'));
select(settingsBox.pick('theme', 'compact'));
```

## `objectBox`

```ts
function objectBox<T extends object>(key: string, initialState: ValueOrFunc<T>): ObjectBox<T>;
```

## State

```ts
ObjectBox<T> extends Box<Readonly<T>>
```

## Mutations

```ts
mergeState(state: ValueOrFunc<Partial<Readonly<T>>, [Readonly<T>]>): Mutation<Readonly<T>>;
set<K extends keyof T>(key: K, value: T[K]): Mutation<T>;
```

`mergeState` shallow-merges the incoming partial object into current state. The argument can be a
partial object or a function of the current state.

`set` returns the existing object when the property value is unchanged; otherwise it returns a
shallow copy with the property replaced.

## Selectors

```ts
get<K extends keyof T>(key: K): Selector<[K], T[K]>;
pick<Ks extends Array<keyof T>>(...keys: Ks): Selector<Ks, Pick<T, Ks[number]>>;
```

`pick` uses shallow equality for result comparison.

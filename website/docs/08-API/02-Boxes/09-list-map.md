# ListMap

```ts
import { List, ListMap, listMapBox, type ListMapBox } from 'amos';
```

`ListMapBox` stores a `ListMap`, a map whose values are Amos `List` instances. It is useful for
keyed collections such as user-to-todo-ids maps.

```ts
const userTodoListBox = listMapBox('todos.byUser', 0, 0);

dispatch(userTodoListBox.pushIn(1, 101, 102));
dispatch(userTodoListBox.deleteIn(1, 101));
select(userTodoListBox.getIn(1, 0));
```

## `ListMap`

```ts
class ListMap<K extends ID, L extends List<any>> extends Map<K, L>
```

`ListMap` supports all `Map` methods and delegated list methods. Methods ending in `In` operate on
the list at a map key.

Mutation-style delegated methods:

```ts
concatIn(key, ...items): this;
copyWithinIn(key, target, start, end?): this;
fillIn(key, value, start?, end?): this;
filterIn(key, predicate): this;
popIn(key): this;
pushIn(key, ...items): this;
reverseIn(key): this;
shiftIn(key): this;
unshiftIn(key, ...items): this;
sliceIn(key, start?, end?): this;
sortIn(key, compareFn?): this;
spliceIn(key, start, deleteCount, ...items): this;
deleteIn(key, item): this;
setIn(key, index, value): this;
resetIn(key, data): this;
```

Selector-style delegated methods:

```ts
getIn(key, index): E | undefined;
hasIn(key, index): boolean;
atIn(key, index): E | undefined;
mapIn(key, callback): List<any>;
flatIn(key, depth?): List<any>;
flatMapIn(key, callback): List<any>;
entriesIn(key): IterableIterator<[number, E]>;
keysIn(key): IterableIterator<number>;
valuesIn(key): IterableIterator<E>;
```

`setItem` and `setAll` accept either `List` instances or readonly arrays. Arrays are converted to
lists with the default list value.

## `listMapBox`

```ts
function listMapBox<K, E>(
  key: string,
  inferKey: K,
  inferElement: E,
): ListMapBox<ListMap<IDOf<K>, List<E>>>;
```

`inferKey` and `inferElement` are used for TypeScript inference.

## Mutations

`ListMapBox` includes `MapBox` mutations and the `In` list mutations listed above.

```ts
pushIn(key: K, ...items: E[]): Mutation<ListMap<K, List<E>>>;
deleteIn(key: K, item: E): Mutation<ListMap<K, List<E>>>;
setIn(key: K, index: number, value: E): Mutation<ListMap<K, List<E>>>;
resetIn(key: K, data: readonly E[]): Mutation<ListMap<K, List<E>>>;
```

## Selectors

`ListMapBox` includes `MapBox` selectors and delegated list selectors:

```ts
getIn(key: K, index: number): Selector<any, E | undefined>;
hasIn(key: K, index: number): Selector<any, boolean>;
atIn(key: K, index: number): Selector<any, E | undefined>;
mapIn(key: K, callback: (value: E, index: number) => any): Selector<any, List<any>>;
flatIn(key: K, depth?: number): Selector<any, List<any>>;
flatMapIn(key: K, callback: (value: E, index: number) => any): Selector<any, List<any>>;
```

`flatIn` is cacheable.

# RecordMap

```ts
import { Record, RecordMap, recordMapBox, type RecordMapBox } from 'amos';
```

`RecordMapBox` stores a `RecordMap`, a map whose values are Amos records and whose keys come from
one field of the record.

```ts
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

class TodoRecord extends Record<Todo>({
  id: 0,
  title: '',
  completed: false,
}) {}

const todosBox = recordMapBox('todos', TodoRecord, 'id');

dispatch(todosBox.setItem(new TodoRecord({ id: 1, title: 'Ship docs' })));
dispatch(todosBox.mergeItem(1, { completed: true }));
select(todosBox.getIn(1, 'title'));
```

## `RecordMap`

```ts
class RecordMap<R extends Record<any>, KF extends IDKeyof<RecordProps<R>>>
  extends Map<R[KF], R>
```

A `RecordMap` supports all `Map` methods, plus record-aware overloads:

```ts
setItem(key: R[KF], value: R): this;
setItem(value: R): this;

mergeItem(props: PartialRequiredProps<R, KF>): this;
mergeItem(key: R[KF], props: PartialProps<R>): this;

setAll(items: PartialDictionary<R[KF], R> | ArraySource<R | Entry<R[KF], R>>): this;

mergeAll(
  items:
    | PartialDictionary<R[KF], PartialProps<R>>
    | ArraySource<PartialRequiredProps<R, KF> | Entry<R[KF], PartialProps<R>>>,
): this;

setIn<K extends keyof RecordProps<R>>(key: R[KF], prop: K, value: RecordProps<R>[K]): this;
updateIn<K extends keyof RecordProps<R>>(
  key: R[KF],
  prop: K,
  updater: (v: RecordProps<R>[K], t: R) => RecordProps<R>[K],
): this;
mergeIn(key: R[KF], props: PartialProps<R>): this;
getIn<K extends keyof RecordProps<R>>(key: R[KF], prop: K): RecordProps<R>[K];
```

`setItem(value)` reads the key from `value[keyField]`.

`mergeItem(props)` reads the key from `props[keyField]`.

## `recordMapBox`

```ts
function recordMapBox<R extends Record<any>, KF extends IDKeyof<RecordProps<R>>>(
  key: string,
  defaultValue: ValueOrConstructor<R>,
  keyField: KF,
): RecordMapBox<RecordMap<R, KF>>;
```

## Mutations

`RecordMapBox` includes the `MapBox` mutations except for the record-specialized overloads of
`setItem`, `setAll`, `mergeItem`, and `mergeAll`.

It also adds:

```ts
setIn<K extends keyof RecordMapProps<RM>>(
  key: RecordMapKey<RM>,
  prop: K,
  value: RecordMapProps<RM>[K],
): Mutation<RM>;

updateIn<K extends keyof RecordMapProps<RM>>(
  key: RecordMapKey<RM>,
  prop: K,
  updater: (value: RecordMapProps<RM>[K]) => RecordMapProps<RM>[K],
): Mutation<RM>;

mergeIn(key: RecordMapKey<RM>, props: PartialProps<RecordMapRecord<RM>>): Mutation<RM>;
```

## Selectors

```ts
getIn<K extends keyof RecordMapProps<RM>>(
  key: RecordMapKey<RM>,
  prop: K,
): Selector<any, RecordMapProps<RM>[K]>;
```

It also inherits `getItem`, `hasItem`, and `size` from `MapBox`.

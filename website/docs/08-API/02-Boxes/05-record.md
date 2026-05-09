# Record

```ts
import { Record, recordBox, type RecordBox } from 'amos';
```

`RecordBox` stores an Amos `Record` shape. A record is a typed immutable object with `get`, `set`,
`merge`, and `update` methods.

```ts
interface User {
  id: number;
  name: string;
}

class UserRecord extends Record<User>({
  id: 0,
  name: '',
}) {}

const userBox = recordBox('user', UserRecord);

dispatch(userBox.set('name', 'Ada'));
dispatch(userBox.merge({ name: 'Grace' }));
select(userBox.get('name'));
```

## `Record`

```ts
function Record<P extends object>(props: P): RecordConstructor<P>;
```

Creates a record class with default props.

Record instances expose:

```ts
get<K extends keyof P>(key: K): P[K];
set<K extends keyof P>(key: K, value: P[K]): this;
merge(props: Partial<P>): this;
update<K extends keyof P>(key: K, updater: (v: P[K], t: this) => P[K]): this;
toJSON(): P;
fromJS(data: JSONState<P>): this;
isInitial(): boolean;
```

`set`, `merge`, and `update` return the same instance when nothing changes, and a cloned instance
when state changes.

`RecordObject` is an untyped alias used for generic record classes.

## `recordBox`

```ts
function recordBox<R extends Record<any>>(
  key: string,
  initialState: ValueOrConstructor<R>,
): RecordBox<R>;
```

`initialState` can be a record instance or a record constructor. Amos creates it through
`resolveConstructorValue` and caches the initial instance.

## Mutations

```ts
set<K extends keyof RecordProps<R>>(key: K, value: R[K]): Mutation<R>;
update<K extends keyof RecordProps<R>>(
  key: K,
  updater: (value: R[K], record: R) => R[K],
): Mutation<R>;
merge(props: PartialProps<R>): Mutation<R>;
```

These delegate to the record instance methods.

## Selectors

```ts
get<K extends keyof RecordProps<R>>(key: K): Selector<any, R[K]>;
isInitial(): Selector<[], boolean>;
```

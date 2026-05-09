# Array

```ts
import { arrayBox, type ArrayBox } from 'amos';
```

`ArrayBox` stores a readonly JavaScript array and exposes immutable array-style mutations.

```ts
const namesBox = arrayBox<string>('names');

dispatch(namesBox.push('Ada'));
dispatch(namesBox.splice(0, 1, 'Grace'));
select(namesBox.at(0)); // 'Grace'
```

## `arrayBox`

```ts
function arrayBox<E>(key: string, initialState?: ValueOrFunc<readonly E[]>): ArrayBox<E>;
```

If `initialState` is omitted, the initial value is `[]`.

## State

```ts
ArrayBox<E> extends Box<readonly E[]>
```

The stored value is a readonly array. Mutations always return a new array when the operation changes
state.

## Mutations

```ts
map(fn: (value: E, index: number, array: readonly E[]) => E): Mutation<readonly E[]>;
push(...items: E[]): Mutation<readonly E[]>;
pop(): Mutation<readonly E[]>;
unshift(...items: E[]): Mutation<readonly E[]>;
shift(): Mutation<readonly E[]>;
splice(start: number, count: number, ...items: E[]): Mutation<readonly E[]>;
sort(compare?: (a: E, b: E) => number): Mutation<readonly E[]>;
slice(start?: number, end?: number): Mutation<readonly E[]>;
filter(predicate: (value: E, index: number, array: readonly E[]) => boolean): Mutation<readonly E[]>;
delete(...items: E[]): Mutation<readonly E[]>;
```

`delete(...items)` removes matching values from a copied array.

## Selectors

```ts
at(index: number): Selector<[number], E | undefined>;
includes(searchElement: E, fromIndex?: number): Selector<any, boolean>;
indexOf(searchElement: E, fromIndex?: number): Selector<any, number>;
lastIndexOf(searchElement: E, fromIndex?: number): Selector<any, number>;
```

These selectors delegate to the corresponding array methods.

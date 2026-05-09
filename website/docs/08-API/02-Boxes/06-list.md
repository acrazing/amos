# List

```ts
import { List, listBox, type ListBox } from 'amos';
```

`ListBox` stores an Amos `List`, an immutable wrapper around an array-like value.

```ts
const idsBox = listBox<number>('todo.ids');

dispatch(idsBox.push(1, 2));
dispatch(idsBox.delete(1));
select(idsBox.length());
select(idsBox.get(0));
```

## `List`

```ts
class List<E> {
  constructor(data?: ArrayLike<E> | Iterable<E>, isInitial?: boolean);
}
```

Important query methods:

```ts
length: number;
has(index: number): boolean;
get(index: number): E | undefined;
at(index: number): E | undefined;
find(predicate: (value: E, index: number) => boolean): E | undefined;
findIndex(predicate: (value: E, index: number) => boolean): number;
indexOf(searchElement: E, fromIndex?: number): number;
lastIndexOf(searchElement: E, fromIndex?: number): number;
includes(searchElement: E, fromIndex?: number): boolean;
some(predicate: (value: E, index: number) => boolean): boolean;
every(predicate: (value: E, index: number) => boolean): boolean;
join(separator?: string): string;
reduce<U>(callbackfn: (previousValue: U, currentValue: E, currentIndex: number) => U, initialValue: U): U;
```

Important update methods:

```ts
filter(predicate: (value: E, index: number) => boolean): this;
flat<D extends number = 1>(depth?: D): List<FlatArray<readonly E[], D>>;
map<R>(callbackfn: (value: E, index: number) => R): List<R>;
flatMap<R>(callbackfn: (value: E, index: number) => R | readonly R[]): List<R>;
slice(start?: number, end?: number): this;
shift(): this;
unshift(...items: E[]): this;
push(...items: E[]): this;
pop(): this;
concat(...items: ConcatArray<E>[]): this;
copyWithin(target: number, start: number, end?: number): this;
fill(value: E, start?: number, end?: number): this;
reverse(): this;
sort(compareFn?: (a: E, b: E) => number): this;
splice(start: number, deleteCount: number, ...items: E[]): this;
set(index: number, value: E): this;
delete(item: E): this;
reset(data: readonly E[]): this;
```

`toJSON()` returns the backing array. `fromJS()` hydrates from JSON array state.

```ts
function isSameList<T>(a: List<T> | readonly T[], b: List<T> | readonly T[]): boolean;
```

`isSameList` compares two lists or arrays by shallow item equality. `ListBox.filter` uses it as the
selector equality function.

## `listBox`

```ts
function listBox<E>(key: string, initialItems?: ArrayLike<E> | Iterable<E>): ListBox<List<E>>;
```

## Mutations

```ts
concat(...items: ConcatArray<E>[]): Mutation<List<E>>;
copyWithin(target: number, start: number, end?: number): Mutation<List<E>>;
fill(value: E, start?: number, end?: number): Mutation<List<E>>;
pop(): Mutation<List<E>>;
push(...items: E[]): Mutation<List<E>>;
reverse(): Mutation<List<E>>;
shift(): Mutation<List<E>>;
unshift(...items: E[]): Mutation<List<E>>;
slice(start?: number, end?: number): Mutation<List<E>>;
sort(compareFn?: (a: E, b: E) => number): Mutation<List<E>>;
splice(start: number, deleteCount: number, ...items: E[]): Mutation<List<E>>;
delete(item: E): Mutation<List<E>>;
set(index: number, value: E): Mutation<List<E>>;
reset(data: readonly E[]): Mutation<List<E>>;
```

## Selectors

```ts
length(): Selector<[], number>;
get(index: number): Selector<any, E | undefined>;
some(predicate: (value: E, index: number) => boolean): Selector<any, boolean>;
every(predicate: (value: E, index: number) => boolean): Selector<any, boolean>;
find(predicate: (value: E, index: number) => boolean): Selector<any, E | undefined>;
findIndex(predicate: (value: E, index: number) => boolean): Selector<any, number>;
filter(predicate: (value: E, index: number) => boolean): Selector<any, List<E>>;
flat(depth?: number): Selector<any, List<any>>;
includes(searchElement: E, fromIndex?: number): Selector<any, boolean>;
indexOf(searchElement: E, fromIndex?: number): Selector<any, number>;
join(separator?: string): Selector<any, string>;
lastIndexOf(searchElement: E, fromIndex?: number): Selector<any, number>;
```

`flat`, `indexOf`, `includes`, `lastIndexOf`, and `join` are cacheable selectors. `filter` compares
results with `isSameList`.

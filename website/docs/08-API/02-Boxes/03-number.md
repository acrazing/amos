# Number

```ts
import { numberBox, type NumberBox } from 'amos';
```

`NumberBox` stores a number and provides arithmetic mutations.

```ts
const countBox = numberBox('count');

dispatch(countBox.add(1));
dispatch(countBox.multiply(2));
select(countBox.toFixed(0));
```

## `numberBox`

```ts
function numberBox(key: string, initialState?: number): NumberBox;
```

If `initialState` is omitted, the initial value is `0`.

## Mutations

```ts
add(value: number): Mutation<number>;
minus(value: number): Mutation<number>;
multiply(value: number): Mutation<number>;
divide(value: number): Mutation<number>;
mod(value: number): Mutation<number>;
```

## Selectors

```ts
toExponential(fractionDigits?: number): Selector<any, string>;
toFixed(fractionDigits?: number): Selector<any, string>;
```

These selectors delegate to the corresponding `Number` methods.

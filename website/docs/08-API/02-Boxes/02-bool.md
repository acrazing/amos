# Bool

```ts
import { boolBox, type BoolBox } from 'amos';
```

`BoolBox` stores a boolean.

```ts
const modalOpenBox = boolBox('ui.modalOpen');

dispatch(modalOpenBox.open());
dispatch(modalOpenBox.toggle());
dispatch(modalOpenBox.close());
```

## `boolBox`

```ts
function boolBox(key: string, initialState?: boolean): BoolBox;
```

If `initialState` is omitted, the initial value is `false`.

## Mutations

```ts
toggle(): Mutation<boolean>;
open(): Mutation<boolean>;
close(): Mutation<boolean>;
```

`toggle()` flips the current value.

`open()` sets the value to `true`.

`close()` sets the value to `false`.

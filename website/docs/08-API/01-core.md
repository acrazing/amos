# Core API

The core API is exported from `amos` and implemented by `amos-core`. It contains the store, boxes,
mutations, selectors, actions, signals, and store enhancers.

```ts
import { action, box, createStore, selector, signal, type Box, type Store } from 'amos';
```

## `createStore`

```ts
function createStore(options?: StoreOptions, ...enhancers: StoreEnhancer[]): Store;
```

Creates a store. Amos always applies the built-in enhancers first:

1. devtools
2. batch dispatch/select
3. concurrent action deduplication
4. selector cache
5. preloaded state

Custom enhancers passed to `createStore` run after the built-in enhancers.

```ts
const store = createStore({
  name: 'app',
  preloadedState: {
    count: 1,
  },
});
```

### `StoreOptions`

```ts
interface StoreOptions {
  preloadedState?: Snapshot;
  name?: string;
  devtools?: DevtoolsOptions | boolean;
}
```

`preloadedState` is a snapshot keyed by box key. The preload enhancer converts JSON-like values back
into state by calling `fromJS(initialState, snapshotValue)`.

`name` is passed to Redux DevTools.

`devtools` controls Redux DevTools integration. `false` disables it. `true` enables it. If omitted,
Amos enables devtools only when `NODE_ENV === 'development'`.

## `Store`

```ts
interface Store {
  snapshot(): Readonly<Snapshot>;
  subscribe(fn: () => void): Unsubscribe;
  dispatch: Dispatch;
  select: Select;
}
```

`snapshot()` returns the current internal state object. Treat it as read-only.

`subscribe(fn)` runs `fn` after the root dispatch finishes. Nested dispatches are coalesced into the
root notification.

`dispatch` accepts mutations, actions, signals, or an array of dispatchables.

`select` accepts a box, selector, or an array of selectables.

## `box`

```ts
function box<S>(key: string, initialState: ValueOrFunc<S>): Box<S>;
```

Creates a basic box. A box owns one state value in the store.

```ts
const userIdBox = box('session.userId', 0);

store.dispatch(userIdBox.setState(42));
store.select(userIdBox); // 42
```

Box keys must be unique and cannot contain `:` or `/`. Keys starting with `amos.` are reserved for
internal state and are skipped by persistence.

### `Box`

```ts
interface Box<S = any> extends BoxOptions<S> {
  readonly key: string;
  readonly getInitialState: () => S;

  config(options: ValueOrFunc<Partial<BoxOptions<S>>, [box: this, initialState: S]>): this;
  setInitialState(initialState: ValueOrFunc<S, [S]>): this;

  setState(): Mutation<S>;
  setState(state: S): Mutation<S>;
  setState(next: (state: S) => S): Mutation<S>;

  subscribe<T>(signal: SignalFactory<any, T>, fn: (state: S, data: T) => S): Unsubscribe;
}
```

`setState()` with no argument resets to the box initial state.

`setState(value)` replaces the current state.

`setState(fn)` computes the next state from the current state.

`config(options)` mutates the box configuration and returns the same box. This is typically used for
persistence options.

`setInitialState(initialState)` changes how future stores initialize the box.

`subscribe(signal, fn)` registers a signal listener that updates this box when the signal is
dispatched.

### `BoxOptions`

```ts
interface BoxOptions<S = any> {
  table?: TableOptions<S>;
  persist?: BoxPersistOptions<S> | false;
}
```

`table` marks the box as a multi-row state structure for persistence. Built-in map-like boxes
provide this automatically.

`persist` configures box persistence. `false` prevents persistence. An object can provide a
persistence version and migration action.

### `TableOptions`

```ts
interface TableOptions<S = any> {
  toRows(state: S): Readonly<Record<string, unknown>>;
  hasRow(state: S, rowId: ID): boolean;
  getRow(state: S, rowId: ID): any;
  hydrate(current: S, incoming: Readonly<Record<string, unknown>>): S;
}
```

Table options let `withPersist` save and hydrate individual rows instead of one large value.

## `Box.extends`

```ts
const MyBox = Box.extends<MyBox>({
  name: 'MyBox',
  mutations: { ... },
  selectors: { ... },
  options: { ... },
  methods: { ... },
});
```

Creates a specialized box factory. Built-in boxes such as `NumberBox`, `MapBox`, and `RecordBox` are
defined this way.

Mutation entries can be:

```ts
mutations: {
  // Call the method with the same name on the state object.
  push: null,

  // Compute the next state directly.
  add: (state, value: number) => state + value,

  // Use the box instance in the update.
  setState: {
    update: (box, state, next) => next ?? box.getInitialState(),
  },
}
```

Selector entries can be:

```ts
selectors: {
  // Call the method with the same name on the state object.
  get: null,

  // Define derive/equality/cache/loadRow behavior.
  pick: {
    derive: (state, ...keys) => Object.fromEntries(keys.map((k) => [k, state[k]])),
    equal: shallowEqual,
    cache: true,
  },
}
```

## Mutations

```ts
interface Mutation<S = any> {
  type: string;
  mutator(state: S): S;
  args: readonly unknown[];
  box: Box<S>;
}
```

A mutation is created by a box method and applied by `dispatch`.

```ts
dispatch(countBox.add(1));
```

The mutation `type` is `<box.key>/<method>`.

## `selector`

```ts
function selector<A extends any[], R>(
  compute: (select: Select, ...args: A) => R,
  options?: Partial<SelectorOptions<A, R>>,
): SelectorFactory<A, R>;
```

Creates a selector factory. Calling the factory creates a selector object that can be passed to
`store.select` or `useSelector`.

```ts
const selectTotal = selector((select) => select(priceBox) * select(quantityBox), { cache: true });

store.select(selectTotal());
```

### `SelectorOptions`

```ts
interface SelectorOptions<A extends any[] = any, R = any> {
  type: string;
  equal(oldResult: R, newResult: R): boolean;
  cache?: boolean;
  loadRow?: (...args: A) => readonly [Box, ID];
}
```

`type` is a debug label. The Babel and TypeScript transformers can generate it.

`equal` controls equality for uncached selectors in React and for cached selector results. It
defaults to `Object.is`.

`cache: true` enables dependency-tracked memoization.

`loadRow` tells persistence which box row a selector reads.

### Selector Enhancement

```ts
const enhanceSelector: (
  enhancer: Enhancer<[Compute, SelectorOptions], SelectorFactory>,
) => Unsubscribe;
```

Registers global enhancers for selector factories. Register selector enhancers before creating
selectors.

## `action`

```ts
function action<A extends any[], R>(
  actor: (dispatch: Dispatch, select: Select, ...args: A) => R,
  options?: Partial<ActionOptions<A, R>>,
): ActionFactory<A, R>;
```

Creates an action factory. Calling the factory returns a dispatchable action.

```ts
const incrementLater = action(async (dispatch, select, amount: number) => {
  await delay(100);
  return dispatch(countBox.add(amount));
});

await dispatch(incrementLater(1));
```

### `ActionOptions`

```ts
interface ActionOptions<A extends any[] = any, R = any> {
  key: string;
  type: string;
  conflictPolicy: 'always' | 'leading';
  conflictKey?: CacheOptions<A>;
}
```

`key` is required for SSR query state. It must be unique when the action is used with `useQuery` and
SSR.

`type` is a debug label.

`conflictPolicy` defaults to `always`. With `leading`, Amos reuses the pending promise for actions
with the same computed conflict key.

`conflictKey` can be a selectable, an array of selectables, a selector factory, or a compute
function. It is passed through `computeCacheKey`.

### `ActionFactory.select`

```ts
actionFactory.select(selectorOrBox);
```

Binds an action to a selector or box for `useQuery`. While the action is pending, `useQuery` can
still return the selected store value.

```ts
const loadTodos = action(async (dispatch) => {
  const todos = await fetchTodos();
  dispatch(todoMapBox.mergeAll(todos));
}).select(selectVisibleTodos);
```

### Action Enhancement

```ts
const enhanceAction: (enhancer: Enhancer<[Actor, ActionOptions], ActionFactory>) => Unsubscribe;
```

Registers global enhancers for action factories. Register action enhancers before creating actions.

## `signal`

```ts
function signal(type: string, options?: Partial<SignalOptions<[], void>>): SignalFactory<[], void>;
function signal<D>(type: string, options?: Partial<SignalOptions<[D], D>>): SignalFactory<[D], D>;
function signal<A extends any[], D>(
  type: string,
  creator: (select: Select, ...args: A) => D,
  options?: Partial<SignalOptions<A, D>>,
): SignalFactory<A, D>;
```

Creates a dispatchable event. A signal factory is also an event center with `subscribe`.

```ts
const signedOut = signal<{ userId: number }>('session/signedOut');

signedOut.subscribe((dispatch, select, data) => {
  dispatch(userBox.setState());
});

dispatch(signedOut({ userId: 1 }));
```

When dispatched, Amos computes the signal data with `creator`, then calls all signal subscribers
with `(dispatch, select, data)`.

### Signal Enhancement

```ts
const enhanceSignal: (enhancer: Enhancer<[SignalOptions], SignalFactory>) => Unsubscribe;
```

Registers global enhancers for signal factories. Register signal enhancers before creating signals.

## Dispatch And Select Types

```ts
interface Dispatch {
  <R>(dispatchable: Dispatchable<R>): R;
  <Rs extends readonly Dispatchable[] | []>(dispatchables: Rs): MapDispatchables<Rs>;
  <R>(dispatchables: readonly Dispatchable<R>[]): R[];
}

interface Select {
  <R>(selectable: Selectable<R>): R;
  <Rs extends readonly Selectable[] | []>(selectables: Rs): MapSelectables<Rs>;
  <R>(selectables: readonly Selectable<R>[]): R[];
}
```

Arrays are supported by the batch enhancer.

## Cache Utilities

```ts
function computeCacheKey(
  select: Select,
  v: Action | Selector,
  key: CacheOptions<any> | undefined,
): string;
```

Computes the cache or conflict key used by cached selectors, leading actions, and queries. The
result is based on the action or selector key plus its arguments. If `key` is provided, Amos appends
selected values or computed values before stringifying.

```ts
function isSelectValueEqual<R>(selectable: Selectable<R>, a: R, b: R): boolean;
```

Compares selected values using Amos rules. Boxes and cached selectors use strict identity. Uncached
selectors use their `equal` function.

```ts
type SelectEntry<R = any> = readonly [selectable: Selectable<R>, value: R];
```

`SelectEntry` is used by selector dependency tracking and by `useSelector`.

## Devtools

```ts
interface DevtoolsOptions {
  enable?: boolean;
  extension?: ReduxDevtoolsExtension;
}

interface ReduxDevtoolsExtension {
  connect(options?: { name?: string }): {
    init(state: any): void;
    send(action: { type: string; args: any[]; root: any }, state: any): void;
  };
}
```

The devtools enhancer sends mounted boxes, mutations, actions, and signals to a Redux
DevTools-compatible extension. `StoreOptions.devtools` can be `false`, `true`, or a
`DevtoolsOptions` object.

## Enhancers

```ts
type StoreEnhancer = Enhancer<[StoreOptions], EnhanceableStore>;
```

A store enhancer wraps store creation and may override methods such as `dispatch` or `select`, or
append lifecycle hooks.

```ts
const enhancer: StoreEnhancer = (next) => (options) => {
  const store = next(options);
  return store;
};
```

### `EnhanceableStore`

```ts
interface EnhanceableStore extends Store {
  state: Snapshot;
  getPreloadedState<S>(box: Box<S>, initialState: S): S | undefined;
  onInit(): void;
  onMount<S>(box: Box<S>, initialState: S, preloadedState: S | undefined): void;
}
```

`onInit` runs after the internal store is created.

`onMount` runs when a box is first selected and mounted into the store state.

## Transformer APIs

Amos includes compile-time helpers that fill action and selector `type` options from variable names.

```ts
import { amosBabelPlugin } from 'amos/babel';
import { createAmosTransformer } from 'amos/typescript';
```

Both accept:

```ts
interface TransformerOptions {
  prefix?: string;
  format?:
    | 'original'
    | 'lowerCamelCase'
    | 'UpperCamelCase'
    | 'lower_underscore'
    | 'UPPER_UNDERSCORE';
}
```

Given:

```ts
const loadUser = action(async () => {});
```

with `{ prefix: 'amos/', format: 'lowerCamelCase' }`, the transformer adds:

```ts
const loadUser = action(async () => {}, { type: 'amos/loadUser' });
```

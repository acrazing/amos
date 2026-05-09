# Utilities

This page lists utility APIs re-exported by the public `amos` package.

```ts
import { arrayEqual, isAmosObject, shallowEqual, toJS, type ValueOrFunc } from 'amos';
```

## Amos Objects

```ts
interface AmosObject<T extends string> {
  readonly id: string;
  readonly key: string;
}

function isAmosObject<S extends AmosObject<any>>(obj: any, key: string): obj is S;
```

Amos objects are tagged objects used for boxes, mutations, selectors, actions, and signals.

`isAmosObject` checks whether a value is an Amos object with the requested kind, such as `box`,
`selector`, or `action`.

## Equality

```ts
function shallowEqual<T>(a: T, b: T): boolean;
function arrayEqual<T extends ArrayLike<any>>(a: T, b: T): boolean;
```

`shallowEqual` compares own enumerable keys and strict property values.

`arrayEqual` compares length and strict item values.

## JSON Conversion

```ts
function toJS<T>(v: T): JSONState<T>;
```

`toJS` recursively converts arrays, `toJSON` objects, and plain object properties to JSON-like
state.

`JSONState<T>` is the compile-time JSON representation of `T`. If `T` has a `toJSON()` method,
`JSONState<T>` uses that return type recursively.

## Enhancers

```ts
type Enhancer<A extends any[], V> = (next: (...args: A) => V) => (...args: A) => V;
```

An enhancer wraps a factory or function with additional behavior. Amos uses this type for store
enhancers and for factory enhancers such as action and selector enhancement.

## Common Types

```ts
type ID = string | number;
type Unsubscribe = () => void;
type AnyFunc = (...args: any[]) => any;
type ValueOrArray<T> = T | T[];
type ValueOrReadonlyArray<T> = T | readonly T[];
type ValueOrPromise<T> = T | Promise<T>;
type ValueOrFunc<V, A extends any[] = []> = V | ((...args: A) => V);
type ValueOrConstructor<V, A extends any[] = []> = V | (new (...args: A) => V);
```

Other exported type utilities include `IsAny`, `IsNever`, `IsNoType`, and `IsUnknown`.

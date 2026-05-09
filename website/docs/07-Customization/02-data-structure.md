# Data structure

Amos boxes work especially well with immutable data structures that expose methods for updates and
queries.

The built-in shapes are:

- `List`
- `Map`
- `Record`
- `RecordMap`
- `ListMap`
- `MapMap`

You can also write your own.

## Shape Requirements

A good Amos shape should:

- return a new instance when it changes
- return the same instance when nothing changes
- expose clear update and query methods
- implement `toJSON` and `fromJS` if it should support SSR or persistence

```ts
class Counter {
  constructor(readonly value = 0) {}

  add(amount: number) {
    return amount === 0 ? this : new Counter(this.value + amount);
  }

  isZero() {
    return this.value === 0;
  }

  toJSON() {
    return this.value;
  }

  fromJS(value: number) {
    return new Counter(value);
  }
}
```

## Wrapping A Shape In A Box

Use `Box.extends` to bind shape methods to mutations and selectors.

```ts
interface CounterBox extends Box<Counter> {
  add(amount: number): Mutation<Counter>;
  isZero(): Selector<[], boolean>;
}

const CounterBox = Box.extends<CounterBox>({
  name: 'CounterBox',
  mutations: {
    add: null,
  },
  selectors: {
    isZero: null,
  },
});

function counterBox(key: string) {
  return new CounterBox(key, new Counter());
}
```

`null` means "call the method with the same name on the state object."

## JSON Restoration

`preloadedState` and persistence use the initial state as the restoration shape.

If the initial state has `fromJS`, Amos delegates to it.

```ts
const counter = new Counter().fromJS(10);
```

For plain objects, Amos preserves the prototype of the initial value while recursively merging
JSON-like data.

## Table-Like Structures

If your shape stores independent rows, define `table` options on the box.

```ts
const EntityBox = Box.extends<EntityBox>({
  name: 'EntityBox',
  mutations: {
    setItem: null,
  },
  selectors: {
    getItem: (box) => ({
      loadRow: (id) => [box, id],
    }),
  },
  options: {
    table: {
      toRows: (state) => state.toJSON(),
      hasRow: (state, id) => state.hasItem(id),
      getRow: (state, id) => state.getItem(id),
      hydrate: (state, rows) => state.setAll(state.fromJS(rows).toJSON()),
    },
  },
});
```

This lets persistence save and hydrate individual rows.

## Prefer Existing Shapes

Before creating a new structure, check whether `Record`, `Map`, `List`, or one of the map
combinations already describes the state. Custom data structures are most valuable when they encode
domain-specific operations that would otherwise be duplicated across actions and selectors.

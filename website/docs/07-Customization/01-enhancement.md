# Enhancement

Amos has three enhancement layers:

- store enhancers
- action/selector/signal factory enhancers
- custom box factories

Use them when you need behavior that should be reusable across state modules.

## Store Enhancers

A store enhancer wraps the internal store during `createStore`.

```ts
const logEnhancer: StoreEnhancer = (next) => (options) => {
  const store = next(options);
  const dispatch = store.dispatch;

  store.dispatch = ((task: any) => {
    console.log(task);
    return dispatch(task);
  }) as typeof store.dispatch;

  return store;
};

const store = createStore({}, logEnhancer);
```

Store enhancers can override `dispatch`, override `select`, or append lifecycle hooks such as
`onInit` and `onMount`.

Built-in store enhancers implement devtools, batch, concurrency, cache, preload, and persistence
behavior.

## Factory Enhancers

Actions, selectors, and signals each have a global enhancer collector.

```ts
const unsubscribe = enhanceAction((next) => (actor, options) => {
  return next((dispatch, select, ...args) => {
    console.time(options.type);
    try {
      return actor(dispatch, select, ...args);
    } finally {
      console.timeEnd(options.type);
    }
  }, options);
});
```

Register factory enhancers before creating the actions, selectors, or signals you want to affect.

Call the returned unsubscribe function to remove the enhancer.

## Custom Box Factories

Use `Box.extends` to create a box type.

```ts
interface StringBox extends Box<string> {
  append(value: string): Mutation<string>;
  length(): Selector<[], number>;
}

const StringBox = Box.extends<StringBox>({
  name: 'StringBox',
  mutations: {
    append: (state, value) => state + value,
  },
  selectors: {
    length: {
      derive: (state) => state.length,
    },
  },
});

function stringBox(key: string, initialState = '') {
  return new StringBox(key, initialState);
}
```

A mutation can call a method on the state by using `null`, or it can provide a function.

```ts
mutations: {
  push: null,
  add: (state, value) => state + value,
}
```

A selector can also use `null` to call the matching state method, or define `derive`, `equal`,
`cache`, and `loadRow`.

## Keep Enhancements Small

Enhancers are powerful because they run near the core dispatch/select path. Keep them focused and
covered by tests.

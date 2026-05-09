# React

```ts
import {
  Provider,
  useDispatch,
  useQuery,
  useSelector,
  useStore,
  useSuspenseQuery,
  type QueryResult,
} from 'amos/react';
```

The React API is implemented by `amos-react`. It is a thin binding over an Amos store.

## `Provider`

```tsx
interface ProviderProps {
  store: Store;
  children: ReactNode;
}

const Provider: ({ store, children }: ProviderProps) => ReactElement;
```

Provides a store to hooks.

```tsx
const store = createStore();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

`Provider` throws if `store` is missing.

## `useStore`

```ts
function useStore(): Store;
```

Returns the nearest Amos store from context.

Throws if called outside `<Provider />`.

## `useDispatch`

```ts
function useDispatch(): Dispatch;
```

Returns `store.dispatch`.

```tsx
const dispatch = useDispatch();

return <button onClick={() => dispatch(countBox.add(1))}>+</button>;
```

## `useSelector`

```ts
interface UseSelector extends Select {
  (): Select;
}

const useSelector: UseSelector;
```

Selects state from the store and subscribes the component to changes.

```tsx
const count = useSelector(countBox);
const [name, age] = useSelector([nameBox, ageBox]);
```

When called with no argument, it returns a `select` function:

```tsx
const select = useSelector();

const visibleTodos = select(selectVisibleTodos());
const currentUser = select(currentUserBox);
```

During render, `useSelector` records every selected box or selector as a dependency. After store
updates, the component re-renders only when one of those dependencies changes according to Amos
selector equality rules.

For arrays, each element is tracked as an individual dependency.

## `useQuery`

```ts
interface UseQuery {
  <A extends any[] = any, R = any, S = any>(
    action: SelectableAction<A, R, S>,
  ): [value: S, result: QueryResult<R>];

  <A extends any[] = any, R = any>(
    action: Action<A, R>,
  ): [value: Awaited<R> | undefined, result: QueryResult<R>];
}

const useQuery: UseQuery;
```

Dispatches an action and tracks its async status.

```tsx
const [todos, result] = useQuery(loadTodos(userId));

if (result.isPending()) {
  return <Spinner />;
}

if (result.isRejected()) {
  return <ErrorView error={result.error} />;
}

return <TodoList todos={todos} />;
```

`useQuery` computes a cache key from the action and action `conflictKey`. It re-dispatches when the
key changes.

If the action has a bound selector via `action(...).select(selectorOrBox)`, the first tuple value is
always the selected state. Otherwise, the first value is the fulfilled action result.

```ts
const loadTodos = action(async (dispatch, select, userId: number) => {
  const todos = await api.getTodos(userId);
  dispatch(todoMapBox.mergeAll(todos));
}).select(selectVisibleTodos);
```

## `QueryResult`

```ts
class QueryResult<R> {
  readonly status: 'pending' | 'fulfilled' | 'rejected';
  readonly value: Awaited<R> | undefined;
  readonly error: any;

  isPending(): boolean;
  isFulfilled(): boolean;
  isRejected(): boolean;
  toJSON(): QueryResultJSON<R>;
  fromJS(state: JSONState<QueryResultJSON<R>>): this;
}
```

`useQuery` stores query results in an internal `amos.queries` box.

Pending query results are omitted from `toJSON`, so SSR snapshots do not serialize unfinished work.

## `useSuspenseQuery`

```ts
interface UseSuspenseQuery {
  <A extends any[] = any, R = any, S = any>(action: SelectableAction<A, R, S>): S;
  <A extends any[] = any, R = any>(action: Action<A, R>): Awaited<R>;
}

const useSuspenseQuery: UseSuspenseQuery;
```

Suspense version of `useQuery`.

```tsx
function Todos({ userId }: { userId: number }) {
  const todos = useSuspenseQuery(loadTodos(userId));
  return <TodoList todos={todos} />;
}
```

Behavior:

1. If the query is pending, it throws the pending promise.
2. If the query is rejected, it throws the error.
3. If fulfilled, it returns the query value.

Use it inside React `<Suspense>` and an error boundary.

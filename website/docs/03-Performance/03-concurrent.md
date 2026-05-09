# Concurrent

Amos actions can deduplicate concurrent async work with `conflictPolicy: 'leading'`.

```ts
const loadUser = action(
  async (dispatch, select, userId: number) => {
    return api.getUser(userId);
  },
  {
    conflictPolicy: 'leading',
    conflictKey: (select, userId) => userId,
  },
);
```

If `loadUser(1)` is already pending, another dispatch of `loadUser(1)` returns the same pending
promise. Amos does not call the actor again.

## Default Behavior

The default policy is `always`.

```ts
const saveDraft = action(async () => {
  await api.saveDraft();
});
```

Every dispatch runs the action.

## Conflict Keys

`conflictKey` decides which action calls conflict.

```ts
const loadPage = action(
  async (dispatch, select, page: number) => {
    return api.loadPage(page);
  },
  {
    conflictPolicy: 'leading',
    conflictKey: (select, page) => page,
  },
);
```

The key may be:

- a box or selector
- an array of boxes or selectors
- a selector factory
- a compute function

```ts
const loadCurrentUserTodos = action(
  async (dispatch, select) => {
    return api.getTodos(select(currentUserIdBox));
  },
  {
    conflictPolicy: 'leading',
    conflictKey: currentUserIdBox,
  },
);
```

## Scope

Deduplication only applies while the action result is a pending promise. If the action returns
synchronously, Amos returns that value and does not store it in the pending map.

Once the promise settles, Amos removes it from the pending map.

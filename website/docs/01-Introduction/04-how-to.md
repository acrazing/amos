# How to design state in large-scale applications

Large applications become hard to maintain when state is shaped around screens instead of domain
data. Amos encourages a different model: design stable domain boxes first, then compose views from
selectors and actions.

## Start With Domain Objects

Prefer boxes that represent durable concepts in your application.

```ts
const userMapBox = recordMapBox('users', UserRecord, 'id');
const todoMapBox = recordMapBox('todos', TodoRecord, 'id');
const userTodoListBox = listMapBox('todos.userTodoList', 0, 0);
```

This state can support many screens. A profile page, todo list, search result, or detail view can
all read the same boxes.

## Keep Relationships Explicit

Use IDs to connect boxes.

```ts
const selectUserTodos = selector((select, userId: number) => {
  return select(userTodoListBox.getItem(userId)).map((todoId) => {
    return select(todoMapBox.getItem(todoId));
  });
});
```

This keeps records normalized and lets persistence hydrate individual rows.

## Put Workflows In Actions

Actions coordinate side effects and multiple state updates.

```ts
const addTodo = action(async (dispatch, select, title: string) => {
  const todo = await api.createTodo({
    userId: select(currentUserIdBox),
    title,
  });

  dispatch([todoMapBox.mergeItem(todo), userTodoListBox.unshiftIn(todo.userId, todo.id)]);
});
```

The action owns the workflow. The boxes still own the low-level state operations.

## Put View Logic In Selectors

Selectors should express view-specific derived state.

```ts
const selectVisibleTodos = selector(
  (select) => {
    const filter = select(todoStatusFilterBox);
    const ids = select(userTodoListBox.getItem(select(currentUserIdBox)));

    return ids.filter((id) => {
      const todo = select(todoMapBox.getItem(id));
      return filter === 'All' || todo.completed === (filter === 'Completed');
    });
  },
  { cache: true },
);
```

When the selector is expensive or returns reusable structure, enable `cache`.

## Use Signals For Cross-Module Events

Signals are helpful when many modules need to react to the same event.

```ts
const signOutSignal = signal<{ userId: number; keepData: boolean }>('user.signOut');

todoMapBox.subscribe(signOutSignal, (state, event) => {
  return event.keepData ? state : state.clear();
});
```

This avoids making a sign-out action import every feature that needs cleanup.

## Persist The Right Boundary

Persist durable boxes, not temporary UI details.

```ts
const settingsBox = objectBox('settings', {
  theme: 'system',
}).config({
  persist: { version: 1 },
});
```

Map-like boxes can persist row by row. That matters for large data sets because a selector such as
`todoMapBox.getItem(id)` can trigger hydration of only that row.

## Recommended Shape

For most features, a good module layout is:

```txt
feature.boxes.ts
feature.selectors.ts
feature.actions.ts
```

Boxes define state. Selectors derive state. Actions perform workflows. This keeps features local
while still letting the store remain decentralized.

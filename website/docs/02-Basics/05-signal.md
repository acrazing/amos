# Signal

Signals are dispatchable events.

```ts
import { signal } from 'amos';

const signOutSignal = signal<{ userId: number; keepData: boolean }>('user.signOut');
```

Subscribe to a signal:

```ts
signOutSignal.subscribe((dispatch, select, event) => {
  if (!event.keepData) {
    dispatch(currentUserIdBox.setState(0));
  }
});
```

Dispatch it like any other dispatchable:

```ts
dispatch(signOutSignal({ userId: 1, keepData: false }));
```

## Why Signals Exist

Actions are good for workflows. Signals are good for events that many modules may care about.

For example, the user module can dispatch `signOutSignal`, while the todo module subscribes to clean
todo state.

```ts
todoMapBox.subscribe(signOutSignal, (state, event) => {
  return event.keepData ? state : state.clear();
});
```

The user module does not need to import todo cleanup code.

## Signal Data

The simplest signal uses its first argument as data.

```ts
const selected = signal<number>('item.selected');

dispatch(selected(1));
```

You can also provide a creator that derives signal data from current state.

```ts
const currentUserChanged = signal('user.currentChanged', (select) => {
  return select(currentUserIdBox);
});

dispatch(currentUserChanged());
```

## Box Subscription Helper

Every box has `subscribe(signal, fn)`.

```ts
currentUserIdBox.subscribe(signOutSignal, () => 0);
```

This helper subscribes to the signal and dispatches `box.setState(nextState)` for you.

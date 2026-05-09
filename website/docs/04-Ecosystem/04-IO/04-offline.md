# Offline

:::warning Experimental

Offline IO workflows are not implemented yet.

:::

Amos persistence can store local state, and actions can implement retry queues or manual sync flows,
but there is no completed offline abstraction in `amos-io` today.

If you need offline behavior now, build it with the stable pieces:

- persist durable boxes with `withPersist`
- model queued operations in a `listBox` or `recordMapBox`
- write actions that replay queued operations when connectivity returns
- use signals to notify features when sync succeeds or fails

Example sketch:

```ts
const pendingOpsBox = listBox<PendingOperation>('sync.pending').config({
  persist: { version: 1 },
});

const enqueueOperation = action((dispatch, select, op: PendingOperation) => {
  dispatch(pendingOpsBox.push(op));
});
```

This page will become a full guide once the IO package has a completed offline API.

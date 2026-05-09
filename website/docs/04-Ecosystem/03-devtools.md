# Devtools

Amos can send updates to a Redux DevTools-compatible extension.

```ts
const store = createStore({
  name: 'TodoMVC',
  devtools: true,
});
```

If `devtools` is omitted, Amos enables devtools in development when an extension is available.

Set `devtools: false` to disable it.

## What Amos Sends

Amos sends:

- mounted boxes
- mutations
- actions
- signals

The action type prefix shows what happened:

```txt
P:<box key>      // preloaded or mounted box
M:<mutation>     // mutation
A:<action>       // action
S:<signal>       // signal
```

Nested dispatches keep a `root` reference so related updates can be understood as one tree.

## Type Labels

Box mutations use `<box.key>/<method>`.

```ts
dispatch(countBox.add(1)); // M:count/add
```

Actions and selectors can receive a `type` option.

```ts
const signIn = action(async () => {}, {
  type: 'users/signIn',
});
```

The Babel and TypeScript transformers can generate these labels from variable names.

## Custom Extension

You can pass a compatible extension object.

```ts
const store = createStore({
  devtools: {
    enable: true,
    extension: myReduxDevtoolsExtension,
  },
});
```

The extension must provide `connect`, `init`, and `send` methods compatible with Redux DevTools.

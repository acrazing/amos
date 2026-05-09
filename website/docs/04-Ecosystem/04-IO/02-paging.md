# Paging

:::warning Experimental

Paging APIs are not complete yet. `PagedList`, `PagedListMap`, and their box helpers exist, but
`pagedListActionFactory` currently throws `NotImplemented`.

:::

The implemented shape is `PagedList`, a record-like structure for list data plus pagination
metadata.

```ts
const todoPageBox = pagedListBox<Todo, string, number>('todos.page', {} as Todo);
```

`PagedList` stores:

- `data`
- `pagedData`
- `cursor`
- `page`
- `perPage`
- `total`
- `ownerId`

It also exposes:

```ts
getAll();
getPage(page?);
delete(value);
```

Until the action factory is implemented, use normal boxes and actions for paging workflows.

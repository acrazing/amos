# Basics

:::warning Experimental

The `amos-io` package is not complete yet. The request helpers exist, but paging, optimistic, and
offline workflows are still placeholders or partial APIs.

:::

The implemented part of IO today is a small request layer built around Amos actions.

```ts
import { GET, POST, request, updateRequestConfig } from 'amos-io';
```

The public `amos` package currently re-exports `withOptimistic`, but most IO helpers are still
exposed from the internal workspace package and are not part of the stable public package surface.

## Request Config

Request config is stored in an Amos box. You can update it with an action.

```ts
dispatch(
  updateRequestConfig({
    baseUrl: 'https://api.example.com',
    responseType: 'json',
  }),
);
```

The request action merges global config with per-request options.

## Request Actions

```ts
const result = await dispatch(
  GET<User>('/users/1', {
    include: 'profile',
  }),
);

console.log(result.data);
```

Aliases exist for `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, and `PATCH`.

## Error Handling

`fetchRequest` wraps fetch, response acceptance, and response decoding errors into a `RequestError`
object with:

- `stage`
- `options`
- `request`
- `response`
- `data`
- `error`

Because the broader IO package is still unfinished, treat this section as a preview rather than a
stable guide.

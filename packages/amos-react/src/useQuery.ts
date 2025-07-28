/*
 * @since 2024-10-18 23:47:02
 * @author junbao <junbao@moego.pet>
 */

import {
  action,
  Action,
  type Box,
  box,
  computeCacheKey,
  type Dispatch,
  isAmosObject,
  type Select,
  SelectableAction,
  selector,
} from 'amos';
import { clone, type JSONSerializable, type JSONState, type Mutable } from 'amos-utils';
import { useRef } from 'react';
import { useDispatch } from './context';
import { useSelector } from './useSelector';

export interface QueryResultJSON<R> extends Pick<QueryResult<R>, 'status' | 'value' | 'error'> {}

export class QueryResult<R> implements JSONSerializable<QueryResultJSON<R>> {
  /** @internal */
  _ssr: 1 | 2 | undefined;
  /** @internal */
  _q: Promise<void> | undefined;

  readonly status: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  readonly value: Awaited<R> | undefined = void 0;
  readonly error: any = void 0;

  toJSON(): QueryResultJSON<R> {
    return {
      status: this.status,
      value: this.value,
      error: this.error,
    };
  }

  fromJS(state: JSONState<QueryResultJSON<R>>): this {
    const r = clone(this, state as any);
    (r as Mutable<this>)._ssr = 1;
    return r;
  }

  isPending() {
    return this.status === 'pending';
  }

  isFulfilled() {
    return this.status === 'fulfilled';
  }

  isRejected() {
    return this.status === 'rejected';
  }
}

export class QueryResultMap
  extends Map<string, QueryResult<any>>
  implements JSONSerializable<Record<string, QueryResult<any>>>
{
  fromJS(state: JSONState<Record<string, QueryResult<any>>>): this {
    const dft = new QueryResult<any>();
    for (const k in state) {
      if (Object.hasOwn(state, k) && state[k].status !== 'pending') {
        this.set(k, dft.fromJS(state[k]));
      }
    }
    return this;
  }

  toJSON(): Record<string, QueryResult<any>> {
    const items = Object.fromEntries(this.entries());
    for (const k in items) {
      if (items[k].isPending()) {
        delete items[k];
      }
    }
    return items;
  }
}

// Immutable state conflicts with react suspense use.
const queryMapBox = box('amos.queries', () => new QueryResultMap());

const selectQuery = selector((select, key: string) => {
  return select(queryMapBox).get(key);
});

function performQuery(
  dispatch: Dispatch,
  select: Select,
  key: string,
  action: Action,
  lastKey: string | undefined,
) {
  const map = select(queryMapBox);
  let query = map.get(key);

  if (query) {
    // From SSR
    if (query._ssr === 1) {
      query._ssr = 2;
      setTimeout(() => (query!._ssr = void 0), 0);
      return;
    } else if (query._ssr === 2) {
      return;
    }

    // same key
    if (lastKey === key) {
      return;
    }

    if (query.isPending()) {
      return;
    }
    query = clone(query, { status: 'pending' });
  } else {
    query = new QueryResult<any>();
  }
  map.set(key, query);
  query._q = Promise.resolve().then(async () => {
    // dispatch action
    const props: Mutable<Partial<QueryResult<any>>> = {};
    try {
      props.value = await dispatch(action);
      props.status = 'fulfilled';
    } catch (e) {
      props.error = e;
      props.status = 'rejected';
      throw e;
    } finally {
      props._q = void 0;
      dispatch(updateQuery(key, query, props));
    }
  });
}

const updateQuery = action(
  (dispatch, select, key: string, query: QueryResult<any>, props: Partial<QueryResult<any>>) => {
    const map = select(queryMapBox);
    if (map.get(key) === query) {
      map.set(key, clone(query, props));
    }
    dispatch(queryMapBox.setState(map));
  },
);

export interface UseQuery {
  <A extends any[] = any, R = any, S = any>(
    action: SelectableAction<A, R, S>,
  ): [value: S, result: QueryResult<R>];
  <A extends any[] = any, R = any>(
    action: Action<A, R>,
  ): [value: Awaited<R> | undefined, result: QueryResult<R>];
}

/**
 * `useQuery` auto dispatch the action, and auto re-dispatch when the params changes,
 * It returns a tuple whose first element is the return value of the action when the
 * action's return value is fulfilled, and if the action has a bound selector, will
 * always be the selector's value; the second element will be a {@link QueryResult} to
 * let you get the dispatch status.
 */
export const useQuery: UseQuery = (action: Action | SelectableAction): [any, QueryResult<any>] => {
  const select = useSelector();
  const dispatch = useDispatch();
  const key = computeCacheKey(select, action, action.conflictKey);
  const lastKey = useRef<string>();
  performQuery(dispatch, select, key, action, lastKey.current);
  const result = select(selectQuery(key))!;
  lastKey.current = key;

  if ('selector' in action) {
    return [
      select(
        isAmosObject<Box>(action.selector, 'box')
          ? action.selector
          : action.selector(...action.args),
      ),
      result,
    ];
  } else {
    return [result.value, result];
  }
};

export interface UseSuspenseQuery {
  <A extends any[] = any, R = any, S = any>(action: SelectableAction<A, R, S>): S;
  <A extends any[] = any, R = any>(action: Action<A, R>): Awaited<R>;
}

/**
 * `useSuspenseQuery` almost same to {@link useQuery}, except for it will throw the
 * returned value if it is a promise to work with react Suspense component.
 */
export const useSuspenseQuery: UseSuspenseQuery = (action: Action): any => {
  const [value, result] = useQuery(action);
  if (result.isPending()) {
    throw result._q;
  } else if (result.isRejected()) {
    throw result.error;
  }
  return value;
};

/*
 * @since 2020-11-03 13:31:31
 * @author acrazing <joking.young@gmail.com>
 */

import { Action } from './action';
import { Box, Mutation } from './box';
import { Selector } from './selector';
import { Signal } from './signal';
import { AmosObject, defineAmosObject, isArray } from './utils';

/**
 * the state snapshot in store
 *
 * @stable
 */
export type Snapshot = Record<string, unknown>;

/**
 * dispatchable things
 *
 * @stable
 */
export type Dispatchable<R = any> = Mutation<R> | Action<R> | Signal<R>;

/**
 * base amos signature, this is used for someone want to change the signature of useDispatch()
 *
 * @stable
 */
export interface AmosDispatch extends AmosObject<'store.dispatch'> {
  <R>(task: Dispatchable<R>): R;
  <R1>(tasks: readonly [Dispatchable<R1>]): [R1];
  <R1, R2>(tasks: readonly [Dispatchable<R1>, Dispatchable<R2>]): [R1, R2];
  <R1, R2, R3>(tasks: readonly [Dispatchable<R1>, Dispatchable<R2>, Dispatchable<R3>]): [
    R1,
    R2,
    R3,
  ];
  <R1, R2, R3, R4>(
    tasks: readonly [Dispatchable<R1>, Dispatchable<R2>, Dispatchable<R3>, Dispatchable<R4>],
  ): [R1, R2, R3, R4];
  <R1, R2, R3, R4, R5>(
    tasks: readonly [
      Dispatchable<R1>,
      Dispatchable<R2>,
      Dispatchable<R3>,
      Dispatchable<R4>,
      Dispatchable<R5>,
    ],
  ): [R1, R2, R3, R4, R5];
  <R1, R2, R3, R4, R5, R6>(
    tasks: readonly [
      Dispatchable<R1>,
      Dispatchable<R2>,
      Dispatchable<R3>,
      Dispatchable<R4>,
      Dispatchable<R5>,
      Dispatchable<R6>,
    ],
  ): [R1, R2, R3, R4, R5, R6];
  <R1, R2, R3, R4, R5, R6, R7>(
    tasks: readonly [
      Dispatchable<R1>,
      Dispatchable<R2>,
      Dispatchable<R3>,
      Dispatchable<R4>,
      Dispatchable<R5>,
      Dispatchable<R6>,
      Dispatchable<R7>,
    ],
  ): [R1, R2, R3, R4, R5, R6, R7];
  <R1, R2, R3, R4, R5, R6, R7, R8>(
    tasks: readonly [
      Dispatchable<R1>,
      Dispatchable<R2>,
      Dispatchable<R3>,
      Dispatchable<R4>,
      Dispatchable<R5>,
      Dispatchable<R6>,
      Dispatchable<R7>,
      Dispatchable<R8>,
    ],
  ): [R1, R2, R3, R4, R5, R6, R7, R8];
  <R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    tasks: readonly [
      Dispatchable<R1>,
      Dispatchable<R2>,
      Dispatchable<R3>,
      Dispatchable<R4>,
      Dispatchable<R5>,
      Dispatchable<R6>,
      Dispatchable<R7>,
      Dispatchable<R8>,
      Dispatchable<R9>,
    ],
  ): [R1, R2, R3, R4, R5, R6, R7, R8, R9];
  <R>(tasks: readonly Dispatchable<R>[]): R[];
}

export interface Dispatch extends AmosDispatch {}

/**
 * selectable things
 *
 * @stable
 */
export type Selectable<R = any> = Box<R> | Selector<R>;

/**
 * select
 *
 * @stable
 */
export interface Select extends AmosObject<'store.select'> {
  <R>(selectable: Selectable<R>, snapshot?: Snapshot): R;
}

/**
 * Store
 *
 * @stable
 */
export interface Store {
  /**
   * get the state snapshot of the store.
   *
   * Please note that any mutation of the snapshot is silent.
   */
  snapshot: () => Snapshot;
  /**
   * dispatch one or more dispatchable things.
   */
  dispatch: Dispatch;
  /**
   * subscribe the mutations
   * @param fn
   */
  subscribe: (fn: (updatedState: Snapshot) => void) => () => void;
  /**
   * select a selectable thing
   */
  select: Select;
}

type SchedulerFn = (cb: () => void) => void;

export let batchedUpdates: SchedulerFn = (cb) => cb();

try {
  const reactDom = require('react-dom');
  if (reactDom.unstable_batchedUpdates) {
    batchedUpdates = reactDom.unstable_batchedUpdates;
  }
} catch {
  // 非 React 环境，不做处理
}

export type StoreEnhancer = (store: Store) => Store;

/**
 * create a store
 * @param preloadedState
 * @param enhancers
 *
 * @stable
 */
export function createStore(preloadedState?: Snapshot, ...enhancers: StoreEnhancer[]): Store {
  const state: Snapshot = {};
  const boxes: Box[] = [];
  const listeners: Set<(updatedSnapshot: Snapshot) => void> = new Set();
  const ensure = (box: Box) => {
    if (state.hasOwnProperty(box.key)) {
      return;
    }
    let boxState = box.initialState;
    if (preloadedState?.hasOwnProperty(box.key)) {
      boxState = box.preload(preloadedState[box.key], boxState);
    }
    state[box.key] = boxState;
    boxes.push(box);
  };

  let dispatchDepth = 0;
  let dispatchingSnapshot: Snapshot = {};

  function flushDispatchQueue() {
    if (--dispatchDepth === 0) {
      if (Object.keys(dispatchingSnapshot).length > 0) {
        const resultSnapshot = { ...dispatchingSnapshot };
        batchedUpdates(() => {
          listeners.forEach((fn) => fn(resultSnapshot));
        });
      }
    }
  }

  const record = (key: string, newState: unknown) => {
    if (newState !== state[key] || dispatchingSnapshot.hasOwnProperty(key)) {
      dispatchingSnapshot[key] = newState;
      state[key] = newState;
    }
  };

  const exec = (dispatchable: Dispatchable) => {
    switch (dispatchable.object) {
      case 'action':
        return dispatchable.actor(store.dispatch, store.select, ...dispatchable.args);
      case 'mutation':
        ensure(dispatchable.box);
        record(
          dispatchable.box.key,
          dispatchable.mutator(state[dispatchable.box.key], ...dispatchable.args),
        );
        return dispatchable.result;
      case 'signal':
        for (const box of boxes) {
          const fn = box.listeners[dispatchable.type];
          fn && record(box.key, fn(state[box.key], dispatchable.data));
        }
        return dispatchable.data;
    }
  };

  let selectingSnapshot: Snapshot | undefined;

  let store: Store = {
    snapshot: () => state,
    subscribe: function subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    dispatch: defineAmosObject('store.dispatch', function dispatch(
      tasks: Dispatchable | readonly Dispatchable[],
    ) {
      if (++dispatchDepth === 1) {
        dispatchingSnapshot = {};
      }

      let res;
      try {
        if (isArray(tasks)) {
          res = tasks.map(exec);
        } else {
          res = exec(tasks);
        }
      } catch {}

      Promise.resolve().then(flushDispatchQueue);

      return res;
    } as any),
    select: defineAmosObject('store.select', function select(
      selectable: Selectable,
      snapshot?: Snapshot,
    ) {
      if (typeof selectable === 'function') {
        if (snapshot) {
          if (selectingSnapshot) {
            throw new Error(`[Amos] recursive snapshot collection is not supported.`);
          }
          selectingSnapshot = snapshot;
          try {
            return selectable(store.select);
          } finally {
            selectingSnapshot = void 0;
          }
        } else {
          return selectable(store.select);
        }
      } else {
        ensure(selectable);
        if (selectingSnapshot) {
          selectingSnapshot[selectable.key] = state[selectable.key];
        }
        return state[selectable.key];
      }
    }) as any,
  };
  store = enhancers.reduce((previousValue, currentValue) => currentValue(previousValue), store);
  if (typeof process === 'object' && process.env.NODE_ENV === 'development') {
    Object.freeze(store);
  }
  return store;
}

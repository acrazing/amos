/*
 * @since 2021-08-02 10:50:14
 * @author junbao <junbao@mymoement.com>
 */

import {
  $amos,
  applyEnhancers,
  createEventCenter,
  Enhancer,
  isAmosObject,
  isObject,
  noop,
  toType,
  Unsubscribe,
} from 'amos-utils';
import { Box } from './box';
import { withBatch } from './enhancers/withBatch';
import { withCache } from './enhancers/withCache';
import { withConcurrent } from './enhancers/withConcurrent';
import { DevtoolsOptions, withDevtools } from './enhancers/withDevtools';
import { withPreload } from './enhancers/withPreload';
import { Dispatch, Dispatchable, Select, Selectable } from './types';

export type Snapshot = Record<string, unknown>;

export interface StoreOptions {
  /**
   * The preloaded state, which will be loaded to the store with {@link fromJS}.
   * This is effective for {@link withPreload}, which is always loaded.
   *
   * Known issue: built in classes like Date cannot be loaded. Maybe `class-transformer`
   * is required.
   */
  preloadedState?: Snapshot;

  /**
   * The store name, use for devtools
   */
  name?: string;

  /**
   * Enable devtools or not, if not set, will auto enable devtools if NODE_ENV
   * is development.
   */
  devtools?: DevtoolsOptions | boolean;
}

export interface Store {
  /**
   * Get the state snapshot or the store
   */
  snapshot: () => Readonly<Snapshot>;

  /**
   * Subscribe to store updates.
   *
   * The provided listener is called with no arguments after the root
   * dispatch has finished processing all mutations.
   */
  subscribe: (fn: () => void) => Unsubscribe;

  /**
   * Dispatch a dispatchable object to update the state of the store.
   */
  dispatch: Dispatch;

  /**
   * Select state of a box or selector.
   */
  select: Select;
}

export interface EnhanceableStore extends Store {
  /**
   * The mutable state of the store.
   */
  state: Snapshot;

  /**
   * Get preloaded state for box.
   */
  getPreloadedState: <S>(box: Box<S>, initialState: S) => S | undefined;

  /**
   * This function will be called after the store created.
   */
  onInit: () => void;

  /**
   * This function will be called after a box is mounted
   */
  onMount: <S>(box: Box<S>, initialState: S, preloadedState: S | undefined) => void;
}

export type StoreEnhancer = Enhancer<[StoreOptions], EnhanceableStore>;

export function createStore(options: StoreOptions = {}, ...enhancers: StoreEnhancer[]): Store {
  const store = applyEnhancers(
    [withDevtools(), withBatch(), withConcurrent(), withCache(), withPreload(), ...enhancers],
    [options],
    (): EnhanceableStore => {
      const ec = createEventCenter<[]>();
      let isDispatching = false;
      return {
        state: {},
        getPreloadedState: () => void 0,
        onInit: noop,
        onMount: noop,

        snapshot: () => store.state,
        subscribe: ec.subscribe,
        // only accepts Dispatchable here
        dispatch: (_task: any) => {
          const task: Dispatchable = _task;
          if (!isObject(task)) {
            throw new Error(`dispatching non-dispatchable type: ${toType(task)}`);
          }
          const isRoot = !isDispatching;
          isDispatching ||= true;
          try {
            let r: any;
            switch (task[$amos]) {
              case 'action':
                r = task.actor(store.dispatch, store.select);
                break;
              case 'mutation':
                const initialState = store.select(task.box);
                r = task.mutator(initialState);
                store.state[task.box.key] = r;
                break;
              case 'signal':
                r = task.creator(store.select, ...task.args);
                task.factory.dispatch(store.dispatch, store.select, r);
                break;
              default:
                throw new Error(
                  `dispatching non-dispatchable object: ${task[$amos] || toType(task)}`,
                );
            }
            if (isRoot) {
              isDispatching = false;
              ec.dispatch();
            }
            return r;
          } finally {
            if (isRoot && isDispatching) {
              isDispatching = false;
            }
          }
        },
        select: (_selectable: any): any => {
          const selectable: Selectable = _selectable;
          if (isAmosObject<Box>(selectable, 'box')) {
            if (!Object.hasOwn(store.state, selectable.key)) {
              const initial = selectable.getInitialState();
              const preloaded = store.getPreloadedState(selectable, initial);
              store.state[selectable.key] = preloaded === void 0 ? initial : preloaded;
              store.onMount(selectable, initial, preloaded);
            }
            return store.state[selectable.key];
          }
          return selectable.compute(store.select);
        },
      };
    },
  );
  store.onInit();
  return {
    snapshot: store.snapshot,
    subscribe: store.subscribe,
    dispatch: store.dispatch,
    select: store.select,
  };
}

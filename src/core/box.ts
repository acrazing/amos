/*
 * @since 2020-11-03 16:25:01
 * @author acrazing <joking.young@gmail.com>
 */

import { SignalFactory } from './signal';
import { fromJSON, JSONState } from './types';
import { clone } from './utils';

/**
 * A `Mutation` is a dispatchable object, which will update the
 * target box's state **synchronously** when you dispatch it.
 * The only way to create a `Mutation` is call the `MutationFactory`
 * which is created by calling `mutation()` method. You don't need
 * to pay attention to any properties of the `Mutation`.
 *
 * The return value of dispatch it is the action.
 *
 * @stable
 */
export interface Mutation<R = any, A extends any[] = any[], S = any> {
  object: 'mutation';
  type: string | undefined;
  box: Box<S>;
  args: A;
  result: R;
  mutator: (state: S, ...args: A) => S;
}

/**
 * A `Box` is an object to keep the information of a state node, includes
 * the `key`, `initialState`, and the state transformer.
 *
 * `Box` is selectable, the select result is the state of the box in the store.
 *
 * A `Box` could subscribe one or more events by calling `box.subscribe()`
 * method, which will mutate the state of the box when the event is dispatched.
 *
 * @stable
 */
export class Box<S = any> {
  readonly key: string;
  readonly initialState: S;
  readonly listeners: Record<string, (state: S, data: any) => S>;
  readonly preload: (preloadedState: JSONState<S>, state: S) => S;

  /**
   * Create a box.
   *
   * @param key the key of the box, it is used for keeping the relation of the box
   *            and its state in a store, it **SHOULD** be unique in your project.
   * @param initialState the initial state of the box, the state of a box **SHOULD**
   *                     be immutable, which means the mutators (include the mutations
   *                     and event subscribers) should return a new state if the updates
   *                     the state.
   * @param preload a function to transform the preloaded state to the state of the box
   *
   * @stable
   */
  constructor(
    key: string,
    initialState: S,
    preload: (preloadedState: JSONState<S>, state: S) => S = fromJSON,
  ) {
    this.key = key;
    this.initialState = initialState;
    this.preload = preload;
    this.listeners = {};
  }

  /**
   * subscribe an `event`, the `fn` will be called when you call
   * `store.dispatch(event(data))`, the first parameter of `fn` is
   * the state of the box, and the second one is the data of the
   * event, and its return value will be set as the new state of
   * the box.
   *
   * @param signal the event factory
   * @param fn the callback
   */
  listen<T>(signal: string | SignalFactory<any, T>, fn: (state: S, data: T) => S) {
    const type = typeof signal === 'string' ? signal : signal.type;
    this.listeners[type] = fn;
  }

  mutation<A extends any[]>(
    mutator: (state: S, ...args: A) => S,
    type?: string,
  ): (...args: A) => Mutation<A[0], A, S> {
    return (...args) => ({ object: 'mutation', type, box: this, args, result: args[0], mutator });
  }

  setState(newState: S | ((prevState: S) => S)): Mutation<void, [], S> {
    return {
      object: 'mutation',
      type: `${this.key}/setState`,
      box: this,
      args: [],
      result: void 0,
      mutator: (state) =>
        typeof newState === 'function' ? (newState as (prevState: S) => S)(state) : state,
    };
  }

  mergeState(props: Partial<S>): Mutation<void, [], S> {
    return {
      object: 'mutation',
      type: `${this.key}/mergeState`,
      box: this,
      args: [],
      result: void 0,
      mutator: (state) => clone(state, props),
    };
  }
}

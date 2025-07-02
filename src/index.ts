/*
 * @since 2020-11-03 13:22:41
 * @author acrazing <joking.young@gmail.com>
 */

export { JSONState, Mutation, Box } from './box';
export { Action, ActionOptions, ActionFactory, action } from './action';
export { Signal, SignalFactory, signal } from './signal';
export { Selector, SelectorFactory, selector } from './selector';
export {
  Dispatchable,
  Dispatch,
  Selectable,
  Select,
  Snapshot,
  StoreEnhancer,
  Store,
  createStore,
} from './store';
export { ProviderProps, Provider, ConsumerProps, Consumer } from './context';
export { useStore, useDispatch, MapSelector, useSelector } from './hooks';
export {
  identity,
  shallowEqual,
  isAmosObject,
  hoistMethod,
  arrayEqual,
  kAmosObject,
} from './utils';

export const VERSION: string = '__VERSION__';

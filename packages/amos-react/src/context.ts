/*
 * @since 2020-11-03 13:42:04
 * @author acrazing <joking.young@gmail.com>
 */

import { Dispatch, Store } from 'amos';
import { must } from 'amos-utils';
import { createContext, createElement, type ReactElement, ReactNode, useContext } from 'react';

const Context = createContext<Store | null>(null);

export interface ProviderProps {
  store: Store;
  children: ReactNode;
}

export const Provider = ({ store, children }: ProviderProps): ReactElement => {
  must(store, 'store is required for <Provider />.');
  return createElement(Context.Provider, { value: store }, children);
};

export function useStore(): Store {
  const state = useContext(Context);
  must(state, 'It seems you are using hooks without <Provider />.');
  return state;
}

export function useDispatch(): Dispatch {
  return useStore().dispatch;
}

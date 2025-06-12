/*
 * @since 2020-11-04 10:51:44
 * @author acrazing <joking.young@gmail.com>
 */

import { addGreet } from './action.spec';
import { mergeTest, setCount, testBox } from './box.spec';
import { logout } from './signal.spec';
import { createStore } from './store';
import fn = jest.fn;

describe('store', () => {
  it('should create store', () => {
    const store = createStore();
    expect(store.snapshot).toBeDefined();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
    expect(store.select).toBeDefined();
  });

  it('should pick state', () => {
    const store = createStore();
    expect(store.snapshot()).toEqual({});
    expect(store.select(testBox)).toEqual({ greets: [], count: 0 });
    expect(store.snapshot()).toEqual({ test: { greets: [], count: 0 } });
  });

  it('should preload state', () => {
    const store = createStore({ test: { greets: ['PRELOAD'], count: 1 } });
    expect(store.select(testBox)).toEqual({ greets: ['PRELOAD'], count: 1 });
  });

  it('should dispatch mutations', () => {
    const store = createStore({ test: { greets: ['MUTATION_PRELOAD'], count: 1 } });
    const r1 = store.dispatch(mergeTest({ greets: ['MUTATION'] }));
    expect(r1).toEqual({ greets: ['MUTATION'] });
    expect(store.select(testBox).greets).toEqual(['MUTATION_PRELOAD', 'MUTATION']);
  });

  it('should dispatch action', async () => {
    const store = createStore({ test: { greets: ['ACTION_PRELOAD'], count: 1 } });
    const r1 = await store.dispatch(addGreet('ACTION'));
    expect(r1).toEqual({ greets: ['ACTION'], count: 2 });
    expect(store.select(testBox).greets).toEqual(['ACTION_PRELOAD', 'ACTION']);
  });

  it('should dispatch event', () => {
    const store = createStore({ test: { greets: ['EVENT_PRELOAD'], count: 1 } });
    store.select(testBox);
    const r1 = store.dispatch(logout(2));
    expect(r1.count).toEqual(2);
    expect(store.select(testBox)).toEqual({ greets: [], count: 2 });
  });

  it('should batch dispatch', async () => {
    const store = createStore({ test: { greets: ['PRELOAD'], count: 1 } });
    store.select(testBox);
    const [r1, r2, r3] = await Promise.all(
      store.dispatch([logout(2), mergeTest({ greets: ['M1', 'M2'] }), addGreet('ADD')]),
    );
    expect(r1.count).toBe(2);
    expect(r2.greets).toEqual(['M1', 'M2']);
    expect(r3).toEqual({ greets: ['ADD'], count: 3 });
    expect(store.select(testBox).greets).toEqual(['M1', 'M2', 'ADD']);
  });

  it('should notify listeners', async () => {
    const store = createStore();
    const listener = fn();
    const disposer = store.subscribe(listener);
    store.dispatch([setCount(1), setCount(2)]);
    await Promise.resolve();
    expect(listener).toBeCalledTimes(1);
    listener.mockClear();
    store.dispatch(setCount(1));
    store.dispatch(setCount(2));
    await Promise.resolve();
    expect(listener).toBeCalledTimes(1);
    listener.mockClear();
    disposer();
    store.dispatch(setCount(1));
    await Promise.resolve();
    expect(listener).toBeCalledTimes(0);
  });
});

/*
 * @since 2024-10-20 13:11:56
 * @author junbao <junbao@moego.pet>
 */

import { act } from '@testing-library/react';
import { action, type Dispatch, type Select } from 'amos-core';
import { countBox, expectCalled, expectCalledWith } from 'amos-testing';
import { clone } from 'amos-utils';
import { renderDynamicHook } from './testUtils';
import { QueryResult, QueryResultMap, useQuery } from './useQuery';

const fn = async (dispatch: Dispatch, select: Select, multiply: number) => {
  dispatch(countBox.multiply(multiply));
  await new Promise((resolve) => setTimeout(resolve, 20));
  dispatch(countBox.multiply(multiply));
  return multiply;
};

const simpleFn = jest.fn(fn);
const simple = action(simpleFn, {
  key: 'simple',
});

const stateFn = jest.fn(fn);
const state = action(stateFn, {
  key: 'state',
}).select(countBox);

describe('useQuery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('should useQuery', async () => {
    const { result, mockFn, rerender } = renderDynamicHook(
      ({ multiply }) => useQuery(simple(multiply)),
      { count: 1 },
      { multiply: 2 },
    );
    expectCalled(mockFn, 1);
    const q1 = clone(new QueryResult(), {
      status: 'pending',
      _q: expect.any(Promise),
      value: void 0,
      error: void 0,
    });
    expect(result.current).toEqual([void 0, q1]);
    await act(async () => {
      jest.advanceTimersByTime(20);
      await result.current[1]._q;
    });
    expectCalled(mockFn, 1);
    expectCalled(simpleFn, 1);
    const q2 = clone(q1, { status: 'fulfilled', _q: void 0, value: 2 });
    expect(result.current).toEqual([2, q2]);
    const q3 = result.current[1];

    rerender({ multiply: 2 });
    expectCalled(mockFn, 1);
    expect(result.current[0]).toBe(2);
    expectCalled(simpleFn, 0);
    expect(result.current).toEqual([2, q2]);
    expect(result.current[1]).toBe(q3);

    rerender({ multiply: 1 });
    expectCalled(mockFn, 1);
    expect(result.current[0]).toBe(void 0);
    expectCalled(simpleFn, 0);

    await act(async () => {
      jest.advanceTimersByTime(20);
      await result.current[1]._q;
    });
    expectCalled(mockFn, 1);
    expect(result.current[0]).toBe(1);
    expectCalled(simpleFn, 1);
  });

  it('should useQuery with selector', async () => {
    const { result, mockFn } = renderDynamicHook(
      ({ multiply }) => useQuery(state(multiply)),
      { count: 1 },
      { multiply: 2 },
    );
    expectCalled(mockFn, 1);
    expectCalled(stateFn, 0);
    const q1 = clone(new QueryResult(), {
      status: 'pending',
      _q: expect.any(Promise),
      value: void 0,
      error: void 0,
    });
    expect(result.current).toEqual([1, q1]);
    await act(async () => {
      jest.advanceTimersByTime(20);
      await result.current[1]._q;
    });
    expectCalled(stateFn, 1);
    const q2 = clone(q1, { status: 'fulfilled', value: 2, _q: void 0 });
    expect(result.current).toEqual([4, q2]);
    expectCalledWith(mockFn, [{ multiply: 2 }, [4, q2]]);
  });

  it('should not dispatch for SSR', async () => {
    const { result, mockFn, rerender } = renderDynamicHook(
      ({ m, n }) => [useQuery(simple(m)), useQuery(n % 2 ? simple(n) : state(n))],
      {
        'amos.queries': {
          'simple:[2]': {
            status: 'fulfilled',
            value: 3, // fake value
          },
        },
      },
      { m: 2, n: 2 },
    );
    expectCalled(mockFn, 1);
    expect(result.current[0][1]._q).toBeUndefined();
    await act(async () => {
      jest.advanceTimersByTime(20);
      await result.current[1][1]._q;
    });
    expectCalled(simpleFn, 0);
    expectCalled(stateFn, 1);
    expectCalled(mockFn, 1);
    expect(result.current[0][0]).toEqual(3);
    expect(result.current[1][0]).toEqual(0);
    rerender({ m: 2, n: 5 });
    expectCalled(mockFn, 1);
    expect(result.current[1][0]).toEqual(void 0);
    await act(async () => {
      jest.advanceTimersByTime(20);
      await result.current[1][1]._q;
    });
    expectCalled(simpleFn, 1);
    expectCalled(stateFn, 0);
    expectCalled(mockFn, 1);
    expect(result.current[0][0]).toEqual(3);
    expect(result.current[1][0]).toEqual(5);
  });

  it('should serialize', () => {
    const r1 = clone(new QueryResult(), {
      _q: expect.any(Promise),
      status: 'fulfilled',
      value: 3, // fake value
      error: void 0,
    });
    expect(r1.toJSON()).toEqual({
      status: 'fulfilled',
      value: 3,
      error: void 0,
    });

    const queryMap = new QueryResultMap()
      .fromJS({
        '1': {
          status: 'fulfilled',
          value: 3,
          error: void 0,
        },
        '2': {
          status: 'rejected',
          value: void 0,
          error: {},
        },
        '3': {
          status: 'pending',
          value: void 0,
          error: {},
        },
      })
      .toJSON();
    const r2 = clone(r1, { _q: void 0, _ssr: 1 });
    expect(queryMap).toEqual({
      '1': r2,
      '2': clone(r2, { status: 'rejected', value: void 0, error: {} }),
    });
  });
});

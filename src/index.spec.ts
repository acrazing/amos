/*
 * @since 2020-11-18 01:09:57
 * @author acrazing <joking.young@gmail.com>
 */

import * as amos from './index';
import {
  action,
  arrayEqual,
  Box,
  Consumer,
  createStore,
  hoistMethod,
  identity,
  isAmosObject,
  Provider,
  selector,
  shallowEqual,
  signal,
  useDispatch,
  useSelector,
  kAmosObject,
  useStore,
  VERSION,
} from './index';

describe('amos', () => {
  it('should exports', () => {
    expect(amos).toEqual({
      createStore,
      Box,
      action,
      signal,
      selector,

      useStore,
      useDispatch,
      useSelector,
      Provider,
      Consumer,

      identity,
      shallowEqual,
      hoistMethod,
      isAmosObject,
      arrayEqual,
      VERSION,
      kAmosObject,
    });
  });
});

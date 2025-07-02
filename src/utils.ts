/*
 * @since 2020-11-04 11:12:36
 * @author acrazing <joking.young@gmail.com>
 */

/**
 * Returns the first argument
 * @param v
 */
export const identity = <T>(v: T) => v;

/**
 * Check two objects is shallow equal or not
 * @param a
 * @param b
 */
export function shallowEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }
  const ka = Object.keys(a) as Array<keyof T>;
  if (ka.length !== Object.keys(b).length) {
    return false;
  }
  for (let i = 0; i < ka.length; i++) {
    if (!b.hasOwnProperty(ka[i]) || a[ka[i]] !== b[ka[i]]) {
      return false;
    }
  }
  return true;
}

/**
 * Copy properties from src function to dst function, and returns dst
 *
 * @param src
 * @param dst
 */
export function hoistMethod<M extends (...args: any[]) => any>(
  src: M,
  dst: (...args: Parameters<M>) => ReturnType<M>,
): M {
  const copy = (name: PropertyKey) => {
    if (dst.hasOwnProperty(name)) {
      return;
    }
    Object.defineProperty(dst, name, Object.getOwnPropertyDescriptor(src, name)!);
  };
  Object.getOwnPropertyNames(src).forEach(copy);
  Object.getOwnPropertySymbols?.(src).forEach(copy);
  return dst as M;
}

export const kAmosObject: unique symbol =
  typeof Symbol === 'function' ? Symbol.for('AMOS_OBJECT') : ('Symbol(AMOS_OBJECT)' as any);

/**
 * A symbol indicates the object is a amos' object.
 */
export interface AmosObject<K extends string> {
  [kAmosObject]: K;
}

/** @internal */
export function defineAmosObject<K extends string, T extends object>(
  key: K,
  obj: T,
): T & AmosObject<K> {
  if (!obj.hasOwnProperty(kAmosObject)) {
    Object.defineProperty(obj, kAmosObject, { value: key });
  }
  return obj as any;
}

/**
 * Check an object is an amos object or not
 *
 * @param key
 * @param o
 */
export function isAmosObject<T extends AmosObject<any>>(
  key: T[typeof kAmosObject],
  o: any,
): o is T {
  return !!o && o[kAmosObject] === key;
}

/** @internal */
export function strictEqual<T>(a: T, b: T) {
  return a === b;
}

/**
 * Check two array is shallow equal or not
 * @param a
 * @param b
 */
export function arrayEqual<T extends ArrayLike<any>>(a: T, b: T) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/** @internal */
export function values<T extends object>(o: T): T[keyof T][] {
  return Object.keys(o).map((k) => o[k as keyof T]);
}

/** @internal */
export const isArray: (args: any) => args is any[] | readonly any[] = Array.isArray;

export function config<T extends object>(this: T, options: object): T {
  return Object.assign(this, { options });
}

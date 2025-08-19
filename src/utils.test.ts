import { describe, it, expect } from 'vitest';
import { isEqual, mergeState, optional } from './utils';
import { OPTIONAL_SYMBOL, StateFromInit } from './types';

describe('isEqual', () => {
  it('should return true for strictly equal values', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
  });

  it('should return true for deeply equal objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(isEqual(obj1, obj2)).toBe(true);
  });

  it('should return true for deeply equal arrays', () => {
    const arr1 = [1, { a: 1 }, [2, 3]];
    const arr2 = [1, { a: 1 }, [2, 3]];
    expect(isEqual(arr1, arr2)).toBe(true);
  });

  it('should return false for different values', () => {
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual('a', 'b')).toBe(false);
    expect(isEqual(true, false)).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
  });

  it('should return false for objects with different values', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(isEqual(obj1, obj2)).toBe(false);
  });

  it('should return false for objects with different keys', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { d: 2 } };
    expect(isEqual(obj1, obj2)).toBe(false);
  });

  it('should return false for arrays with different length', () => {
    const arr1 = [1, 2];
    const arr2 = [1, 2, 3];
    expect(isEqual(arr1, arr2)).toBe(false);
  });

  it('should return false for arrays with different order', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 2, 1];
    expect(isEqual(arr1, arr2)).toBe(false);
  });

  it('should return false for different types of objects', () => {
    expect(isEqual({}, [])).toBe(false);
    expect(isEqual(new Date(), {})).toBe(false);
    expect(isEqual(1, {})).toBe(false);
    expect(isEqual({}, 1)).toBe(false);
    expect(isEqual(null, {})).toBe(false);
    expect(isEqual({}, null)).toBe(false);
  });

  it('should return false when objB does not have a property present in objA', () => {
    const objA = { a: 1, b: 2 };
    const objB = { a: 1 };
    expect(isEqual(objA, objB)).toBe(false);
  });

  it('should handle Date objects correctly', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-01');
    const date3 = new Date('2023-01-02');
    expect(isEqual(date1, date2)).toBe(true);
    expect(isEqual(date1, date3)).toBe(false);
    expect(isEqual(date1, '2023-01-01')).toBe(false); // Different types
  });

  it('should handle circular references by returning false', () => {
    const obj1: any = {};
    obj1.a = obj1;
    const obj2: any = {};
    obj2.a = obj2;
    expect(isEqual(obj1, obj2)).toBe(false);
  });
});

describe('optional', () => {
  it('should return an OptionalValue object with the correct symbol and value', () => {
    const value = 'hello';
    const optionalValue = optional(value);
    expect(optionalValue[OPTIONAL_SYMBOL]).toBe(true);
    expect(optionalValue.value).toBe(value);
  });

  it('should handle undefined initial value', () => {
    const optionalValue = optional<string>();
    expect(optionalValue[OPTIONAL_SYMBOL]).toBe(true);
    expect(optionalValue.value).toBeUndefined();
  });

  it('should handle null initial value', () => {
    const optionalValue = optional<string | null>(null);
    expect(optionalValue[OPTIONAL_SYMBOL]).toBe(true);
    expect(optionalValue.value).toBeNull();
  });
});

describe('mergeState', () => {
  const INIT_STORE_DEFINITION = {
    user: { name: 'Jhon', age: 30, data: { status: 'active' } },
    task: optional({ id: 1, title: 'Test Task' }),
    counter: 0,
    list: [1, 2, 3],
  };

  type InitialStateUnwrapped = StateFromInit<typeof INIT_STORE_DEFINITION>;

  const INITIAL_STATE_UNWRAPPED: InitialStateUnwrapped = {
    user: { name: 'Jhon', age: 30, data: { status: 'active' } },
    task: { id: 1, title: 'Test Task' },
    counter: 0,
    list: [1, 2, 3],
  };

  it('should shallow merge top-level object slices', () => {
    const override = { user: { age: 31, newProp: 'value' } };
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    expect(result.user).toEqual({ name: 'Jhon', age: 31, data: { status: 'active' }, newProp: 'value' });
    expect(result.task).toEqual({ id: 1, title: 'Test Task' });
    expect(result.counter).toBe(0);
    expect(result.list).toEqual([1, 2, 3]);
  });

  it('should replace non-object top-level slices', () => {
    const override = { counter: 100 };
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    expect(result.counter).toBe(100);
    expect(result.user).toEqual(INITIAL_STATE_UNWRAPPED.user);
    expect(result.task).toEqual(INITIAL_STATE_UNWRAPPED.task);
    expect(result.list).toEqual(INITIAL_STATE_UNWRAPPED.list);
  });

  it('should replace optional slices when overridden with undefined', () => {
    const override = { task: undefined };
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    expect(result.task).toBeUndefined();
    expect(result.user).toEqual(INITIAL_STATE_UNWRAPPED.user);
    expect(result.counter).toBe(INITIAL_STATE_UNWRAPPED.counter);
    expect(result.list).toEqual(INITIAL_STATE_UNWRAPPED.list);
  });

  it('should replace optional slices when overridden with a value', () => {
    const override = { task: { id: 2, title: 'New Task' } };
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    expect(result.task).toEqual({ id: 2, title: 'New Task' });
    expect(result.user).toEqual(INITIAL_STATE_UNWRAPPED.user);
    expect(result.counter).toBe(INITIAL_STATE_UNWRAPPED.counter);
    expect(result.list).toEqual(INITIAL_STATE_UNWRAPPED.list);
  });

  it('should not shallow merge nested objects within a slice', () => {
    const override = { user: { data: { status: 'inactive', newProp: 'new' } } }; // Provide a complete data object
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    // The 'data' object should be replaced, not merged
    expect(result.user.data).toEqual({ status: 'inactive', newProp: 'new' });
    expect(result.user.name).toBe('Jhon');
    expect(result.user.age).toBe(30);
    expect(result.task).toEqual(INITIAL_STATE_UNWRAPPED.task);
    expect(result.counter).toBe(INITIAL_STATE_UNWRAPPED.counter);
    expect(result.list).toEqual(INITIAL_STATE_UNWRAPPED.list);
  });

  it('should handle empty override object', () => {
    const result = mergeState(INITIAL_STATE_UNWRAPPED, {});
    expect(result).toEqual(INITIAL_STATE_UNWRAPPED);
  });

  it('should handle arrays by replacement, not shallow merge', () => {
    const override = { list: [4, 5] };
    const result = mergeState(INITIAL_STATE_UNWRAPPED, override);
    expect(result.list).toEqual([4, 5]);
    expect(result.user).toEqual(INITIAL_STATE_UNWRAPPED.user);
    expect(result.task).toEqual(INITIAL_STATE_UNWRAPPED.task);
    expect(result.counter).toBe(INITIAL_STATE_UNWRAPPED.counter);
  });
});
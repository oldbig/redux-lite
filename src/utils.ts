import { OptionalValue, OPTIONAL_SYMBOL, StateFromInit, StateOverride } from './types';

/**
 * Marks a value in the store definition as optional.
 * This allows the property to be undefined in the state.
 *
 * @param initialValue The initial value of the property (optional).
 * @returns An object that signals the property is optional.
 */
export function optional<T>(initialValue?: T): OptionalValue<T> {
  return {
    [OPTIONAL_SYMBOL]: true,
    value: initialValue,
  };
}

// A simple deep-equal check for performance optimization.
export function isEqual(objA: any, objB: any, seen = new WeakSet()): boolean {
  if (objA === objB) return true;

  if (objA && typeof objA === 'object' && objB && typeof objB === 'object') {
    if (seen.has(objA)) return false; // Circular reference detected
    seen.add(objA);

    if (objA.constructor !== objB.constructor) return false;

    if (objA instanceof Date) {
      return objA.getTime() === objB.getTime();
    }

    if (Array.isArray(objA)) {
      if (objA.length !== objB.length) return false;
      for (let i = 0; i < objA.length; i++) {
        if (!isEqual(objA[i], objB[i], seen)) return false;
      }
      return true;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      if (!Object.prototype.hasOwnProperty.call(objB, key) || !isEqual(objA[key], objB[key], seen)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

// Merges the initial state with the override, shallowly merging object slices.
export function mergeState<T extends Record<string, any>>(base: StateFromInit<T>, override: StateOverride<StateFromInit<T>>): StateFromInit<T> {
  const newState = { ...base };
  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const baseValue = newState[key];
      const overrideValue = override[key];
      if (
        typeof baseValue === 'object' &&
        baseValue !== null &&
        !Array.isArray(baseValue) && // Do not shallow merge arrays
        typeof overrideValue === 'object' &&
        overrideValue !== null &&
        !Array.isArray(overrideValue) // Do not shallow merge arrays
      ) {
        // Shallow merge for object slices
        newState[key] = { ...baseValue, ...overrideValue };
      } else {
        // Replace for other types (primitives, arrays, null, undefined)
        newState[key] = overrideValue as any;
      }
    }
  }
  return newState;
}
export type FieldChangeCallback = (path: string, value: any, oldValue: any) => void;

const RAW_TARGET = Symbol('trackedRawTarget');

function isSkipTracking(obj: any): boolean {
  if (obj === null || typeof obj !== 'object') return true;
  if (obj.__v_skip || obj._isAMomentObject) return true;
  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Promise ||
    obj instanceof Error ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet ||
    obj instanceof ArrayBuffer ||
    ArrayBuffer.isView(obj)
  ) {
    return true;
  }
  if (typeof Node !== 'undefined' && obj instanceof Node) return true;
  if (typeof Window !== 'undefined' && obj instanceof Window) return true;
  return false;
}

export function untracked<T>(value: T): T {
  if (value && typeof value === 'object' && (value as any)[RAW_TARGET]) {
    return (value as any)[RAW_TARGET];
  }
  return value;
}

/**
 * Wraps `target` in a deep Proxy that invokes `onChange(path, value, oldValue)` on mutations.
 * Safe around Vue `reactive()` proxies; skips functions, built-ins, DOM nodes, and `__v_skip` objects.
 */
export function createTrackedState<T extends object>(
  target: T,
  onChange?: FieldChangeCallback,
  basePath = '',
  cache = new WeakMap<object, any>()
): T {
  if (isSkipTracking(target)) return target;

  const rawTarget = untracked(target) as T;
  if (cache.has(rawTarget)) {
    return cache.get(rawTarget);
  }

  const proxy = new Proxy(rawTarget, {
    get(obj, prop) {
      if (prop === RAW_TARGET) {
        return obj;
      }
      if (typeof prop === 'symbol' || (typeof prop === 'string' && prop.startsWith('__v_'))) {
        return Reflect.get(obj, prop, obj);
      }

      const val = Reflect.get(obj, prop, obj);
      if (typeof val === 'function') {
        return val;
      }
      if (!isSkipTracking(val)) {
        const nextPath = basePath ? `${basePath}.${String(prop)}` : String(prop);
        return createTrackedState(val as object, onChange, nextPath, cache);
      }
      return val;
    },

    set(obj, prop, value) {
      if (typeof prop === 'symbol' || (typeof prop === 'string' && prop.startsWith('__v_'))) {
        return Reflect.set(obj, prop, value, obj);
      }

      const nextValue = untracked(value);
      const oldValue = (obj as any)[prop];
      const result = Reflect.set(obj, prop, nextValue, obj);

      if (result && oldValue !== nextValue && prop !== 'length') {
        const currentPath = basePath ? `${basePath}.${String(prop)}` : String(prop);
        onChange?.(currentPath, nextValue, oldValue);
      }
      return result;
    },

    deleteProperty(obj, prop) {
      if (typeof prop === 'symbol' || (typeof prop === 'string' && prop.startsWith('__v_'))) {
        return Reflect.deleteProperty(obj, prop);
      }

      const hadKey = prop in obj;
      const oldValue = (obj as any)[prop];
      const result = Reflect.deleteProperty(obj, prop);

      if (result && hadKey) {
        const currentPath = basePath ? `${basePath}.${String(prop)}` : String(prop);
        onChange?.(currentPath, undefined, oldValue);
      }
      return result;
    },
  });

  cache.set(rawTarget, proxy);
  return proxy;
}

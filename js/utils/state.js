/**
 * Reactive settings store with key-based and global subscriptions.
 * Supports batched notifications and snapshot export.
 */

export function createState(initialState = {}) {
  const store = { ...initialState };
  const listeners = new Map(); // key -> Set of callbacks
  const wildcardListeners = new Set();

  function get(key) {
    return store[key];
  }

  function set(key, value, notify = true) {
    const prev = store[key];
    if (prev === value) return;
    store[key] = value;

    if (notify) {
      const specific = listeners.get(key);
      if (specific) {
        specific.forEach((fn) => {
          try {
            fn(value, prev, key);
          } catch (err) {
            console.error(`State listener error on "${key}":`, err);
          }
        });
      }

      wildcardListeners.forEach((fn) => {
        try {
          fn(key, value, prev);
        } catch (err) {
          console.error(`Wildcard state listener error on "${key}":`, err);
        }
      });
    }
  }

  function setMultiple(updates, notify = true) {
    for (const [key, value] of Object.entries(updates)) {
      set(key, value, notify);
    }
  }

  function subscribe(key, callback) {
    if (key === '*') {
      wildcardListeners.add(callback);
      return () => wildcardListeners.delete(callback);
    }

    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    const setGroup = listeners.get(key);
    setGroup.add(callback);

    return () => {
      setGroup.delete(callback);
      if (setGroup.size === 0) listeners.delete(key);
    };
  }

  function snapshot() {
    return { ...store };
  }

  return {
    get,
    set,
    setMultiple,
    subscribe,
    snapshot
  };
}

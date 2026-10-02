/**
 * Generic reusable object pool with allocation and reset hooks.
 */

export class ObjectPool {
  /**
   * @param {() => any} factory Creates a new item
   * @param {(item: any) => void} [resetFn] Resets an item on return
   * @param {number} [initialSize=0]
   */
  constructor(factory, resetFn = null, initialSize = 0) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  release(item) {
    if (!item) return;
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.pool.push(item);
  }

  clear(disposeFn = null) {
    if (disposeFn) {
      this.pool.forEach((item) => disposeFn(item));
    }
    this.pool.length = 0;
  }

  get size() {
    return this.pool.length;
  }
}

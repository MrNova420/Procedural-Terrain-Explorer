/**
 * Unified Keyboard, Mouse, and Pointer Lock input manager with drag fallback.
 */

export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Map();
    this.mouseDelta = { x: 0, y: 0 };
    this.isPointerLocked = false;
    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  onKeyDown(e) {
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
      return; // Ignore typing in UI inputs
    }
    this.keys.set(e.code, true);
  }

  onKeyUp(e) {
    this.keys.set(e.code, false);
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  onMouseMove(e) {
    if (this.isPointerLocked) {
      this.mouseDelta.x += e.movementX || 0;
      this.mouseDelta.y += e.movementY || 0;
    } else if (this.isMouseDown) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.mouseDelta.x += dx;
      this.mouseDelta.y += dy;
    }
  }

  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  requestPointerLock() {
    try {
      this.domElement.requestPointerLock();
    } catch (e) {
      console.warn('Pointer lock request rejected:', e);
    }
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  consumeMouseDelta() {
    const delta = { x: this.mouseDelta.x, y: this.mouseDelta.y };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  isKeyPressed(code) {
    return Boolean(this.keys.get(code));
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }
}

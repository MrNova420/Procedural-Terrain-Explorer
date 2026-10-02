/**
 * Touch controls: virtual movement joystick, touch look-drag, and action buttons.
 */

export class TouchControls {
  constructor(container, inputManager) {
    this.container = container;
    this.input = inputManager;
    this.touchLookId = null;
    this.lastTouchX = 0;
    this.lastTouchY = 0;

    this.joystickTouchId = null;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickDelta = { x: 0, y: 0 };

    this.domElements = {};
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    const wrap = document.createElement('div');
    wrap.className = 'touch-overlay';
    wrap.innerHTML = `
      <div class="touch-zone touch-left" id="touch-left-zone">
        <div class="virtual-joystick" id="v-joystick" style="display:none;">
          <div class="joystick-base"></div>
          <div class="joystick-knob" id="v-knob"></div>
        </div>
      </div>
      <div class="touch-zone touch-right" id="touch-right-zone">
        <div class="touch-buttons">
          <button class="touch-btn" id="btn-touch-up">▲</button>
          <button class="touch-btn" id="btn-touch-down">▼</button>
          <button class="touch-btn touch-btn-boost" id="btn-touch-boost">⚡</button>
        </div>
      </div>
    `;
    this.container.appendChild(wrap);

    this.domElements = {
      wrap,
      leftZone: wrap.querySelector('#touch-left-zone'),
      rightZone: wrap.querySelector('#touch-right-zone'),
      joystick: wrap.querySelector('#v-joystick'),
      knob: wrap.querySelector('#v-knob'),
      btnUp: wrap.querySelector('#btn-touch-up'),
      btnDown: wrap.querySelector('#btn-touch-down'),
      btnBoost: wrap.querySelector('#btn-touch-boost')
    };
  }

  bindEvents() {
    const { leftZone, rightZone, btnUp, btnDown, btnBoost } = this.domElements;

    // Joystick touch
    leftZone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.joystickOrigin = { x: touch.clientX, y: touch.clientY };
      this.domElements.joystick.style.display = 'block';
      this.domElements.joystick.style.left = `${touch.clientX - 50}px`;
      this.domElements.joystick.style.top = `${touch.clientY - 50}px`;
      this.domElements.knob.style.transform = 'translate(0px, 0px)';
    }, { passive: false });

    leftZone.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          e.preventDefault();
          const dx = touch.clientX - this.joystickOrigin.x;
          const dy = touch.clientY - this.joystickOrigin.y;
          const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
          const angle = Math.atan2(dy, dx);

          const kx = Math.cos(angle) * dist;
          const ky = Math.sin(angle) * dist;
          this.domElements.knob.style.transform = `translate(${kx}px, ${ky}px)`;

          // Synthesize keys
          this.input.keys.set('KeyW', ky < -10);
          this.input.keys.set('KeyS', ky > 10);
          this.input.keys.set('KeyA', kx < -10);
          this.input.keys.set('KeyD', kx > 10);
        }
      }
    }, { passive: false });

    const endJoystick = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.domElements.joystick.style.display = 'none';
          this.input.keys.set('KeyW', false);
          this.input.keys.set('KeyS', false);
          this.input.keys.set('KeyA', false);
          this.input.keys.set('KeyD', false);
        }
      }
    };
    leftZone.addEventListener('touchend', endJoystick);
    leftZone.addEventListener('touchcancel', endJoystick);

    // Look touch
    rightZone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      if (this.touchLookId === null) {
        this.touchLookId = touch.identifier;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
      }
    }, { passive: true });

    rightZone.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchLookId) {
          const dx = touch.clientX - this.lastTouchX;
          const dy = touch.clientY - this.lastTouchY;
          this.lastTouchX = touch.clientX;
          this.lastTouchY = touch.clientY;

          this.input.mouseDelta.x += dx * 1.5;
          this.input.mouseDelta.y += dy * 1.5;
        }
      }
    }, { passive: true });

    const endLook = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchLookId) {
          this.touchLookId = null;
        }
      }
    };
    rightZone.addEventListener('touchend', endLook);
    rightZone.addEventListener('touchcancel', endLook);

    // Buttons
    const bindBtn = (elem, key) => {
      elem.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.input.keys.set(key, true);
      });
      elem.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.input.keys.set(key, false);
      });
    };

    bindBtn(btnUp, 'Space');
    bindBtn(btnDown, 'ShiftLeft');
    bindBtn(btnBoost, 'ControlLeft');
  }
}

/**
 * Help Overlay displaying keyboard, mouse, and touch control references.
 */

export class HelpOverlay {
  constructor(container) {
    this.container = container;
    this.visible = false;

    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'help-overlay modal-hidden';
    this.overlayEl.id = 'help-overlay';

    this.overlayEl.innerHTML = `
      <div class="help-card">
        <div class="help-header">
          <h2>Explorer Controls Guide</h2>
          <button class="help-close-btn" id="help-close-btn">✕</button>
        </div>
        <div class="help-grid">
          <div class="help-section">
            <h3>Desktop Navigation</h3>
            <ul>
              <li><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> - Move / Strafe</li>
              <li><kbd>Space</kbd> - Fly Up / Jump</li>
              <li><kbd>Shift</kbd> / <kbd>C</kbd> - Fly Down</li>
              <li><kbd>Ctrl</kbd> - Speed Boost / Sprint</li>
              <li><kbd>Mouse Look</kbd> - Look around (Pointer Lock)</li>
              <li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> - Switch Fly / Walk / Orbit</li>
            </ul>
          </div>
          <div class="help-section">
            <h3>Shortcuts & UI</h3>
            <ul>
              <li><kbd>G</kbd> - Toggle World Control Panel</li>
              <li><kbd>H</kbd> - Toggle this Help Menu</li>
              <li><kbd>P</kbd> - Capture High-Res Screenshot</li>
              <li><kbd>Esc</kbd> - Release Pointer Lock</li>
            </ul>
          </div>
        </div>
        <div class="help-footer">
          <p>Press <kbd>H</kbd> or click ✕ to close</p>
        </div>
      </div>
    `;

    this.container.appendChild(this.overlayEl);

    this.overlayEl.querySelector('#help-close-btn').addEventListener('click', () => this.toggle());
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) this.toggle();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    this.overlayEl.classList.toggle('modal-hidden', !this.visible);
  }

  show() {
    this.visible = true;
    this.overlayEl.classList.remove('modal-hidden');
  }

  hide() {
    this.visible = false;
    this.overlayEl.classList.add('modal-hidden');
  }
}

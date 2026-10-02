/**
 * HUD Overlay: FPS, Coordinates, Altitude, Time of Day, Seed, and Quick Action buttons.
 */

export class Hud {
  constructor(container, state, callbacks = {}) {
    this.container = container;
    this.state = state;
    this.callbacks = callbacks;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud-container';
    this.hudEl.innerHTML = `
      <div class="hud-stats">
        <div class="hud-stat-item"><span class="hud-label">FPS</span> <span class="hud-val" id="hud-fps">60</span></div>
        <div class="hud-stat-item"><span class="hud-label">POS</span> <span class="hud-val" id="hud-pos">0, 0</span></div>
        <div class="hud-stat-item"><span class="hud-label">ALT</span> <span class="hud-val" id="hud-alt">0 m</span></div>
        <div class="hud-stat-item"><span class="hud-label">TIME</span> <span class="hud-val" id="hud-time">12:00</span></div>
        <div class="hud-stat-item"><span class="hud-label">CHUNKS</span> <span class="hud-val" id="hud-chunks">0</span></div>
      </div>
      <div class="hud-top-right">
        <button class="hud-icon-btn" id="hud-btn-panel" title="Toggle Controls (G)">⚙</button>
        <button class="hud-icon-btn" id="hud-btn-help" title="Controls Help (H)">?</button>
        <button class="hud-icon-btn" id="hud-btn-photo" title="Capture Screenshot (P)">📷</button>
      </div>
    `;

    this.container.appendChild(this.hudEl);

    this.fpsEl = this.hudEl.querySelector('#hud-fps');
    this.posEl = this.hudEl.querySelector('#hud-pos');
    this.altEl = this.hudEl.querySelector('#hud-alt');
    this.timeEl = this.hudEl.querySelector('#hud-time');
    this.chunksEl = this.hudEl.querySelector('#hud-chunks');

    this.bindButtons();
  }

  bindButtons() {
    this.hudEl.querySelector('#hud-btn-panel').addEventListener('click', () => {
      if (this.callbacks.onTogglePanel) this.callbacks.onTogglePanel();
    });
    this.hudEl.querySelector('#hud-btn-help').addEventListener('click', () => {
      if (this.callbacks.onToggleHelp) this.callbacks.onToggleHelp();
    });
    this.hudEl.querySelector('#hud-btn-photo').addEventListener('click', () => {
      if (this.callbacks.onScreenshot) this.callbacks.onScreenshot();
    });
  }

  update(fps, playerPos, timeOfDayHours, chunkCount) {
    if (this.fpsEl) {
      this.fpsEl.textContent = fps;
      this.fpsEl.style.color = fps >= 45 ? '#4ade80' : fps >= 25 ? '#facc15' : '#f87171';
    }

    if (playerPos) {
      this.posEl.textContent = `${Math.round(playerPos.x)}, ${Math.round(playerPos.z)}`;
      this.altEl.textContent = `${Math.round(playerPos.y)} m`;
    }

    if (timeOfDayHours !== undefined) {
      const hrs = Math.floor(timeOfDayHours);
      const mins = Math.floor((timeOfDayHours % 1) * 60);
      const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      this.timeEl.textContent = timeStr;
    }

    if (chunkCount !== undefined) {
      this.chunksEl.textContent = chunkCount;
    }
  }
}

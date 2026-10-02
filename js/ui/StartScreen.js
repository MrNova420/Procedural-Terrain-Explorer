/**
 * Start Screen overlay for seed input, biome selection, and launching exploration.
 */

import { BIOMES } from '../config/biomes.js';

export function createStartScreen(container, state, onStart) {
  const overlay = document.createElement('div');
  overlay.className = 'start-screen-overlay';
  overlay.id = 'start-screen';

  overlay.innerHTML = `
    <div class="start-card">
      <div class="start-badge">WebGL 3D Explorer</div>
      <h1 class="start-title">TERRAIN EXPLORER</h1>
      <p class="start-desc">
        Infinite, deterministic procedural landscapes generated in real-time with custom GLSL shaders.
      </p>

      <div class="start-field">
        <label class="start-label">World Seed</label>
        <div class="start-input-row">
          <input type="text" id="start-seed-input" class="start-input" value="${state.get('seed')}" />
          <button id="start-seed-random" class="start-btn-secondary" title="Random Seed">🎲</button>
        </div>
      </div>

      <div class="start-field">
        <label class="start-label">Choose Biome</label>
        <div class="biome-pills" id="start-biome-pills">
          ${Object.values(BIOMES)
            .map(
              (b) => `
            <button class="biome-pill ${b.id === state.get('biome') ? 'active' : ''}" data-biome="${b.id}">
              ${b.name}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <button id="start-btn-enter" class="start-btn-primary">
        <span>ENTER WORLD</span>
        <span class="btn-arrow">→</span>
      </button>

      <div class="start-hints">
        <span>Controls: <b>WASD</b> move, <b>Space/Shift</b> fly, <b>G</b> settings, <b>H</b> help</span>
      </div>
    </div>
  `;

  container.appendChild(overlay);

  const seedInput = overlay.querySelector('#start-seed-input');
  const seedRandom = overlay.querySelector('#start-seed-random');
  const enterBtn = overlay.querySelector('#start-btn-enter');
  const pills = overlay.querySelectorAll('.biome-pill');

  seedInput.addEventListener('input', (e) => {
    state.set('seed', e.target.value.trim() || 'Orbit');
  });

  seedRandom.addEventListener('click', () => {
    const rSeed = 'Orbit_' + Math.floor(Math.random() * 90000 + 10000);
    seedInput.value = rSeed;
    state.set('seed', rSeed);
  });

  pills.forEach((p) => {
    p.addEventListener('click', () => {
      pills.forEach((el) => el.classList.remove('active'));
      p.classList.add('active');
      state.set('biome', p.dataset.biome);
    });
  });

  enterBtn.addEventListener('click', () => {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 450);
    onStart();
  });

  return {
    element: overlay,
    show: () => {
      overlay.style.display = 'flex';
      overlay.classList.remove('fade-out');
    },
    hide: () => {
      overlay.style.display = 'none';
    }
  };
}

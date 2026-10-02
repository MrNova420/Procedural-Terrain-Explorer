/**
 * Top-down 2D Canvas Minimap sampled live from the terrain height sampler.
 */

import * as THREE from 'three';

export function createMinimap(container, sampler) {
  const size = 130;
  const range = 240; // World units around player

  const wrap = document.createElement('div');
  wrap.className = 'minimap-container';
  wrap.innerHTML = `
    <canvas width="${size}" height="${size}" class="minimap-canvas" id="minimap-canvas"></canvas>
    <div class="minimap-compass" id="minimap-compass">N</div>
  `;
  container.appendChild(wrap);

  const canvas = wrap.querySelector('#minimap-canvas');
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  let lastSampleX = Infinity;
  let lastSampleZ = Infinity;
  let lastSampleTime = 0;

  function getColorForHeight(h, waterLevel, heightScale) {
    if (h < waterLevel) return [25, 90, 140]; // Water
    if (h < waterLevel + 2.0) return [215, 195, 140]; // Sand
    if (h < waterLevel + heightScale * 0.4) return [65, 120, 50]; // Grass
    if (h < waterLevel + heightScale * 0.7) return [110, 105, 95]; // Rock
    return [240, 245, 250]; // Snow
  }

  function renderMap(playerPos, cameraQuat) {
    const now = performance.now();
    const settings = sampler.getSettings();
    const waterLevel = settings.waterLevel !== undefined ? settings.waterLevel : 0.0;
    const heightScale = settings.heightScale || 48;

    // Resample map if player moved > 4 units or 200ms passed
    const dx = playerPos.x - lastSampleX;
    const dz = playerPos.z - lastSampleZ;
    if (dx * dx + dz * dz > 16 || now - lastSampleTime > 250) {
      lastSampleX = playerPos.x;
      lastSampleZ = playerPos.z;
      lastSampleTime = now;

      const halfR = range / 2;
      const step = range / size;

      for (let py = 0; py < size; py++) {
        const wz = playerPos.z - halfR + py * step;
        for (let px = 0; px < size; px++) {
          const wx = playerPos.x - halfR + px * step;
          const h = sampler.getHeight(wx, wz);
          const [r, g, b] = getColorForHeight(h, waterLevel, heightScale);

          const idx = (py * size + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 230;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw player arrow in center
    const cx = size / 2;
    const cy = size / 2;

    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuat);
    const angle = Math.atan2(dir.x, -dir.z);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Arrow pointer
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  return {
    element: wrap,
    update: renderMap
  };
}

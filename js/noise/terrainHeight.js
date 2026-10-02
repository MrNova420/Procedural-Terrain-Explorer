/**
 * Single source of truth for terrain height, normals, slope, and biome data.
 * Used by chunk meshes, physics/walk mode, vegetation placement, and minimap.
 */

import { createSimplex } from './simplex.js';
import { fbm2D, ridged2D, domainWarp2D } from './fbm.js';
import { clamp, smoothstep } from '../utils/math.js';

export function createTerrainSampler(initialSettings) {
  let settings = { ...initialSettings };
  let simplex = createSimplex(settings.seed);
  let moistureSimplex = createSimplex((settings.seed || '') + '_moisture');

  function rebuild(newSettings) {
    settings = { ...settings, ...newSettings };
    if (newSettings.seed !== undefined) {
      simplex = createSimplex(settings.seed);
      moistureSimplex = createSimplex(settings.seed + '_moisture');
    }
  }

  function getHeight(x, z) {
    const noise2D = simplex.noise2D;
    let wx = x;
    let wz = z;

    // Optional domain warping
    if (settings.warp && settings.warp > 0) {
      const warped = domainWarp2D(noise2D, x * settings.frequency, z * settings.frequency, settings.warp * 0.04, {
        octaves: 2
      });
      wx = warped.x / settings.frequency;
      wz = warped.y / settings.frequency;
    }

    const opts = {
      octaves: settings.octaves || 5,
      frequency: settings.frequency || 0.004,
      persistence: settings.persistence || 0.5,
      lacunarity: settings.lacunarity || 2.0
    };

    // Low-frequency rolling hills
    const baseFbm = fbm2D(noise2D, wx, wz, opts);

    // High-frequency sharp mountain ridges
    const ridgedAmount = settings.ridged !== undefined ? settings.ridged : 0.3;
    let elevation = baseFbm;

    if (ridgedAmount > 0) {
      const ridges = ridged2D(noise2D, wx + 120.5, wz + 77.3, {
        ...opts,
        octaves: Math.max(3, opts.octaves - 1),
        frequency: opts.frequency * 1.2
      });
      elevation = baseFbm * (1.0 - ridgedAmount) + ridges * ridgedAmount;
    }

    let h = elevation * (settings.heightScale || 48);

    // Island falloff modifier
    if (settings.island) {
      const r = settings.islandRadius || 280;
      const dist = Math.sqrt(x * x + z * z);
      const falloff = 1.0 - smoothstep(r * 0.45, r, dist);
      h = h * falloff - (1.0 - falloff) * 20.0;
    }

    return h;
  }

  function getNormal(x, z, out = { x: 0, y: 1, z: 0 }) {
    const eps = 0.5;
    const hL = getHeight(x - eps, z);
    const hR = getHeight(x + eps, z);
    const hD = getHeight(x, z - eps);
    const hU = getHeight(x, z + eps);

    const nx = hL - hR;
    const ny = 2.0 * eps;
    const nz = hD - hU;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    out.x = nx / len;
    out.y = ny / len;
    out.z = nz / len;
    return out;
  }

  function getSlope(x, z) {
    const eps = 0.5;
    const hL = getHeight(x - eps, z);
    const hR = getHeight(x + eps, z);
    const hD = getHeight(x, z - eps);
    const hU = getHeight(x, z + eps);
    const dx = (hR - hL) / (2.0 * eps);
    const dz = (hU - hD) / (2.0 * eps);
    return Math.sqrt(dx * dx + dz * dz);
  }

  function getMoisture(x, z) {
    const m = fbm2D(moistureSimplex.noise2D, x, z, {
      octaves: 3,
      frequency: (settings.frequency || 0.004) * 0.75,
      persistence: 0.5
    });
    return clamp(m * 0.5 + 0.5, 0, 1);
  }

  return {
    getHeight,
    getNormal,
    getSlope,
    getMoisture,
    rebuild,
    getSettings: () => ({ ...settings })
  };
}

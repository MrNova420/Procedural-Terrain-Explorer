/**
 * Deterministic rules for scattering trees, rocks, and vegetation across a chunk.
 */

import { createPRNG, hashString, randFloat } from '../../utils/prng.js';

/**
 * Returns lists of transforms for each vegetation type within a chunk.
 * @param {number} cx
 * @param {number} cz
 * @param {number} chunkSize
 * @param {string} seed
 * @param {object} sampler
 * @param {object} biome
 * @param {number} densityMult
 * @returns {{ pines: Array, deciduous: Array, cacti: Array, rocks: Array }}
 */
export function getChunkVegetationTransforms(cx, cz, chunkSize, seed, sampler, biome, densityMult = 1.0) {
  const result = {
    pines: [],
    deciduous: [],
    cacti: [],
    rocks: []
  };

  const chunkSeedStr = `${seed}_veg_${cx}_${cz}`;
  const rng = createPRNG(hashString(chunkSeedStr));

  const settings = sampler.getSettings();
  const waterLevel = settings.waterLevel !== undefined ? settings.waterLevel : 0.0;
  const heightScale = settings.heightScale || 48.0;

  const baseTreeCount = Math.floor(28 * (biome.vegetation.treeDensity || 0.6) * densityMult);
  const baseRockCount = Math.floor(18 * (biome.vegetation.rockDensity || 0.4) * densityMult);

  const startX = cx * chunkSize;
  const startZ = cz * chunkSize;
  const tempNorm = { x: 0, y: 1, z: 0 };

  // Tree placement candidates
  for (let i = 0; i < baseTreeCount; i++) {
    const wx = startX + randFloat(rng, 2.0, chunkSize - 2.0);
    const wz = startZ + randFloat(rng, 2.0, chunkSize - 2.0);

    const wy = sampler.getHeight(wx, wz);
    sampler.getNormal(wx, wz, tempNorm);

    const normH = (wy - waterLevel) / heightScale;
    const slope = tempNorm.y;

    // Rules: above water, gentle slope, below snow peak
    if (wy > waterLevel + 1.2 && slope > 0.72 && normH < 0.65) {
      const scale = randFloat(rng, 0.75, 1.35);
      const rotY = randFloat(rng, 0, Math.PI * 2);

      const transform = { x: wx, y: wy, z: wz, scale, rotY };

      if (biome.vegetation.cacti) {
        result.cacti.push(transform);
      } else {
        // High altitude favors pine, lower favors deciduous
        if (normH > 0.35 || !biome.vegetation.trees.includes('deciduous')) {
          result.pines.push(transform);
        } else {
          result.deciduous.push(transform);
        }
      }
    }
  }

  // Rock placement candidates
  for (let i = 0; i < baseRockCount; i++) {
    const wx = startX + randFloat(rng, 1.0, chunkSize - 1.0);
    const wz = startZ + randFloat(rng, 1.0, chunkSize - 1.0);

    const wy = sampler.getHeight(wx, wz);
    sampler.getNormal(wx, wz, tempNorm);

    // Rocks can be placed on steeper hills and coastlines
    if (wy > waterLevel - 1.0) {
      const scaleX = randFloat(rng, 0.6, 1.8);
      const scaleY = randFloat(rng, 0.5, 1.4);
      const scaleZ = randFloat(rng, 0.6, 1.8);
      const rotX = randFloat(rng, -0.2, 0.2);
      const rotY = randFloat(rng, 0, Math.PI * 2);
      const rotZ = randFloat(rng, -0.2, 0.2);

      result.rocks.push({
        x: wx,
        y: wy,
        z: wz,
        scaleX,
        scaleY,
        scaleZ,
        rotX,
        rotY,
        rotZ
      });
    }
  }

  return result;
}

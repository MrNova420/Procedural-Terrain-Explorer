/**
 * Seeded PRNG (Mulberry32) and string-to-seed hash utilities.
 * Deterministic random number generation for reproducible worlds.
 */

/**
 * MurmurHash3-inspired 32-bit hash from string.
 * @param {string|number} str
 * @returns {number} 32-bit integer seed
 */
export function hashString(str) {
  const s = String(str);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  return (h + (h << 5)) >>> 0;
}

/**
 * Creates a deterministic PRNG using Mulberry32.
 * @param {number|string} seed
 * @returns {() => number} Returns float in [0, 1)
 */
export function createPRNG(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : (seed >>> 0);
  if (a === 0) a = 0x6D2B79F5;

  return function next() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a random integer in [min, max] inclusive using given PRNG.
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Returns a random float in [min, max) using given PRNG.
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randFloat(rng, min, max) {
  return min + rng() * (max - min);
}

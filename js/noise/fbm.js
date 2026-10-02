/**
 * Fractional Brownian Motion (fBm), Ridged multi-fractal, and Domain Warping.
 */

export function fbm2D(noise2D, x, y, options = {}) {
  const octaves = options.octaves || 4;
  const lacunarity = options.lacunarity || 2.0;
  const persistence = options.persistence || 0.5;

  let total = 0;
  let frequency = options.frequency || 1.0;
  let amplitude = 1.0;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return maxValue > 0 ? total / maxValue : total;
}

export function ridged2D(noise2D, x, y, options = {}) {
  const octaves = options.octaves || 4;
  const lacunarity = options.lacunarity || 2.0;
  const persistence = options.persistence || 0.5;
  const gain = options.gain || 1.0;

  let total = 0;
  let frequency = options.frequency || 1.0;
  let amplitude = 1.0;
  let weight = 1.0;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    let signal = noise2D(x * frequency, y * frequency);
    signal = Math.abs(signal);
    signal = gain - signal;
    signal *= signal;
    signal *= weight;
    weight = Math.min(1.0, Math.max(0.0, signal * 2.0));

    total += signal * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return (maxValue > 0 ? total / maxValue : total) * 2.0 - 1.0;
}

export function domainWarp2D(noise2D, x, y, warpAmount, options = {}) {
  if (!warpAmount || warpAmount <= 0) return { x, y };

  const qx = fbm2D(noise2D, x, y, { ...options, octaves: 2 });
  const qy = fbm2D(noise2D, x + 5.2, y + 1.3, { ...options, octaves: 2 });

  const rx = fbm2D(noise2D, x + 4.0 * qx + 1.7, y + 4.0 * qy + 9.2, { ...options, octaves: 2 });
  const ry = fbm2D(noise2D, x + 4.0 * qx + 8.3, y + 4.0 * qy + 2.8, { ...options, octaves: 2 });

  return {
    x: x + warpAmount * rx,
    y: y + warpAmount * ry
  };
}

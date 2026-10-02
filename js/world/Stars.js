/**
 * Star field particle system with night-time opacity fading.
 */

import * as THREE from 'three';
import { createPRNG, randFloat } from '../utils/prng.js';
import { clamp } from '../utils/math.js';

export function createStarField(count = 1600) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const rng = createPRNG('stars_universe_seed');
  const radius = 800;

  for (let i = 0; i < count; i++) {
    // Generate uniform distribution on hemisphere
    const theta = randFloat(rng, 0, Math.PI * 2);
    const phi = Math.acos(randFloat(rng, 0.05, 1.0)); // upper hemisphere only

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    sizes[i] = randFloat(rng, 1.5, 3.5);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.0,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    sizeAttenuation: false
  });

  const points = new THREE.Points(geometry, material);

  function update(sunDirection, intensity = 1.0) {
    const isNight = sunDirection.y < 0.1;
    const nightFactor = clamp((-sunDirection.y + 0.1) * 2.5, 0.0, 1.0);
    material.opacity = nightFactor * intensity;
    points.visible = material.opacity > 0.01;
  }

  return {
    mesh: points,
    update
  };
}

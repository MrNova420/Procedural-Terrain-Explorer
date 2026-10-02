/**
 * Low-poly instanced fluffy clouds drifting across the sky.
 */

import * as THREE from 'three';
import { createPRNG, randFloat } from '../utils/prng.js';

export function createClouds(count = 48) {
  const group = new THREE.Group();

  // Create single cloud geometry by merging several spheres
  const cloudGeom = createSingleCloudGeometry();
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    flatShading: true
  });

  const instMesh = new THREE.InstancedMesh(cloudGeom, cloudMat, count);
  instMesh.castShadow = false;
  instMesh.receiveShadow = false;

  const dummy = new THREE.Object3D();
  const rng = createPRNG('clouds_world_seed');

  const cloudData = [];
  const spread = 700;

  for (let i = 0; i < count; i++) {
    const x = randFloat(rng, -spread, spread);
    const y = randFloat(rng, 100, 140);
    const z = randFloat(rng, -spread, spread);
    const scale = randFloat(rng, 6.0, 14.0);
    const speed = randFloat(rng, 1.5, 3.5);

    cloudData.push({ x, y, z, scale, speed });

    dummy.position.set(x, y, z);
    dummy.scale.set(scale, scale * 0.5, scale);
    dummy.rotation.y = randFloat(rng, 0, Math.PI * 2);
    dummy.updateMatrix();
    instMesh.setMatrixAt(i, dummy.matrix);
  }

  instMesh.instanceMatrix.needsUpdate = true;
  group.add(instMesh);

  function update(dt, cameraPos) {
    for (let i = 0; i < count; i++) {
      const c = cloudData[i];
      c.x += c.speed * dt;

      // Wrap around relative to camera
      if (cameraPos) {
        if (c.x - cameraPos.x > spread) c.x -= spread * 2;
        if (c.x - cameraPos.x < -spread) c.x += spread * 2;
        if (c.z - cameraPos.z > spread) c.z -= spread * 2;
        if (c.z - cameraPos.z < -spread) c.z += spread * 2;
      }

      dummy.position.set(c.x, c.y, c.z);
      dummy.scale.set(c.scale, c.scale * 0.45, c.scale);
      dummy.updateMatrix();
      instMesh.setMatrixAt(i, dummy.matrix);
    }
    instMesh.instanceMatrix.needsUpdate = true;
  }

  function setVisible(visible) {
    group.visible = visible;
  }

  return {
    group,
    update,
    setVisible
  };
}

function createSingleCloudGeometry() {
  const geo = new THREE.DodecahedronGeometry(1.0, 1);
  return geo;
}

/**
 * Sky dome mesh with dynamic custom shader uniforms.
 */

import * as THREE from 'three';
import { skyVert } from '../shaders/sky.vert.js';
import { skyFrag } from '../shaders/sky.frag.js';

export function createSkyDome() {
  const geometry = new THREE.SphereGeometry(900, 32, 24);

  const uniforms = {
    uSkyTop: { value: new THREE.Color('#3a7bd5') },
    uSkyBottom: { value: new THREE.Color('#9bc5ff') },
    uHorizonColor: { value: new THREE.Color('#9bc5ff') },
    uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
    uSunColor: { value: new THREE.Color(0xfffaed) },
    uMoonDirection: { value: new THREE.Vector3(-0.5, -0.8, -0.3) },
    uMoonColor: { value: new THREE.Color(0xddeeff) },
    uSunSize: { value: 1.0 }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    uniforms,
    side: THREE.BackSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geometry, material);

  function update(timeOfDay, cameraPosition) {
    if (cameraPosition) {
      mesh.position.copy(cameraPosition);
    }

    uniforms.uSkyTop.value.copy(timeOfDay.skyTop);
    uniforms.uSkyBottom.value.copy(timeOfDay.skyBottom);
    uniforms.uHorizonColor.value.copy(timeOfDay.horizonColor);
    uniforms.uSunDirection.value.copy(timeOfDay.sunDirection);
    uniforms.uSunColor.value.copy(timeOfDay.sunColor);
    uniforms.uMoonDirection.value.copy(timeOfDay.moonDirection);
  }

  return {
    mesh,
    update
  };
}

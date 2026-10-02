/**
 * Infinite-feeling animated water plane following the player.
 */

import * as THREE from 'three';
import { waterVert } from '../shaders/water.vert.js';
import { waterFrag } from '../shaders/water.frag.js';

export function createWater(config, biome) {
  const size = 900;
  const segments = 160;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uWaveHeight: { value: config.waveHeight || 0.7 },
    uWaveSpeed: { value: config.waveSpeed || 1.2 },
    uWaterColor: { value: new THREE.Color(config.waterColor || biome.waterColor) },
    uWaterDeepColor: { value: new THREE.Color(config.waterDeepColor || biome.waterDeepColor) },
    uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
    uSunColor: { value: new THREE.Color(0xfffaed) },
    uSkyColor: { value: new THREE.Color(0x9bc5ff) },
    uFogColor: { value: new THREE.Color('#c8e2f0') },
    uFogDensity: { value: 0.0035 },
    uFogNear: { value: 40.0 },
    uFogFar: { value: 380.0 },
    uOpacity: { value: config.waterOpacity || 0.88 },
    uFoamEnabled: { value: config.waterFoam !== false }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: waterVert,
    fragmentShader: waterFrag,
    uniforms,
    transparent: true,
    depthWrite: false,
    fog: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = config.waterLevel !== undefined ? config.waterLevel : 0.0;

  function update(dt, time, cameraPos, timeOfDay, biomeData) {
    uniforms.uTime.value = time;

    if (cameraPos) {
      mesh.position.x = cameraPos.x;
      mesh.position.z = cameraPos.z;
    }

    if (timeOfDay) {
      uniforms.uSunDirection.value.copy(timeOfDay.sunDirection);
      uniforms.uSunColor.value.copy(timeOfDay.sunColor);
      uniforms.uSkyColor.value.copy(timeOfDay.skyBottom);
      uniforms.uFogColor.value.copy(timeOfDay.fogColor);
      uniforms.uFogDensity.value = timeOfDay.fogDensity;
    }

    if (biomeData) {
      uniforms.uWaterColor.value.set(biomeData.waterColor);
      uniforms.uWaterDeepColor.value.set(biomeData.waterDeepColor);
    }
  }

  function setParams(waterLevel, waveHeight, waveSpeed, foamEnabled) {
    if (waterLevel !== undefined) mesh.position.y = waterLevel;
    if (waveHeight !== undefined) uniforms.uWaveHeight.value = waveHeight;
    if (waveSpeed !== undefined) uniforms.uWaveSpeed.value = waveSpeed;
    if (foamEnabled !== undefined) uniforms.uFoamEnabled.value = Boolean(foamEnabled);
  }

  return {
    mesh,
    uniforms,
    update,
    setParams
  };
}

/**
 * Terrain ShaderMaterial creator and uniform updater.
 */

import * as THREE from 'three';
import { terrainVert } from '../shaders/terrain.vert.js';
import { terrainFrag } from '../shaders/terrain.frag.js';

export function createTerrainMaterial(biome, config) {
  const c = biome.terrainColors;

  const uniforms = {
    uColorDeep: { value: new THREE.Color(c.deep) },
    uColorSand: { value: new THREE.Color(c.sand) },
    uColorGrass: { value: new THREE.Color(c.grass) },
    uColorForest: { value: new THREE.Color(c.forest) },
    uColorRock: { value: new THREE.Color(c.rock) },
    uColorSnow: { value: new THREE.Color(c.snow) },

    uWaterLevel: { value: config.waterLevel !== undefined ? config.waterLevel : 0.0 },
    uHeightScale: { value: config.heightScale || 48.0 },
    uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
    uSunColor: { value: new THREE.Color(0xfffaed) },
    uAmbientColor: { value: new THREE.Color(0x334455) },
    uFogColor: { value: new THREE.Color(biome.fogColorDay || '#c8e2f0') },
    uFogDensity: { value: 0.0035 },
    uFogNear: { value: 40.0 },
    uFogFar: { value: 380.0 }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: terrainVert,
    fragmentShader: terrainFrag,
    uniforms,
    wireframe: Boolean(config.wireframe),
    fog: false
  });

  function updateBiome(newBiome) {
    const pal = newBiome.terrainColors;
    uniforms.uColorDeep.value.set(pal.deep);
    uniforms.uColorSand.value.set(pal.sand);
    uniforms.uColorGrass.value.set(pal.grass);
    uniforms.uColorForest.value.set(pal.forest);
    uniforms.uColorRock.value.set(pal.rock);
    uniforms.uColorSnow.value.set(pal.snow);
  }

  function updateParams(waterLevel, heightScale) {
    if (waterLevel !== undefined) uniforms.uWaterLevel.value = waterLevel;
    if (heightScale !== undefined) uniforms.uHeightScale.value = heightScale;
  }

  function updateLighting(sunDir, sunCol, ambCol, fogCol, fogDens) {
    if (sunDir) uniforms.uSunDirection.value.copy(sunDir);
    if (sunCol) uniforms.uSunColor.value.copy(sunCol);
    if (ambCol) uniforms.uAmbientColor.value.copy(ambCol);
    if (fogCol) uniforms.uFogColor.value.copy(fogCol);
    if (fogDens !== undefined) uniforms.uFogDensity.value = fogDens;
  }

  return {
    instance: material,
    uniforms,
    updateBiome,
    updateParams,
    updateLighting
  };
}

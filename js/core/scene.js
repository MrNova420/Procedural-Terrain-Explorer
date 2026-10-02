/**
 * Scene hierarchy, lights, fog, and player-tracking shadow configuration.
 */

import * as THREE from 'three';

export function createScene(initialFogColor = '#c8e2f0', initialFogDensity = 0.0035) {
  const scene = new THREE.Scene();

  // NOTE: We do NOT set scene.fog here. Three.js would call refreshFogUniforms
  // on every material (including our custom ShaderMaterials) and crash because
  // they don't define the standard fogColor/fogDensity uniforms.
  // Fog is handled entirely inside our custom GLSL shaders via uFogColor/uFogDensity.
  const fog = new THREE.FogExp2(initialFogColor, initialFogDensity);

  // Ambient & hemisphere lights
  const ambientLight = new THREE.AmbientLight(0xddeeff, 0.45);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.4);
  hemiLight.position.set(0, 100, 0);
  scene.add(hemiLight);

  // Directional sun light with shadows
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;

  const d = 160;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.normalBias = 0.04;

  scene.add(sunLight);
  scene.add(sunLight.target);

  function updateShadowTarget(targetPosition) {
    if (!targetPosition) return;
    sunLight.target.position.set(targetPosition.x, 0, targetPosition.z);
    sunLight.target.updateMatrixWorld();
  }

  function updateLights(sunDir, sunCol, ambCol, fogCol, fogDens) {
    if (sunDir) {
      sunLight.position.set(
        sunLight.target.position.x + sunDir.x * 150,
        sunLight.target.position.y + Math.max(sunDir.y, 0.05) * 150,
        sunLight.target.position.z + sunDir.z * 150
      );
    }
    if (sunCol) {
      sunLight.color.copy(sunCol);
    }
    if (ambCol) {
      ambientLight.color.copy(ambCol);
    }
    // fog object is kept as a reference only; scene.fog is intentionally null.
    if (fogCol) {
      fog.color.copy(fogCol);
    }
    if (fogDens !== undefined) {
      fog.density = fogDens;
    }
  }

  return {
    instance: scene,
    fog,
    ambientLight,
    hemiLight,
    sunLight,
    updateShadowTarget,
    updateLights
  };
}

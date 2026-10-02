/**
 * WebGLRenderer initialization, pixel ratio management, and resize handling.
 */

import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  function resize(width, height, maxPixelRatio = 2.0) {
    const pr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    renderer.setPixelRatio(pr);
    renderer.setSize(width, height, false);
  }

  // Initial resize
  resize(window.innerWidth, window.innerHeight);

  return {
    instance: renderer,
    resize,
    domElement: renderer.domElement
  };
}

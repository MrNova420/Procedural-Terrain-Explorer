/**
 * Optional postprocessing pipeline (UnrealBloom, Vignette, Tone Mapping).
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.15 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      gl_FragColor = vec4(mix(tex.rgb, vec3(0.0), dot(uv, uv) * darkness), tex.a);
    }
  `
};

export function createPostProcessing(renderer, scene, camera) {
  let composer = null;
  let bloomPass = null;
  let vignettePass = null;
  let enabled = false;

  try {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35, // strength
      0.4,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);

    vignettePass = new ShaderPass(VignetteShader);
    composer.addPass(vignettePass);
  } catch (e) {
    console.warn('Post-processing initialization failed, falling back to direct render:', e);
    composer = null;
  }

  function resize(width, height) {
    if (composer) {
      composer.setSize(width, height);
      if (bloomPass) {
        bloomPass.resolution.set(width, height);
      }
    }
  }

  function render(dt) {
    if (enabled && composer) {
      composer.render(dt);
    } else {
      renderer.render(scene, camera);
    }
  }

  function setEnabled(val) {
    enabled = Boolean(val);
  }

  function setBloomIntensity(val) {
    if (bloomPass) {
      bloomPass.strength = val;
    }
  }

  return {
    render,
    resize,
    setEnabled,
    setBloomIntensity,
    isEnabled: () => enabled
  };
}

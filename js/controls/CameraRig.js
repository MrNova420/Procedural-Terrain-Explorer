/**
 * Camera Rig coordinating Fly, Walk, Orbit modes, and camera parameters.
 */

import * as THREE from 'three';
import { FlyControls } from './FlyControls.js';
import { WalkControls } from './WalkControls.js';
import { OrbitMode } from './OrbitMode.js';
import { TouchControls } from './touch.js';

export class CameraRig {
  constructor(canvas, domOverlay, input, sampler, config) {
    this.canvas = canvas;
    this.input = input;
    this.sampler = sampler;
    this.config = config;

    this.camera = new THREE.PerspectiveCamera(
      config.fov || 65,
      window.innerWidth / window.innerHeight,
      0.2,
      1200
    );

    // Initial position on high hill looking across landscape
    const startH = sampler.getHeight(0, 0);
    this.camera.position.set(0, Math.max(startH + 20, 25), 40);
    this.camera.lookAt(0, startH, -100);

    this.flyControls = new FlyControls(this.camera, input, sampler, config);
    this.walkControls = new WalkControls(this.camera, input, sampler, config);
    this.orbitControls = new OrbitMode(this.camera, canvas, sampler);

    // Mobile touch if supported
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch && domOverlay) {
      this.touch = new TouchControls(domOverlay, input);
    }

    this.mode = 'fly';
    this.setMode(config.cameraMode || 'fly');
  }

  setMode(mode) {
    this.mode = mode;
    this.orbitControls.deactivate();

    if (mode === 'orbit') {
      this.orbitControls.activate();
    } else if (mode === 'walk') {
      const curH = this.sampler.getHeight(this.camera.position.x, this.camera.position.z);
      this.camera.position.y = curH + (this.config.playerHeight || 2.0);
    }
  }

  setFov(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(dt) {
    if (this.mode === 'fly') {
      this.flyControls.update(dt);
    } else if (this.mode === 'walk') {
      this.walkControls.update(dt);
    } else if (this.mode === 'orbit') {
      this.orbitControls.update(dt);
    }
  }

  get position() {
    return this.camera.position;
  }

  get quaternion() {
    return this.camera.quaternion;
  }
}

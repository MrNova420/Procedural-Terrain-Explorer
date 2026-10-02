/**
 * OrbitControls wrapper for third-person landscape inspection.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class OrbitMode {
  constructor(camera, domElement, sampler) {
    this.camera = camera;
    this.domElement = domElement;
    this.sampler = sampler;

    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below horizon
    this.controls.minDistance = 5;
    this.controls.maxDistance = 600;
    this.controls.enabled = false;
  }

  activate(targetPos = null) {
    this.controls.enabled = true;
    if (targetPos) {
      this.controls.target.set(targetPos.x, targetPos.y, targetPos.z);
    } else {
      // Look 50 units ahead of camera
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this.controls.target.copy(this.camera.position).addScaledVector(dir, 40);
    }
  }

  deactivate() {
    this.controls.enabled = false;
  }

  update(dt) {
    if (!this.controls.enabled) return;
    this.controls.update();

    // Prevent camera from clipping through terrain
    const groundH = this.sampler.getHeight(this.camera.position.x, this.camera.position.z);
    if (this.camera.position.y < groundH + 3.0) {
      this.camera.position.y = groundH + 3.0;
    }
  }
}

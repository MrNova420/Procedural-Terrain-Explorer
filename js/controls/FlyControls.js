/**
 * Free-flight 6DOF camera controller with damping and terrain collision floor.
 */

import * as THREE from 'three';
import { damp } from '../utils/math.js';

export class FlyControls {
  constructor(camera, input, sampler, config) {
    this.camera = camera;
    this.input = input;
    this.sampler = sampler;
    this.config = config;

    this.velocity = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.minHeightAboveTerrain = 2.0;

    this.lookSpeed = 0.0022;
    this.damping = 8.0;
  }

  update(dt) {
    const mouseDelta = this.input.consumeMouseDelta();

    // Mouse look
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= mouseDelta.x * this.lookSpeed;
    this.euler.x -= mouseDelta.y * this.lookSpeed;
    this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);

    // Direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);

    const moveDir = new THREE.Vector3();

    if (this.input.isKeyPressed('KeyW')) moveDir.add(forward);
    if (this.input.isKeyPressed('KeyS')) moveDir.sub(forward);
    if (this.input.isKeyPressed('KeyD')) moveDir.add(right);
    if (this.input.isKeyPressed('KeyA')) moveDir.sub(right);
    if (this.input.isKeyPressed('Space')) moveDir.add(up);
    if (this.input.isKeyPressed('ShiftLeft') || this.input.isKeyPressed('KeyC')) moveDir.sub(up);

    let speed = this.config.flySpeed || 36;
    if (this.input.isKeyPressed('ControlLeft') || this.input.isKeyPressed('ControlRight')) {
      speed *= this.config.boostMultiplier || 2.5;
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      this.velocity.x = damp(this.velocity.x, targetVel.x, this.damping, dt);
      this.velocity.y = damp(this.velocity.y, targetVel.y, this.damping, dt);
      this.velocity.z = damp(this.velocity.z, targetVel.z, this.damping, dt);
    } else {
      this.velocity.x = damp(this.velocity.x, 0, this.damping, dt);
      this.velocity.y = damp(this.velocity.y, 0, this.damping, dt);
      this.velocity.z = damp(this.velocity.z, 0, this.damping, dt);
    }

    this.camera.position.addScaledVector(this.velocity, dt);

    // Terrain elevation floor
    const terrainH = this.sampler.getHeight(this.camera.position.x, this.camera.position.z);
    const minAllowedY = terrainH + this.minHeightAboveTerrain;
    if (this.camera.position.y < minAllowedY) {
      this.camera.position.y = minAllowedY;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }
  }
}

/**
 * Ground-following First-Person Walk controller with gravity, jumping, and water resistance.
 */

import * as THREE from 'three';
import { damp } from '../utils/math.js';

export class WalkControls {
  constructor(camera, input, sampler, config) {
    this.camera = camera;
    this.input = input;
    this.sampler = sampler;
    this.config = config;

    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.playerHeight = config.playerHeight || 2.0;
    this.gravity = 24.0;
    this.jumpForce = config.jumpForce || 10.5;

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.lookSpeed = 0.0022;
    this.damping = 10.0;
  }

  update(dt) {
    const mouseDelta = this.input.consumeMouseDelta();

    // Mouse look
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= mouseDelta.x * this.lookSpeed;
    this.euler.x -= mouseDelta.y * this.lookSpeed;
    this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);

    // Horizontal look direction
    const forward = new THREE.Vector3(-Math.sin(this.euler.y), 0, -Math.cos(this.euler.y)).normalize();
    const right = new THREE.Vector3(Math.cos(this.euler.y), 0, -Math.sin(this.euler.y)).normalize();

    const moveDir = new THREE.Vector3();
    if (this.input.isKeyPressed('KeyW')) moveDir.add(forward);
    if (this.input.isKeyPressed('KeyS')) moveDir.sub(forward);
    if (this.input.isKeyPressed('KeyD')) moveDir.add(right);
    if (this.input.isKeyPressed('KeyA')) moveDir.sub(right);

    let speed = this.config.walkSpeed || 9.0;
    if (this.input.isKeyPressed('ControlLeft') || this.input.isKeyPressed('ShiftLeft')) {
      speed *= 1.8; // Sprint
    }

    // Water resistance check
    const terrainH = this.sampler.getHeight(this.camera.position.x, this.camera.position.z);
    const waterLevel = this.config.waterLevel || 0.0;
    if (terrainH < waterLevel) {
      const depth = waterLevel - terrainH;
      speed *= Math.max(0.35, 1.0 - depth * 0.15);
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      this.velocity.x = damp(this.velocity.x, targetVel.x, this.damping, dt);
      this.velocity.z = damp(this.velocity.z, targetVel.z, this.damping, dt);
    } else {
      this.velocity.x = damp(this.velocity.x, 0, this.damping, dt);
      this.velocity.z = damp(this.velocity.z, 0, this.damping, dt);
    }

    // Jump
    if (this.isGrounded && this.input.isKeyPressed('Space')) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }

    // Apply gravity
    this.verticalVelocity -= this.gravity * dt;

    // Apply movement
    this.camera.position.x += this.velocity.x * dt;
    this.camera.position.z += this.velocity.z * dt;
    this.camera.position.y += this.verticalVelocity * dt;

    // Terrain ground snap
    const currentGroundY = this.sampler.getHeight(this.camera.position.x, this.camera.position.z);
    const targetEyeY = currentGroundY + this.playerHeight;

    if (this.camera.position.y <= targetEyeY) {
      this.camera.position.y = targetEyeY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
}

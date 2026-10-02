/**
 * Day/Night Cycle management, celestial orbits, dynamic lighting & fog colors.
 */

import * as THREE from 'three';
import { clamp } from '../utils/math.js';

export class TimeOfDay {
  constructor(initialTime = 14.5, timeSpeed = 0.05, autoTime = true) {
    this.time = initialTime; // in hours (0..24)
    this.timeSpeed = timeSpeed;
    this.autoTime = autoTime;

    this.sunDirection = new THREE.Vector3();
    this.moonDirection = new THREE.Vector3();
    this.sunColor = new THREE.Color();
    this.ambientColor = new THREE.Color();
    this.skyTop = new THREE.Color();
    this.skyBottom = new THREE.Color();
    this.horizonColor = new THREE.Color();
    this.fogColor = new THREE.Color();
    this.fogDensity = 0.0035;
  }

  update(dt, biome) {
    if (this.autoTime) {
      this.time = (this.time + this.timeSpeed * dt) % 24;
    }

    const rad = ((this.time - 6.0) / 24.0) * Math.PI * 2;
    const sunElevation = Math.sin(rad);
    const sunAzimuth = Math.cos(rad);

    this.sunDirection.set(sunAzimuth * 0.8, sunElevation, 0.4).normalize();
    this.moonDirection.set(-this.sunDirection.x, -this.sunDirection.y, -this.sunDirection.z);

    const isDay = sunElevation > 0;
    const dawnDusk = 1.0 - clamp(Math.abs(sunElevation) * 3.5, 0.0, 1.0);
    const dayFactor = clamp(sunElevation * 2.0, 0.0, 1.0);

    const daySun = new THREE.Color(0xfffaea);
    const sunsetSun = new THREE.Color(0xff6b35);
    const nightSun = new THREE.Color(0x111c38);

    // Sun & Ambient Colors
    if (isDay) {
      this.sunColor.copy(sunsetSun).lerp(daySun, dayFactor);
      this.ambientColor.set(0x3a4b5c).lerp(new THREE.Color(0x7a9cb8), dayFactor);
    } else {
      this.sunColor.copy(nightSun);
      this.ambientColor.set(0x0e1322);
    }

    // Sky Gradients
    const dayTop = new THREE.Color(biome.skyTopDay || '#3a7bd5');
    const dayBottom = new THREE.Color(biome.skyBottomDay || '#9bc5ff');
    const sunsetTop = new THREE.Color(0x381e4b);
    const sunsetBottom = new THREE.Color(0xfd746c);
    const nightTop = new THREE.Color(0x050814);
    const nightBottom = new THREE.Color(0x0e1526);

    if (isDay) {
      this.skyTop.copy(dayTop).lerp(sunsetTop, dawnDusk * 0.6);
      this.skyBottom.copy(dayBottom).lerp(sunsetBottom, dawnDusk);
      this.horizonColor.copy(dayBottom).lerp(sunsetBottom, dawnDusk);
    } else {
      this.skyTop.copy(nightTop);
      this.skyBottom.copy(nightBottom);
      this.horizonColor.copy(nightBottom);
    }

    // Fog Color
    const fogDay = new THREE.Color(biome.fogColorDay || '#c8e2f0');
    const fogNight = new THREE.Color(biome.fogColorNight || '#0d1527');
    const fogSunset = new THREE.Color(0xd47363);

    if (isDay) {
      this.fogColor.copy(fogDay).lerp(fogSunset, dawnDusk * 0.7);
    } else {
      this.fogColor.copy(fogNight);
    }
  }

  setTime(hours) {
    this.time = ((hours % 24) + 24) % 24;
  }
}

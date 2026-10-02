/**
 * Single Terrain Chunk instance: mesh, geometry pooling, and LOD management.
 */

import * as THREE from 'three';
import { buildChunkGeometry } from './chunkGeometry.js';

export class Chunk {
  constructor(size, material) {
    this.size = size;
    this.material = material;
    this.cx = 0;
    this.cz = 0;
    this.lod = -1;
    this.geometry = null;
    this.mesh = new THREE.Mesh();
    this.mesh.material = material.instance;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.key = '';
    this.inUse = false;
  }

  init(cx, cz, lod, sampler, segments) {
    this.cx = cx;
    this.cz = cz;
    this.lod = lod;
    this.key = `${cx},${cz}`;
    this.inUse = true;

    if (this.geometry) {
      this.geometry.dispose();
    }

    this.geometry = buildChunkGeometry(null, cx, cz, this.size, segments, sampler);
    this.mesh.geometry = this.geometry;
    this.mesh.visible = true;
  }

  updateLOD(lod, sampler, segments) {
    if (this.lod === lod) return;
    this.lod = lod;
    if (this.geometry) {
      this.geometry.dispose();
    }
    this.geometry = buildChunkGeometry(null, this.cx, this.cz, this.size, segments, sampler);
    this.mesh.geometry = this.geometry;
  }

  hide() {
    this.inUse = false;
    this.mesh.visible = false;
  }

  dispose() {
    this.inUse = false;
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
  }
}

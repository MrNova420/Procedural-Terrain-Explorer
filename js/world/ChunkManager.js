/**
 * Infinite chunk streaming coordinator: LODs, view distance, generation queue, and pooling.
 */

import { Chunk } from './Chunk.js';
import { ObjectPool } from '../utils/pool.js';

export class ChunkManager {
  constructor(scene, terrainMaterial, sampler, vegManager, config, biome) {
    this.scene = scene;
    this.material = terrainMaterial;
    this.sampler = sampler;
    this.vegManager = vegManager;
    this.config = config;
    this.biome = biome;

    this.chunkSize = config.chunkSize || 80;
    this.viewDistance = config.viewDistance || 4;
    this.lodSegments = [56, 28, 14];
    this.maxPerFrame = config.maxChunksPerFrame || 2;

    this.activeChunks = new Map(); // key -> Chunk
    this.buildQueue = []; // Array of { cx, cz, lod, distSq }
    this.chunkPool = new ObjectPool(
      () => new Chunk(this.chunkSize, this.material),
      (chunk) => chunk.hide()
    );

    this.lastCamChunkX = Infinity;
    this.lastCamChunkZ = Infinity;
    this.isRegenerating = false;
  }

  setQuality(lodSegments, viewDistance) {
    this.lodSegments = lodSegments;
    this.viewDistance = viewDistance;
    this.regenerateAll();
  }

  setBiome(biome) {
    this.biome = biome;
    this.material.updateBiome(biome);
    this.regenerateAll();
  }

  update(cameraPos) {
    if (!cameraPos) return;

    const cx = Math.floor(cameraPos.x / this.chunkSize);
    const cz = Math.floor(cameraPos.z / this.chunkSize);

    if (cx !== this.lastCamChunkX || cz !== this.lastCamChunkZ || this.isRegenerating) {
      this.lastCamChunkX = cx;
      this.lastCamChunkZ = cz;
      this.isRegenerating = false;
      this.planChunks(cx, cz);
    }

    this.processQueue();
  }

  planChunks(centerCx, centerCz) {
    const vd = this.viewDistance;
    const requiredKeys = new Set();
    const newTasks = [];

    for (let dx = -vd; dx <= vd; dx++) {
      for (let dz = -vd; dz <= vd; dz++) {
        const distSq = dx * dx + dz * dz;
        if (distSq <= vd * vd + 0.5) {
          const cx = centerCx + dx;
          const cz = centerCz + dz;
          const key = `${cx},${cz}`;
          requiredKeys.add(key);

          let targetLod = 0;
          if (distSq > 9) targetLod = 2;
          else if (distSq > 3) targetLod = 1;

          const existing = this.activeChunks.get(key);
          if (!existing) {
            newTasks.push({ cx, cz, lod: targetLod, distSq });
          } else if (existing.lod !== targetLod) {
            existing.updateLOD(targetLod, this.sampler, this.lodSegments[targetLod]);
          }
        }
      }
    }

    // Unload chunks outside view distance
    for (const [key, chunk] of this.activeChunks) {
      if (!requiredKeys.has(key)) {
        this.scene.remove(chunk.mesh);
        this.vegManager.removeChunk(chunk.cx, chunk.cz, this.scene);
        this.chunkPool.release(chunk);
        this.activeChunks.delete(key);
      }
    }

    // Sort new chunks: closest to player generated first
    newTasks.sort((a, b) => a.distSq - b.distSq);
    this.buildQueue = newTasks;
  }

  processQueue() {
    let processed = 0;
    while (this.buildQueue.length > 0 && processed < this.maxPerFrame) {
      const task = this.buildQueue.shift();
      const key = `${task.cx},${task.cz}`;

      if (this.activeChunks.has(key)) continue;

      const chunk = this.chunkPool.acquire();
      chunk.init(task.cx, task.cz, task.lod, this.sampler, this.lodSegments[task.lod]);

      this.scene.add(chunk.mesh);
      this.activeChunks.set(key, chunk);

      // Only populate vegetation on LOD 0 & 1 chunks
      if (task.lod <= 1) {
        this.vegManager.populateChunk(
          task.cx,
          task.cz,
          this.chunkSize,
          this.config.seed,
          this.sampler,
          this.biome,
          this.config.vegetationDensity || 1.0,
          this.scene
        );
      }

      processed++;
    }
  }

  regenerateAll() {
    for (const [, chunk] of this.activeChunks) {
      this.scene.remove(chunk.mesh);
      this.chunkPool.release(chunk);
    }
    this.activeChunks.clear();
    this.vegManager.clear(this.scene);
    this.buildQueue.length = 0;
    this.lastCamChunkX = Infinity;
    this.lastCamChunkZ = Infinity;
    this.isRegenerating = true;
  }

  getActiveCount() {
    return this.activeChunks.size;
  }

  isGenerating() {
    return this.buildQueue.length > 0;
  }
}

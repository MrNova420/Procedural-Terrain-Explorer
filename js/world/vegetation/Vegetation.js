/**
 * InstancedMesh vegetation coordinator with wind vertex animation.
 */

import * as THREE from 'three';
import { createPineGeometry, createDeciduousGeometry, createCactusGeometry } from './treeModels.js';
import { createRockGeometry } from './rockModels.js';
import { getChunkVegetationTransforms } from './placement.js';
import { glslWind } from '../../shaders/wind.glsl.js';

export class VegetationManager {
  constructor() {
    this.chunkMeshes = new Map(); // chunkKey -> Array of InstancedMesh
    this.windUniforms = {
      uTime: { value: 0 },
      uWindSpeed: { value: 1.2 },
      uWindStrength: { value: 0.4 }
    };

    // Geometries
    this.pineGeo = createPineGeometry();
    this.deciduousGeo = createDeciduousGeometry();
    this.cactusGeo = createCactusGeometry();
    this.rockGeo = createRockGeometry();

    // Materials
    this.pineMat = this.createTreeMaterial(0x2d5225, 0x4a3219);
    this.deciduousMat = this.createTreeMaterial(0x427b32, 0x543d22);
    this.cactusMat = this.createTreeMaterial(0x2f6e3b, 0x224e29);
    this.rockMat = new THREE.MeshLambertMaterial({ color: 0x7a756b, flatShading: true });

    this.dummy = new THREE.Object3D();
  }

  createTreeMaterial(foliageColorHex, trunkColorHex) {
    const mat = new THREE.MeshLambertMaterial({
      color: foliageColorHex,
      flatShading: true
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.windUniforms.uTime;
      shader.uniforms.uWindSpeed = this.windUniforms.uWindSpeed;
      shader.uniforms.uWindStrength = this.windUniforms.uWindStrength;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uWindSpeed;
        uniform float uWindStrength;
        ${glslWind}
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float hFactor = clamp(position.y * 0.25, 0.0, 1.0);
        transformed = applyWind(transformed, hFactor, uTime, uWindSpeed, uWindStrength);
        `
      );
    };

    return mat;
  }

  populateChunk(cx, cz, chunkSize, seed, sampler, biome, densityMult, scene) {
    const key = `${cx},${cz}`;
    if (this.chunkMeshes.has(key)) return;

    const data = getChunkVegetationTransforms(cx, cz, chunkSize, seed, sampler, biome, densityMult);
    const meshes = [];

    // Pines
    if (data.pines.length > 0) {
      const mesh = new THREE.InstancedMesh(this.pineGeo, this.pineMat, data.pines.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      data.pines.forEach((t, i) => {
        this.dummy.position.set(t.x, t.y, t.z);
        this.dummy.rotation.set(0, t.rotY, 0);
        this.dummy.scale.set(t.scale, t.scale, t.scale);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Deciduous
    if (data.deciduous.length > 0) {
      const mesh = new THREE.InstancedMesh(this.deciduousGeo, this.deciduousMat, data.deciduous.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      data.deciduous.forEach((t, i) => {
        this.dummy.position.set(t.x, t.y, t.z);
        this.dummy.rotation.set(0, t.rotY, 0);
        this.dummy.scale.set(t.scale, t.scale, t.scale);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Cacti
    if (data.cacti.length > 0) {
      const mesh = new THREE.InstancedMesh(this.cactusGeo, this.cactusMat, data.cacti.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      data.cacti.forEach((t, i) => {
        this.dummy.position.set(t.x, t.y, t.z);
        this.dummy.rotation.set(0, t.rotY, 0);
        this.dummy.scale.set(t.scale, t.scale, t.scale);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Rocks
    if (data.rocks.length > 0) {
      const mesh = new THREE.InstancedMesh(this.rockGeo, this.rockMat, data.rocks.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      data.rocks.forEach((t, i) => {
        this.dummy.position.set(t.x, t.y, t.z);
        this.dummy.rotation.set(t.rotX, t.rotY, t.rotZ);
        this.dummy.scale.set(t.scaleX, t.scaleY, t.scaleZ);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      meshes.push(mesh);
    }

    this.chunkMeshes.set(key, meshes);
  }

  removeChunk(cx, cz, scene) {
    const key = `${cx},${cz}`;
    const meshes = this.chunkMeshes.get(key);
    if (meshes) {
      meshes.forEach((m) => {
        scene.remove(m);
        m.dispose();
      });
      this.chunkMeshes.delete(key);
    }
  }

  clear(scene) {
    for (const [, meshes] of this.chunkMeshes) {
      meshes.forEach((m) => {
        scene.remove(m);
        m.dispose();
      });
    }
    this.chunkMeshes.clear();
  }

  update(time, windSpeed, windStrength) {
    this.windUniforms.uTime.value = time;
    if (windSpeed !== undefined) this.windUniforms.uWindSpeed.value = windSpeed;
    if (windStrength !== undefined) this.windUniforms.uWindStrength.value = windStrength;
  }
}

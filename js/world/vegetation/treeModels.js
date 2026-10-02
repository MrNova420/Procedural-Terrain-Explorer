/**
 * Low-poly procedural 3D model geometries for Pine, Deciduous, and Cactus trees.
 */

import * as THREE from 'three';

export function createPineGeometry() {
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.8, 5);
  trunkGeo.translate(0, 0.9, 0);

  const foliage1 = new THREE.ConeGeometry(2.0, 2.5, 5);
  foliage1.translate(0, 2.2, 0);

  const foliage2 = new THREE.ConeGeometry(1.5, 2.2, 5);
  foliage2.translate(0, 3.4, 0);

  const foliage3 = new THREE.ConeGeometry(1.0, 1.8, 5);
  foliage3.translate(0, 4.4, 0);

  const merged = mergeBufferGeometries([trunkGeo, foliage1, foliage2, foliage3]);
  return merged;
}

export function createDeciduousGeometry() {
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 2.2, 6);
  trunkGeo.translate(0, 1.1, 0);

  const crownGeo = new THREE.DodecahedronGeometry(1.8, 1);
  crownGeo.translate(0, 3.2, 0);

  const crownSub = new THREE.DodecahedronGeometry(1.2, 1);
  crownSub.translate(0.6, 2.8, 0.4);

  const merged = mergeBufferGeometries([trunkGeo, crownGeo, crownSub]);
  return merged;
}

export function createCactusGeometry() {
  const stem = new THREE.CylinderGeometry(0.35, 0.4, 3.5, 6);
  stem.translate(0, 1.75, 0);

  const arm1H = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 5);
  arm1H.rotateZ(Math.PI / 2);
  arm1H.translate(0.6, 2.0, 0);

  const arm1V = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 5);
  arm1V.translate(1.0, 2.4, 0);

  const arm2H = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 5);
  arm2H.rotateZ(-Math.PI / 2);
  arm2H.translate(-0.55, 1.4, 0);

  const arm2V = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 5);
  arm2V.translate(-0.9, 1.75, 0);

  const merged = mergeBufferGeometries([stem, arm1H, arm1V, arm2H, arm2V]);
  return merged;
}

function mergeBufferGeometries(geometries) {
  let totalVerts = 0;
  let totalIndices = 0;

  geometries.forEach((g) => {
    totalVerts += g.attributes.position.count;
    totalIndices += g.index ? g.index.count : g.attributes.position.count;
  });

  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIndices);

  let vOffset = 0;
  let iOffset = 0;
  let baseIndex = 0;

  geometries.forEach((g) => {
    const pos = g.attributes.position;
    const norm = g.attributes.normal || g.computeVertexNormals().attributes.normal;
    const count = pos.count;

    for (let i = 0; i < count * 3; i++) {
      posArr[vOffset * 3 + i] = pos.array[i];
      normArr[vOffset * 3 + i] = norm.array[i];
    }

    if (g.index) {
      for (let i = 0; i < g.index.count; i++) {
        indices[iOffset++] = baseIndex + g.index.array[i];
      }
    } else {
      for (let i = 0; i < count; i++) {
        indices[iOffset++] = baseIndex + i;
      }
    }

    baseIndex += count;
    vOffset += count;
    g.dispose();
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeVertexNormals();
  return merged;
}

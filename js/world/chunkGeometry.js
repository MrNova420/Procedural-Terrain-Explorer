/**
 * Grid BufferGeometry builder with LOD resolution and border skirts for crack-free seams.
 */

import * as THREE from 'three';

/**
 * Builds or updates a chunk BufferGeometry with skirt borders.
 * @param {THREE.BufferGeometry} [targetGeom] Existing geometry to reuse
 * @param {number} cx Chunk X coordinate
 * @param {number} cz Chunk Z coordinate
 * @param {number} size Chunk world size in units
 * @param {number} segments Grid resolution (e.g. 48, 24, 12)
 * @param {object} sampler Terrain sampler { getHeight, getNormal }
 * @returns {THREE.BufferGeometry}
 */
export function buildChunkGeometry(targetGeom, cx, cz, size, segments, sampler) {
  const geom = targetGeom || new THREE.BufferGeometry();

  const gridVertsX = segments + 1;
  const gridVertsZ = segments + 1;
  const totalGridVerts = gridVertsX * gridVertsZ;

  // 4 perimeter edges for skirts: 4 * (segments + 1)
  const totalSkirtVerts = 4 * (segments + 1);
  const totalVerts = totalGridVerts + totalSkirtVerts;

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);

  const startX = cx * size;
  const startZ = cz * size;
  const step = size / segments;

  const tempNorm = { x: 0, y: 1, z: 0 };
  let vIdx = 0;
  let uvIdx = 0;

  // 1. Generate main grid vertices
  for (let j = 0; j <= segments; j++) {
    const wz = startZ + j * step;
    const v = j / segments;

    for (let i = 0; i <= segments; i++) {
      const wx = startX + i * step;
      const u = i / segments;

      const wy = sampler.getHeight(wx, wz);
      sampler.getNormal(wx, wz, tempNorm);

      positions[vIdx * 3] = wx;
      positions[vIdx * 3 + 1] = wy;
      positions[vIdx * 3 + 2] = wz;

      normals[vIdx * 3] = tempNorm.x;
      normals[vIdx * 3 + 1] = tempNorm.y;
      normals[vIdx * 3 + 2] = tempNorm.z;

      uvs[uvIdx * 2] = u;
      uvs[uvIdx * 2 + 1] = v;

      vIdx++;
      uvIdx++;
    }
  }

  // 2. Generate Skirt Vertices (extruded downwards by skirtDepth)
  const skirtDepth = 20.0;
  const skirtStartIdx = totalGridVerts;
  let skirtVIdx = skirtStartIdx;

  // North edge (j = 0)
  for (let i = 0; i <= segments; i++) {
    const origIdx = i;
    positions[skirtVIdx * 3] = positions[origIdx * 3];
    positions[skirtVIdx * 3 + 1] = positions[origIdx * 3 + 1] - skirtDepth;
    positions[skirtVIdx * 3 + 2] = positions[origIdx * 3 + 2];

    normals[skirtVIdx * 3] = 0;
    normals[skirtVIdx * 3 + 1] = -1;
    normals[skirtVIdx * 3 + 2] = 0;

    uvs[skirtVIdx * 2] = uvs[origIdx * 2];
    uvs[skirtVIdx * 2 + 1] = uvs[origIdx * 2 + 1];
    skirtVIdx++;
  }

  // South edge (j = segments)
  for (let i = 0; i <= segments; i++) {
    const origIdx = segments * gridVertsX + i;
    positions[skirtVIdx * 3] = positions[origIdx * 3];
    positions[skirtVIdx * 3 + 1] = positions[origIdx * 3 + 1] - skirtDepth;
    positions[skirtVIdx * 3 + 2] = positions[origIdx * 3 + 2];

    normals[skirtVIdx * 3] = 0;
    normals[skirtVIdx * 3 + 1] = -1;
    normals[skirtVIdx * 3 + 2] = 0;

    uvs[skirtVIdx * 2] = uvs[origIdx * 2];
    uvs[skirtVIdx * 2 + 1] = uvs[origIdx * 2 + 1];
    skirtVIdx++;
  }

  // West edge (i = 0)
  for (let j = 0; j <= segments; j++) {
    const origIdx = j * gridVertsX;
    positions[skirtVIdx * 3] = positions[origIdx * 3];
    positions[skirtVIdx * 3 + 1] = positions[origIdx * 3 + 1] - skirtDepth;
    positions[skirtVIdx * 3 + 2] = positions[origIdx * 3 + 2];

    normals[skirtVIdx * 3] = 0;
    normals[skirtVIdx * 3 + 1] = -1;
    normals[skirtVIdx * 3 + 2] = 0;

    uvs[skirtVIdx * 2] = uvs[origIdx * 2];
    uvs[skirtVIdx * 2 + 1] = uvs[origIdx * 2 + 1];
    skirtVIdx++;
  }

  // East edge (i = segments)
  for (let j = 0; j <= segments; j++) {
    const origIdx = j * gridVertsX + segments;
    positions[skirtVIdx * 3] = positions[origIdx * 3];
    positions[skirtVIdx * 3 + 1] = positions[origIdx * 3 + 1] - skirtDepth;
    positions[skirtVIdx * 3 + 2] = positions[origIdx * 3 + 2];

    normals[skirtVIdx * 3] = 0;
    normals[skirtVIdx * 3 + 1] = -1;
    normals[skirtVIdx * 3 + 2] = 0;

    uvs[skirtVIdx * 2] = uvs[origIdx * 2];
    uvs[skirtVIdx * 2 + 1] = uvs[origIdx * 2 + 1];
    skirtVIdx++;
  }

  // 3. Generate Triangles (indices)
  const numGridQuads = segments * segments;
  const numSkirtQuads = 4 * segments;
  const totalIndices = (numGridQuads + numSkirtQuads) * 6;
  const indices = new Uint32Array(totalIndices);
  let iIdx = 0;

  // Grid index quads
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * gridVertsX + i;
      const b = a + 1;
      const c = (j + 1) * gridVertsX + i;
      const d = c + 1;

      indices[iIdx++] = a;
      indices[iIdx++] = c;
      indices[iIdx++] = b;

      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }

  // Skirt index quads: North
  let sOffset = skirtStartIdx;
  for (let i = 0; i < segments; i++) {
    const topA = i;
    const topB = i + 1;
    const botA = sOffset + i;
    const botB = sOffset + i + 1;

    indices[iIdx++] = topA;
    indices[iIdx++] = topB;
    indices[iIdx++] = botA;

    indices[iIdx++] = topB;
    indices[iIdx++] = botB;
    indices[iIdx++] = botA;
  }

  // South
  sOffset += (segments + 1);
  for (let i = 0; i < segments; i++) {
    const topA = segments * gridVertsX + i;
    const topB = topA + 1;
    const botA = sOffset + i;
    const botB = sOffset + i + 1;

    indices[iIdx++] = topA;
    indices[iIdx++] = botA;
    indices[iIdx++] = topB;

    indices[iIdx++] = topB;
    indices[iIdx++] = botA;
    indices[iIdx++] = botB;
  }

  // West
  sOffset += (segments + 1);
  for (let j = 0; j < segments; j++) {
    const topA = j * gridVertsX;
    const topB = (j + 1) * gridVertsX;
    const botA = sOffset + j;
    const botB = sOffset + j + 1;

    indices[iIdx++] = topA;
    indices[iIdx++] = botA;
    indices[iIdx++] = topB;

    indices[iIdx++] = topB;
    indices[iIdx++] = botA;
    indices[iIdx++] = botB;
  }

  // East
  sOffset += (segments + 1);
  for (let j = 0; j < segments; j++) {
    const topA = j * gridVertsX + segments;
    const topB = (j + 1) * gridVertsX + segments;
    const botA = sOffset + j;
    const botB = sOffset + j + 1;

    indices[iIdx++] = topA;
    indices[iIdx++] = topB;
    indices[iIdx++] = botA;

    indices[iIdx++] = topB;
    indices[iIdx++] = botB;
    indices[iIdx++] = botA;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(new THREE.BufferAttribute(indices, 1));
  geom.computeBoundingBox();
  geom.computeBoundingSphere();

  return geom;
}

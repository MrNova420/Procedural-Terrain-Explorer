/**
 * Low-poly procedural rock geometries with random angular deform.
 */

import * as THREE from 'three';

export function createRockGeometry(detail = 1) {
  const geo = new THREE.DodecahedronGeometry(1.0, detail);
  const pos = geo.attributes.position;

  // Perturb vertices slightly for jagged, natural rock facets
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const noiseFactor = 0.82 + 0.36 * Math.sin(x * 4.0 + y * 5.0 + z * 3.0);
    pos.setXYZ(i, x * noiseFactor, y * (noiseFactor * 0.75), z * noiseFactor);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Terrain Vertex Shader.
 * Transforms position, computes world pos, view pos, and passes normal for slope lighting.
 */

export const terrainVert = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vHeight;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vHeight = worldPos.y;
  
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = viewMatrix * worldPos;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

/**
 * Water Vertex Shader.
 * Computes procedural wave displacement and normal vectors.
 */

export const waterVert = /* glsl */ `
uniform float uTime;
uniform float uWaveHeight;
uniform float uWaveSpeed;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float t = uTime * uWaveSpeed;
  
  // Multi-wave displacement
  float w1 = sin(pos.x * 0.12 + t * 1.5) * cos(pos.z * 0.14 + t * 1.2);
  float w2 = sin(pos.x * 0.28 - t * 2.1) * cos(pos.z * 0.22 + t * 1.8) * 0.5;
  float w3 = sin((pos.x + pos.z) * 0.45 + t * 2.8) * 0.25;
  
  float elevation = (w1 + w2 + w3) * uWaveHeight;
  pos.y += elevation;
  
  // Wave normal analytical derivation
  float dX = (cos(pos.x * 0.12 + t * 1.5) * 0.12 * cos(pos.z * 0.14 + t * 1.2)
            + cos(pos.x * 0.28 - t * 2.1) * 0.28 * cos(pos.z * 0.22 + t * 1.8) * 0.5) * uWaveHeight;
  float dZ = (-sin(pos.x * 0.12 + t * 1.5) * sin(pos.z * 0.14 + t * 1.2) * 0.14
            - sin(pos.x * 0.28 - t * 2.1) * sin(pos.z * 0.22 + t * 1.8) * 0.22 * 0.5) * uWaveHeight;
            
  vec3 localNorm = normalize(vec3(-dX, 1.0, -dZ));
  vNormal = normalize(normalMatrix * localNorm);
  
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;
  
  vec4 mvPosition = viewMatrix * worldPos;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

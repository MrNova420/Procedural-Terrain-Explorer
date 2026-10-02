/**
 * Water Fragment Shader.
 * Shallow/deep color, Fresnel reflection, sun specular highlights, crest foam, and fog.
 */

import { glslNoise2D, glslFog } from './chunks.glsl.js';

export const waterFrag = /* glsl */ `
uniform vec3 uWaterColor;
uniform vec3 uWaterDeepColor;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogNear;
uniform float uFogFar;
uniform float uTime;
uniform float uOpacity;
uniform bool uFoamEnabled;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

${glslNoise2D}
${glslFog}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 sunDir = normalize(uSunDirection);
  
  // Fresnel effect
  float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.0);
  fresnel = clamp(fresnel, 0.1, 0.9);
  
  // Water base gradient
  vec3 baseColor = mix(uWaterDeepColor, uWaterColor, 0.45);
  vec3 surfaceColor = mix(baseColor, uSkyColor, fresnel * 0.7);
  
  // Specular reflection (Blinn-Phong)
  vec3 halfVec = normalize(sunDir + viewDir);
  float specFactor = pow(max(dot(norm, halfVec), 0.0), 128.0);
  vec3 specular = uSunColor * specFactor * 1.4;
  
  // Dynamic wave ripples & crest foam
  vec3 col = surfaceColor + specular;
  
  if (uFoamEnabled) {
    float foamNoise = snoise2D(vWorldPosition.xz * 0.25 + vec2(uTime * 0.3, uTime * 0.2));
    float waveCrest = smoothstep(0.4, 0.8, norm.y * 0.5 + foamNoise * 0.5);
    vec3 foamColor = vec3(0.95, 0.98, 1.0);
    col = mix(col, foamColor, waveCrest * 0.4);
  }
  
  // Apply distance fog
  float dist = length(vViewPosition);
  col = applyFog(col, dist, uFogColor, uFogDensity, uFogNear, uFogFar);
  
  gl_FragColor = vec4(col, uOpacity);
}
`;

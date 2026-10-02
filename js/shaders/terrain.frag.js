/**
 * Terrain Fragment Shader.
 * Procedural multi-band height coloring, slope rock detection, noise detail, and atmospheric fog.
 */

import { glslNoise2D, glslFog } from './chunks.glsl.js';

export const terrainFrag = /* glsl */ `
uniform vec3 uColorDeep;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorForest;
uniform vec3 uColorRock;
uniform vec3 uColorSnow;

uniform float uWaterLevel;
uniform float uHeightScale;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogNear;
uniform float uFogFar;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vHeight;

${glslNoise2D}
${glslFog}

void main() {
  vec3 norm = normalize(vNormal);
  
  // Slope calculation (1 = flat horizontal, 0 = vertical cliff)
  float slope = clamp(norm.y, 0.0, 1.0);
  
  // Detail micro-noise
  float microNoise = snoise2D(vWorldPosition.xz * 0.08) * 0.5 + 0.5;
  float macroNoise = snoise2D(vWorldPosition.xz * 0.015);
  
  float h = vHeight + macroNoise * 3.5;
  float normH = (h - uWaterLevel) / max(uHeightScale, 1.0);
  
  // Color blending bands
  // 1. Underwater / Deep
  vec3 col = uColorDeep;
  
  // 2. Sand / Shore
  float sandEdge = smoothstep(-1.5, 1.5, h - uWaterLevel);
  col = mix(col, uColorSand, sandEdge);
  
  // 3. Grass
  float grassEdge = smoothstep(1.5, 6.5, h - uWaterLevel);
  col = mix(col, uColorGrass, grassEdge);
  
  // 4. Forest
  float forestEdge = smoothstep(0.18, 0.45, normH);
  col = mix(col, uColorForest, forestEdge);
  
  // 5. Steep Rock / Cliffs
  float rockFactor = 1.0 - smoothstep(0.55, 0.78, slope);
  col = mix(col, uColorRock, rockFactor);
  
  // 6. Snow on high peaks (perturbed by slope so cliffs stay rocky)
  float snowHeight = smoothstep(0.68, 0.88, normH + microNoise * 0.08);
  float snowSlope = smoothstep(0.6, 0.85, slope);
  float snowFactor = snowHeight * snowSlope;
  col = mix(col, uColorSnow, snowFactor);
  
  // Add subtle micro variation
  col *= 0.92 + 0.16 * microNoise;
  
  // Directional lighting with soft wrap
  vec3 lightDir = normalize(uSunDirection);
  float nDotL = max(dot(norm, lightDir), 0.0);
  float halfLambert = dot(norm, lightDir) * 0.5 + 0.5;
  
  vec3 diffuse = uSunColor * (nDotL * 0.8 + halfLambert * 0.2);
  vec3 ambient = uAmbientColor;
  vec3 finalColor = col * (ambient + diffuse);
  
  // Atmospheric Fog
  float dist = length(vViewPosition);
  finalColor = applyFog(finalColor, dist, uFogColor, uFogDensity, uFogNear, uFogFar);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

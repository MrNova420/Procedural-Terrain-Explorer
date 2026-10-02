/**
 * Wind sway animation GLSL function for vegetation shaders.
 */

export const glslWind = /* glsl */ `
vec3 applyWind(vec3 pos, float heightFactor, float time, float windSpeed, float windStrength) {
  float phase = (pos.x + pos.z) * 0.15 + time * windSpeed * 2.5;
  float swayX = sin(phase) * 0.4 + cos(phase * 0.5) * 0.2;
  float swayZ = cos(phase * 0.8) * 0.3;
  
  // Stronger displacement at top of the model
  float displacement = heightFactor * heightFactor * windStrength;
  pos.x += swayX * displacement;
  pos.z += swayZ * displacement;
  return pos;
}
`;

/**
 * Sky Dome Fragment Shader.
 * Dynamic day/night atmosphere, smooth zenith-to-horizon gradients, sun & moon rendering.
 */

export const skyFrag = /* glsl */ `
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform vec3 uHorizonColor;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uMoonDirection;
uniform vec3 uMoonColor;
uniform float uSunSize;

varying vec3 vWorldPosition;

void main() {
  vec3 dir = normalize(vWorldPosition);
  
  // Zenith to horizon gradient
  float height = clamp(dir.y, 0.0, 1.0);
  vec3 sky = mix(uHorizonColor, uSkyTop, pow(height, 0.6));
  
  // Lower sky / below horizon blend
  if (dir.y < 0.0) {
    sky = mix(uHorizonColor, uSkyBottom * 0.5, clamp(-dir.y * 3.0, 0.0, 1.0));
  }
  
  // Sun calculation
  vec3 sunDir = normalize(uSunDirection);
  float sunDot = max(dot(dir, sunDir), 0.0);
  
  // Sun disc & glow
  float sunDisc = smoothstep(0.9995 - uSunSize * 0.001, 0.9998, sunDot);
  float sunGlow = pow(sunDot, 16.0) * 0.6 + pow(sunDot, 4.0) * 0.2;
  vec3 sun = uSunColor * (sunDisc * 2.0 + sunGlow);
  
  // Moon calculation
  vec3 moonDir = normalize(uMoonDirection);
  float moonDot = max(dot(dir, moonDir), 0.0);
  float moonDisc = smoothstep(0.9992, 0.9998, moonDot);
  float moonGlow = pow(moonDot, 32.0) * 0.3;
  vec3 moon = uMoonColor * (moonDisc * 1.5 + moonGlow);
  
  vec3 finalColor = sky + sun + moon;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

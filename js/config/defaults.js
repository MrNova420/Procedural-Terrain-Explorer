/**
 * Default global configuration parameters for Procedural Terrain Explorer.
 */

export const DEFAULT_CONFIG = {
  // World & Seed
  seed: 'OrbitExplorer2026',
  biome: 'temperate',
  chunkSize: 80,
  maxChunks: 81, // view radius ~ 4 chunks (9x9)
  viewDistance: 4,
  maxChunksPerFrame: 2,

  // Terrain Noise
  octaves: 5,
  frequency: 0.004,
  heightScale: 48,
  persistence: 0.48,
  lacunarity: 2.05,
  ridged: 0.25,
  warp: 25.0,
  island: false,
  islandRadius: 280,

  // Water
  waterLevel: 0.0,
  waveHeight: 0.7,
  waveSpeed: 1.2,
  waterFoam: true,
  waterColor: '#1d5e78',
  waterDeepColor: '#0b263b',
  waterOpacity: 0.88,

  // Vegetation
  vegetationDensity: 0.7,
  treeDensity: 0.6,
  rockDensity: 0.4,
  windSpeed: 1.2,
  windStrength: 0.4,

  // Sky & Time of Day
  timeOfDay: 14.5, // 2:30 PM
  timeSpeed: 0.05, // hours per second
  autoTime: true,
  cloudsEnabled: true,
  starsIntensity: 1.0,

  // Rendering & Quality
  quality: 'high',
  wireframe: false,
  shadows: true,
  postprocessing: false,
  bloomIntensity: 0.35,
  vignette: true,
  fov: 65,

  // Controls & Player
  cameraMode: 'fly', // 'fly' | 'walk' | 'orbit'
  flySpeed: 36,
  boostMultiplier: 2.5,
  walkSpeed: 9,
  jumpForce: 11,
  playerHeight: 2.0
};

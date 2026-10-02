/**
 * Quality presets, LOD resolutions, and hardware detection helpers.
 */

export const QUALITY_PRESETS = {
  low: {
    name: 'Low',
    pixelRatioMax: 1.0,
    lodSegments: [24, 12, 6],
    viewDistance: 3,
    shadows: false,
    shadowMapSize: 512,
    postprocessing: false,
    vegetationDensityMult: 0.4,
    clouds: false
  },
  medium: {
    name: 'Medium',
    pixelRatioMax: 1.5,
    lodSegments: [40, 20, 10],
    viewDistance: 4,
    shadows: true,
    shadowMapSize: 1024,
    postprocessing: false,
    vegetationDensityMult: 0.75,
    clouds: true
  },
  high: {
    name: 'High',
    pixelRatioMax: 2.0,
    lodSegments: [56, 28, 14],
    viewDistance: 5,
    shadows: true,
    shadowMapSize: 2048,
    postprocessing: false, // Bloom toggleable via UI
    vegetationDensityMult: 1.0,
    clouds: true
  }
};

export function detectDeviceQuality() {
  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile) {
    return memory >= 6 && cores >= 6 ? 'medium' : 'low';
  }

  if (memory <= 4 || cores <= 2) {
    return 'medium';
  }

  return 'high';
}

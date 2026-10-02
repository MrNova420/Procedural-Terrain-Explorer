/**
 * Declarative schema for all Control Panel parameters, categories, and widgets.
 */

export const PANEL_SCHEMA = [
  {
    category: 'World & Biome',
    controls: [
      { key: 'seed', label: 'World Seed', type: 'text' },
      {
        key: 'biome',
        label: 'Biome Preset',
        type: 'select',
        options: [
          { value: 'temperate', label: 'Temperate Green Hills' },
          { value: 'desert', label: 'Desert Dunes' },
          { value: 'arctic', label: 'Arctic Snowlands' },
          { value: 'alien', label: 'Alien World' }
        ]
      },
      { key: 'island', label: 'Island Mode', type: 'toggle' },
      { key: 'viewDistance', label: 'View Distance (Chunks)', type: 'slider', min: 2, max: 7, step: 1 }
    ]
  },
  {
    category: 'Terrain Noise',
    controls: [
      { key: 'heightScale', label: 'Height Scale', type: 'slider', min: 10, max: 100, step: 1 },
      { key: 'octaves', label: 'Octaves', type: 'slider', min: 1, max: 8, step: 1 },
      { key: 'frequency', label: 'Noise Frequency', type: 'slider', min: 0.001, max: 0.015, step: 0.0005 },
      { key: 'ridged', label: 'Mountain Ridges', type: 'slider', min: 0.0, max: 1.0, step: 0.05 },
      { key: 'warp', label: 'Domain Warping', type: 'slider', min: 0, max: 60, step: 2 }
    ]
  },
  {
    category: 'Water Surface',
    controls: [
      { key: 'waterLevel', label: 'Sea Level', type: 'slider', min: -15, max: 20, step: 0.5 },
      { key: 'waveHeight', label: 'Wave Height', type: 'slider', min: 0.0, max: 2.5, step: 0.1 },
      { key: 'waveSpeed', label: 'Wave Speed', type: 'slider', min: 0.2, max: 3.0, step: 0.1 },
      { key: 'waterFoam', label: 'Foam Ripples', type: 'toggle' }
    ]
  },
  {
    category: 'Vegetation & Props',
    controls: [
      { key: 'vegetationDensity', label: 'Flora Density', type: 'slider', min: 0.0, max: 1.5, step: 0.05 },
      { key: 'windSpeed', label: 'Wind Speed', type: 'slider', min: 0.1, max: 3.0, step: 0.1 },
      { key: 'windStrength', label: 'Wind Sway Strength', type: 'slider', min: 0.0, max: 1.0, step: 0.05 }
    ]
  },
  {
    category: 'Sky & Atmosphere',
    controls: [
      { key: 'timeOfDay', label: 'Time (Hours)', type: 'slider', min: 0, max: 24, step: 0.1 },
      { key: 'autoTime', label: 'Day/Night Cycle', type: 'toggle' },
      { key: 'timeSpeed', label: 'Time Speed', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
      { key: 'cloudsEnabled', label: 'Drifting Clouds', type: 'toggle' }
    ]
  },
  {
    category: 'Rendering & Graphics',
    controls: [
      {
        key: 'quality',
        label: 'Quality Preset',
        type: 'select',
        options: [
          { value: 'high', label: 'High (Detailed LODs & Shadows)' },
          { value: 'medium', label: 'Medium (Balanced)' },
          { value: 'low', label: 'Low (Fast / Mobile)' }
        ]
      },
      { key: 'shadows', label: 'Sun Shadows', type: 'toggle' },
      { key: 'wireframe', label: 'Wireframe Mode', type: 'toggle' },
      { key: 'postprocessing', label: 'Bloom & Postprocessing', type: 'toggle' },
      { key: 'bloomIntensity', label: 'Bloom Glow', type: 'slider', min: 0.1, max: 1.5, step: 0.05 }
    ]
  },
  {
    category: 'Camera & Navigation',
    controls: [
      {
        key: 'cameraMode',
        label: 'Movement Mode',
        type: 'select',
        options: [
          { value: 'fly', label: 'Fly (Free Flight 6DOF)' },
          { value: 'walk', label: 'Walk (Ground Physics & Jump)' },
          { value: 'orbit', label: 'Orbit (Cinematic Inspection)' }
        ]
      },
      { key: 'fov', label: 'Field of View', type: 'slider', min: 45, max: 100, step: 1 },
      { key: 'flySpeed', label: 'Fly Speed', type: 'slider', min: 10, max: 100, step: 2 },
      { key: 'walkSpeed', label: 'Walk Speed', type: 'slider', min: 3, max: 25, step: 1 }
    ]
  }
];

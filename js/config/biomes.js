/**
 * Biome presets and color palettes for terrain, water, atmosphere, and vegetation.
 */

export const BIOMES = {
  temperate: {
    id: 'temperate',
    name: 'Temperate Green Hills',
    description: 'Lush green valleys, pine forests, sandy coastlines, and alpine peaks.',
    heightScale: 48,
    ridged: 0.25,
    warp: 25.0,
    octaves: 5,
    frequency: 0.004,
    waterLevel: 0.0,
    waterColor: '#1a6b8a',
    waterDeepColor: '#0c2e42',
    fogColorDay: '#c8e2f0',
    fogColorNight: '#0d1527',
    skyTopDay: '#3a7bd5',
    skyBottomDay: '#9bc5ff',
    terrainColors: {
      deep: '#193322',
      sand: '#dfcb9a',
      grass: '#487c3a',
      forest: '#2d5427',
      rock: '#6b665c',
      snow: '#eef4f8'
    },
    vegetation: {
      trees: ['pine', 'deciduous'],
      rocks: true,
      cacti: false,
      treeDensity: 0.65,
      rockDensity: 0.35
    }
  },

  desert: {
    id: 'desert',
    name: 'Desert Dunes',
    description: 'Golden rolling sand dunes, rocky canyons, sparse oases, and saguaro cacti.',
    heightScale: 42,
    ridged: 0.55,
    warp: 40.0,
    octaves: 4,
    frequency: 0.0035,
    waterLevel: -6.0,
    waterColor: '#20857a',
    waterDeepColor: '#0a423c',
    fogColorDay: '#f4dec4',
    fogColorNight: '#1a1424',
    skyTopDay: '#e89e58',
    skyBottomDay: '#fedbb0',
    terrainColors: {
      deep: '#9c6f3d',
      sand: '#e8be7b',
      grass: '#c99e5f',
      forest: '#9e7345',
      rock: '#a8603c',
      snow: '#f5e4c6'
    },
    vegetation: {
      trees: ['cactus'],
      rocks: true,
      cacti: true,
      treeDensity: 0.3,
      rockDensity: 0.55
    }
  },

  arctic: {
    id: 'arctic',
    name: 'Arctic Snowlands',
    description: 'Glacial fjords, frosted peaks, turquoise freezing waters, and snow-dusted pines.',
    heightScale: 56,
    ridged: 0.4,
    warp: 18.0,
    octaves: 5,
    frequency: 0.0042,
    waterLevel: 0.0,
    waterColor: '#1d738a',
    waterDeepColor: '#0d3245',
    fogColorDay: '#d9e8f5',
    fogColorNight: '#0c1626',
    skyTopDay: '#537895',
    skyBottomDay: '#b3d1ea',
    terrainColors: {
      deep: '#34495e',
      sand: '#9fb3c8',
      grass: '#7b9ca8',
      forest: '#3a5759',
      rock: '#62727b',
      snow: '#f7fafc'
    },
    vegetation: {
      trees: ['pine'],
      rocks: true,
      cacti: false,
      treeDensity: 0.45,
      rockDensity: 0.45
    }
  },

  alien: {
    id: 'alien',
    name: 'Alien World',
    description: 'Neon purple ridges, bioluminescent magenta shores, and eerie extraterrestrial flora.',
    heightScale: 62,
    ridged: 0.6,
    warp: 35.0,
    octaves: 6,
    frequency: 0.0045,
    waterLevel: 2.0,
    waterColor: '#00d2ff',
    waterDeepColor: '#531b7a',
    fogColorDay: '#37204e',
    fogColorNight: '#0a0614',
    skyTopDay: '#6b11ff',
    skyBottomDay: '#ff4b8b',
    terrainColors: {
      deep: '#230b3b',
      sand: '#bb3fa9',
      grass: '#4a157e',
      forest: '#83188f',
      rock: '#2e1840',
      snow: '#00ffff'
    },
    vegetation: {
      trees: ['pine', 'deciduous', 'cactus'],
      rocks: true,
      cacti: true,
      treeDensity: 0.5,
      rockDensity: 0.4
    }
  }
};

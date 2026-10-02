---
name: procedural-terrain
description: Guide and workflows for extending, modifying, and reusing the Procedural Terrain Explorer Three.js engine.
---

# Procedural Terrain Explorer Skill

This skill guides agents and developers when extending, maintaining, or reusing the Procedural Terrain Explorer codebase.

## 1. Core Architecture Principles

1. **Pure ES Modules & Zero Bundler:**
   - Always use standard ES module `import`/`export` with explicit relative paths and `.js` extensions.
   - Three.js is imported from the CDN via the import map defined in `index.html`. Do not add npm dependencies.
2. **Single Source of Truth (`js/noise/terrainHeight.js`):**
   - ALL elevation, slope, and surface normal logic must remain in `createTerrainSampler()`.
   - Never compute custom terrain heights inside chunk geometries, physics controllers, or vegetation scatter scripts—always call `sampler.getHeight(x, z)` or `sampler.getNormal(x, z)`.
3. **Strict Line Count Limits:**
   - Every `.js` file must stay under 300 lines (absolute maximum 400).
   - If a module expands, split helper functions into submodules (e.g. `world/vegetation/` or `noise/`).
4. **No Console Garbage or Leakage:**
   - Do not pollute `window.` or create global variables.
   - Always dispose Three.js geometries and materials when removing chunks or instanced meshes.

---

## 2. Common Extension Workflows

### How to Add a New Biome
1. Open [`js/config/biomes.js`](file:///c:/Users/Senarios/Desktop/orbit/js/config/biomes.js).
2. Add a new key to the `BIOMES` object defining:
   - `terrainColors`: `{ deep, sand, grass, forest, rock, snow }`
   - `waterColor` and `waterDeepColor`
   - `fogColorDay` and `fogColorNight`
   - `skyTopDay` and `skyBottomDay`
   - `vegetation`: `{ trees: ['pine'|'deciduous'|'cactus'], rocks: true, treeDensity, rockDensity }`
3. Add the option to the `panelSchema.js` under the `biome` control select options.

### How to Add New Vegetation or Prop Models
1. Create or extend geometry builders in [`js/world/vegetation/treeModels.js`](file:///c:/Users/Senarios/Desktop/orbit/js/world/vegetation/treeModels.js) or [`rockModels.js`](file:///c:/Users/Senarios/Desktop/orbit/js/world/vegetation/rockModels.js).
2. Update [`placement.js`](file:///c:/Users/Senarios/Desktop/orbit/js/world/vegetation/placement.js) to define placement rules (height range, slope angle, PRNG distribution).
3. Register the mesh in [`Vegetation.js`](file:///c:/Users/Senarios/Desktop/orbit/js/world/vegetation/Vegetation.js).

### How to Add a Custom Control Slider / Toggle
1. Open [`js/ui/panelSchema.js`](file:///c:/Users/Senarios/Desktop/orbit/js/ui/panelSchema.js).
2. Add an entry to the appropriate category (or create a new category):
   ```javascript
   { key: 'myParam', label: 'My Parameter', type: 'slider', min: 0, max: 10, step: 0.1 }
   ```
3. Set the default in [`js/config/defaults.js`](file:///c:/Users/Senarios/Desktop/orbit/js/config/defaults.js).
4. In [`js/main.js`](file:///c:/Users/Senarios/Desktop/orbit/js/main.js), subscribe to changes:
   ```javascript
   state.subscribe('myParam', (val) => { /* update target system */ });
   ```

---

## 3. Reusable Submodules

- **`createSimplex(seed)` (`js/noise/simplex.js`):** Fast, standalone 2D/3D simplex noise with seed support.
- **`createState(initial)` (`js/utils/state.js`):** Lightweight, reactive pub/sub state container.
- **`ObjectPool` (`js/utils/pool.js`):** Generic object pool for buffer geometries and meshes.
- **`buildChunkGeometry(...)` (`js/world/chunkGeometry.js`):** Generates LOD grids with crack-prevention downward skirts.

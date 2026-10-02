/**
 * Main application entry point: wires all subsystems, reactive state, and render loop.
 */

import { DEFAULT_CONFIG } from './config/defaults.js';
import { BIOMES } from './config/biomes.js';
import { QUALITY_PRESETS, detectDeviceQuality } from './config/quality.js';
import { createState } from './utils/state.js';
import { decodeUrlState, updateUrlHash } from './utils/urlState.js';
import { createTerrainSampler } from './noise/terrainHeight.js';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createLoop } from './core/loop.js';
import { createPostProcessing } from './core/postprocessing.js';
import { createTerrainMaterial } from './world/terrainMaterial.js';
import { ChunkManager } from './world/ChunkManager.js';
import { VegetationManager } from './world/vegetation/Vegetation.js';
import { TimeOfDay } from './world/TimeOfDay.js';
import { createSkyDome } from './world/Sky.js';
import { createStarField } from './world/Stars.js';
import { createClouds } from './world/Clouds.js';
import { createWater } from './world/Water.js';
import { InputManager } from './controls/input.js';
import { CameraRig } from './controls/CameraRig.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { Hud } from './ui/Hud.js';
import { createMinimap } from './ui/Minimap.js';
import { createStartScreen } from './ui/StartScreen.js';
import { HelpOverlay } from './ui/HelpOverlay.js';
import { captureScreenshot } from './ui/screenshot.js';

function init() {
  const urlState = decodeUrlState();
  const initialQuality = detectDeviceQuality();
  const state = createState({
    ...DEFAULT_CONFIG,
    quality: initialQuality,
    ...urlState
  });

  const canvas = document.getElementById('webgl-canvas');
  const uiRoot = document.getElementById('ui-root');

  // Core 3D engine setup
  const renderer = createRenderer(canvas);
  let activeBiome = BIOMES[state.get('biome')] || BIOMES.temperate;
  const sceneWrap = createScene(activeBiome.fogColorDay);
  const sampler = createTerrainSampler(state.snapshot());

  const input = new InputManager(canvas);
  const cameraRig = new CameraRig(canvas, uiRoot, input, sampler, state.snapshot());
  const postProcessing = createPostProcessing(renderer.instance, sceneWrap.instance, cameraRig.camera);

  // World objects
  const terrainMat = createTerrainMaterial(activeBiome, state.snapshot());
  const vegManager = new VegetationManager();
  const chunkManager = new ChunkManager(
    sceneWrap.instance,
    terrainMat,
    sampler,
    vegManager,
    state.snapshot(),
    activeBiome
  );

  const timeOfDay = new TimeOfDay(state.get('timeOfDay'), state.get('timeSpeed'), state.get('autoTime'));
  const sky = createSkyDome();
  sceneWrap.instance.add(sky.mesh);

  const stars = createStarField();
  sceneWrap.instance.add(stars.mesh);

  const clouds = createClouds();
  sceneWrap.instance.add(clouds.group);

  const water = createWater(state.snapshot(), activeBiome);
  sceneWrap.instance.add(water.mesh);

  // Apply initial quality preset
  const qConfig = QUALITY_PRESETS[state.get('quality')] || QUALITY_PRESETS.high;
  chunkManager.setQuality(qConfig.lodSegments, state.get('viewDistance'));

  // UI Setup
  const hud = new Hud(uiRoot, state, {
    onTogglePanel: () => panel.toggle(),
    onToggleHelp: () => help.toggle(),
    onScreenshot: () => captureScreenshot(renderer.instance, sceneWrap.instance, cameraRig.camera)
  });

  const minimap = createMinimap(uiRoot, sampler);
  const help = new HelpOverlay(uiRoot);

  const panel = new ControlPanel(uiRoot, state, {
    onRandomizeSeed: () => {
      const r = 'Orbit_' + Math.floor(Math.random() * 90000 + 10000);
      state.set('seed', r);
    },
    onScreenshot: () => captureScreenshot(renderer.instance, sceneWrap.instance, cameraRig.camera)
  });

  createStartScreen(uiRoot, state, () => {
    input.requestPointerLock();
  });

  // Debounced terrain regeneration handler
  let regenTimer = null;
  function triggerTerrainRegen() {
    panel.setGenerating(true);
    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => {
      sampler.rebuild(state.snapshot());
      chunkManager.config = state.snapshot();
      terrainMat.updateParams(state.get('waterLevel'), state.get('heightScale'));
      chunkManager.regenerateAll();
      updateUrlHash(state.snapshot());
      panel.setGenerating(false);
    }, 200);
  }

  // Reactive state subscriptions
  state.subscribe('seed', triggerTerrainRegen);
  state.subscribe('octaves', triggerTerrainRegen);
  state.subscribe('frequency', triggerTerrainRegen);
  state.subscribe('heightScale', triggerTerrainRegen);
  state.subscribe('ridged', triggerTerrainRegen);
  state.subscribe('warp', triggerTerrainRegen);
  state.subscribe('island', triggerTerrainRegen);
  state.subscribe('vegetationDensity', triggerTerrainRegen);

  state.subscribe('biome', (biomeId) => {
    activeBiome = BIOMES[biomeId] || BIOMES.temperate;
    state.setMultiple({
      heightScale: activeBiome.heightScale,
      ridged: activeBiome.ridged,
      warp: activeBiome.warp,
      waterLevel: activeBiome.waterLevel,
      octaves: activeBiome.octaves,
      frequency: activeBiome.frequency
    }, false);
    chunkManager.setBiome(activeBiome);
    triggerTerrainRegen();
  });

  state.subscribe('viewDistance', (vd) => {
    chunkManager.viewDistance = vd;
    chunkManager.regenerateAll();
  });

  state.subscribe('waterLevel', (wl) => water.setParams(wl));
  state.subscribe('waveHeight', (wh) => water.setParams(undefined, wh));
  state.subscribe('waveSpeed', (ws) => water.setParams(undefined, undefined, ws));
  state.subscribe('waterFoam', (wf) => water.setParams(undefined, undefined, undefined, wf));

  state.subscribe('timeOfDay', (t) => timeOfDay.setTime(t));
  state.subscribe('autoTime', (a) => { timeOfDay.autoTime = a; });
  state.subscribe('timeSpeed', (s) => { timeOfDay.timeSpeed = s; });
  state.subscribe('cloudsEnabled', (c) => clouds.setVisible(c));

  state.subscribe('quality', (qKey) => {
    const q = QUALITY_PRESETS[qKey] || QUALITY_PRESETS.high;
    renderer.resize(window.innerWidth, window.innerHeight, q.pixelRatioMax);
    chunkManager.setQuality(q.lodSegments, state.get('viewDistance'));
  });

  state.subscribe('wireframe', (w) => { terrainMat.instance.wireframe = w; });
  state.subscribe('shadows', (s) => { renderer.instance.shadowMap.enabled = s; });
  state.subscribe('postprocessing', (p) => postProcessing.setEnabled(p));
  state.subscribe('bloomIntensity', (b) => postProcessing.setBloomIntensity(b));

  state.subscribe('cameraMode', (m) => cameraRig.setMode(m));
  state.subscribe('fov', (f) => cameraRig.setFov(f));
  state.subscribe('flySpeed', (s) => { cameraRig.config.flySpeed = s; });
  state.subscribe('walkSpeed', (s) => { cameraRig.config.walkSpeed = s; });

  // Quick keyboard shortcuts for camera mode (1: Fly, 2: Walk, 3: Orbit)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'Digit1') state.set('cameraMode', 'fly');
    if (e.code === 'Digit2') state.set('cameraMode', 'walk');
    if (e.code === 'Digit3') state.set('cameraMode', 'orbit');
    if (e.code === 'KeyP') captureScreenshot(renderer.instance, sceneWrap.instance, cameraRig.camera);
  });

  // Window resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const q = QUALITY_PRESETS[state.get('quality')] || QUALITY_PRESETS.high;
    renderer.resize(w, h, q.pixelRatioMax);
    cameraRig.resize(w, h);
    postProcessing.resize(w, h);
  });

  // Main Render Loop
  const loop = createLoop((dt, time, fps) => {
    cameraRig.update(dt);
    timeOfDay.update(dt, activeBiome);

    // Sync time back to state display if auto-time is active
    if (timeOfDay.autoTime) {
      state.set('timeOfDay', timeOfDay.time, false);
    }

    // Update environmental lights & sky
    sceneWrap.updateLights(
      timeOfDay.sunDirection,
      timeOfDay.sunColor,
      timeOfDay.ambientColor,
      timeOfDay.fogColor,
      timeOfDay.fogDensity
    );
    sceneWrap.updateShadowTarget(cameraRig.position);

    terrainMat.updateLighting(
      timeOfDay.sunDirection,
      timeOfDay.sunColor,
      timeOfDay.ambientColor,
      timeOfDay.fogColor,
      timeOfDay.fogDensity
    );

    sky.update(timeOfDay, cameraRig.position);
    stars.update(timeOfDay.sunDirection, state.get('starsIntensity'));
    clouds.update(dt, cameraRig.position);
    water.update(dt, time, cameraRig.position, timeOfDay, activeBiome);
    vegManager.update(time, state.get('windSpeed'), state.get('windStrength'));

    // Update chunk streaming around player
    chunkManager.update(cameraRig.position);

    // Update UI telemetry
    hud.update(fps, cameraRig.position, timeOfDay.time, chunkManager.getActiveCount());
    minimap.update(cameraRig.position, cameraRig.quaternion);

    // Render frame
    postProcessing.render(dt);
  });

  loop.start();
}

window.addEventListener('DOMContentLoaded', init);

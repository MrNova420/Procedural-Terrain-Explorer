/**
 * Main animation loop with clamped delta, visibility pausing, and FPS calculation.
 */

export function createLoop(onUpdate) {
  let isRunning = false;
  let animId = null;
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = performance.now();
  let currentFps = 60;

  function tick(now) {
    if (!isRunning) return;

    const rawDelta = (now - lastTime) / 1000;
    lastTime = now;

    // Clamp delta between 0.001 and 0.1 seconds to prevent huge physics jumps
    const dt = Math.min(Math.max(rawDelta, 0.001), 0.1);

    // FPS calculation
    frameCount++;
    if (now - fpsTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - fpsTime));
      frameCount = 0;
      fpsTime = now;
    }

    try {
      onUpdate(dt, now * 0.001, currentFps);
    } catch (err) {
      console.error('Error in render loop update:', err);
    }

    animId = requestAnimationFrame(tick);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    lastTime = performance.now();
    fpsTime = performance.now();
    frameCount = 0;
    animId = requestAnimationFrame(tick);
  }

  function stop() {
    isRunning = false;
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lastTime = performance.now();
    } else {
      lastTime = performance.now();
    }
  });

  return {
    start,
    stop,
    getFps: () => currentFps,
    isRunning: () => isRunning
  };
}

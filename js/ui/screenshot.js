/**
 * Captures clean canvas screenshot and downloads PNG.
 */

export function captureScreenshot(renderer, scene, camera, filename = 'terrain-explorer.png') {
  try {
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to capture screenshot:', err);
  }
}

/**
 * Biology Dash: Immune Patrol
 * Image Texture Utilities
 */

/**
 * Removes solid white background from an image element and returns a transparent canvas
 */
export function removeWhiteBackground(
  image: HTMLImageElement,
  threshold: number = 242,
  feather: number = 20
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // White detection
    const brightness = (r + g + b) / 3;
    if (brightness >= threshold) {
      const alphaFactor = Math.max(0, 1 - (brightness - threshold) / feather);
      data[i + 3] = Math.floor(data[i + 3] * alphaFactor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

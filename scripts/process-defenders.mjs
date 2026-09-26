/**
 * Extracts, isolates, and removes background from the 3D rendered chibi defenders.
 * Uses flood-fill from outer frame edges to preserve internal white clay highlights,
 * centering each character into a 256x256 transparent frame on a 1024x768 spritesheet.
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function processDefenders() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const srcPath = path.resolve('/Users/henrywei/.gemini/antigravity/brain/09827f4b-15d6-4dfb-9ab9-66e8458e875f/defenders_chibi_1790423736723.jpg');
  const imgBase64 = (await fs.readFile(srcPath)).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <img id="src" src="data:image/jpeg;base64,${imgBase64}" />
      <canvas id="out" width="1024" height="768"></canvas>
      <script>
        window.processDone = false;
        const img = document.getElementById('src');
        img.onload = () => {
          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = img.width;
          srcCanvas.height = img.height;
          const sCtx = srcCanvas.getContext('2d');
          sCtx.drawImage(img, 0, 0);

          const outCanvas = document.getElementById('out');
          const oCtx = outCanvas.getContext('2d');
          oCtx.clearRect(0, 0, 1024, 768);

          // Defined bounding boxes for each character
          const characters = [
            // Row 0: Neutrophil (4 poses)
            { r: 0, c: 0, x1: 50, y1: 112, x2: 265, y2: 305 },
            { r: 0, c: 1, x1: 298, y1: 116, x2: 506, y2: 305 },
            { r: 0, c: 2, x1: 520, y1: 116, x2: 732, y2: 305 },
            { r: 0, c: 3, x1: 770, y1: 120, x2: 975, y2: 305 },

            // Row 1: Macrophage (4 poses)
            { r: 1, c: 0, x1: 25, y1: 420, x2: 280, y2: 658 },
            { r: 1, c: 1, x1: 290, y1: 430, x2: 556, y2: 658 },
            { r: 1, c: 2, x1: 570, y1: 434, x2: 752, y2: 658 },
            { r: 1, c: 3, x1: 785, y1: 434, x2: 996, y2: 658 },

            // Row 2: Plasma Cell (4 poses)
            { r: 2, c: 0, x1: 50, y1: 760, x2: 235, y2: 992 },
            { r: 2, c: 1, x1: 300, y1: 765, x2: 490, y2: 992 },
            { r: 2, c: 2, x1: 560, y1: 760, x2: 750, y2: 992 },
            { r: 2, c: 3, x1: 790, y1: 760, x2: 985, y2: 992 },
          ];

          for (const char of characters) {
            const cropW = char.x2 - char.x1;
            const cropH = char.y2 - char.y1;
            const imgData = sCtx.getImageData(char.x1, char.y1, cropW, cropH);
            const data = imgData.data;

            // 1. Flood-fill from outer edges to detect true background
            const visited = new Uint8Array(cropW * cropH);
            const queue = [];

            // Helper to push boundary pixels
            for (let x = 0; x < cropW; x++) {
              queue.push(x, 0);
              queue.push(x, cropH - 1);
            }
            for (let y = 0; y < cropH; y++) {
              queue.push(0, y);
              queue.push(cropW - 1, y);
            }

            // BFS flood fill on bright/white background
            let qIdx = 0;
            while (qIdx < queue.length) {
              const qx = queue[qIdx++];
              const qy = queue[qIdx++];
              const pIdx = qy * cropW + qx;
              if (visited[pIdx]) continue;
              visited[pIdx] = 1;

              const dIdx = pIdx * 4;
              const r = data[dIdx];
              const g = data[dIdx + 1];
              const b = data[dIdx + 2];

              // Is this pixel background white/near-white?
              if (r >= 236 && g >= 236 && b >= 236) {
                // Explore neighbors
                if (qx > 0 && !visited[pIdx - 1]) queue.push(qx - 1, qy);
                if (qx < cropW - 1 && !visited[pIdx + 1]) queue.push(qx + 1, qy);
                if (qy > 0 && !visited[pIdx - cropW]) queue.push(qx, qy - 1);
                if (qy < cropH - 1 && !visited[pIdx + cropW]) queue.push(qx, qy + 1);
              }
            }

            // 2. Set alpha for all visited background pixels with smooth feathering
            for (let i = 0; i < cropW * cropH; i++) {
              const dIdx = i * 4;
              if (visited[i]) {
                const r = data[dIdx];
                const g = data[dIdx + 1];
                const b = data[dIdx + 2];
                const brightness = (r + g + b) / 3;
                if (brightness >= 244) {
                  data[dIdx + 3] = 0; // Pure transparent
                } else if (brightness >= 225) {
                  data[dIdx + 3] = Math.floor(255 * (1 - (brightness - 225) / 19));
                }
              }
            }

            // 3. Put into a temporary canvas
            const tempC = document.createElement('canvas');
            tempC.width = cropW;
            tempC.height = cropH;
            const tCtx = tempC.getContext('2d');
            tCtx.putImageData(imgData, 0, 0);

            // 4. Center into 256x256 destination frame
            const dstX = char.c * 256;
            const dstY = char.r * 256;

            // Target max size within 256x256
            const maxDim = 220;
            const scale = Math.min(maxDim / cropW, maxDim / cropH);
            const fitW = cropW * scale;
            const fitH = cropH * scale;
            const offsetX = dstX + (256 - fitW) / 2;
            const offsetY = dstY + (256 - fitH) / 2;

            oCtx.drawImage(tempC, offsetX, offsetY, fitW, fitH);
          }

          window.processDone = true;
        };
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction(() => window.processDone === true, { timeout: 15000 });
  const outBuffer = await page.locator('#out').screenshot({ omitBackground: true });
  const targetPath = path.resolve('public/assets/defenders-v2-transparent.png');
  await fs.writeFile(targetPath, outBuffer);
  console.log('Saved transparent 3D defenders spritesheet:', targetPath, 'bytes:', outBuffer.length);
  await browser.close();
}

processDefenders().catch(console.error);

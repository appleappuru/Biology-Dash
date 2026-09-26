import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function processSpritesheets() {
  const browser = await chromium.launch({ headless: true });

  const defJpgPath = '/Users/henrywei/.gemini/antigravity/brain/09827f4b-15d6-4dfb-9ab9-66e8458e875f/defenders_kawaii_chibi_1790441598901.jpg';
  const micJpgPath = '/Users/henrywei/.gemini/antigravity/brain/09827f4b-15d6-4dfb-9ab9-66e8458e875f/microbes_kawaii_candy_1790441624937.jpg';

  const defBase64 = (await fs.readFile(defJpgPath)).toString('base64');
  const micBase64 = (await fs.readFile(micJpgPath)).toString('base64');

  // =========================================================================
  // 1. DEFENDERS SPRITESHEET: 4 cols x 3 rows (256x256 per frame = 1024x768)
  // =========================================================================
  const defPage = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  const defHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent;">
  <canvas id="out" width="1024" height="768"></canvas>
  <script>
    const outCanvas = document.getElementById('out');
    const outCtx = outCanvas.getContext('2d');

    const srcImg = new Image();
    srcImg.onload = () => {
      // Create temporary canvas to read pixels
      const tCanvas = document.createElement('canvas');
      tCanvas.width = 1024;
      tCanvas.height = 1024;
      const tCtx = tCanvas.getContext('2d');
      tCtx.drawImage(srcImg, 0, 0);

      // In defenders_kawaii_chibi_1790441598901.jpg:
      // Row 0 (Neutrophils): y ~ 65 to 290
      // Row 1 (Macrophages): y ~ 380 to 620
      // Row 2 (Plasma Cells): y ~ 710 to 950
      // Columns:
      // Col 0: x ~ 30 to 250
      // Col 1: x ~ 265 to 495
      // Col 2: x ~ 515 to 760
      // Col 3: x ~ 765 to 985

      const defBoxes = [
        // Row 0: Neutrophil (4 poses - clean spear tip separation)
        [ { x: 30, y: 70, w: 220, h: 220 }, { x: 270, y: 70, w: 230, h: 220 }, { x: 520, y: 68, w: 258, h: 224 }, { x: 785, y: 70, w: 215, h: 220 } ],
        // Row 1: Macrophage (4 poses)
        [ { x: 30, y: 380, w: 225, h: 235 }, { x: 260, y: 380, w: 240, h: 235 }, { x: 515, y: 380, w: 240, h: 235 }, { x: 760, y: 380, w: 225, h: 235 } ],
        // Row 2: Plasma Cell (4 poses - clean boundaries)
        [ { x: 30, y: 720, w: 230, h: 225 }, { x: 275, y: 715, w: 225, h: 225 }, { x: 510, y: 715, w: 260, h: 225 }, { x: 780, y: 715, w: 215, h: 225 } ]
      ];

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const box = defBoxes[row][col];
          const crop = tCtx.getImageData(box.x, box.y, box.w, box.h);
          const cData = crop.data;

          // Remove white/light background with smooth alpha feathering
          for (let i = 0; i < cData.length; i += 4) {
            const r = cData[i];
            const g = cData[i+1];
            const b = cData[i+2];

            const dr = 255 - r;
            const dg = 255 - g;
            const db = 255 - b;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist < 16) {
              cData[i+3] = 0; // Pure background
            } else if (dist < 44) {
              const factor = (dist - 16) / (44 - 16);
              cData[i+3] = Math.round(cData[i+3] * factor);
            }
          }

          const spriteCanvas = document.createElement('canvas');
          spriteCanvas.width = box.w;
          spriteCanvas.height = box.h;
          spriteCanvas.getContext('2d').putImageData(crop, 0, 0);

          // Draw into target 256x256 cell scaled to fit with breathing room
          const maxDim = Math.max(box.w, box.h);
          const targetDim = 210;
          const scale = Math.min(1.0, targetDim / maxDim);
          const drawW = Math.round(box.w * scale);
          const drawH = Math.round(box.h * scale);
          const destX = col * 256 + Math.round((256 - drawW) / 2);
          const destY = row * 256 + Math.round((256 - drawH) / 2);

          outCtx.imageSmoothingEnabled = true;
          outCtx.imageSmoothingQuality = 'high';
          outCtx.drawImage(spriteCanvas, destX, destY, drawW, drawH);
        }
      }

      window._done = true;
    };
    srcImg.src = 'data:image/jpeg;base64,' + "${defBase64}";
  </script>
</body>
</html>
  `;

  await defPage.setContent(defHtml);
  await defPage.waitForFunction(() => window._done === true);
  const defBuffer = await defPage.locator('#out').screenshot({ omitBackground: true });
  const defOutPath = path.resolve('public/assets/defenders-biological-3d.png');
  await fs.writeFile(defOutPath, defBuffer);
  console.log('Saved transparent defenders spritesheet to:', defOutPath, 'bytes:', defBuffer.length);
  await defPage.close();

  // =========================================================================
  // 2. MICROBES SPRITESHEET: 3 cols x 3 rows (128x128 per frame = 384x384)
  // =========================================================================
  const micPage = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  const micHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent;">
  <canvas id="out" width="384" height="384"></canvas>
  <script>
    const outCanvas = document.getElementById('out');
    const outCtx = outCanvas.getContext('2d');

    const srcImg = new Image();
    srcImg.onload = () => {
      const tCanvas = document.createElement('canvas');
      tCanvas.width = 1024;
      tCanvas.height = 1024;
      const tCtx = tCanvas.getContext('2d');
      tCtx.drawImage(srcImg, 0, 0);

      const micBoxes = [
        [ { x: 45, y: 35, w: 265, h: 265 }, { x: 360, y: 30, w: 275, h: 275 }, { x: 685, y: 25, w: 280, h: 275 } ],
        [ { x: 45, y: 355, w: 265, h: 265 }, { x: 370, y: 355, w: 260, h: 265 }, { x: 685, y: 355, w: 270, h: 265 } ],
        [ { x: 30, y: 690, w: 290, h: 250 }, { x: 360, y: 695, w: 285, h: 240 }, { x: 685, y: 675, w: 275, h: 265 } ]
      ];

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const box = micBoxes[row][col];
          const crop = tCtx.getImageData(box.x, box.y, box.w, box.h);
          const cData = crop.data;

          for (let i = 0; i < cData.length; i += 4) {
            const r = cData[i];
            const g = cData[i+1];
            const b = cData[i+2];

            const dr = 255 - r;
            const dg = 255 - g;
            const db = 255 - b;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist < 16) {
              cData[i+3] = 0;
            } else if (dist < 42) {
              const factor = (dist - 16) / (42 - 16);
              cData[i+3] = Math.round(cData[i+3] * factor);
            }
          }

          const spriteCanvas = document.createElement('canvas');
          spriteCanvas.width = box.w;
          spriteCanvas.height = box.h;
          spriteCanvas.getContext('2d').putImageData(crop, 0, 0);

          // Draw scaled into target 128x128 cell (scaling with high quality smoothing)
          const maxDim = Math.max(box.w, box.h);
          const targetDim = 100;
          const scale = Math.min(1.0, targetDim / maxDim);
          const drawW = Math.round(box.w * scale);
          const drawH = Math.round(box.h * scale);
          const destX = col * 128 + Math.round((128 - drawW) / 2);
          const destY = row * 128 + Math.round((128 - drawH) / 2);

          outCtx.imageSmoothingEnabled = true;
          outCtx.imageSmoothingQuality = 'high';
          outCtx.drawImage(spriteCanvas, destX, destY, drawW, drawH);
        }
      }

      window._done = true;
    };
    srcImg.src = 'data:image/jpeg;base64,' + "${micBase64}";
  </script>
</body>
</html>
  `;

  await micPage.setContent(micHtml);
  await micPage.waitForFunction(() => window._done === true);
  const micBuffer = await micPage.locator('#out').screenshot({ omitBackground: true });
  const micOutPath = path.resolve('public/assets/microbes-biological-3d.png');
  await fs.writeFile(micOutPath, micBuffer);
  console.log('Saved transparent microbes spritesheet to:', micOutPath, 'bytes:', micBuffer.length);

  await browser.close();
}

processSpritesheets().catch(console.error);

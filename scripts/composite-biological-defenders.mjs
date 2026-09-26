import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Read base 3D clay figurine spritesheet
  const baseImgBase64 = (await fs.readFile('public/assets/defenders-v2-transparent.png')).toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent;">
  <canvas id="c" width="1024" height="768"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      // 1. Draw base 3D clay figurines
      ctx.drawImage(img, 0, 0);

      // 2. Composite Biological Hallmarks onto 3D Figurines
      // ROW 0: NEUTROPHILS (cols 0, 1, 2, 3)
      for (let col = 0; col < 4; col++) {
        const cx = 128 + col * 256;
        const cy = 128;

        // Biological Hallmark: Translucent Multi-Lobed PMN Nucleus
        // Subtly visible through translucent porcelain body
        ctx.save();
        ctx.globalAlpha = 0.42;
        ctx.globalCompositeOperation = 'source-atop'; // Only blends inside character body

        const nGrad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy - 2, 28);
        nGrad.addColorStop(0, '#c084fc');
        nGrad.addColorStop(0.7, '#8b5cf6');
        nGrad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = nGrad;

        // 3 connected lobes (horseshoe configuration)
        ctx.beginPath();
        ctx.arc(cx - 22, cy - 6, 12, 0, Math.PI * 2);
        ctx.arc(cx, cy - 14, 11, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        // Connecting chromatin strands
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 6);
        ctx.quadraticCurveTo(cx - 11, cy - 12, cx, cy - 14);
        ctx.quadraticCurveTo(cx + 11, cy - 12, cx + 22, cy - 6);
        ctx.stroke();

        // Cytoplasmic granules (subtle pink/purple sparkles)
        ctx.fillStyle = '#e879f9';
        ctx.globalAlpha = 0.35;
        [
          { x: cx - 36, y: cy + 10 },
          { x: cx - 28, y: cy + 24 },
          { x: cx + 32, y: cy + 12 },
          { x: cx + 24, y: cy + 26 },
          { x: cx - 8, y: cy + 34 },
          { x: cx + 10, y: cy + 32 },
        ].forEach(g => {
          ctx.beginPath();
          ctx.arc(g.x, g.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // ROW 1: MACROPHAGES (cols 0, 1, 2, 3)
      for (let col = 0; col < 4; col++) {
        const cx = 128 + col * 256;
        const cy = 384;

        ctx.save();
        ctx.globalAlpha = 0.38;
        ctx.globalCompositeOperation = 'source-atop';

        // Biological Hallmark: Kidney-shaped / indented monocyte nucleus
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 10);
        ctx.bezierCurveTo(cx - 30, cy - 28, cx - 8, cy - 32, cx + 6, cy - 24);
        ctx.bezierCurveTo(cx + 20, cy - 16, cx + 18, cy - 2, cx + 8, cy + 2);
        ctx.bezierCurveTo(cx - 6, cy - 6, cx - 14, cy - 6, cx - 24, cy - 10);
        ctx.fill();

        // Phagolysosome digestive vacuoles inside belly
        [
          { x: cx - 18, y: cy + 24, r: 6.5, col: '#f43f5e' },
          { x: cx + 16, y: cy + 28, r: 5.5, col: '#facc15' },
        ].forEach(vac => {
          ctx.fillStyle = vac.col;
          ctx.beginPath();
          ctx.arc(vac.x, vac.y, vac.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // ROW 2: PLASMA CELLS (cols 0, 1, 2, 3)
      for (let col = 0; col < 4; col++) {
        const cx = 128 + col * 256;
        const cy = 640;

        ctx.save();
        ctx.globalAlpha = 0.40;
        ctx.globalCompositeOperation = 'source-atop';

        // Biological Hallmark: Clock-face / Cartwheel chromatin nucleus
        const ncx = cx - 16;
        const ncy = cy - 16;
        const nr = 18;

        ctx.strokeStyle = '#4a044e';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(ncx + Math.cos(a) * 4, ncy + Math.sin(a) * 4);
          ctx.lineTo(ncx + Math.cos(a) * (nr - 2), ncy + Math.sin(a) * (nr - 2));
          ctx.stroke();
        }
        ctx.restore();
      }

      window._done = true;
    };
    img.src = 'data:image/png;base64,' + "${baseImgBase64}";
  </script>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window._done === true);
  const buf = await page.locator('#c').screenshot({ omitBackground: true });

  const outPath = path.resolve('public/assets/defenders-biological-3d.png');
  await fs.writeFile(outPath, buf);
  console.log('Saved biologically enhanced 3D clay defenders:', outPath, 'bytes:', buf.length);
  await browser.close();
}

main().catch(console.error);

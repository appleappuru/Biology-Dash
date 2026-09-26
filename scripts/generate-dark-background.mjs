/**
 * Generates a clean, low-distraction, volumetric 2.5D dark tissue corridor
 * with heavy depth-of-field blur, 3/4 isometric perspective guidelines,
 * and muted deep-field ambient lighting.
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function generateDarkBackground() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1536 }
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #030a10;
    }
    canvas {
      display: block;
      width: 1024px;
      height: 1536px;
    }
  </style>
</head>
<body>
  <canvas id="c" width="1024" height="1536"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const W = 1024;
    const H = 1536;

    // 1. Dark ambient base gradient (deep cellular midnight)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#02070c');
    baseGrad.addColorStop(0.35, '#05121b');
    baseGrad.addColorStop(0.7, '#071824');
    baseGrad.addColorStop(1, '#030b12');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Out-of-focus background cellular bokeh (heavy depth of field)
    ctx.filter = 'blur(45px)';
    ctx.globalAlpha = 0.22;

    // Distant blurred organic structures
    const bokehColors = ['#1a3644', '#152d3a', '#102430', '#1c2e38'];
    for (let i = 0; i < 28; i++) {
      const bx = (i * 137) % W;
      const by = (i * 211) % H;
      const br = 60 + ((i * 47) % 120);
      ctx.fillStyle = bokehColors[i % bokehColors.length];
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;

    // 3. Central 3/4 perspective playable corridor floor
    // Receding trapezoid from Y=180 (W=460) to Y=1536 (W=880)
    const floorGrad = ctx.createLinearGradient(0, 180, 0, H);
    floorGrad.addColorStop(0, 'rgba(8, 25, 36, 0.65)');
    floorGrad.addColorStop(0.6, 'rgba(10, 32, 46, 0.85)');
    floorGrad.addColorStop(1, 'rgba(12, 38, 54, 0.95)');

    ctx.beginPath();
    ctx.moveTo(282, 180);
    ctx.lineTo(742, 180);
    ctx.lineTo(952, H);
    ctx.lineTo(72, H);
    ctx.closePath();
    ctx.fillStyle = floorGrad;
    ctx.fill();

    // 4. Subtle 3/4 perspective grid lines (low contrast, Mob Control style)
    ctx.strokeStyle = 'rgba(70, 160, 180, 0.08)';
    ctx.lineWidth = 1.5;

    // Longitudinal grid lines
    const lanes = 6;
    for (let l = 1; l < lanes; l++) {
      const topX = 282 + (742 - 282) * (l / lanes);
      const botX = 72 + (952 - 72) * (l / lanes);
      ctx.beginPath();
      ctx.moveTo(topX, 180);
      ctx.lineTo(botX, H);
      ctx.stroke();
    }

    // Transverse 3/4 perspective rungs
    for (let y = 240; y < H; y += 95) {
      const progress = (y - 180) / (H - 180);
      const leftX = 282 - (282 - 72) * progress;
      const rightX = 742 + (952 - 742) * progress;
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    // 5. Corridor border guide runners (subtle glowing neon rails)
    ctx.shadowColor = 'rgba(85, 239, 196, 0.35)';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = 'rgba(85, 239, 196, 0.28)';
    ctx.lineWidth = 3.5;

    // Left rail
    ctx.beginPath();
    ctx.moveTo(282, 180);
    ctx.lineTo(72, H);
    ctx.stroke();

    // Right rail
    ctx.beginPath();
    ctx.moveTo(742, 180);
    ctx.lineTo(952, H);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 6. Deep dark vignette borders on left and right sides
    const leftVignette = ctx.createLinearGradient(0, 0, 260, 0);
    leftVignette.addColorStop(0, '#02070c');
    leftVignette.addColorStop(0.7, 'rgba(2, 7, 12, 0.85)');
    leftVignette.addColorStop(1, 'rgba(2, 7, 12, 0)');
    ctx.fillStyle = leftVignette;
    ctx.fillRect(0, 0, 260, H);

    const rightVignette = ctx.createLinearGradient(W - 260, 0, W, 0);
    rightVignette.addColorStop(0, 'rgba(2, 7, 12, 0)');
    rightVignette.addColorStop(0.3, 'rgba(2, 7, 12, 0.85)');
    rightVignette.addColorStop(1, '#02070c');
    ctx.fillStyle = rightVignette;
    ctx.fillRect(W - 260, 0, 260, H);

    // 7. Horizon soft ambient occlusion fade at top
    const topFade = ctx.createLinearGradient(0, 0, 0, 280);
    topFade.addColorStop(0, '#02070c');
    topFade.addColorStop(0.65, 'rgba(2, 7, 12, 0.8)');
    topFade.addColorStop(1, 'rgba(2, 7, 12, 0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, W, 280);
  </script>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);

  const buffer = await page.screenshot({ type: 'png' });
  const outPath = path.resolve('public/assets/tissue-perspective-v2.png');
  await fs.writeFile(outPath, buffer);
  console.log('Successfully generated clean, low-distraction 2.5D background:', outPath);

  await browser.close();
}

generateDarkBackground().catch(console.error);

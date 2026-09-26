/**
 * High-Fidelity Microvascular Endothelial Corridor Generator
 * Pre-renders a subtle, biologically grounded 1024x1536 vascular lumen:
 * - Endothelial cell monolayer with delicate tight junctions and basement membrane
 * - Soft out-of-focus peripheral erythrocyte biconcave discs (RBCs)
 * - Muted microvascular palette (deep cellular navy, subtle plum & endothelial slate)
 * - Uncluttered, high-contrast central flow channel for effortless unit visibility
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function generateEndothelialCorridor() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1536 } });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #030a10; overflow: hidden; }
    canvas { display: block; width: 1024px; height: 1536px; }
  </style>
</head>
<body>
  <canvas id="c" width="1024" height="1536"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const W = 1024;
    const H = 1536;

    // 1. Deep microvascular ambient base gradient (calm, non-distracting navy & deep plum)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#02070d');      // Distant capillary threshold
    baseGrad.addColorStop(0.3, '#040f18');    // Deep microvascular lumen
    baseGrad.addColorStop(0.7, '#071822');    // Venular lumen
    baseGrad.addColorStop(1, '#05111b');      // Proximal foreground
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Central 3/4 perspective runway illumination (subtle plasma sheen)
    const horizonY = 240;
    const horizonX = W / 2;
    const horizonW = 120;
    const baseW = 540;

    // Soft radial glow at distal vascular horizon
    const glowGrad = ctx.createRadialGradient(horizonX, horizonY, 10, horizonX, horizonY, 280);
    glowGrad.addColorStop(0, 'rgba(85, 239, 196, 0.16)');
    glowGrad.addColorStop(0.4, 'rgba(10, 46, 61, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(horizonX, horizonY, 280, 0, Math.PI * 2);
    ctx.fill();

    // Central lumen flow channel
    const flowGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    flowGrad.addColorStop(0, 'rgba(6, 26, 38, 0.2)');
    flowGrad.addColorStop(0.5, 'rgba(9, 36, 52, 0.35)');
    flowGrad.addColorStop(1, 'rgba(5, 22, 33, 0.25)');

    ctx.beginPath();
    ctx.moveTo(horizonX - horizonW / 2, horizonY);
    ctx.lineTo(horizonX + horizonW / 2, horizonY);
    ctx.lineTo(horizonX + baseW / 2, H);
    ctx.lineTo(horizonX - baseW / 2, H);
    ctx.closePath();
    ctx.fillStyle = flowGrad;
    ctx.fill();

    // 3. Peripheral Endothelial Monolayer Walls (Left & Right)
    function drawEndothelialWalls() {
      // Left endothelial margin
      const leftGrad = ctx.createLinearGradient(0, 0, W * 0.35, 0);
      leftGrad.addColorStop(0, '#06131c');
      leftGrad.addColorStop(0.65, '#0a2230');
      leftGrad.addColorStop(1, 'rgba(10, 34, 48, 0)');

      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(horizonX - horizonW / 2, horizonY);
      ctx.lineTo(horizonX - baseW / 2, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Right endothelial margin
      const rightGrad = ctx.createLinearGradient(W, 0, W * 0.65, 0);
      rightGrad.addColorStop(0, '#06131c');
      rightGrad.addColorStop(0.65, '#0a2230');
      rightGrad.addColorStop(1, 'rgba(10, 34, 48, 0)');

      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(horizonX + horizonW / 2, horizonY);
      ctx.lineTo(horizonX + baseW / 2, H);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }
    drawEndothelialWalls();

    // 4. Subtle Cobblestone Endothelial Cell Junctions
    ctx.save();
    ctx.strokeStyle = 'rgba(85, 239, 196, 0.08)';
    ctx.lineWidth = 1.2;

    // Longitudinal boundary lines
    [-1, 1].forEach(side => {
      for (let s = 1; s <= 4; s++) {
        const t = s / 4;
        ctx.beginPath();
        const topX = horizonX + side * (horizonW / 2 + t * (W / 2 - horizonW / 2));
        const botX = horizonX + side * (baseW / 2 + t * (W / 2 - baseW / 2));
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, H);
        ctx.stroke();
      }
    });

    // Transverse endothelial seam rings (foreshortened along perspective)
    for (let r = 1; r <= 14; r++) {
      const p = Math.pow(r / 14, 2.2); // exponential depth spacing
      const y = horizonY + p * (H - horizonY);
      const halfW = (horizonW / 2) + p * ((baseW - horizonW) / 2);

      // Left segment
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(horizonX - halfW, y);
      ctx.stroke();

      // Right segment
      ctx.beginPath();
      ctx.moveTo(horizonX + halfW, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Out-of-Focus Peripheral Erythrocytes (Biconcave Red Blood Cells)
    // Rendered with soft depth-of-field in the margins (not in central combat lumen)
    ctx.save();
    ctx.filter = 'blur(16px)';
    ctx.globalAlpha = 0.22;

    function drawRBC(x, y, r, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // Biconcave outer disc (subtle deep erythrocyte burgundy)
      const rbcGrad = ctx.createRadialGradient(0, 0, r * 0.25, 0, 0, r);
      rbcGrad.addColorStop(0, '#5c1d24');
      rbcGrad.addColorStop(0.65, '#852932');
      rbcGrad.addColorStop(1, '#421419');

      ctx.fillStyle = rbcGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Biconcave central dimple / depression
      ctx.fillStyle = '#2d0c11';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Left peripheral margin RBCs
    const rbcPositionsLeft = [
      { x: 90, y: 380, r: 42, a: 0.4 },
      { x: 140, y: 620, r: 54, a: -0.3 },
      { x: 70, y: 880, r: 62, a: 0.7 },
      { x: 160, y: 1140, r: 76, a: -0.2 },
      { x: 80, y: 1380, r: 84, a: 0.5 },
      { x: 180, y: 440, r: 38, a: -0.6 },
      { x: 110, y: 990, r: 68, a: 0.3 },
    ];
    rbcPositionsLeft.forEach(p => drawRBC(p.x, p.y, p.r, p.a));

    // Right peripheral margin RBCs
    const rbcPositionsRight = [
      { x: W - 100, y: 410, r: 44, a: -0.5 },
      { x: W - 150, y: 660, r: 56, a: 0.4 },
      { x: W - 80, y: 920, r: 66, a: -0.3 },
      { x: W - 170, y: 1180, r: 78, a: 0.6 },
      { x: W - 90, y: 1410, r: 86, a: -0.4 },
      { x: W - 190, y: 480, r: 40, a: 0.7 },
      { x: W - 120, y: 1040, r: 70, a: -0.2 },
    ];
    rbcPositionsRight.forEach(p => drawRBC(p.x, p.y, p.r, p.a));
    ctx.restore();

    // 6. Subtle Vascular Perspective Guidelines along Lumen Borders
    ctx.save();
    // Left glowing border rail
    const railGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    railGrad.addColorStop(0, 'rgba(85, 239, 196, 0.05)');
    railGrad.addColorStop(0.5, 'rgba(85, 239, 196, 0.22)');
    railGrad.addColorStop(1, 'rgba(85, 239, 196, 0.08)');

    ctx.strokeStyle = railGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(horizonX - horizonW / 2, horizonY);
    ctx.lineTo(horizonX - baseW / 2, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(horizonX + horizonW / 2, horizonY);
    ctx.lineTo(horizonX + baseW / 2, H);
    ctx.stroke();

    // Faint subtle central dash line (lane guide)
    ctx.strokeStyle = 'rgba(85, 239, 196, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 28]);
    ctx.beginPath();
    ctx.moveTo(horizonX, horizonY);
    ctx.lineTo(horizonX, H);
    ctx.stroke();
    ctx.restore();

    // 7. Microscopic Floating Solute Particles (Very subtle, muted)
    ctx.save();
    ctx.fillStyle = '#55efc4';
    for (let i = 0; i < 40; i++) {
      const px = horizonX - 200 + ((i * 83) % 400);
      const py = horizonY + 30 + ((i * 137) % (H - horizonY - 60));
      const pr = 1 + ((i * 19) % 2.5);
      const pAlpha = 0.08 + ((i * 29) % 15) / 100;
      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  </script>
</body>
</html>
  `;

  await page.setContent(html);
  const outBuffer = await page.locator('#c').screenshot();
  const outPath = path.resolve('public/assets/corridor-endothelial-lumen.jpg');
  await fs.writeFile(outPath, outBuffer);
  console.log('Saved subtle endothelial corridor:', outPath, 'bytes:', outBuffer.length);
  await browser.close();
}

generateEndothelialCorridor().catch(console.error);

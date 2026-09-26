/**
 * High-Detail 3D Volumetric Microbe Spritesheet Generator
 * Renders 9 distinct 3D clay/resin/metallic character sprites (3x3 grid, 128x128 each, total 384x384)
 * with deep spherical Phong lighting, ambient occlusion, high-gloss specular catchlights,
 * and high-personality Kawaii faces.
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function render3DMicrobes() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const html = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="384" height="384"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 384, 384);

    // 1. Core 3D Volumetric Clay Sphere Shading
    function drawClaySphere(cx, cy, r, baseColor, shadowColor, highlightColor, rimColor = 'rgba(255,255,255,0.4)') {
      ctx.save();
      // Contact ground shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.82, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(2, 10, 16, 0.4)';
      ctx.fill();

      // Spherical diffuse gradient (Key light top-left: cx - r*0.35, cy - r*0.35)
      const grad = ctx.createRadialGradient(
        cx - r * 0.35, cy - r * 0.35, r * 0.05,
        cx, cy, r
      );
      grad.addColorStop(0, highlightColor);
      grad.addColorStop(0.55, baseColor);
      grad.addColorStop(0.9, shadowColor);
      grad.addColorStop(1, rimColor);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular glint
      const spec = ctx.createRadialGradient(
        cx - r * 0.38, cy - r * 0.38, 1,
        cx - r * 0.38, cy - r * 0.38, r * 0.3
      );
      spec.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      spec.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
      spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(cx - r * 0.38, cy - r * 0.38, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();
      ctx.restore();
    }

    // 2. High-Expression Kawaii Face
    function drawKawaiiFace(cx, cy, r, type = 'happy') {
      ctx.save();
      // Rosy 3D Cheek Blushes
      const blushY = cy + r * 0.16;
      [-r * 0.44, r * 0.44].forEach(bx => {
        const bGrad = ctx.createRadialGradient(cx + bx, blushY, 1, cx + bx, blushY, r * 0.18);
        bGrad.addColorStop(0, 'rgba(255, 107, 129, 0.85)');
        bGrad.addColorStop(1, 'rgba(255, 107, 129, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx + bx, blushY, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      });

      // Eyes
      const eyeY = cy - r * 0.05;
      const eyeR = r * 0.14;

      if (type === 'sleepy') {
        // Pouty determined squint
        [-r * 0.28, r * 0.28].forEach(ex => {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(cx + ex, eyeY + 1, eyeR, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        });
        // Pout mouth
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        // Big sparkly anime eyes
        [-r * 0.28, r * 0.28].forEach(ex => {
          const eyeX = cx + ex;
          // Dark pupil
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();

          // Big catchlight
          ctx.beginPath();
          ctx.arc(eyeX - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Tiny secondary sparkle
          ctx.beginPath();
          ctx.arc(eyeX + eyeR * 0.3, eyeY + eyeR * 0.3, eyeR * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // Joyful open smile
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.15, r * 0.18, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }

    // ==========================================
    // FRAME (0,0): S. AUREUS (Honey Golden Cluster)
    // ==========================================
    const c0x = 64, c0y = 64;
    // Clustered grape-like spheres
    drawClaySphere(c0x - 22, c0y - 14, 20, '#fcc419', '#d97706', '#fff9db');
    drawClaySphere(c0x + 22, c0y - 12, 19, '#fcc419', '#d97706', '#fff9db');
    drawClaySphere(c0x - 18, c0y + 16, 21, '#fcc419', '#d97706', '#fff9db');
    drawClaySphere(c0x + 18, c0y + 18, 20, '#fcc419', '#d97706', '#fff9db');
    drawClaySphere(c0x, c0y, 28, '#ffc000', '#c86800', '#fffbeb');
    drawKawaiiFace(c0x, c0y, 28, 'happy');

    // ==========================================
    // FRAME (1,0): BETA-LACTAMASE+ (Amber with 3D Shield)
    // ==========================================
    const c1x = 192, c1y = 64;
    drawClaySphere(c1x, c1y, 34, '#f97316', '#c2410c', '#ffedd5');
    // 3D Beveled Brass Shield in front
    ctx.save();
    ctx.translate(c1x + 18, c1y + 12);
    ctx.rotate(0.15);
    const sGrad = ctx.createLinearGradient(-16, -20, 16, 20);
    sGrad.addColorStop(0, '#ffd700');
    sGrad.addColorStop(0.5, '#f59e0b');
    sGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(16, -12);
    ctx.lineTo(12, 12);
    ctx.lineTo(0, 20);
    ctx.lineTo(-12, 12);
    ctx.lineTo(-16, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3bf';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Shield boss
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawKawaiiFace(c1x - 6, c1y - 2, 30, 'happy');

    // ==========================================
    // FRAME (2,0): DOXY-RESISTANT (Coral with Stubborn Pout)
    // ==========================================
    const c2x = 320, c2y = 64;
    drawClaySphere(c2x, c2y, 35, '#f43f5e', '#be123c', '#ffe4e6');
    // Mini headband
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(c2x, c2y - 24, 28, 8, -0.05, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    drawKawaiiFace(c2x, c2y + 4, 32, 'sleepy');

    // ==========================================
    // FRAME (0,1): MRSA (Royal Violet with Knight Visor)
    // ==========================================
    const c3x = 64, c3y = 192;
    drawClaySphere(c3x, c3y, 35, '#8b5cf6', '#5b21b6', '#ede9fe');
    // Sculpted 3D Knight Visor
    ctx.save();
    const vGrad = ctx.createLinearGradient(c3x - 30, c3y - 10, c3x + 30, c3y + 10);
    vGrad.addColorStop(0, '#94a3b8');
    vGrad.addColorStop(0.5, '#475569');
    vGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = vGrad;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(c3x - 28, c3y - 12, 56, 18, 6);
    ctx.fill();
    ctx.stroke();
    // Glowing eye slit
    ctx.fillStyle = '#ffeaa7';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.fillRect(c3x - 20, c3y - 5, 14, 4);
    ctx.fillRect(c3x + 6, c3y - 5, 14, 4);
    ctx.restore();
    // Cute cheeks below visor
    drawKawaiiFace(c3x, c3y + 12, 26, 'happy');

    // ==========================================
    // FRAME (1,1): ANTIGEN-B (Mint with Queen Crown ♛)
    // ==========================================
    const c4x = 192, c4y = 192;
    drawClaySphere(c4x, c4y, 35, '#10b981', '#047857', '#d1fae5');
    // 3D Gold Queen Crown
    ctx.save();
    const crGrad = ctx.createLinearGradient(c4x - 24, c4y - 42, c4x + 24, c4y - 20);
    crGrad.addColorStop(0, '#fff3bf');
    crGrad.addColorStop(0.5, '#facc15');
    crGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = crGrad;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c4x - 24, c4y - 22);
    ctx.lineTo(c4x - 28, c4y - 40);
    ctx.lineTo(c4x - 12, c4y - 28);
    ctx.lineTo(c4x, c4y - 44);
    ctx.lineTo(c4x + 12, c4y - 28);
    ctx.lineTo(c4x + 28, c4y - 40);
    ctx.lineTo(c4x + 24, c4y - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Crown ruby jewels
    ctx.fillStyle = '#f43f5e';
    [-18, 0, 18].forEach(jx => {
      ctx.beginPath();
      ctx.arc(c4x + jx, c4y - 26, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    drawKawaiiFace(c4x, c4y + 4, 32, 'happy');

    // ==========================================
    // FRAME (2,1): PNEUMOCOCCUS (Paired Lilac in Iridescent Bubble)
    // ==========================================
    const c5x = 320, c5y = 192;
    // Iridescent Bubble Capsule Shell
    ctx.save();
    const bubGrad = ctx.createRadialGradient(c5x - 14, c5y - 14, 4, c5x, c5y, 44);
    bubGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    bubGrad.addColorStop(0.6, 'rgba(238, 190, 250, 0.28)');
    bubGrad.addColorStop(0.9, 'rgba(168, 85, 247, 0.4)');
    bubGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
    ctx.fillStyle = bubGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(c5x, c5y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Twin Lilac Mochis Inside
    drawClaySphere(c5x - 15, c5y, 20, '#c084fc', '#7e22ce', '#f3e8ff');
    drawClaySphere(c5x + 15, c5y, 20, '#c084fc', '#7e22ce', '#f3e8ff');
    drawKawaiiFace(c5x - 15, c5y, 20, 'happy');
    drawKawaiiFace(c5x + 15, c5y, 20, 'happy');

    // ==========================================
    // FRAME (0,2): E. COLI (Coral Rod with Flagella Cilia)
    // ==========================================
    const c6x = 64, c6y = 320;
    // Waving Flagella Cilia tentacles
    ctx.save();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    [
      { sx: c6x - 28, sy: c6y - 12, ex: c6x - 46, ey: c6y - 20 },
      { sx: c6x - 28, sy: c6y + 12, ex: c6x - 48, ey: c6y + 18 },
      { sx: c6x + 28, sy: c6y - 12, ex: c6x + 46, ey: c6y - 20 },
      { sx: c6x + 28, sy: c6y + 12, ex: c6x + 48, ey: c6y + 18 },
      { sx: c6x, sy: c6y + 26, ex: c6x - 8, ey: c6y + 46 },
      { sx: c6x, sy: c6y + 26, ex: c6x + 8, ey: c6y + 46 },
    ].forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.sx, f.sy);
      ctx.quadraticCurveTo((f.sx + f.ex)/2 + 6, (f.sy + f.ey)/2, f.ex, f.ey);
      ctx.stroke();
    });
    ctx.restore();
    drawClaySphere(c6x, c6y, 32, '#ef4444', '#b91c1c', '#fee2e2');
    drawKawaiiFace(c6x, c6y, 30, 'happy');

    // ==========================================
    // FRAME (1,2): PSEUDOMONAS (Aqua Sea-Slug with Antenna)
    // ==========================================
    const c7x = 192, c7y = 320;
    // Antenna
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c7x, c7y - 26);
    ctx.quadraticCurveTo(c7x + 18, c7y - 48, c7x + 26, c7y - 38);
    ctx.stroke();
    // Glowing antenna tip
    ctx.fillStyle = '#67e8f9';
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(c7x + 26, c7y - 38, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawClaySphere(c7x, c7y, 33, '#06b6d4', '#0e7490', '#cffafe');
    drawKawaiiFace(c7x, c7y, 30, 'happy');

    // ==========================================
    // FRAME (2,2): CANDIDA (Dough Dumpling with Budding Baby Sprout)
    // ==========================================
    const c8x = 320, c8y = 320;
    // Baby Bud Sprout
    drawClaySphere(c8x + 22, c8y - 20, 16, '#f8fafc', '#94a3b8', '#ffffff');
    drawKawaiiFace(c8x + 22, c8y - 20, 16, 'happy');
    // Mother dumpling
    drawClaySphere(c8x, c8y + 6, 32, '#f8fafc', '#94a3b8', '#ffffff');
    drawKawaiiFace(c8x, c8y + 6, 30, 'happy');
  </script>
</body>
</html>
  `;

  await page.setContent(html);
  const outBuffer = await page.locator('#c').screenshot({ omitBackground: true });
  const outPath = path.resolve('public/assets/microbes-v4-volumetric.png');
  await fs.writeFile(outPath, outBuffer);
  console.log('Saved 3D volumetric microbes spritesheet:', outPath, 'bytes:', outBuffer.length);
  await browser.close();
}

render3DMicrobes().catch(console.error);

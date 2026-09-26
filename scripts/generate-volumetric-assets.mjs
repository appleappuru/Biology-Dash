/**
 * Biology Dash: Immune Patrol
 * High-Precision 2.5D Volumetric Asset Generator
 * Renders 3D clay/acrylic shaded sprites in 3/4 isometric perspective
 * using Playwright Chromium Canvas rendering.
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function generateVolumetricAssets() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });

  // 1. Generate Defenders Spritesheet (512x384, 4 cols x 3 rows, 128x128 frames)
  const defendersHtml = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="512" height="384"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // Helper: Draw 3D Volumetric Sphere with Directional Light & Specular Gloss
    function drawVolumetricSphere(cx, cy, r, baseR, baseG, baseB, lightAngle = -Math.PI * 0.75) {
      // 1. Directional Light Vector
      const lx = Math.cos(lightAngle);
      const ly = Math.sin(lightAngle);

      // Create base radial sphere gradient
      const grad = ctx.createRadialGradient(
        cx + lx * r * 0.38, cy + ly * r * 0.38, r * 0.08,
        cx, cy, r
      );
      // Highlight
      const hr = Math.min(255, baseR + 80);
      const hg = Math.min(255, baseG + 80);
      const hb = Math.min(255, baseB + 80);
      grad.addColorStop(0, \`rgb(\${hr},\${hg},\${hb})\`);
      // Midtone
      grad.addColorStop(0.55, \`rgb(\${baseR},\${baseG},\${baseB})\`);
      // Ambient Occlusion / Shadow
      const sr = Math.max(0, Math.floor(baseR * 0.55));
      const sg = Math.max(0, Math.floor(baseG * 0.55));
      const sb = Math.max(0, Math.floor(baseB * 0.55));
      grad.addColorStop(0.92, \`rgb(\${sr},\${sg},\${sb})\`);
      // Soft Rim Light on opposite edge
      grad.addColorStop(1, 'rgba(85, 239, 196, 0.45)');

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. High-Gloss Specular Highlight (Hotspot)
      const specX = cx + lx * r * 0.38;
      const specY = cy + ly * r * 0.38;
      const specGrad = ctx.createRadialGradient(specX, specY, 1, specX, specY, r * 0.35);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(specX, specY, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();
    }

    // Helper: Draw 3/4 Perspective Kawaii Eyes & Rosy Blush
    function draw34Face(cx, cy, r, tiltX = 0, expression = 'happy') {
      ctx.save();
      // Rosy 3D Blush Spheres
      const blushY = cy + r * 0.16;
      [-r * 0.48, r * 0.48].forEach(bx => {
        const bGrad = ctx.createRadialGradient(cx + bx + tiltX, blushY, 1, cx + bx + tiltX, blushY, r * 0.2);
        bGrad.addColorStop(0, 'rgba(255, 118, 117, 0.85)');
        bGrad.addColorStop(1, 'rgba(255, 118, 117, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx + bx + tiltX, blushY, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3D Bead Eyes with dual specular sparkles
      const eyeY = cy - r * 0.04;
      const eyeR = r * 0.14;
      [-r * 0.28, r * 0.28].forEach(ex => {
        const eyeX = cx + ex + tiltX;
        if (expression === 'hug') {
          // Closed joyful eyes ^ ^
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(eyeX, eyeY + 2, eyeR * 1.1, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else {
          // Volumetric Bead Eye
          const eyeGrad = ctx.createRadialGradient(eyeX - 1, eyeY - 1, 1, eyeX, eyeY, eyeR);
          eyeGrad.addColorStop(0, '#334155');
          eyeGrad.addColorStop(0.7, '#0f172a');
          eyeGrad.addColorStop(1, '#020617');
          ctx.fillStyle = eyeGrad;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fill();

          // Primary Specular Catchlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.42, 0, Math.PI * 2);
          ctx.fill();
          // Secondary Catchlight
          ctx.beginPath();
          ctx.arc(eyeX + eyeR * 0.3, eyeY + eyeR * 0.3, eyeR * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (expression === 'hug') {
        ctx.arc(cx + tiltX, cy + r * 0.18, r * 0.18, 0.1, Math.PI - 0.1);
        ctx.fillStyle = '#ff7675';
        ctx.fill();
      } else {
        ctx.arc(cx + tiltX, cy + r * 0.14, r * 0.16, 0.2, Math.PI - 0.2);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Helper: 3D Volumetric Hug Arms
    function draw3DVolumetricArm(ax, ay, r, angle) {
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      // Tubular capsule arm
      const armGrad = ctx.createLinearGradient(0, -r * 0.3, 0, r * 0.3);
      armGrad.addColorStop(0, '#ffffff');
      armGrad.addColorStop(0.6, '#d4f5fc');
      armGrad.addColorStop(1, '#74b9ff');
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.roundRect(-r * 0.5, -r * 0.25, r, r * 0.5, r * 0.25);
      ctx.fill();
      ctx.restore();
    }

    // --- ROW 0: NEUTROPHIL (Marshmallow White 3D Clay Sphere) ---
    for (let c = 0; c < 4; c++) {
      const cx = 64 + c * 128;
      const cy = 64;
      const tiltX = c === 1 ? -6 : c === 2 ? 6 : 0;
      const expr = c === 3 ? 'hug' : 'happy';

      // 3D Arms
      if (c === 3) {
        draw3DVolumetricArm(cx - 38, cy + 8, 30, -0.6);
        draw3DVolumetricArm(cx + 38, cy + 8, 30, 0.6);
      } else {
        draw3DVolumetricArm(cx - 36, cy + 14, 24, -0.2);
        draw3DVolumetricArm(cx + 36, cy + 14, 24, 0.2);
      }

      drawVolumetricSphere(cx, cy, 38, 245, 250, 255);
      draw34Face(cx, cy, 38, tiltX, expr);
    }

    // --- ROW 1: MACROPHAGE (Volumetric Soft Mint Seafoam Pear) ---
    for (let c = 0; c < 4; c++) {
      const cx = 64 + c * 128;
      const cy = 192;
      const tiltX = c === 1 ? -6 : c === 2 ? 6 : 0;
      const expr = c === 3 ? 'hug' : 'happy';

      // Big 3D Hug Arms
      draw3DVolumetricArm(cx - 44, cy + 6, 38, c === 3 ? -0.7 : -0.25);
      draw3DVolumetricArm(cx + 44, cy + 6, 38, c === 3 ? 0.7 : 0.25);

      // Pear Body
      drawVolumetricSphere(cx, cy + 4, 44, 187, 242, 229);
      // Cream Underbelly
      const bGrad = ctx.createRadialGradient(cx, cy + 12, 4, cx, cy + 12, 26);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.7, '#fff9e6');
      bGrad.addColorStop(1, 'rgba(255, 249, 230, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 26, 0, Math.PI * 2);
      ctx.fill();

      draw34Face(cx, cy, 42, tiltX, expr);
    }

    // --- ROW 2: PLASMA CELL (Lavender Torus Halo & 3D Egg) ---
    for (let c = 0; c < 4; c++) {
      const cx = 64 + c * 128;
      const cy = 320;
      const tiltX = c === 1 ? -6 : c === 2 ? 6 : 0;
      const expr = c === 3 ? 'hug' : 'happy';

      // 3D Glowing Halo Ring (tilted at 35 degrees)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy - 38, 26, 9, 0, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffeaa7';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      drawVolumetricSphere(cx, cy, 38, 228, 210, 252);
      draw34Face(cx, cy, 38, tiltX, expr);

      // 3D Floating Y-Antibodies for pose 3
      if (c === 3) {
        [-34, 34].forEach(ax => {
          ctx.strokeStyle = '#ffeaa7';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx + ax, cy - 14);
          ctx.lineTo(cx + ax, cy - 4);
          ctx.moveTo(cx + ax - 6, cy - 20);
          ctx.lineTo(cx + ax, cy - 14);
          ctx.lineTo(cx + ax + 6, cy - 20);
          ctx.stroke();
        });
      }
    }
  </script>
</body>
</html>
  `;

  await page.setContent(defendersHtml);
  const defBuffer = await page.locator('#c').screenshot();
  const defPath = path.resolve('public/assets/defenders-simple-v1.png');
  await fs.writeFile(defPath, defBuffer);
  console.log('Saved 3/4 volumetric defenders:', defPath);

  // 2. Generate Microbes Sprite Atlas (288x288, 3x3 grid, 96x96 frames)
  const microbesHtml = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="288" height="288"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    function drawSphere(cx, cy, r, baseR, baseG, baseB, rimColor = 'rgba(85,239,196,0.45)') {
      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.08, cx, cy, r);
      grad.addColorStop(0, \`rgb(\${Math.min(255, baseR + 85)},\${Math.min(255, baseG + 85)},\${Math.min(255, baseB + 85)})\`);
      grad.addColorStop(0.55, \`rgb(\${baseR},\${baseG},\${baseB})\`);
      grad.addColorStop(0.92, \`rgb(\${Math.floor(baseR * 0.5)},\${Math.floor(baseG * 0.5)},\${Math.floor(baseB * 0.5)})\`);
      grad.addColorStop(1, rimColor);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight
      const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 1, cx - r * 0.35, cy - r * 0.35, r * 0.35);
      spec.addColorStop(0, 'rgba(255,255,255,0.95)');
      spec.addColorStop(0.4, 'rgba(255,255,255,0.3)');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();
    }

    function drawCuteFace(cx, cy, r, sleepy = false) {
      // Rosy blush
      ctx.fillStyle = 'rgba(255, 107, 107, 0.7)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy + r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy + r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Bead eyes
      const eyeR = r * 0.13;
      [-r * 0.28, r * 0.28].forEach(ex => {
        if (sleepy) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx + ex, cy + 1, eyeR, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(cx + ex, cy, eyeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx + ex - 1.5, cy - 1.5, eyeR * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.16, r * 0.15, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // 1. S. aureus (0,0) - Golden Honey Clay Cluster
    drawSphere(36, 36, 18, 253, 203, 110);
    drawSphere(60, 38, 17, 253, 203, 110);
    drawSphere(48, 56, 19, 253, 203, 110);
    drawSphere(48, 46, 26, 255, 234, 167);
    drawCuteFace(48, 46, 26);

    // 2. Beta-Lactamase+ (1,0) - Amber with 3D Brass Collar
    drawSphere(144, 48, 28, 245, 159, 0);
    // Brass metallic shield
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(144, 66, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.restore();
    drawCuteFace(144, 48, 28);

    // 3. Doxy-Resistant (2,0) - Rosy Coral Candy
    drawSphere(240, 48, 28, 244, 63, 94);
    drawCuteFace(240, 48, 28, true);

    // 4. MRSA (0,1) - Royal Violet Mochi with 3D Knight Visor
    drawSphere(48, 144, 29, 139, 92, 246);
    // Metallic 3D Visor
    ctx.fillStyle = '#475569';
    ctx.fillRect(32, 134, 32, 14);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 134, 32, 14);
    // Glowing eye slit
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(38, 139, 8, 4);
    ctx.fillRect(50, 139, 8, 4);

    // 5. Antigen-B (1,1) - Mint with 3D Queen Crown ♛
    drawSphere(144, 144, 29, 16, 185, 129);
    // 3D Crown
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, 126);
    ctx.lineTo(134, 110);
    ctx.lineTo(144, 118);
    ctx.lineTo(154, 110);
    ctx.lineTo(158, 126);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawCuteFace(144, 144, 29);

    // 6. Pneumococcus (2,1) - Paired Lilac in Iridescent Bubble
    ctx.save();
    ctx.beginPath();
    ctx.arc(240, 144, 36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(238, 190, 250, 0.28)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#da77f2';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawSphere(230, 144, 16, 192, 132, 252);
    drawSphere(250, 144, 16, 192, 132, 252);
    drawCuteFace(230, 144, 16);
    drawCuteFace(250, 144, 16);

    // 7. E. coli (0,2) - Volumetric 3D Coral Capsule
    drawSphere(48, 240, 26, 248, 113, 113);
    drawCuteFace(48, 240, 26);

    // 8. Pseudomonas (1,2) - Sleek Aqua Sea-Slug with 3D Antenna
    drawSphere(144, 240, 27, 6, 182, 212);
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(144, 216);
    ctx.quadraticCurveTo(158, 196, 164, 204);
    ctx.stroke();
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(164, 204, 4, 0, Math.PI * 2);
    ctx.fill();
    drawCuteFace(144, 240, 27);

    // 9. Candida (2,2) - 3D Toasted-Cream Dough Dumpling & Baby Bud
    drawSphere(240, 244, 26, 241, 245, 249);
    drawSphere(255, 222, 14, 241, 245, 249);
    drawCuteFace(240, 244, 26);
    drawCuteFace(255, 222, 14);
  </script>
</body>
</html>
  `;

  await page.setContent(microbesHtml);
  const micBuffer = await page.locator('#c').screenshot();
  const micPath = path.resolve('public/assets/microbes-volumetric-v3.png');
  await fs.writeFile(micPath, micBuffer);
  console.log('Saved 3/4 volumetric microbes:', micPath);

  // 3. Generate 3D UI Icons (256x256, replacing all native Unicode emojis)
  // Grid: 4x4 icons (64x64 each):
  // (0,0): Heart / Cells badge (chubby 3D pink/red heart)
  // (1,0): Gold Coin (3D beveled gold coin)
  // (2,0): Lightning / Surge (3D glowing neon bolt)
  // (3,0): Medicine Vial / Capsule (3D two-tone cyan/white blister capsule)
  // (0,1): Care Kit Tool (3D medical kit briefcase)
  // (1,1): Pause Button (3D dual glowing rounded cylinders)
  // (2,1): 3D Star (5-pointed beveled golden star)
  // (3,1): 3D Shield (beveled metallic heraldic shield)
  const iconsHtml = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="256" height="256"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // (0,0): 3D Chubby Heart
    function draw3DHeart(cx, cy, size) {
      ctx.save();
      ctx.translate(cx, cy);
      const s = size / 32;
      ctx.scale(s, s);
      const grad = ctx.createRadialGradient(-4, -6, 2, 0, 0, 18);
      grad.addColorStop(0, '#ff9999');
      grad.addColorStop(0.6, '#ff4757');
      grad.addColorStop(1, '#b31224');

      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-14, -6, -14, -14, 0, -4);
      ctx.bezierCurveTo(14, -14, 14, -6, 0, 8);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(255, 71, 87, 0.45)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // (1,0): 3D Beveled Gold Coin
    function draw3DCoin(cx, cy, r) {
      ctx.save();
      // Coin outer rim
      const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      rimGrad.addColorStop(0, '#fff3bf');
      rimGrad.addColorStop(0.5, '#fcc419');
      rimGrad.addColorStop(1, '#d9480f');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Coin inner inset
      const inGrad = ctx.createLinearGradient(cx + r, cy + r, cx - r, cy - r);
      inGrad.addColorStop(0, '#ffd43b');
      inGrad.addColorStop(1, '#f59f00');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = inGrad;
      ctx.fill();

      // Star emblem on coin
      ctx.fillStyle = '#fff9db';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C', cx, cy + 1);
      ctx.restore();
    }

    // (2,0): 3D Glowing Lightning Surge
    function draw3DLightning(cx, cy, size) {
      ctx.save();
      ctx.translate(cx, cy);
      const grad = ctx.createLinearGradient(-10, -20, 10, 20);
      grad.addColorStop(0, '#fff9db');
      grad.addColorStop(0.5, '#ffd43b');
      grad.addColorStop(1, '#f59f00');

      ctx.beginPath();
      ctx.moveTo(2, -18);
      ctx.lineTo(-12, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-4, 18);
      ctx.lineTo(12, -2);
      ctx.lineTo(0, -2);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ffd43b';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }

    // (3,0): 3D Medicine Capsule
    function draw3DCapsule(cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);

      // Top half (Cyan)
      const topGrad = ctx.createLinearGradient(-10, -20, 10, -20);
      topGrad.addColorStop(0, '#55efc4');
      topGrad.addColorStop(1, '#00cec9');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.roundRect(-8, -20, 16, 20, [8, 8, 0, 0]);
      ctx.fill();

      // Bottom half (White porcelain)
      const botGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      botGrad.addColorStop(0, '#ffffff');
      botGrad.addColorStop(1, '#dfe6e9');
      ctx.fillStyle = botGrad;
      ctx.beginPath();
      ctx.roundRect(-8, 0, 16, 20, [0, 0, 8, 8]);
      ctx.fill();
      ctx.restore();
    }

    // (0,1): 3D Care Kit Briefcase
    function draw3DKit(cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      // Case body
      const caseGrad = ctx.createLinearGradient(0, -14, 0, 16);
      caseGrad.addColorStop(0, '#ff7675');
      caseGrad.addColorStop(1, '#d63031');
      ctx.fillStyle = caseGrad;
      ctx.beginPath();
      ctx.roundRect(-18, -10, 36, 26, 6);
      ctx.fill();

      // Handle
      ctx.strokeStyle = '#dfe6e9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-8, -17, 16, 9, 3);
      ctx.stroke();

      // White cross emblem
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -4, 6, 14);
      ctx.fillRect(-7, 0, 14, 6);
      ctx.restore();
    }

    // (1,1): 3D Pause Bars
    function draw3DPause(cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      const pGrad = ctx.createLinearGradient(-10, -14, 10, 14);
      pGrad.addColorStop(0, '#81ecec');
      pGrad.addColorStop(1, '#00cec9');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(-10, -14, 7, 28, 3.5);
      ctx.roundRect(3, -14, 7, 28, 3.5);
      ctx.fill();
      ctx.restore();
    }

    // (2,1): 3D Star
    function draw3DStar(cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
      starGrad.addColorStop(0, '#fff9db');
      starGrad.addColorStop(0.6, '#ffd43b');
      starGrad.addColorStop(1, '#f59f00');

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r, -Math.sin((18 + i * 72) * Math.PI / 180) * r);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.5), -Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.5));
      }
      ctx.closePath();
      ctx.fillStyle = starGrad;
      ctx.shadowColor = '#ffd43b';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // Render icons on 64x64 grid
    draw3DHeart(32, 32, 22);
    draw3DCoin(96, 32, 18);
    draw3DLightning(160, 32, 22);
    draw3DCapsule(224, 32);
    draw3DKit(32, 96);
    draw3DPause(96, 96);
    draw3DStar(160, 96, 18);
  </script>
</body>
</html>
  `;

  await page.setContent(iconsHtml);
  const iconBuffer = await page.locator('#c').screenshot();
  const iconPath = path.resolve('public/assets/ui-icons-3d.png');
  await fs.writeFile(iconPath, iconBuffer);
  console.log('Saved 3D UI icons:', iconPath);

  await browser.close();
}

generateVolumetricAssets().catch(console.error);

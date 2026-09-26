/**
 * Biology Dash: Immune Patrol
 * Pre-Rendered High-Precision Biological Spritesheet Generator
 * Fuses rigorous cell biology & microbiology morphology with tactile 3D clay Kawaii aesthetics:
 * - Neutrophils: 3-lobed PMN nucleus, cytoplasmic granules, NETosis chromatin lance
 * - Macrophages: Ruffled undulating lamellipodia, kidney-shaped nucleus, digestive vacuoles
 * - Plasma Cells: Eccentric clock-face nucleus, perinuclear Golgi Hof halo, Y-shaped immunoglobulins
 * - Pathogens: Staph grape clusters, lancet diplococci with polysaccharide capsule,
 *   E. coli peritrichous rods, Pseudomonas polar flagella, Candida budding blastoconidia with germ tube
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function generateBiologicalSprites() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  // =========================================================================
  // 1. DEFENDERS: 4 cols x 3 rows (256x256 each, total 1024x768)
  // =========================================================================
  const defendersHtml = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="1024" height="768"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 768);

    // Helper: 3D Spherical Volume
    function drawVolume(cx, cy, rx, ry, baseColor, shadowColor, highlightColor, rim = 'rgba(255,255,255,0.45)') {
      ctx.save();
      const grad = ctx.createRadialGradient(cx - rx * 0.32, cy - ry * 0.32, rx * 0.05, cx, cy, rx);
      grad.addColorStop(0, highlightColor);
      grad.addColorStop(0.55, baseColor);
      grad.addColorStop(0.9, shadowColor);
      grad.addColorStop(1, rim);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular hotspot
      const sGrad = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.35, 1, cx - rx * 0.35, cy - ry * 0.35, rx * 0.35);
      sGrad.addColorStop(0, 'rgba(255,255,255,0.92)');
      sGrad.addColorStop(0.4, 'rgba(255,255,255,0.3)');
      sGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.35, cy - ry * 0.35, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = sGrad;
      ctx.fill();
      ctx.restore();
    }

    // Helper: Cute Anime Face
    function drawCuteFace(cx, cy, r, sleepy = false) {
      ctx.save();
      // Rosy 3D Blushes
      [-r * 0.42, r * 0.42].forEach(bx => {
        const bGrad = ctx.createRadialGradient(cx + bx, cy + r * 0.16, 1, cx + bx, cy + r * 0.16, r * 0.18);
        bGrad.addColorStop(0, 'rgba(255, 120, 140, 0.85)');
        bGrad.addColorStop(1, 'rgba(255, 120, 140, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx + bx, cy + r * 0.16, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      });

      const eyeY = cy - r * 0.05;
      const eyeR = r * 0.13;
      if (sleepy) {
        [-r * 0.28, r * 0.28].forEach(ex => {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(cx + ex, eyeY + 1, eyeR, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        });
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.18, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        [-r * 0.28, r * 0.28].forEach(ex => {
          ctx.beginPath();
          ctx.arc(cx + ex, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + ex - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + ex + eyeR * 0.3, eyeY + eyeR * 0.3, eyeR * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.15, r * 0.16, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =========================================================================
    // ROW 0: POLYMORPHONUCLEAR NEUTROPHILS (PMN)
    // 3-Lobed Nucleus visible in translucent cytoplasm + Granules + Pseudopods
    // =========================================================================
    for (let col = 0; col < 4; col++) {
      const cx = 128 + col * 256;
      const cy = 128;
      const r = 68;

      ctx.save();
      // 1. Ameboid pseudopod feet
      const footL = col === 1 ? -12 : 0;
      const footR = col === 1 ? 12 : 0;
      drawVolume(cx - 32, cy + 54 + footL, 20, 16, '#f8fafc', '#cbd5e1', '#ffffff');
      drawVolume(cx + 32, cy + 54 + footR, 20, 16, '#f8fafc', '#cbd5e1', '#ffffff');

      // Ameboid hands
      if (col === 0) {
        // Cheer: hands raised
        drawVolume(cx - 58, cy - 14, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');
        drawVolume(cx + 58, cy - 14, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');
      } else if (col === 1) {
        // Walk: swing
        drawVolume(cx - 52, cy + 18, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');
        drawVolume(cx + 52, cy + 8, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');
      } else if (col === 2) {
        // NETosis Lance Hero: holding chromatin net lance
        drawVolume(cx - 48, cy + 12, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');
        drawVolume(cx + 44, cy + 4, 18, 18, '#f8fafc', '#cbd5e1', '#ffffff');

        // Chromatin NET Lance (Decondensed DNA fibers + antimicrobial histone pearls)
        ctx.strokeStyle = '#a29bfe';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + 42, cy + 45);
        ctx.lineTo(cx + 58, cy - 65);
        ctx.stroke();

        // Glowing NET Spearhead
        const sGrad = ctx.createLinearGradient(cx + 55, cy - 65, cx + 64, cy - 85);
        sGrad.addColorStop(0, '#a29bfe');
        sGrad.addColorStop(1, '#dfe6e9');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 58, cy - 65);
        ctx.lineTo(cx + 48, cy - 70);
        ctx.lineTo(cx + 62, cy - 90);
        ctx.lineTo(cx + 72, cy - 70);
        ctx.closePath();
        ctx.fill();

        // Sticky antimicrobial histone pearls
        ctx.fillStyle = '#ffeaa7';
        [
          { x: cx + 46, y: cy + 15 },
          { x: cx + 52, y: cy - 20 },
          { x: cx + 56, y: cy - 45 }
        ].forEach(hp => {
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Translucent Cytoplasmic Body (Chubby porcelain clay)
      drawVolume(cx, cy, r, r * 0.94, '#f8fafc', '#e2e8f0', '#ffffff');

      // 3. BIOLOGICAL HALLMARK: Multi-Lobed PMN Nucleus (3 connected lobes inside cytoplasm)
      ctx.save();
      ctx.globalAlpha = 0.58;
      const nGrad = ctx.createRadialGradient(cx - 6, cy - 20, 2, cx, cy - 16, 26);
      nGrad.addColorStop(0, '#c4b5fd');
      nGrad.addColorStop(0.7, '#8b5cf6');
      nGrad.addColorStop(1, '#6d28d9');
      ctx.fillStyle = nGrad;

      // 3 Nuclear Lobes (horseshoe configuration)
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 20, 14, 0, Math.PI * 2);
      ctx.arc(cx, cy - 28, 13, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy - 20, 14, 0, Math.PI * 2);
      ctx.fill();

      // Chromatin connecting strands between lobes
      ctx.strokeStyle = '#6d28d9';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 20);
      ctx.quadraticCurveTo(cx - 10, cy - 26, cx, cy - 28);
      ctx.quadraticCurveTo(cx + 10, cy - 26, cx + 20, cy - 20);
      ctx.stroke();
      ctx.restore();

      // 4. BIOLOGICAL HALLMARK: Azurophilic & Specific Cytoplasmic Granules
      ctx.save();
      ctx.fillStyle = '#c084fc';
      ctx.globalAlpha = 0.45;
      [
        { x: cx - 34, y: cy - 4 },
        { x: cx - 26, y: cy + 18 },
        { x: cx + 28, y: cy - 6 },
        { x: cx + 32, y: cy + 16 },
        { x: cx - 12, y: cy + 32 },
        { x: cx + 14, y: cy + 30 },
      ].forEach(g => {
        ctx.beginPath();
        ctx.arc(g.x, g.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Kawaii Expression
      drawCuteFace(cx, cy + 4, r * 0.85, col === 3);
      ctx.restore();
    }

    // =========================================================================
    // ROW 1: MACROPHAGES (Mononuclear Phagocyte Giant)
    // Ruffled Lamellipodia Skirt + Kidney Nucleus + Phagolysosome Vacuoles
    // =========================================================================
    for (let col = 0; col < 4; col++) {
      const cx = 128 + col * 256;
      const cy = 384;
      const r = 78;

      ctx.save();
      // 1. Biological Hallmark: Ruffled Undulating Plasma Membrane Skirt
      ctx.save();
      ctx.fillStyle = '#34d399';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.2) {
        const wave = Math.sin(a * 7) * 8 + Math.cos(a * 4) * 5;
        const radX = (r + 14 + wave);
        const radY = (r * 0.9 + 12 + wave * 0.6);
        const px = cx + Math.cos(a) * radX;
        const py = cy + 10 + Math.sin(a) * radY;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Ameboid Phagocytic Arms
      if (col === 0) {
        // Waving
        drawVolume(cx - 72, cy + 6, 26, 26, '#6ee7b7', '#059669', '#a7f3d0');
        drawVolume(cx + 74, cy - 24, 26, 30, '#6ee7b7', '#059669', '#a7f3d0');
      } else if (col === 1) {
        // Wide Phagocytic Pseudopods (embracing)
        drawVolume(cx - 86, cy, 32, 28, '#6ee7b7', '#059669', '#a7f3d0');
        drawVolume(cx + 86, cy, 32, 28, '#6ee7b7', '#059669', '#a7f3d0');
      } else if (col === 2) {
        // Engulfing Hug
        drawVolume(cx - 56, cy + 20, 32, 26, '#6ee7b7', '#059669', '#a7f3d0');
        drawVolume(cx + 56, cy + 20, 32, 26, '#6ee7b7', '#059669', '#a7f3d0');
      } else {
        // Rear view
        drawVolume(cx - 72, cy + 16, 26, 26, '#6ee7b7', '#059669', '#a7f3d0');
        drawVolume(cx + 72, cy + 16, 26, 26, '#6ee7b7', '#059669', '#a7f3d0');
      }

      // 2. Main Ameboid Body
      drawVolume(cx, cy, r, r * 1.05, '#55efc4', '#00b894', '#a8ffeb');

      // 3. Translucent Belly
      const bellyGrad = ctx.createRadialGradient(cx, cy + 20, 5, cx, cy + 20, 48);
      bellyGrad.addColorStop(0, '#fef9c3');
      bellyGrad.addColorStop(0.8, '#fef08a');
      bellyGrad.addColorStop(1, '#6ee7b7');
      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 46, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. BIOLOGICAL HALLMARK: Kidney-Shaped / Indented Monocyte Nucleus
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      // Indented kidney bean contour
      ctx.moveTo(cx - 30, cy - 25);
      ctx.bezierCurveTo(cx - 35, cy - 45, cx - 10, cy - 50, cx + 5, cy - 40);
      ctx.bezierCurveTo(cx + 25, cy - 30, cx + 25, cy - 10, cx + 15, cy - 5);
      ctx.bezierCurveTo(cx - 5, cy - 15, cx - 15, cy - 15, cx - 30, cy - 25);
      ctx.fill();
      ctx.restore();

      // 5. BIOLOGICAL HALLMARK: Digestive Phagolysosome Vacuoles
      ctx.save();
      [
        { x: cx - 22, y: cy + 18, r: 8, col: '#f43f5e' }, // digesting coccus fragment
        { x: cx + 18, y: cy + 24, r: 7, col: '#facc15' }, // lipid droplet
        { x: cx - 4, y: cy + 36, r: 9, col: '#38bdf8' },  // phagolysosome
      ].forEach(vac => {
        const vGrad = ctx.createRadialGradient(vac.x - 2, vac.y - 2, 1, vac.x, vac.y, vac.r);
        vGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
        vGrad.addColorStop(0.6, vac.col);
        vGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(vac.x, vac.y, vac.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Engulfed captive microbe for Pose 2
      if (col === 2) {
        ctx.save();
        // Tiny cute trapped S. aureus mochi in hug
        drawVolume(cx, cy + 15, 18, 18, '#f59e0b', '#b45309', '#fef3c7');
        drawCuteFace(cx, cy + 15, 18, false);
        ctx.restore();
      }

      // 6. Cute Face
      if (col !== 3) {
        drawCuteFace(cx, cy - 10, r * 0.75, col === 2);
      }
      ctx.restore();
    }

    // =========================================================================
    // ROW 2: PLASMA CELLS (Differentiated B-Cells)
    // Clock-Face Nucleus + Perinuclear Golgi Halo + Secreted Y-Antibodies
    // =========================================================================
    for (let col = 0; col < 4; col++) {
      const cx = 128 + col * 256;
      const cy = 640;
      const r = 66;

      ctx.save();
      // 1. BIOLOGICAL HALLMARK: Perinuclear Golgi Hof Halo Ring
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy - 64, 48, 16, 0, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Little floating secretory star-gems on halo
      ctx.fillStyle = '#ffffff';
      [-36, 0, 36].forEach(sx => {
        ctx.beginPath();
        ctx.arc(cx + sx, cy - 64, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. Secretory Robe / Torso
      const robeGrad = ctx.createLinearGradient(cx, cy + 20, cx, cy + 78);
      robeGrad.addColorStop(0, '#c084fc');
      robeGrad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = robeGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 50, cy + 22, 100, 52, 18);
      ctx.fill();

      // 3. Cute Flying Feet
      drawVolume(cx - 20, cy + 76, 15, 15, '#a855f7', '#6b21a8', '#e9d5ff');
      drawVolume(cx + 20, cy + 76, 15, 15, '#a855f7', '#6b21a8', '#e9d5ff');

      // 4. Arms
      if (col === 0) {
        drawVolume(cx - 52, cy + 34, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
        drawVolume(cx + 52, cy + 34, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
      } else if (col === 1) {
        drawVolume(cx - 48, cy + 38, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
        drawVolume(cx + 58, cy + 18, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
      } else if (col === 2) {
        // Holding Y-Antibodies
        drawVolume(cx - 46, cy + 28, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
        drawVolume(cx + 46, cy + 28, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
      } else {
        drawVolume(cx - 52, cy + 34, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
        drawVolume(cx + 52, cy + 34, 16, 16, '#e9d5ff', '#a855f7', '#ffffff');
      }

      // 5. Main Lavender Head Body
      drawVolume(cx, cy, r, r * 0.94, '#d8b4fe', '#9333ea', '#f3e8ff');

      // 6. BIOLOGICAL HALLMARK: Clock-Face (Cartwheel) Chromatin Nucleus
      ctx.save();
      const ncx = cx - 18; // Eccentrically located nucleus
      const ncy = cy - 18;
      const nr = 22;

      // Nuclear membrane
      ctx.beginPath();
      ctx.arc(ncx, ncy, nr, 0, Math.PI * 2);
      ctx.fillStyle = '#581c87';
      ctx.globalAlpha = 0.55;
      ctx.fill();

      // Radially arranged heterochromatin wedges (Cartwheel / Clock-Face!)
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(ncx + Math.cos(a) * 5, ncy + Math.sin(a) * 5);
        ctx.lineTo(ncx + Math.cos(a) * (nr - 3), ncy + Math.sin(a) * (nr - 3));
        ctx.stroke();
      }
      ctx.restore();

      // 7. BIOLOGICAL HALLMARK: Secreted Y-Shaped Antibodies (IgG)
      function drawAntibody(ax, ay, scale = 1, angle = 0) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;

        // Fc Stem
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, 0);
        // Left Fab Arm
        ctx.lineTo(-12, -14);
        // Right Fab Arm
        ctx.moveTo(0, 0);
        ctx.lineTo(12, -14);
        ctx.stroke();

        // Fab Antigen-Binding Tips
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-12, -14, 3, 0, Math.PI * 2);
        ctx.arc(12, -14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (col === 2) {
        // Dual active antibodies in hand
        drawAntibody(cx - 52, cy - 2, 1.2, -0.2);
        drawAntibody(cx + 52, cy - 2, 1.2, 0.2);
      } else if (col === 3) {
        // Orbiting star antibodies
        drawAntibody(cx - 68, cy - 40, 1.0, -0.4);
        drawAntibody(cx + 68, cy - 40, 1.0, 0.4);
      }

      // 8. Kawaii Face
      if (col !== 3) {
        drawCuteFace(cx + 8, cy + 4, r * 0.82, false);
      }
      ctx.restore();
    }
  </script>
</body>
</html>
  `;

  await page.setContent(defendersHtml);
  const defBuffer = await page.locator('#c').screenshot({ omitBackground: true });
  const defPath = path.resolve('public/assets/defenders-biological-3d.png');
  await fs.writeFile(defPath, defBuffer);
  console.log('Saved biological 3D defenders spritesheet:', defPath, 'bytes:', defBuffer.length);
  await page.close();

  // =========================================================================
  // 2. PATHOGENS: 3 cols x 3 rows (128x128 each, total 384x384)
  // Strict Microbiology Morphology (Grape clusters, lancet diplococci, rods, yeast)
  // =========================================================================
  const page2 = await browser.newPage({ viewport: { width: 512, height: 512 } });
  page2.on('console', msg => console.log('PAGE2 LOG:', msg.text()));
  page2.on('pageerror', err => console.error('PAGE2 ERROR:', err));
  const microbesHtml = `
<!DOCTYPE html>
<html>
<body>
  <canvas id="c" width="384" height="384"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 384, 384);

    function drawSphere(cx, cy, r, baseR, baseG, baseB, rim = 'rgba(255,255,255,0.45)') {
      ctx.save();
      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.05, cx, cy, r);
      grad.addColorStop(0, \`rgb(\${Math.min(255, baseR + 90)},\${Math.min(255, baseG + 90)},\${Math.min(255, baseB + 90)})\`);
      grad.addColorStop(0.55, \`rgb(\${baseR},\${baseG},\${baseB})\`);
      grad.addColorStop(0.9, \`rgb(\${Math.floor(baseR * 0.55)},\${Math.floor(baseG * 0.55)},\${Math.floor(baseB * 0.55)})\`);
      grad.addColorStop(1, rim);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight
      const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 1, cx - r * 0.35, cy - r * 0.35, r * 0.35);
      spec.addColorStop(0, 'rgba(255,255,255,0.92)');
      spec.addColorStop(0.4, 'rgba(255,255,255,0.3)');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();
      ctx.restore();
    }

    function drawCuteFace(cx, cy, r, sleepy = false) {
      ctx.save();
      // Rosy blushes
      [-r * 0.44, r * 0.44].forEach(bx => {
        const bGrad = ctx.createRadialGradient(cx + bx, cy + r * 0.16, 1, cx + bx, cy + r * 0.16, r * 0.18);
        bGrad.addColorStop(0, 'rgba(255, 107, 129, 0.85)');
        bGrad.addColorStop(1, 'rgba(255, 107, 129, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx + bx, cy + r * 0.16, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      });

      const eyeY = cy - r * 0.05;
      const eyeR = r * 0.13;
      if (sleepy) {
        [-r * 0.28, r * 0.28].forEach(ex => {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.arc(cx + ex, eyeY + 1, eyeR, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        });
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.18, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        [-r * 0.28, r * 0.28].forEach(ex => {
          ctx.beginPath();
          ctx.arc(cx + ex, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + ex - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.15, r * 0.18, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =========================================================================
    // (0,0): STAPHYLOCOCCUS AUREUS
    // Microbiology: Irregular grape-like cluster of Gram-positive golden cocci
    // =========================================================================
    const s0x = 64, s0y = 64;
    // 5 interlocking golden spheres (staphyle = bunch of grapes!)
    drawSphere(s0x - 24, s0y - 14, 18, 245, 158, 11);
    drawSphere(s0x + 22, s0y - 16, 17, 245, 158, 11);
    drawSphere(s0x - 18, s0y + 18, 19, 245, 158, 11);
    drawSphere(s0x + 20, s0y + 18, 18, 245, 158, 11);
    drawSphere(s0x, s0y + 2, 26, 251, 191, 36);
    drawCuteFace(s0x, s0y + 2, 26);

    // =========================================================================
    // (1,0): BETA-LACTAMASE+ S. AUREUS
    // Microbiology: Golden staph cluster secreting beta-lactamase enzyme ring
    // =========================================================================
    const s1x = 192, s1y = 64;
    // Enzyme shield halo
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(s1x, s1y, 44, 0, Math.PI * 2);
    ctx.stroke();
    // Cleaved beta-lactam rings
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.strokeRect(s1x + 24, s1y - 38, 12, 12);
    ctx.restore();

    drawSphere(s1x - 22, s1y - 12, 17, 249, 115, 22);
    drawSphere(s1x + 20, s1y - 14, 16, 249, 115, 22);
    drawSphere(s1x - 16, s1y + 16, 18, 249, 115, 22);
    drawSphere(s1x + 18, s1y + 16, 17, 249, 115, 22);
    drawSphere(s1x, s1y + 2, 25, 251, 146, 60);
    drawCuteFace(s1x, s1y + 2, 25);

    // =========================================================================
    // (2,0): DOXY-RESISTANT S. AUREUS
    // Microbiology: Active Tet efflux pump nozzles on membrane
    // =========================================================================
    const s2x = 320, s2y = 64;
    // Efflux pump channels projecting out
    ctx.save();
    ctx.fillStyle = '#fb7185';
    [
      { x: s2x - 38, y: s2y - 10, a: -0.4 },
      { x: s2x + 36, y: s2y - 12, a: 0.4 },
      { x: s2x - 32, y: s2y + 18, a: -0.8 },
      { x: s2x + 30, y: s2y + 20, a: 0.8 },
    ].forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillRect(-5, -5, 12, 10);
      ctx.restore();
    });
    ctx.restore();

    drawSphere(s2x - 20, s2y - 12, 18, 244, 63, 94);
    drawSphere(s2x + 20, s2y - 12, 17, 244, 63, 94);
    drawSphere(s2x - 16, s2y + 16, 18, 244, 63, 94);
    drawSphere(s2x + 18, s2y + 16, 17, 244, 63, 94);
    drawSphere(s2x, s2y + 2, 25, 251, 113, 133);
    drawCuteFace(s2x, s2y + 2, 25, true);

    // =========================================================================
    // (0,1): MRSA (Methicillin-Resistant S. Aureus)
    // Microbiology: Mutated PBP2a transpeptidase armor plating
    // =========================================================================
    const s3x = 64, s3y = 192;
    drawSphere(s3x - 22, s3y - 14, 18, 124, 58, 237);
    drawSphere(s3x + 22, s3y - 14, 17, 124, 58, 237);
    drawSphere(s3x - 18, s3y + 18, 19, 124, 58, 237);
    drawSphere(s3x + 18, s3y + 18, 18, 124, 58, 237);
    drawSphere(s3x, s3y + 2, 26, 139, 92, 246);

    // PBP2a Metallic Visor Plate
    ctx.save();
    const pbpGrad = ctx.createLinearGradient(s3x - 24, s3y - 8, s3x + 24, s3y + 8);
    pbpGrad.addColorStop(0, '#94a3b8');
    pbpGrad.addColorStop(0.5, '#475569');
    pbpGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = pbpGrad;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(s3x - 24, s3y - 8, 48, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing eye slit
    ctx.fillStyle = '#fde047';
    ctx.fillRect(s3x - 16, s3y - 2, 10, 4);
    ctx.fillRect(s3x + 6, s3y - 2, 10, 4);
    ctx.restore();

    // =========================================================================
    // (1,1): ANTIGEN-B S. AUREUS
    // Microbiology: Hypervariable surface adhesin/protein A epitope crown
    // =========================================================================
    const s4x = 192, s4y = 192;
    drawSphere(s4x - 22, s4y - 12, 17, 5, 150, 105);
    drawSphere(s4x + 20, s4y - 14, 16, 5, 150, 105);
    drawSphere(s4x - 16, s4y + 16, 18, 5, 150, 105);
    drawSphere(s4x + 18, s4y + 16, 17, 5, 150, 105);
    drawSphere(s4x, s4y + 2, 25, 16, 185, 129);

    // Epitope B Crown
    ctx.save();
    const bGrad = ctx.createLinearGradient(s4x - 20, s4y - 36, s4x + 20, s4y - 16);
    bGrad.addColorStop(0, '#fde047');
    bGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s4x - 20, s4y - 16);
    ctx.lineTo(s4x - 24, s4y - 34);
    ctx.lineTo(s4x - 10, s4y - 22);
    ctx.lineTo(s4x, s4y - 36);
    ctx.lineTo(s4x + 10, s4y - 22);
    ctx.lineTo(s4x + 24, s4y - 34);
    ctx.lineTo(s4x + 20, s4y - 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCuteFace(s4x, s4y + 4, 24);

    // =========================================================================
    // (2,1): STREPTOCOCCUS PNEUMONIAE
    // Microbiology: Lancet-shaped (pointed oval) diplococci pairs in polysaccharide capsule
    // =========================================================================
    const s5x = 320, s5y = 192;
    // Iridescent polysaccharide capsule (Quellung reaction)
    ctx.save();
    const capGrad = ctx.createRadialGradient(s5x - 10, s5y - 10, 5, s5x, s5y, 44);
    capGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    capGrad.addColorStop(0.65, 'rgba(216, 180, 254, 0.28)');
    capGrad.addColorStop(1, 'rgba(192, 132, 252, 0.6)');
    ctx.fillStyle = capGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s5x, s5y, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Twin Lancet-Shaped Diplococci (pointed flame ends!)
    function drawLancet(lx, ly, angle) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      const lGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 18);
      lGrad.addColorStop(0, '#f3e8ff');
      lGrad.addColorStop(0.6, '#c084fc');
      lGrad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.moveTo(0, -18); // pointed lancet flame apex
      ctx.bezierCurveTo(14, -10, 16, 14, 0, 18);
      ctx.bezierCurveTo(-16, 14, -14, -10, 0, -18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawLancet(s5x - 14, s5y, -0.2);
    drawLancet(s5x + 14, s5y, 0.2);
    drawCuteFace(s5x - 14, s5y, 16);
    drawCuteFace(s5x + 14, s5y, 16);

    // =========================================================================
    // (0,2): ESCHERICHIA COLI
    // Microbiology: Gram-negative bacillus rod with peritrichous flagella
    // =========================================================================
    const s6x = 64, s6y = 320;
    // Peritrichous flagella emerging from all around the perimeter
    ctx.save();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    [
      { sx: s6x - 26, sy: s6y - 12, ex: s6x - 48, ey: s6y - 24 },
      { sx: s6x - 28, sy: s6y + 8, ex: s6x - 52, ey: s6y + 14 },
      { sx: s6x + 26, sy: s6y - 12, ex: s6x + 48, ey: s6y - 24 },
      { sx: s6x + 28, sy: s6y + 8, ex: s6x + 52, ey: s6y + 14 },
      { sx: s6x - 10, sy: s6y + 24, ex: s6x - 18, ey: s6y + 46 },
      { sx: s6x + 10, sy: s6y + 24, ex: s6x + 18, ey: s6y + 46 },
      { sx: s6x - 8, sy: s6y - 24, ex: s6x - 14, ey: s6y - 44 },
      { sx: s6x + 8, sy: s6y - 24, ex: s6x + 14, ey: s6y - 44 },
    ].forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.sx, f.sy);
      ctx.quadraticCurveTo((f.sx + f.ex)/2 + 4, (f.sy + f.ey)/2, f.ex, f.ey);
      ctx.stroke();
    });
    ctx.restore();

    // Cylindrical Bacillus Capsule Body
    ctx.save();
    const rodGrad = ctx.createLinearGradient(s6x - 28, s6y - 24, s6x + 28, s6y + 24);
    rodGrad.addColorStop(0, '#fca5a5');
    rodGrad.addColorStop(0.5, '#ef4444');
    rodGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = rodGrad;
    ctx.beginPath();
    ctx.roundRect(s6x - 26, s6y - 22, 52, 44, 22);
    ctx.fill();
    ctx.restore();
    drawCuteFace(s6x, s6y, 24);

    // =========================================================================
    // (1,2): PSEUDOMONAS AERUGINOSA
    // Microbiology: Slender rod with single polar whip flagellum and pyocyanin sheen
    // =========================================================================
    const s7x = 192, s7y = 320;
    // Single Polar Flagellum
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s7x, s7y - 22);
    ctx.bezierCurveTo(s7x + 14, s7y - 40, s7x + 32, s7y - 36, s7x + 28, s7y - 54);
    ctx.stroke();
    ctx.restore();

    // Slender rod with pyocyanin blue-green gradient sheen
    ctx.save();
    const psGrad = ctx.createLinearGradient(s7x - 26, s7y - 20, s7x + 26, s7y + 20);
    psGrad.addColorStop(0, '#a5f3fc');
    psGrad.addColorStop(0.4, '#06b6d4');
    psGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = psGrad;
    ctx.beginPath();
    ctx.roundRect(s7x - 26, s7y - 20, 52, 40, 20);
    ctx.fill();

    // Pyocyanin bioluminescent glint
    ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
    ctx.beginPath();
    ctx.ellipse(s7x - 8, s7y - 10, 14, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawCuteFace(s7x, s7y + 2, 22);

    // =========================================================================
    // (2,2): CANDIDA ALBICANS
    // Microbiology: Dimorphic yeast: mother blastoconidium + constricted bud + germ tube
    // =========================================================================
    const s8x = 320, s8y = 320;
    // Sprouting Germ Tube
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s8x + 18, s8y - 12);
    ctx.quadraticCurveTo(s8x + 36, s8y - 28, s8x + 44, s8y - 44);
    ctx.stroke();
    ctx.restore();

    // Mother Yeast Blastoconidium (large oval)
    ctx.save();
    const yGrad = ctx.createRadialGradient(s8x - 8, s8y + 6, 4, s8x, s8y + 10, 32);
    yGrad.addColorStop(0, '#ffffff');
    yGrad.addColorStop(0.65, '#f1f5f9');
    yGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = yGrad;
    ctx.beginPath();
    ctx.ellipse(s8x - 6, s8y + 8, 28, 24, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Constricted Budding Daughter Cell
    const dGrad = ctx.createRadialGradient(s8x + 20, s8y - 12, 2, s8x + 22, s8y - 10, 16);
    dGrad.addColorStop(0, '#ffffff');
    dGrad.addColorStop(0.65, '#f1f5f9');
    dGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.ellipse(s8x + 20, s8y - 10, 16, 14, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Budding neck constriction scar
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s8x + 10, s8y - 2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Cute matching mother & baby faces
    drawCuteFace(s8x - 6, s8y + 8, 24);
    drawCuteFace(s8x + 20, s8y - 10, 14);
  </script>
</body>
</html>
  `;

  await page2.setContent(microbesHtml);
  const micBuffer = await page2.locator('#c').screenshot({ omitBackground: true });
  const micPath = path.resolve('public/assets/microbes-biological-3d.png');
  await fs.writeFile(micPath, micBuffer);
  console.log('Saved biological 3D microbes spritesheet:', micPath, 'bytes:', micBuffer.length);

  await browser.close();
}

generateBiologicalSprites().catch(console.error);

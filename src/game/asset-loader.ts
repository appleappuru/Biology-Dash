/**
 * Biology Dash: Immune Patrol
 * Dynamic 3D Clay Texture Processor & Asset Loader
 * Strips white backgrounds from 3D AI-generated spritesheets and generates
 * rich 3D clay-shaded procedural microbe textures.
 */

import Phaser from 'phaser';

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

/**
 * Generates rich 3D clay-shaded microbe sprites with spherical lighting,
 * porcelain catchlights, and kawaii faces.
 */
export function generate3DClayMicrobeAtlas(scene: Phaser.Scene): void {
  if (scene.textures.exists('microbes_3d')) return;

  const canvas = document.createElement('canvas');
  canvas.width = 288;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  // 9 Microbes (3x3 grid, each 96x96)
  const drawClaySphere = (
    cx: number,
    cy: number,
    r: number,
    baseColor: string,
    shadowColor: string,
    highlightColor: string
  ) => {
    // Drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.85, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5, 21, 31, 0.45)';
    ctx.fill();
    ctx.restore();

    // 3D Spherical Radial Gradient
    const grad = ctx.createRadialGradient(
      cx - r * 0.35,
      cy - r * 0.35,
      r * 0.08,
      cx,
      cy,
      r
    );
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(0.55, baseColor);
    grad.addColorStop(1, shadowColor);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Clay specular gloss highlight
    const specGrad = ctx.createRadialGradient(
      cx - r * 0.32,
      cy - r * 0.32,
      1,
      cx - r * 0.32,
      cy - r * 0.32,
      r * 0.45
    );
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(cx - r * 0.32, cy - r * 0.32, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();
  };

  const drawKawaiiFace = (cx: number, cy: number, r: number, expression: string = 'happy') => {
    ctx.save();
    // Rosy Blush
    ctx.fillStyle = 'rgba(255, 120, 140, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.48, cy + r * 0.18, r * 0.22, r * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.48, cy + r * 0.18, r * 0.22, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Anime Eyes with dual catchlights
    const eyeY = cy;
    const eyeR = r * 0.16;

    [-r * 0.28, r * 0.28].forEach((eyeX) => {
      ctx.beginPath();
      ctx.arc(cx + eyeX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Big catchlight
      ctx.beginPath();
      ctx.arc(cx + eyeX - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Tiny catchlight
      ctx.beginPath();
      ctx.arc(cx + eyeX + eyeR * 0.3, eyeY + eyeR * 0.3, eyeR * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Mouth
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (expression === 'sleepy') {
      ctx.arc(cx, cy + r * 0.2, r * 0.15, 0.2, Math.PI - 0.2);
    } else {
      ctx.arc(cx, cy + r * 0.14, r * 0.18, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Render 9 critters in 96x96 slots:
  // 1. S. aureus (golden honey clay jelly)
  drawClaySphere(48, 48, 30, '#fcc419', '#d97706', '#fff9db');
  drawClaySphere(32, 38, 18, '#fcc419', '#d97706', '#fff9db');
  drawClaySphere(64, 40, 16, '#fcc419', '#d97706', '#fff9db');
  drawKawaiiFace(48, 48, 30, 'happy');

  // 2. Beta-Lactamase+ (Amber with brass shield)
  drawClaySphere(144, 48, 30, '#f97316', '#c2410c', '#ffedd5');
  // Brass shield collar
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(144, 68, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawKawaiiFace(144, 48, 30, 'happy');

  // 3. Doxy-Resistant S. aureus (Rosy coral with stubborn cheeks)
  drawClaySphere(240, 48, 30, '#f43f5e', '#be123c', '#ffe4e6');
  drawKawaiiFace(240, 48, 30, 'sleepy');

  // 4. MRSA (Royal violet with knight visor)
  drawClaySphere(48, 144, 30, '#8b5cf6', '#6d28d9', '#ede9fe');
  // Knight visor
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.fillRect(32, 134, 32, 12);
  ctx.strokeRect(32, 134, 32, 12);
  drawKawaiiFace(48, 144, 30, 'happy');

  // 5. Antigen-B (Mint with Queen crown ♛)
  drawClaySphere(144, 144, 30, '#10b981', '#047857', '#d1fae5');
  // Gold crown
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(132, 124);
  ctx.lineTo(136, 110);
  ctx.lineTo(144, 118);
  ctx.lineTo(152, 110);
  ctx.lineTo(156, 124);
  ctx.closePath();
  ctx.fill();
  drawKawaiiFace(144, 144, 30, 'happy');

  // 6. Pneumococcus (Lilac duo in bubble)
  ctx.save();
  ctx.beginPath();
  ctx.arc(240, 144, 36, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(238, 190, 250, 0.35)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawClaySphere(230, 144, 16, '#c084fc', '#7e22ce', '#f3e8ff');
  drawClaySphere(250, 144, 16, '#c084fc', '#7e22ce', '#f3e8ff');
  drawKawaiiFace(230, 144, 16, 'happy');
  drawKawaiiFace(250, 144, 16, 'happy');

  // 7. E. coli (Coral bean with cilia)
  drawClaySphere(48, 240, 28, '#f87171', '#b91c1c', '#fee2e2');
  drawKawaiiFace(48, 240, 28, 'happy');

  // 8. Pseudomonas (Sleek aqua sea-slug with antennae)
  drawClaySphere(144, 240, 28, '#06b6d4', '#0e7490', '#cffafe');
  // Antenna
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(144, 214);
  ctx.quadraticCurveTo(156, 196, 162, 202);
  ctx.stroke();
  drawKawaiiFace(144, 240, 28, 'happy');

  // 9. Candida (Creamy dough dumpling with baby bud sprout)
  drawClaySphere(240, 244, 28, '#f1f5f9', '#94a3b8', '#ffffff');
  drawClaySphere(254, 222, 14, '#f1f5f9', '#94a3b8', '#ffffff');
  drawKawaiiFace(240, 244, 28, 'happy');
  drawKawaiiFace(254, 222, 14, 'happy');

  // Register in Phaser
  scene.textures.addCanvas('microbes_3d', canvas);
  const tex = scene.textures.get('microbes_3d');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      tex.add(String(idx), 0, col * 96, row * 96, 96, 96);
    }
  }
}

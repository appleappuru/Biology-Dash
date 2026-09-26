#!/usr/bin/env python3
"""
Generate professional, kawaii, 3D-styled, child-drawable defender SVG atlas for Biology Dash.
Preserves:
- 512x384 viewBox across 4 columns (Forward, Left, Right, Reaction) and 3 rows (Neutrophil, Macrophage, Plasma).
- 128x128 frame dimensions.
- Child-drawable simplicity: round circle bodies, hugging arms, cute dot eyes, smile, rosy cheeks.
- 3D-style rendered appearance: spherical radial lighting, glossy specular highlights, bead eyes with catchlights, airbrushed radial blush, tubular 3D limbs.
"""

import xml.etree.ElementTree as ET

svg_content = r"""<svg xmlns="http://www.w3.org/2000/svg" width="512" height="384" viewBox="0 0 512 384">
  <defs>
    <!-- NEUTROPHIL 3D LIGHTING: Crisp white sphere with subtle cool porcelain ambient shadow -->
    <radialGradient id="neutro-body-3d" cx="36%" cy="28%" r="66%" fx="28%" fy="20%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="42%" stop-color="#fcfefe"/>
      <stop offset="72%" stop-color="#e4eff3"/>
      <stop offset="90%" stop-color="#cbe0e7"/>
      <stop offset="100%" stop-color="#b6d2db"/>
    </radialGradient>
    <radialGradient id="neutro-arm-3d" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f2f8fa"/>
      <stop offset="85%" stop-color="#d6e7ec"/>
      <stop offset="100%" stop-color="#bed7e0"/>
    </radialGradient>

    <!-- MACROPHAGE 3D LIGHTING: Ultra chubby warm ivory marshmallow volume -->
    <radialGradient id="maco-body-3d" cx="34%" cy="26%" r="68%" fx="26%" fy="18%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#fffef9"/>
      <stop offset="74%" stop-color="#f4ede0"/>
      <stop offset="90%" stop-color="#e3d8c5"/>
      <stop offset="100%" stop-color="#d0c3ad"/>
    </radialGradient>
    <radialGradient id="maco-arm-3d" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#fffdf6"/>
      <stop offset="85%" stop-color="#ece2d2"/>
      <stop offset="100%" stop-color="#d8cbb8"/>
    </radialGradient>

    <!-- PLASMA CELL 3D LIGHTING: Pearlescent white sphere with soft lavender volume -->
    <radialGradient id="plasma-body-3d" cx="36%" cy="28%" r="66%" fx="28%" fy="20%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="42%" stop-color="#fbfaff"/>
      <stop offset="72%" stop-color="#eae4f9"/>
      <stop offset="90%" stop-color="#d4c9f0"/>
      <stop offset="100%" stop-color="#c1b3e4"/>
    </radialGradient>
    <radialGradient id="plasma-arm-3d" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f8f6fe"/>
      <stop offset="85%" stop-color="#dfd6f5"/>
      <stop offset="100%" stop-color="#cac0ec"/>
    </radialGradient>

    <!-- 3D AIRBRUSHED ROSY CHEEKS: Soft glowing blush that melts into the body -->
    <radialGradient id="blush-3d" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff718a" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#ff94a7" stop-opacity="0.55"/>
      <stop offset="80%" stop-color="#ffc2ce" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ffeef2" stop-opacity="0"/>
    </radialGradient>

    <!-- 3D ANTIBODY RECEPTOR GEM CREST: Glowing lavender-violet crystal -->
    <linearGradient id="crest-3d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ede3ff"/>
      <stop offset="45%" stop-color="#b89deb"/>
      <stop offset="100%" stop-color="#8864d4"/>
    </linearGradient>

    <!-- 3D REACTION OPEN MOUTH GRADIENT -->
    <linearGradient id="mouth-joy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff4767"/>
      <stop offset="100%" stop-color="#d82545"/>
    </linearGradient>
  </defs>

  <!-- ===================================================================== -->
  <!-- ROW 0: NEUTROPHIL (Smaller, agile, round, kawaii, swift hugger)      -->
  <!-- ===================================================================== -->

  <!-- Frame 0: Neutrophil Forward -->
  <g id="neutro-fwd" transform="translate(0, 0)">
    <!-- 3D Hugging Arms (Back layer & main limb) -->
    <path d="M 33 65 Q 16 48 23 39" fill="none" stroke="#bccfd5" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 95 65 Q 112 48 105 39" fill="none" stroke="#bccfd5" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 33 65 Q 16 48 23 39" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 95 65 Q 112 48 105 39" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <!-- Arm top rim highlights for 3D tubular effect -->
    <path d="M 32 64 Q 18 49 24 41" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.8"/>
    <path d="M 96 64 Q 110 49 104 41" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.8"/>
    <!-- Spherical 3D Body -->
    <ellipse cx="64" cy="66" rx="34" ry="33" fill="url(#neutro-body-3d)" stroke="#52777d" stroke-width="2.8"/>
    <!-- Glossy 3D Specular Sheen (Curved highlight) -->
    <ellipse cx="49" cy="49" rx="13" ry="6" transform="rotate(-28 49 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="39" cy="57" r="2.2" fill="#ffffff" opacity="0.55"/>
    <!-- Soft Glowing Cheeks -->
    <ellipse cx="47" cy="75" rx="7" ry="4.5" fill="url(#blush-3d)"/>
    <ellipse cx="81" cy="75" rx="7" ry="4.5" fill="url(#blush-3d)"/>
    <!-- 3D Kawaii Bead Eyes with Crisp Catchlights -->
    <g fill="#172b34">
      <ellipse cx="51" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="77" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="52.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="49.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="78.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="75.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Cheerful Smile -->
    <path d="M 60 74 Q 64 79 68 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 1: Neutrophil Facing Left -->
  <g id="neutro-left" transform="translate(128, 0)">
    <!-- Right arm behind -->
    <path d="M 94 65 Q 106 50 101 43" fill="none" stroke="#bccfd5" stroke-width="12" stroke-linecap="round" opacity="0.4"/>
    <path d="M 94 65 Q 106 50 101 43" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="10" stroke-linecap="round"/>
    <!-- Left arm reaching forward-left -->
    <path d="M 33 65 Q 12 47 18 36" fill="none" stroke="#bccfd5" stroke-width="14" stroke-linecap="round" opacity="0.45"/>
    <path d="M 33 65 Q 12 47 18 36" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11.5" stroke-linecap="round"/>
    <path d="M 32 64 Q 14 48 20 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <!-- Spherical 3D Body -->
    <ellipse cx="64" cy="66" rx="34" ry="33" fill="url(#neutro-body-3d)" stroke="#52777d" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="49" cy="49" rx="13" ry="6" transform="rotate(-28 49 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="39" cy="57" r="2.2" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="41" cy="75" rx="7" ry="4.5" fill="url(#blush-3d)"/>
    <ellipse cx="75" cy="75" rx="6.5" ry="4.2" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="45" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="71" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="46.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="43.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="72.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="69.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 54 74 Q 58 79 62 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 2: Neutrophil Facing Right -->
  <g id="neutro-right" transform="translate(256, 0)">
    <!-- Left arm behind -->
    <path d="M 34 65 Q 22 50 27 43" fill="none" stroke="#bccfd5" stroke-width="12" stroke-linecap="round" opacity="0.4"/>
    <path d="M 34 65 Q 22 50 27 43" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="10" stroke-linecap="round"/>
    <!-- Right arm reaching forward-right -->
    <path d="M 95 65 Q 116 47 110 36" fill="none" stroke="#bccfd5" stroke-width="14" stroke-linecap="round" opacity="0.45"/>
    <path d="M 95 65 Q 116 47 110 36" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11.5" stroke-linecap="round"/>
    <path d="M 96 64 Q 114 48 108 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <!-- Spherical 3D Body -->
    <ellipse cx="64" cy="66" rx="34" ry="33" fill="url(#neutro-body-3d)" stroke="#52777d" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="49" cy="49" rx="13" ry="6" transform="rotate(-28 49 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="39" cy="57" r="2.2" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="53" cy="75" rx="6.5" ry="4.2" fill="url(#blush-3d)"/>
    <ellipse cx="87" cy="75" rx="7" ry="4.5" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="57" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="83" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="58.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="55.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="84.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="81.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 66 74 Q 70 79 74 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 3: Neutrophil Reaction (Joyful Jumping Hug) -->
  <g id="neutro-react" transform="translate(384, 0)">
    <!-- Both arms thrown high in joyous cheer \o/ -->
    <path d="M 33 62 Q 13 36 24 23" fill="none" stroke="#bccfd5" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 95 62 Q 115 36 104 23" fill="none" stroke="#bccfd5" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 33 62 Q 13 36 24 23" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 95 62 Q 115 36 104 23" fill="none" stroke="url(#neutro-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 31 60 Q 15 37 25 25" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <path d="M 97 60 Q 113 37 103 25" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <!-- Spherical 3D Body -->
    <ellipse cx="64" cy="66" rx="34" ry="33" fill="url(#neutro-body-3d)" stroke="#52777d" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="49" cy="49" rx="13" ry="6" transform="rotate(-28 49 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="39" cy="57" r="2.2" fill="#ffffff" opacity="0.55"/>
    <!-- Extra Glowing Cheeks -->
    <ellipse cx="46" cy="74" rx="7.5" ry="5" fill="url(#blush-3d)"/>
    <ellipse cx="82" cy="74" rx="7.5" ry="5" fill="url(#blush-3d)"/>
    <!-- Adorable Happy Closed Eyes ^ ^ -->
    <path d="M 45 65 Q 51 58 57 65" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M 71 65 Q 77 58 83 65" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Open Happy Laughing Mouth with Tongue :D -->
    <path d="M 59 73 Q 64 83 69 73 Z" fill="url(#mouth-joy)"/>
    <path d="M 61 79 Q 64 83 67 79" fill="#ffa1b3"/>
  </g>


  <!-- ===================================================================== -->
  <!-- ROW 1: MACROPHAGE (Larger, chubbier, massive warm protective hugger)  -->
  <!-- ===================================================================== -->

  <!-- Frame 4: Macrophage Forward -->
  <g id="maco-fwd" transform="translate(0, 128)">
    <!-- Giant Warm Hugging Arms -->
    <path d="M 17 63 Q 2 37 16 29" fill="none" stroke="#cfc2af" stroke-width="16" stroke-linecap="round" opacity="0.45"/>
    <path d="M 111 63 Q 126 37 112 29" fill="none" stroke="#cfc2af" stroke-width="16" stroke-linecap="round" opacity="0.45"/>
    <path d="M 17 63 Q 2 37 16 29" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 111 63 Q 126 37 112 29" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 17 61 Q 5 38 18 31" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.85"/>
    <path d="M 111 61 Q 123 38 110 31" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.85"/>
    <!-- Extra Chubby Marshmallow Body (rx=50, ry=44) -->
    <ellipse cx="64" cy="65" rx="50" ry="44" fill="url(#maco-body-3d)" stroke="#4a6668" stroke-width="3.2"/>
    <!-- Wide Forehead 3D Glossy Sheen -->
    <ellipse cx="46" cy="45" rx="17" ry="7.5" transform="rotate(-24 46 45)" fill="#ffffff" opacity="0.7"/>
    <circle cx="33" cy="54" r="2.8" fill="#ffffff" opacity="0.55"/>
    <!-- Soft Chubby Glowing Cheeks -->
    <ellipse cx="42" cy="77" rx="9" ry="5.8" fill="url(#blush-3d)"/>
    <ellipse cx="86" cy="77" rx="9" ry="5.8" fill="url(#blush-3d)"/>
    <!-- Warm, Loving 3D Bead Eyes with Sparkles -->
    <g fill="#172b34">
      <ellipse cx="49" cy="65" rx="4.0" ry="5.2"/>
      <ellipse cx="79" cy="65" rx="4.0" ry="5.2"/>
    </g>
    <circle cx="50.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="47.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <circle cx="80.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="77.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <!-- Sweet Gentle Giant Smile -->
    <path d="M 57 76 Q 64 85 71 76" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
  </g>

  <!-- Frame 5: Macrophage Facing Left -->
  <g id="maco-left" transform="translate(128, 128)">
    <!-- Right arm behind -->
    <path d="M 110 63 Q 120 42 110 33" fill="none" stroke="#cfc2af" stroke-width="15" stroke-linecap="round" opacity="0.4"/>
    <path d="M 110 63 Q 120 42 110 33" fill="none" stroke="url(#maco-arm-3d)" stroke-width="13" stroke-linecap="round"/>
    <!-- Left arm reaching wide forward-left -->
    <path d="M 18 63 Q -1 36 12 26" fill="none" stroke="#cfc2af" stroke-width="17" stroke-linecap="round" opacity="0.45"/>
    <path d="M 18 63 Q -1 36 12 26" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14.5" stroke-linecap="round"/>
    <path d="M 18 61 Q 1 37 14 28" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" opacity="0.85"/>
    <!-- Extra Chubby Body -->
    <ellipse cx="64" cy="65" rx="50" ry="44" fill="url(#maco-body-3d)" stroke="#4a6668" stroke-width="3.2"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="46" cy="45" rx="17" ry="7.5" transform="rotate(-24 46 45)" fill="#ffffff" opacity="0.7"/>
    <circle cx="33" cy="54" r="2.8" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="36" cy="77" rx="8.5" ry="5.5" fill="url(#blush-3d)"/>
    <ellipse cx="80" cy="77" rx="8" ry="5.2" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="43" cy="65" rx="4.0" ry="5.2"/>
      <ellipse cx="73" cy="65" rx="4.0" ry="5.2"/>
    </g>
    <circle cx="44.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="41.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <circle cx="74.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="71.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 51 76 Q 58 85 65 76" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
  </g>

  <!-- Frame 6: Macrophage Facing Right -->
  <g id="maco-right" transform="translate(256, 128)">
    <!-- Left arm behind -->
    <path d="M 18 63 Q 8 42 18 33" fill="none" stroke="#cfc2af" stroke-width="15" stroke-linecap="round" opacity="0.4"/>
    <path d="M 18 63 Q 8 42 18 33" fill="none" stroke="url(#maco-arm-3d)" stroke-width="13" stroke-linecap="round"/>
    <!-- Right arm reaching wide forward-right -->
    <path d="M 110 63 Q 129 36 116 26" fill="none" stroke="#cfc2af" stroke-width="17" stroke-linecap="round" opacity="0.45"/>
    <path d="M 110 63 Q 129 36 116 26" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14.5" stroke-linecap="round"/>
    <path d="M 110 61 Q 127 37 114 28" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" opacity="0.85"/>
    <!-- Extra Chubby Body -->
    <ellipse cx="64" cy="65" rx="50" ry="44" fill="url(#maco-body-3d)" stroke="#4a6668" stroke-width="3.2"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="46" cy="45" rx="17" ry="7.5" transform="rotate(-24 46 45)" fill="#ffffff" opacity="0.7"/>
    <circle cx="33" cy="54" r="2.8" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="48" cy="77" rx="8" ry="5.2" fill="url(#blush-3d)"/>
    <ellipse cx="92" cy="77" rx="8.5" ry="5.5" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="55" cy="65" rx="4.0" ry="5.2"/>
      <ellipse cx="85" cy="65" rx="4.0" ry="5.2"/>
    </g>
    <circle cx="56.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="53.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <circle cx="86.6" cy="63.0" r="1.5" fill="#ffffff"/>
    <circle cx="83.6" cy="67.0" r="0.85" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 63 76 Q 70 85 77 76" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
  </g>

  <!-- Frame 7: Macrophage Reaction (Huge Warm Bear Hug) -->
  <g id="maco-react" transform="translate(384, 128)">
    <!-- Huge Arms Raised Wide \O/ -->
    <path d="M 17 60 Q 2 28 17 18" fill="none" stroke="#cfc2af" stroke-width="16" stroke-linecap="round" opacity="0.45"/>
    <path d="M 111 60 Q 126 28 111 18" fill="none" stroke="#cfc2af" stroke-width="16" stroke-linecap="round" opacity="0.45"/>
    <path d="M 17 60 Q 2 28 17 18" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 111 60 Q 126 28 111 18" fill="none" stroke="url(#maco-arm-3d)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 16 58 Q 4 29 18 20" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.85"/>
    <path d="M 112 58 Q 124 29 110 20" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.85"/>
    <!-- Extra Chubby Body -->
    <ellipse cx="64" cy="65" rx="50" ry="44" fill="url(#maco-body-3d)" stroke="#4a6668" stroke-width="3.2"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="46" cy="45" rx="17" ry="7.5" transform="rotate(-24 46 45)" fill="#ffffff" opacity="0.7"/>
    <circle cx="33" cy="54" r="2.8" fill="#ffffff" opacity="0.55"/>
    <!-- Extra Glowing Cheeks -->
    <ellipse cx="42" cy="76" rx="9.5" ry="6.2" fill="url(#blush-3d)"/>
    <ellipse cx="86" cy="76" rx="9.5" ry="6.2" fill="url(#blush-3d)"/>
    <!-- Joyful Closed Smile Eyes ^ ^ -->
    <path d="M 43 65 Q 49 57 55 65" fill="none" stroke="#172b34" stroke-width="3.0" stroke-linecap="round"/>
    <path d="M 73 65 Q 79 57 85 65" fill="none" stroke="#172b34" stroke-width="3.0" stroke-linecap="round"/>
    <!-- Big Joyful Laughing Mouth with Rosy Tongue -->
    <path d="M 57 74 Q 64 86 71 74 Z" fill="url(#mouth-joy)"/>
    <path d="M 59 81 Q 64 86 69 81" fill="#ffa1b3"/>
  </g>


  <!-- ===================================================================== -->
  <!-- ROW 2: PLASMA CELL (Antibody specialist with 3D Y receptor crest)     -->
  <!-- ===================================================================== -->

  <!-- Frame 8: Plasma Forward -->
  <g id="plasma-fwd" transform="translate(0, 256)">
    <!-- 3D Translucent Antibody "Y" Crest (Receptor antenna) -->
    <path d="M 64 43 L 64 36 M 64 36 L 58 30 M 64 36 L 70 30" fill="none" stroke="url(#crest-3d)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="58" cy="30" r="2.8" fill="url(#crest-3d)"/>
    <circle cx="70" cy="30" r="2.8" fill="url(#crest-3d)"/>
    <circle cx="57.5" cy="29.2" r="1.0" fill="#ffffff"/>
    <circle cx="69.5" cy="29.2" r="1.0" fill="#ffffff"/>
    <!-- 3D Hugging Arms -->
    <path d="M 29 65 Q 12 47 19 39" fill="none" stroke="#c0b5dc" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 99 65 Q 116 47 109 39" fill="none" stroke="#c0b5dc" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 29 65 Q 12 47 19 39" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 99 65 Q 116 47 109 39" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 28 64 Q 14 48 20 41" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <path d="M 100 64 Q 114 48 108 41" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <!-- Pearlescent 3D Body (rx=38, ry=36) -->
    <ellipse cx="64" cy="66" rx="38" ry="36" fill="url(#plasma-body-3d)" stroke="#534d74" stroke-width="2.8"/>
    <!-- 3D Glossy Specular Sheen -->
    <ellipse cx="48" cy="49" rx="14" ry="6.2" transform="rotate(-26 48 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="38" cy="57" r="2.4" fill="#ffffff" opacity="0.55"/>
    <!-- Soft Glowing Cheeks -->
    <ellipse cx="47" cy="75" rx="7.2" ry="4.6" fill="url(#blush-3d)"/>
    <ellipse cx="81" cy="75" rx="7.2" ry="4.6" fill="url(#blush-3d)"/>
    <!-- 3D Intelligent Kawaii Bead Eyes -->
    <g fill="#172b34">
      <ellipse cx="51" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="77" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="52.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="49.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="78.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="75.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Sweet Smile -->
    <path d="M 60 74 Q 64 79 68 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 9: Plasma Facing Left -->
  <g id="plasma-left" transform="translate(128, 256)">
    <!-- Crest tilted left -->
    <path d="M 62 43 L 60 36 M 60 36 L 53 31 M 60 36 L 66 29" fill="none" stroke="url(#crest-3d)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="53" cy="31" r="2.8" fill="url(#crest-3d)"/>
    <circle cx="66" cy="29" r="2.8" fill="url(#crest-3d)"/>
    <!-- Right arm behind -->
    <path d="M 98 65 Q 109 50 104 43" fill="none" stroke="#c0b5dc" stroke-width="12" stroke-linecap="round" opacity="0.4"/>
    <path d="M 98 65 Q 109 50 104 43" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="10" stroke-linecap="round"/>
    <!-- Left arm reaching forward-left -->
    <path d="M 29 65 Q 9 46 15 36" fill="none" stroke="#c0b5dc" stroke-width="14" stroke-linecap="round" opacity="0.45"/>
    <path d="M 29 65 Q 9 46 15 36" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11.5" stroke-linecap="round"/>
    <path d="M 28 64 Q 11 47 17 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <!-- Pearlescent Body -->
    <ellipse cx="64" cy="66" rx="38" ry="36" fill="url(#plasma-body-3d)" stroke="#534d74" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="48" cy="49" rx="14" ry="6.2" transform="rotate(-26 48 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="38" cy="57" r="2.4" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="41" cy="75" rx="7.2" ry="4.6" fill="url(#blush-3d)"/>
    <ellipse cx="75" cy="75" rx="6.8" ry="4.4" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="45" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="71" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="46.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="43.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="72.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="69.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 54 74 Q 58 79 62 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 10: Plasma Facing Right -->
  <g id="plasma-right" transform="translate(256, 256)">
    <!-- Crest tilted right -->
    <path d="M 66 43 L 68 36 M 68 36 L 62 29 M 68 36 L 75 31" fill="none" stroke="url(#crest-3d)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="62" cy="29" r="2.8" fill="url(#crest-3d)"/>
    <circle cx="75" cy="31" r="2.8" fill="url(#crest-3d)"/>
    <!-- Left arm behind -->
    <path d="M 30 65 Q 19 50 24 43" fill="none" stroke="#c0b5dc" stroke-width="12" stroke-linecap="round" opacity="0.4"/>
    <path d="M 30 65 Q 19 50 24 43" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="10" stroke-linecap="round"/>
    <!-- Right arm reaching forward-right -->
    <path d="M 99 65 Q 119 46 113 36" fill="none" stroke="#c0b5dc" stroke-width="14" stroke-linecap="round" opacity="0.45"/>
    <path d="M 99 65 Q 119 46 113 36" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11.5" stroke-linecap="round"/>
    <path d="M 100 64 Q 117 47 111 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <!-- Pearlescent Body -->
    <ellipse cx="64" cy="66" rx="38" ry="36" fill="url(#plasma-body-3d)" stroke="#534d74" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="48" cy="49" rx="14" ry="6.2" transform="rotate(-26 48 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="38" cy="57" r="2.4" fill="#ffffff" opacity="0.55"/>
    <!-- Shifted Cheeks -->
    <ellipse cx="53" cy="75" rx="6.8" ry="4.4" fill="url(#blush-3d)"/>
    <ellipse cx="87" cy="75" rx="7.2" ry="4.6" fill="url(#blush-3d)"/>
    <!-- Shifted Eyes with Catchlights -->
    <g fill="#172b34">
      <ellipse cx="57" cy="65" rx="3.4" ry="4.6"/>
      <ellipse cx="83" cy="65" rx="3.4" ry="4.6"/>
    </g>
    <circle cx="58.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="55.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <circle cx="84.3" cy="63.2" r="1.3" fill="#ffffff"/>
    <circle cx="81.9" cy="66.5" r="0.75" fill="#ffffff" opacity="0.85"/>
    <!-- Shifted Smile -->
    <path d="M 66 74 Q 70 79 74 74" fill="none" stroke="#172b34" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- Frame 11: Plasma Reaction (Gleeful Antibody Burst) -->
  <g id="plasma-react" transform="translate(384, 256)">
    <!-- Glowing Crest -->
    <path d="M 64 43 L 64 34 M 64 34 L 56 27 M 64 34 L 72 27" fill="none" stroke="url(#crest-3d)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="56" cy="27" r="3.2" fill="url(#crest-3d)"/>
    <circle cx="72" cy="27" r="3.2" fill="url(#crest-3d)"/>
    <circle cx="55.3" cy="26" r="1.1" fill="#ffffff"/>
    <circle cx="71.3" cy="26" r="1.1" fill="#ffffff"/>
    <!-- Both arms thrown high in joy -->
    <path d="M 29 62 Q 10 35 21 22" fill="none" stroke="#c0b5dc" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 99 62 Q 118 35 107 22" fill="none" stroke="#c0b5dc" stroke-width="13" stroke-linecap="round" opacity="0.45"/>
    <path d="M 29 62 Q 10 35 21 22" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 99 62 Q 118 35 107 22" fill="none" stroke="url(#plasma-arm-3d)" stroke-width="11" stroke-linecap="round"/>
    <path d="M 27 60 Q 12 36 22 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <path d="M 101 60 Q 116 36 106 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
    <!-- Pearlescent Body -->
    <ellipse cx="64" cy="66" rx="38" ry="36" fill="url(#plasma-body-3d)" stroke="#534d74" stroke-width="2.8"/>
    <!-- 3D Specular Sheen -->
    <ellipse cx="48" cy="49" rx="14" ry="6.2" transform="rotate(-26 48 49)" fill="#ffffff" opacity="0.7"/>
    <circle cx="38" cy="57" r="2.4" fill="#ffffff" opacity="0.55"/>
    <!-- Extra Glowing Cheeks -->
    <ellipse cx="46" cy="74" rx="7.8" ry="5.2" fill="url(#blush-3d)"/>
    <ellipse cx="82" cy="74" rx="7.8" ry="5.2" fill="url(#blush-3d)"/>
    <!-- Adorable Happy Closed Eyes ^ ^ -->
    <path d="M 45 65 Q 51 58 57 65" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M 71 65 Q 77 58 83 65" fill="none" stroke="#172b34" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Open Laughing Mouth with Tongue -->
    <path d="M 59 73 Q 64 83 69 73 Z" fill="url(#mouth-joy)"/>
    <path d="M 61 79 Q 64 83 67 79" fill="#ffa1b3"/>
  </g>
</svg>
"""

# Verify XML
ET.fromstring(svg_content)
with open("public/assets/defenders-simple-v1.svg", "w", encoding="utf-8") as f:
    f.write(svg_content.strip() + "\n")
print("SUCCESS: public/assets/defenders-simple-v1.svg generated and verified as valid XML.")

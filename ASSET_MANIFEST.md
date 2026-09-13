# Original asset manifest

Visual system: deep teal/navy tissue, mint controls, cyan-white phagocytes, violet antibody support, bright bacterial clusters. Toy-like shaded 2D forms with upper-left highlights, generous transparent margins, dark teal outlines. UI geometry and gates use native vector primitives. No third-party game art.

| Asset | Origin | Use / inspection |
|---|---|---|
| `public/assets/immune-sprite-atlas.png` | Built-in image generation, original 4×3 atlas, 1448×1086 RGBA | 362px frames. Inspected generated image, actual desktop and 390px phone game. Cells/antibody/cocci used; rod frames 5,7,8,10 excluded from S. aureus encounters. Different phenotype colors are abstract cues, not diagnostic morphology. |
| `public/assets/tissue-corridor.png` | Built-in image generation, 1024×1536 | Original dark tissue corridor with clear center. Bundled; no remote image loading. |
| `assets/icon.png` / `artifacts/app-icon-original.png` | Built-in image generation, 1254×1254 | White/cyan neutrophil on deep teal. Standard Capacitor Assets generator produced native icons and splash screens. |
| Native `mipmap-*`, `drawable-*`, `Assets.xcassets` | `@capacitor/assets` from original icon | 86 Android and 8 iOS generated outputs. Not validated by stores/devices. |
| `public/assets/soft.wav`, `recruit.wav`, `finish.wav` | Original NumPy synthesis via `scripts/audio.py`, WAV container | Quiet sine cues, 0.12/0.25/0.65 seconds; normalized peak ~0.054 before in-game attenuation, 150ms sound rate cap, Phaser playback. No music. Perceptual listening unavailable in headless QA. |
| `public/favicon.svg` | Original minimal vector mark | Tiny functional browser icon. |

Original atlas prompt records: `artifacts/art-generation.json`. The original atlas remains in menu illustrations only; gameplay uses the following revised assets.

| Revised asset | Origin / layout | Gameplay use |
|---|---|---|
| `public/assets/defenders-v2.png` | Original image generation; 1448×1086 RGBA, 4×3 grid of 362px frames | Rows: neutrophil, macrophage, plasma. Columns: elevated rear neutral, left turn, right turn, compressed hit pose. |
| `public/assets/enemies-v2.png` | Original image generation; 1122×1402 RGBA, proportional rounded 4×5 grid | Rows: green clustered cocci, amber ring, coral jagged cluster, violet armored cluster, turquoise paired cocci. Columns: approaching neutral, left, right, hit. Phenotype designs are fictional visual cues, not diagnostic morphology. |
| `public/assets/tissue-perspective-v2.png` | Original image generation; 1024×1536 | Elevated 35-degree view from behind the patrol, broad open floor receding toward top center. |

Art direction: polished shaded 3D-style cell miniatures with transparent backgrounds, distinct silhouettes and materials, consistent elevated camera, side-angle and damage poses. Gameplay uses these pre-rendered frames plus Phaser recruitment, hit and defeat transitions. Full 1–30 squad counts are drawn. The sheets and actual phone/desktop screenshots were visually inspected for framing, transparency, readable gates and correct phenotype/defender rows. No claim of human illustration or clinical microscopy.

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

Generation prompt records and exact frame order: `artifacts/art-generation.json`. Atlas frames: neutrophil, macrophage, plasma, antibody; green cluster, unused rod, coral coccus, unused rod; unused capsule rod, green boss cluster, unused rod boss, hero trio. Game uses tint variants of the coccal cluster for resistant/mismatched phenotypes; never identifies a rod as S. aureus.

Phone screenshot inspection includes transparency, sprite bounds, contrast, representative squad count, gate text and HUD. Squads above 12 render 12 representative sprites while the HUD remains the authoritative strength count. No artificial sprite-sheet animation; small Phaser tweens supply motion. Generated image provenance is original AI art; no claim of human illustration or clinical microscopy.

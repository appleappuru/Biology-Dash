# Biology Dash checkpoint

## Completed
- Official Phaser Vite TS starter reviewed and adapted; original MIT license preserved, telemetry omitted.
- Ten authored level definitions, evidence register, three defender roles, five tested phenotypes, two medicine mechanisms.
- Phaser patrol, gates, casualties, boss, campaign map, local progression, settings, field guide and selection/recall UI implemented.
- Original generated atlas/corridor and three synthesized soft WAV effects included locally.
- 34 automated rule tests passed; TypeScript and production build passed.

## In progress / next action
Continue real browser verification against compiled `dist-test` at http://127.0.0.1:4173. `scripts/inspect-browser.mjs` captures campaign map and starts first patrol. Diagnose any Phaser runtime errors, then complete mobile/input/win/loss/learning/repeated-run/offline QA and publish.

## Current failures
- Vite default bundled config loader hung; native config loader fixes production build/test commands.
- Vite dev-server module requests stalled intermittently; compiled test build served with Python is current browser-test approach.
- Browser tests have not yet completed a game run. No native runtime/device claim.

## Commands
Use Node 24 at `/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` (add containing directory to PATH), bundled pnpm or install a normal Node environment.
- `pnpm test` — 34 passed
- `pnpm build` — passed
- `node node_modules/vite/bin/vite.js build --configLoader native --mode test --outDir dist-test`
- `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist-test`

## Hosting and external blockers
Sites registered once: `.openai/hosting.json` preserves exact ID. Not deployed. Sites skill installation disappeared during execution; connector tools may remain usable; do not create a replacement Site.
Mac has command-line developer tools but no full Xcode, Java, Android SDK, or signing identities. Temporary development ID only; owner-approved permanent ID requested. Native generation/builds pending. Qualified medical review, human learning evaluation and device performance remain external work.

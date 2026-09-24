# Biology Dash: Immune Patrol

**Account transfer / resume:** Start with [START_HERE.md](START_HERE.md) and [the project handoff](handoff/PROJECT_HANDOFF.md). Game work and automatic resumption are paused until explicitly resumed. Current verified release: v0.2.3.

Original portrait Phaser + TypeScript game: ten 90-second authored patrols, local progression, two susceptibility-dependent medicine supports, cooperative immune roles and a playable B-cell selection/recall progression.

## Run

Node 24 and pnpm 11.19.0 are the verified toolchain.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm preview
```

The normal development command is `pnpm dev`. On this host, Vite module requests stalled intermittently; a compiled build served by `python3 -m http.server 4175 --directory dist` was verified instead. Vite uses its native config loader to avoid the bundled-loader startup issue.

## Controls

Drag in any direction in the corridor; the finger may stay below the squad. Arrow keys or WASD move left/right and forward/back on desktop. Phagocytes engulf automatically inside the contact zone. Read each gate pair: recruitment, wider reach, rapid response, rescue shielding, and explicit cell-for-reach tradeoffs rotate through the encounter. Every defender is drawn, up to 30. Space activates equipped external medicine (level 3+). Escape pauses. Medicine and antibody buttons expose evidence and switch profiles. Touch cancellation clears dragging.

## Verify

```sh
pnpm test:build
python3 -m http.server 4173 --directory dist-test
# in another terminal
pnpm test:browser
node scripts/input-performance-test.mjs
```

Browser scripts use installed Google Chrome through Playwright. The browser suite includes a real-time patrol and separately labeled accelerated simulations for later learning flows. For production offline checks, serve `dist/` on 4175, then run `node scripts/production-test.mjs`. Test-only controls exist only in Vite dev/test mode and are excluded from production.

## Native — deferred

```sh
pnpm build
pnpm native:sync
pnpm assets
cd android && ./gradlew assembleDebug
```

Native work is deferred for this development phase. Existing scaffolds are retained for future portability; do not run the commands above as part of normal web iteration.

Open `ios/App/App.xcodeproj` in Xcode for iOS. Both projects bundle game files locally. `dev.biologydash.immune` is temporary and must be replaced by an owner-approved identity before distribution. No signing keys are included. See RELEASE.md for exact missing tooling and release steps.

## Architecture and evidence

- `src/content.ts`: evidence-backed biological definitions and ten learning encounters.
- `src/simulation.ts`: deterministic capped simulation, independent of renderer.
- `src/game.ts`: Phaser scene, input, sprites, effects and audio.
- `src/save.ts`: versioned local saves, rewards and entitlement catalog.
- `src/main.ts`: campaign, decisions, field guide and native lifecycle.
- `MEDICAL_EVIDENCE.md`: source records and review questions.
- `GAME_DESIGN.md`, `ASSET_MANIFEST.md`, `RELEASE.md`, `STATUS.md`: design, provenance, release and resume checkpoint.

Based on the structure of [Phaser’s official Vite TypeScript starter](https://github.com/phaserjs/template-vite-ts); original template license retained. No starter telemetry, backend, ads, purchases, accounts or analytics. This is a game abstraction, not prescribing advice or clinically validated instruction. Human learning evaluation and qualified medical review remain outstanding.

The revised presentation includes individually rendered squads, directional 3D-style cell frames, four rotating gate pairs, floating effect callouts, personal-best scores and flawless-defense awards. Existing version-1 saves migrate automatically. Additional checks: `node scripts/presentation-test.mjs` and `node scripts/save-upgrade-test.mjs`.

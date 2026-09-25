# Project handoff — September23,2026

## Status and priority
Latest user priority: simpler larger mostly-white kawaii defenders and translucent staggered three-lane gates (handoff/requirements/DEFENDERS_AND_GATES.md) are completed and verified in v0.6.0 alongside the prior verified medicine-audio refinement (commit a431bbe). All 137 unit tests and browser fixtures (defenders-and-gates-test.mjs, simple-defenders-test.mjs, first-hug-test.mjs, medicine-audio-match-test.mjs) pass with zero errors. Visual evidence saved in artifacts/.
User explicitly resumed development on September23,2026 after opening this local project. Development and verified deployments are authorized within AGENTS.md scope and usage cutoffs. The ACTIVE heartbeat `resume-biology-dash-after-usage-reset` is explicitly authorized to resume development, commit/push verified milestones and deploy verified releases to the existing Vercel demo. The earlier checks-only restriction is superseded. No chat/account database manipulation is needed.

Current application/package version: **0.6.0**. Last verified production: https://biology-dash-public-demo.vercel.app/.
Deployment: `dpl_C2VbiCrX4YCMxXwTT4YXjTAxZm9v` (READY when verified).
Immutable URL: https://biology-dash-public-demo-ocw3h3mtj-applefound.vercel.app.
Service worker cache: `biology-b51d50fc9b54`.
v0.6.0 integrates simplified kawaii white SVG defenders, translucent staggered three-lane interactive gates with dilemma mechanics and contact reactions, and ineffective-medicine no-match audio feedback. Primary launch paths bypass configuration; optional Patrol setup remains on map/results. Suggested squads adapt to unlocks; manual lineups are persisted.

## v0.5.0 sound system
src/audio.ts owns original procedural synthesis, event mapping, short musical combinations, density/voice limits and sound preferences. It shares the context passed to Phaser; no runtime sound downloads. Historical WAV assets remain unused. Master/effects/musical-reward sliders live only in Settings. No looping music. Existing mute/master values migrate; new channels are additive without changing save schema4. See AUDIO_DESIGN.md for palette, limits and test artifacts.

## v0.4.0 current gameplay
First Hug starts with one magnified cell and a short, sequential introduction. Base phagocytes retire after one completed digestion; Neutrophil upgrades allow two/three. This is an explicit arcade abstraction. Hold/release medicine applies3–6seconds of isolate-specific exposure to currently visible invaders; one main button, optional Kit thereafter. Tissue-origin Defensin particles begin in Patrol2. Granuloma/TB formations remain future work. Existing saves and optional configuration are retained.

## What exists
Portrait Phaser4 + TypeScript + Vite web game, one32-second opening and nine90-second levels. Kawaii elevated rear-view2.5D sprites with directional/hit frames; individually rendered defenders, organic formations, two-axis movement, single/pair gates with recruit/reach/tempo/shield/tradeoffs. Local approach/wrap/digest animations tied to actual cell-target interactions. Plasma antibody binding/opsonization and external medicine mechanisms, named microbes and isolate susceptibility. Explicit educational abstractions and evidence in MEDICAL_EVIDENCE.md.

Local Coins economy: play -> reward -> permanent recruit/role upgrade/capacity -> compose next patrol. Save schema4 at localStorage key `biology-dash-v1`, migrates older versions. Permanent ownership survives casualties; gate recruits temporary. Exactly-once run settlement with transaction IDs and pending receipt. No real money or online systems.

v0.2.2: full scientific names, two-column phone medicine kit, startup readiness, one-tap first patrol and nonblocking learning checklist, next-patrol preview.
v0.2.3: failed/stalled art recovery with retry/exit; first cluster and gate brought closer for immediate action; one accurate recruitment callout, including full-squad handling. Natural browser opening: first catch7.97s, first recruit8.67s, squad16, no casualties. Subsequent first-level gates remain27/44/61s.

v0.2.4: quiet directional tissue-interception cues and up to3 local markers, excluded during wrapping. Later patrol warnings sit above the medicine kit. See RELEASES.md and STATUS.md for full verification and next review.

v0.3.0: charged medicine support from Patrol3 with tested pointer/key cancellation and full natural-patrol verification. Follow ROADMAP.md and the full continuous-product objective; first-patrol active charge followed in0.3.2; richer weapon/progression systems remain pending.

v0.3.1: one-button first-run welcome, one cue at a time, first contact around4.8s. Campaign opens after first win. Natural opening and actual public first-play/save/offline checks pass. User priority: simpler and more engaging first play; evaluate fun through human observation rather than claiming it from automated checks.

v0.3.2: optional reinforcement hold/release in Patrols1–2, with one-to-four arriving cells, bounded recovery/cap and gathered-cell preview. Full natural90second opening patrol and public charge/release checks pass. No upfront setup or medicine choices added.

v0.3.3: configuration is optional for all patrols. Play/Next/map level cards launch directly. Suggested squads add owned, level-appropriate roles; manual squads and a restore-suggestions option persist. B-cell selection is optional in setup. Fresh welcome stays uncluttered.

v0.3.4: charged medicine previews show compatible microbes, wall/growth distinctions and no-match feedback. Preview cleanup verified through release, switch, pause and victory; suggested-squad campaign simulation completes all ten levels without purchases or selection-room use.

## Validation at last release
v0.5.0:127 unit tests/typecheck/production build pass. Audio event palette, capped clustered rewards, voice priority, natural catch and charged release, pause/mute/cancellation, channel preferences and reload pass in Chrome. A simulated20minute dense-event director test and26second actual OfflineAudioContext render pass. Initial voice-replacement peak was corrected; final full-volume peak0.2322/RMS0.0190 with8active transient voices maximum and silence at the end. These are digital metrics, not subjective listening results. Public audio waveform/mute/settings/preview checks pass; natural32second opening still wins with one settlement and direct Patrol2. Public files/version/no-index/robots verified. Phone/desktop show0.5.0; returning0.4.0 cached player retains42Coins/roster/upgrades/transactions and offline reload. Current audio tests: scripts/adaptive-audio-test.mjs, audio-render-test.mjs, audio-production-test.mjs. Original WAV routing test now forwards to adaptive-audio-test. Current gameplay checks remain first-hug-test.mjs, simple-support-controls-test.mjs and first-hug-production-test.mjs.
Not verified: real-device performance, subjective sound quality, human enjoyment/retention, educational efficacy, clinician review, native readiness. The broad improvement objective is not complete.

## Resume work after explicit permission
1. Read latest STATUS.md tail, RELEASES.md, GAME_DESIGN.md, ECONOMY.md and MEDICAL_EVIDENCE.md; inspect git status. Earlier documents may contain stale names, Sites/native plans or timestamps; current instructions win.
2. Check new account usage (not old reset timestamps). No development at<=5% remaining in either window. Do not redeem credits or restart schedules without authorization.
3. Verify current source/build/live state and select a substantive gameplay/visual/audio improvement grounded in actual playtest findings. The0.2.4 tissue-warning batch is complete; do not repeat it as unfinished work. Reserve capacity for deployment checks. No mandate to endlessly rerun unchanged suites.
4. Useful next review: play full patrols naturally; refine action readability and cadence in crowds; test touch play on phones; evaluate restrained audio by listening. Startup recovery and opening pace are already fixed. Avoid small unrelated housekeeping as a substitute for improving the game.

## Architecture
src/content.ts biology/levels/names; simulation.ts deterministic gameplay; game.ts Phaser rendering/input/effects; main.ts UI/lifecycle; style.css layouts; roster.ts defender variants; economy.ts prices/rewards/transactions; save.ts persistence; formation.ts cell spacing. RULES_VERSION in simulation.ts is coupled to save schema acceptance: do not bump it casually for pacing changes (version4 saves would otherwise be rejected without migration edits). package.json controls visible APP_VERSION and version.json via vite.config.ts.

## Run on this Mac
Prefer installed Node24 and pnpm11.19.0. Existing node_modules can be reused. If unavailable, `pnpm install --frozen-lockfile`. Same-host bundled tools (verify existence):
```
/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm
/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/git
/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
```
System git/python may print missing macOS SDK errors; use bundled binaries rather than reinstalling the system. Put the bundled node directory on PATH when invoking pnpm. These are host paths, not account credentials; if absent on another host use standard installations.

Commands (normal toolchain on PATH):
```
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run --configLoader native
node node_modules/vite/bin/vite.js build --configLoader native --mode test --outDir dist-test
node node_modules/vite/bin/vite.js preview --configLoader native --outDir dist-test --host 127.0.0.1 --port 4190 --strictPort
node scripts/opening-pace-test.mjs
```
Preview4190 served dist-test during development; do not assume a process remains live after account switch. Inspect before starting duplicates. Scripts use Playwright with installed Google Chrome; permission may be needed. Some older scripts hardcode4173/4175 and old UI names; inspect before using. Modern tests commonly use4190 or GAME_URL. __BIOLOGY__ instrumentation is test-only: never deploy dist-test. Browser shutdown can be slow; poll the existing live process, do not launch duplicates merely on timeout.

## Deployment — existing project only
Vercel CLI pinned59.16.0. Account previously `appuru`; team Apple Appuru Foundation / `applefound`.
Project `biology-dash-public-demo`; projectId `prj_x1OzqYPgPJ11uFr07HpOMOeS6Hmw`; orgId `team_QGp8JL4Af1L5ShMknzmBZwwf`. IDs are identifiers, not credentials. Verify login/team normally when needed. Do not read/export auth tokens.

Bump package version only for a new release. Build into a fresh temporary directory (synced dist has previously developed duplicate asset files), generate offline cache, add hosting config. `handoff/deployment/` retains the verified non-secret project/config files; copy its contents into the compiled output only. Include robots.txt BEFORE upload. Never upload source, tests, native files, .env or private documentation.
```
node node_modules/vite/bin/vite.js build --configLoader native --outDir /tmp/biology-dash-NEWVERSION
node scripts/offline.mjs /tmp/biology-dash-NEWVERSION
# Copy handoff/deployment including hidden .vercel and .vercelignore into that output.
pnpm dlx vercel@59.16.0 deploy --prod --yes --scope applefound --cwd /tmp/biology-dash-NEWVERSION
pnpm dlx vercel@59.16.0 alias set RETURNED_IMMUTABLE_URL biology-dash-public-demo.vercel.app --scope applefound --cwd /tmp/biology-dash-NEWVERSION
BUILD_DIR=/tmp/biology-dash-NEWVERSION node scripts/verify-live-build.mjs
GAME_URL=https://biology-dash-public-demo.vercel.app node scripts/version-browser-test.mjs
```
CLI defaults to a different team-suffixed alias: explicit shared-alias assignment matters. Existing no-index setup makes the URL unlisted, not access-controlled/private.

For cache transition: remove `/tmp/biology-dash-polish-deployed.flag`, start scripts/cache-upgrade-test.mjs BEFORE deployment; it caches the old site and waits up to6minutes. Only after alias+live-file verification succeeds, create the flag. Await result. It verifies controllerchange, version, save preservation and offline reload. Record deployment ID/cache and limitations in RELEASES.md/STATUS.md. Do not publish merely because upload returned queued/building.

## Account portability
Local source/files and this handoff are the durable context. Do not assume old chat history, project sidebar entries, account memories, installed plugins, automations or tool permissions migrate. Open this folder in the new account and ask to resume. AGENTS.md directs the agent here. Same-machine Vercel CLI may still be logged in but it must be verified; normal login may be required. Player saves are browser-origin data and must not be cleared. No third-party account switchers, credential copying, or modifications to Codex internal databases are required.

Official documentation consulted: https://learn.chatgpt.com/docs/app and https://learn.chatgpt.com/docs/agent-configuration/agents-md. They document local project work and AGENTS.md instructions; they do not establish guaranteed zero-step cross-account chat migration.

## GitHub milestone backup policy
User authorized committing and pushing all game source and assets after each verified milestone to appleappuru/biology-dash. Existing origin uses https://github.com/appleappuru/Biology-Dash.git. Follow AGENTS.md inclusion/exclusion and verification rules; no force pushes; scheduled development is now explicitly authorized. At setup, command-line HTTPS authentication was unavailable. See STATUS.md for backup state; verify remote access before claiming a push succeeded.

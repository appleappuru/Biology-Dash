# Biology Dash checkpoint — 2026-09-13

## Gameplay overhaul
- Addressed preview feedback: every defender is rendered up to the 30-cell cap; visible arrival and casualty transitions.
- Four gate pairs rotate recruitment, reach, temporary rapid response, shields, and cell-cost tradeoffs. Recruitment labels reflect available capacity.
- Three defender designs and five enemy designs, with neutral/left/right/hit frames and defeat transitions; elevated rear-view 2.5D tissue scene.
- Arrow keys/WASD and relative mouse/touch movement on both axes. Moving forward changes combat range; enemies behind the squad still threaten the tissue.
- Illustrated lead-defender choices and active ability timers. RULES_VERSION is now 2.
- New presentation browser test passed; real 90-second play, all ten accelerated victories, save/settings, offline, touch and six-run stability repeated September 13.
- Actual user's preview refreshed from stale offline cache and revised level-2 choice screen verified.

## Added polish and upgrade safety
- Floating gate/recruitment/casualty callouts; saved per-level personal bests and flawless-defense awards. Strategic cell reassignment does not count as a forced loss.
- Version-1 saves migrate to rules version 2, retaining progression, stars, credits, preferences and learning flags. Verified in a production browser and through reload; see artifacts/save-upgrade-results.json.
- The initial version bump briefly displayed an empty save before migration was added. After reconnecting, verified the final production script index-Pryq4p-P.js and the actual user UI retained level 1 complete, three stars and 30 credits through reload.
- Preview servers survived a UI disconnect but returned empty responses. Confirmed live PIDs and empty HTTP replies, then restarted only those two servers with file-backed logs in /tmp/biology-preview-*.log.
- Award screenshot uses a synthetic result fixture for layout verification; real victory evidence remains the full 90-second run and all-level sweep.

## Completed
- Ten authored 90-second patrols, three defender roles, five tested bacterial phenotypes, two medicines, two theatrical bosses.
- Phaser movement/engulfment/gates/casualties, campaign, earned unlocks, local saves, settings, field guide, B-cell selection and matching recall.
- Original raster atlas/corridor/icon, local soft WAV cues; 86 Android and 8 iOS icon/splash outputs.
- 55 rule/regression tests pass. TypeScript and final production build pass.
- Real browser 90-second first-level run with actual mouse steering, victory, saved unlock, defeat/restart, settings persistence and learning corrections pass.
- Final accelerated browser sweep wins all ten levels with real support-panel selections (`artifacts/final-sweep.json`). All reported browser page-error lists empty.
- Relative touch, cancellation and no-jump restart pass. Six repeated game runs keep one scene, canvas and pointer listener.
- Production test controls excluded. Offline navigation reload and cold gameplay start after precaching pass.
- Phone/desktop screenshots inspected; 320px hero overlap repaired.
- Headless desktop Chrome heavy encounter: 180 frames, 33.4ms p95, about 46fps reported by Phaser, 25 live enemies and 30 defenders at sample end. This is NOT physical-phone performance.
- Capacitor Android/iOS projects generated and synced with local game files, portrait config, lifecycle/back handling, icons/splash. CI workflow prepared, not run remotely.

## Next action
Local revision is ready at http://127.0.0.1:4175. Source checkpoint: c59bf49.
Hosted publication requires explicit user approval to export this project source and bundled QA artifacts to the existing private Sites repository:
https://git.chatgpt-team.site/2b44f6f5-c34d-444b-83e8-53ef432f4f49/appgprj_6aa5bab3c21c819187d24627f0551c1d.git
Automatic approval review rejected the upload on September 13 because the destination/payload were not explicitly authorized. No revised source was uploaded. Do not bypass or deploy the obsolete saved version.
The local Sites hosting skill and packaging helper also disappeared after the reset; a plugin-cache search found no copy. After authorization, restore the supported helper or use the connector's supported remote-build path. Preserve owner-private access and reuse the existing project.

## Exact verification commands
Use Node 24 / pnpm 11.19.0. On this host, Node is `/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; add its containing directory to PATH.
- `node scripts/presentation-test.mjs` — all nine presentation checks passed, including actual gate crossing and saved awards.
- `node scripts/save-upgrade-test.mjs` — production save migration and reload passed.
- `pnpm test` — 55 passed in three files, most recent run September 13.
- `node node_modules/typescript/bin/tsc --pretty false` — passed.
- `pnpm build` — production build passed, offline cache generated.
- `pnpm native:sync` — both platforms synced successfully.
- `pnpm test:build` then `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist-test`.
- `node scripts/browser-test.mjs` — full real-time/accelerated browser acceptance passed (September 12); later boss regression repaired and final all-level sweep below repeated.
- `node scripts/final-sweep.mjs` — all ten victories, September 13.
- `node scripts/input-performance-test.mjs` — touch and headless performance passed.
- Serve `dist` on port 4175; `node scripts/production-test.mjs` — offline/test-isolation/small-phone checks passed; final CSS check repeated September 13.
- `pnpm assets` — 86 Android / 8 iOS outputs generated with Capacitor Assets.
- `./android/gradlew -p android assembleDebug` — BLOCKED: Java runtime absent.
- `xcodebuild -list -project ios/App/App.xcodeproj` — BLOCKED: full Xcode absent; command-line tools alone installed.

## Preview and release
Local production preview: http://127.0.0.1:4175 (restart server after host/session exit).
Local instrumented QA preview: http://127.0.0.1:4173 (test build only).
Hosting: `.openai/hosting.json` contains registered project `appgprj_6aa5bab3c21c819187d24627f0551c1d`; owner-private audience confirmed. Deployment pending, not yet a live URL.
Source checkpoint before final publishing edits: `41d04e7`.

## Fixed failures / practical limitations
Fixed scene-start race, malformed antibody-save validation, escaped-boss handling, boss-contact deletion and cross-profile affinity contamination. Vite default bundled config loader stalled on this host; native loader works. Dev module requests were intermittent, so verification uses compiled test/production servers. Production bundle includes Phaser (~395KB gzip JS); no unexplained runtime errors found.

## External blockers (not completed)
No full Xcode/simulator, Java, Android SDK/emulator, connected physical device, or valid code-signing identity. No APK, AAB, signed IPA, TestFlight upload, store submission or native runtime result is claimed. Temporary development ID `dev.biologydash.immune` awaits owner-approved permanent identity. Native distribution stays partial until toolchain/accounts/devices are available.
Perceptual audio listening, qualified medical review, and human learning evaluation are outstanding. See MEDICAL_EVIDENCE.md for five review questions and GAME_DESIGN.md for the human evaluation protocol. No clinical validation, measured learning gains or real-phone 60/30fps claim.

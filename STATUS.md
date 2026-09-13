# Biology Dash checkpoint — 2026-09-13

## Current direction — latest user instructions
Continue local web development only. Do not publish this revision until the user asks. No native build, sync or distribution work. The existing Vercel demo is an older build and remains unchanged.

## Individual interactions and expanded microbes — current revision
- Five actual species / nine encounter records, names and illustrated field-guide/briefing roster; four new directional/hit sprite rows in `public/assets/microbes-v3.png`.
- Individual cells reserve different targets, approach within local reach, wrap at physical contact, engulf and display an internal digestion vesicle. Hits/deaths carry defender ID and cause. Steering away cancels unreachable interactions.
- Plasma-cell antibodies diffuse before attaching; mismatches do not bind or damage. C3 host opsonins assist uptake. Medication wall stress, growth inhibition, target mismatch and resistance have distinct feedback.
- Stable organic squad positions, clustered enemy waves, two-axis steering, optional approach dots default off, reduced-motion mode.
- Existing saves version 1/2 migrate to version 3 without losing progress. Native scaffolds deliberately untouched.
- Verified: 95 rule/regression tests; seven interaction browser checks; all ten accelerated campaign victories; a real 90-second patrol with mouse steering; six repeated restarts; touch cancellation; production offline start; save migration and 320px controls. Browser error lists empty.
- Full-squad desktop Chrome stress sample: 180 frames, p95 33.4ms, 24 enemies remaining at sample end. This is not physical-phone performance.
- User’s actual local browser refreshed from the old offline cache; retained two completed levels, 60 credits and a level-2 personal best of 725. Local preview is http://127.0.0.1:4175/ and is left at the level-2 briefing.
- Current production script: index-ch4dd7ZR.js; offline cache biology-aa5ea9dd4d89. Production contains no debug controls. No public deployment authorized or performed for this revision.

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

## Public demo — deployed September 13, 2026
- User selected Apple Appuru Foundation (`applefound`), Hobby plan. Browser signed in as appuru. The connector remains linked to a different Team Hayashi account; use the browser for this project's deployments unless the connector is reconnected.
- Live URL: https://biology-dash-public-demo.vercel.app/
- Dashboard: https://vercel.com/applefound/biology-dash-public-demo
- Deployed the 16-file compiled-only archive using Vercel Drop. No source repository or native upload, Git integration, or tunnel.
- Anonymous HTTP request returned 200 and X-Robots-Tag: noindex, nofollow, noarchive. The unlisted URL is publicly accessible to anyone who has it.
- Live browser loaded the campaign map and launched the first patrol with its tutorial; no browser error logs.
- Future changes require deploying a newly built copy; local edits do not publish automatically.
Current source checkpoint before demo setup: 3ea67be.

## Exact verification commands
Use Node 24 / pnpm 11.19.0. On this host, Node is `/Users/henrywei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; add its containing directory to PATH.
- `node scripts/presentation-test.mjs` — all ten presentation checks passed, including actual gate crossing and saved awards.
- `node scripts/save-upgrade-test.mjs` — production save migration and reload passed.
- `pnpm test` — 55 passed in three files, most recent run September 13.
- `node node_modules/typescript/bin/tsc --pretty false` — passed.
- `pnpm build` — production build passed, offline cache generated.
- `pnpm native:sync` — both platforms synced successfully.
- `pnpm test:build` then `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist-test`.
- `node scripts/browser-test.mjs` — full real-time/accelerated browser acceptance repeated successfully September 13, including six-run stability.
- `node scripts/final-sweep.mjs` — all ten victories, September 13.
- `node scripts/input-performance-test.mjs` — touch and headless performance passed.
- Serve `dist` on port 4175; `node scripts/production-test.mjs` — offline/test-isolation/small-phone checks passed; final CSS check repeated September 13.
- `pnpm assets` — 86 Android / 8 iOS outputs generated with Capacitor Assets.
- `./android/gradlew -p android assembleDebug` — BLOCKED: Java runtime absent.
- `xcodebuild -list -project ios/App/App.xcodeproj` — BLOCKED: full Xcode absent; command-line tools alone installed.

## Preview and release
Local production preview: http://127.0.0.1:4175 (restart server after host/session exit).
Local instrumented QA preview: http://127.0.0.1:4173 (test build only).
Hosting: `.openai/hosting.json` contains registered project `appgprj_6aa5bab3c21c819187d24627f0551c1d`; owner-private audience previously confirmed. Dormant: do not publish or upload source; user deferred this path.
Requirement-by-requirement assessment: ACCEPTANCE_AUDIT.md. Git history preserves initial and revised builds.

## Fixed failures / practical limitations
Fixed scene-start race, malformed antibody-save validation, escaped-boss handling, boss-contact deletion and cross-profile affinity contamination. Vite default bundled config loader stalled on this host; native loader works. Dev module requests were intermittent, so verification uses compiled test/production servers. Production bundle includes Phaser (~395KB gzip JS); no unexplained runtime errors found.

## Deferred future work (not current development blockers)
No full Xcode/simulator, Java, Android SDK/emulator, connected physical device, or valid code-signing identity. No APK, AAB, signed IPA, TestFlight upload, store submission or native runtime result is claimed. Temporary development ID `dev.biologydash.immune` awaits owner-approved permanent identity. Native distribution stays partial until toolchain/accounts/devices are available.
Perceptual audio listening, qualified medical review, and human learning evaluation are outstanding. See MEDICAL_EVIDENCE.md for five review questions and GAME_DESIGN.md for the human evaluation protocol. No clinical validation, measured learning gains or real-phone 60/30fps claim.

## Demo package
Compiled-only copy: /tmp/biology-dash-public-demo.zip (8,502,795 bytes, 16 files). Inventory: artifacts/demo-upload-manifest.json. Adds noindex/robots directives; no TypeScript sources, tests, Git data, source maps or native files. Uploaded via the supported Vercel Drop file chooser. A generic current-project deploy action was rejected because of full-source export risk; the narrower built-copy upload succeeded.
Cloudflared was installed before the user rejected tunneling, but no tunnel command was started. Do not run it.

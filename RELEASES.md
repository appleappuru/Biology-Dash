# Biology Dash web releases

## Release practice

Bundle significant, verified gameplay/UI improvements into periodic deployments to the existing Apple Appuru Foundation Vercel project. Avoid deploying every tiny edit. User authorized this cadence on September15,2026. Continue local web work; no native release work.

Use package.json as the single source of the app version. Bump the patch for fixes and minor version for a substantial feature batch. Never reuse a published version for different application code. Vite embeds the version in the desktop sidebar and Settings (including phones), and emits version.json. Save schema versions remain separate.

Before publishing: typecheck, appropriate automated/browser checks, clean compiled-only build, offline cache generation. After publishing: verify shared URL assets and version.json against that build, check returning-player update/save preservation when applicable, then record deployment ID and verification here. Do not label a version deployed until verified.

## v0.2.1 — deployed September22,2026

Deployment: dpl_CBTbBkvwcJJAUA9uVUqQ8hB8WqeK. Shared URL: https://biology-dash-public-demo.vercel.app/.

Audio patch: per-cue cooldowns preserve recruit/victory cues after catches, reduce repetitive catch sounds, and respect mute/zero volume. Pause panel now offers a persistent sound toggle. TypeScript/build, audio routing, phone pause/preference lifecycle, production version labels, exact live asset checks and cached-client progress/offline checks pass. Perceptual listening remains unverified.

## v0.2.0 — deployed September15,2026

Deployment: dpl_CNsQ5YEsddbr8ZALUZ78gaXXMrGU. Shared URL: https://biology-dash-public-demo.vercel.app/. Verified live assets and version.json against the clean build; cached-player upgrade preserves progress and offline play.

First explicitly versioned web release. Includes the existing Coins/roster progression, shop and squad usability improvements, oriented engulfment wraps, corrected casualty feedback, and visible release identification. Version-label changes are new in this release; gameplay batch previously deployed September15.

## Prior deployment — legacy UI label v0.1

September15: dpl_DNd9UWRK9Xdn3qqY9vusmNhjNVCJ. Shared URL https://biology-dash-public-demo.vercel.app/. Previous builds reused the generic v0.1 label; do not treat that label as a unique release identifier.

## v0.2.2 — deployed September23,2026

Deployment: dpl_6H2VtC5Vf5L5sdAAKYVJyLhfcez7. Shared URL: https://biology-dash-public-demo.vercel.app/. Immutable URL: https://biology-dash-public-demo-lzmd7gnmj-applefound.vercel.app.

Full educational cell/microbe/medicine names, two-column phone medicine kit, explicit startup readiness, one-tap first patrol with in-play checklist, and next-patrol discovery preview. Typecheck,108 unit tests and targeted phone browser checks pass. Live files/version match compiled output; existing cache upgrades to biology-a4c7ed081c92 with42Coins/roster/transactions preserved and offline reload passing. Phone Settings and desktop version labels show0.2.2. Packaging check caught missing robots.txt on the initial deployment; corrected final deployment preserves both robots exclusion and no-index headers. No application-code change between those deployment attempts. Keep robots.txt in every clean deployment directory; verify it before uploading as well as afterward. Physical-device/perceptual audio and human enjoyment evaluations remain unverified.

## v0.2.3 — deployed September23,2026

Deployment dpl_43XXzi6aV68i3WCsWdkxLCdqHUML READY. Shared URL https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-gi9go1q5a-applefound.vercel.app.

Startup art failure/timeout recovery, faster first-patrol catch/recruit pacing, and one accurate recruitment callout including capacity handling.110 unit tests and targeted phone browser checks passed before release; production typecheck/build passes. Public assets/version/no-index and robots verified; returning-player cache changes to biology-154fa5879ba9 while preserving42Coins, roster and transactions; offline reload passes. Phone and desktop labels show0.2.3. No save schema changes.

## v0.2.4 — deployed September23,2026

Deployment dpl_7aczzfy6owBfPkyjhhM5JTjUZSQR READY. Shared URL https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-qe9odzu4d-applefound.vercel.app. Cache biology-1442e1a886df.

Quiet interception cues identify unwrapped microbes within2.5seconds of the tissue line, point toward the nearest threat and clear on wrapping/end. Up to3 local markers avoid crowd clutter; phone medicine-kit warnings stay above controls. No new medical claims, combat changes or save-schema changes. Typecheck,110unit tests,320px warning fixtures and crowded touch/label checks pass. Headless crowd sample17labels/0overlaps, median16.7ms/p9533.4ms; no physical-device performance claim. Clean production build completed a full90-second patrol with migration, purchases,110Coins awarded exactly once,130balance retained on reload and offline reload with0errors. Public compiled files/version/no-index/robots match; phone/desktop show0.2.4. Previously cached0.2.3 player updates with42Coins, roster and transactions preserved, offline reload passes. Evidence: artifacts/breach-warning-phone.png, breach-warning-kit-phone.png, patrol-readability.json, input-performance-v11.json, local-coins-verification.json and live-cache-upgrade-v14.json. Natural baseline was a fixed-left steering run, not evidence of improved human interception or learning.

## v0.3.0 — deployed September24,2026

Deployment dpl_EruA92RgdcjyE4NevUjnxem2Kj9N READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-mf33qtlkb-applefound.vercel.app. Cache biology-91e485084939.

Hold/charge/release external support from Patrol3: capped1.5second charge, stronger wall bursts with longer recovery, faster charged growth-suppression recovery, visible charge and discharge, pointer capture and keyboard/assistive activation, safe interruption. No save-schema or susceptibility changes.113unit tests/typecheck/build pass. Browser mouse/touch/keyboard/pause/reduced-motion320px checks pass. Natural90second charged Patrol3 won with21clears and4full discharges, one reward settlement, no errors. Crowded-label/touch regression passes17labels/0overlaps; headless median16.7ms,p9533.4ms (not a real-phone performance claim). Opening event instrumented at7.97seconds; old polling-time assertion was replaced with actual event timing and0.5second variable-frame allowance. Production exact-byte/version/no-index/robots checks pass, visible phone/desktop version0.3.0, returning0.2.4 cached client preserves42Coins/roster/transactions and offline reload. Human fun, physical touch and subjective audio remain unverified.

## v0.3.1 — deployed September24,2026

Deployment dpl_DM7cNeAGq1WiN29njh2NHV9E5P1D READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-opd9gihpi-applefound.vercel.app. Cache biology-6234c4c00f85.

Simpler first run: one Play action plus Settings, campaign/Coins/roster/reference panels deferred until first victory, sequential single coaching cue, closer opening cluster. Natural first catch4.8s and recruitment8.7s with16cells/0casualties in the opening check.113unit tests, typecheck/build, welcome/settings/campaign-reveal/reload, first-play/result-action and opening checks pass. Live production without instrumentation verifies one-tap launch, early catch and pause; exact assets, version labels, no-index/robots and cached-player42Coins/roster/transactions/offline update pass. No save schema changes. No measured enjoyment/retention or physical-device claim.

## v0.3.2 — deployed September24,2026

Deployment dpl_4KB5CNjBhUFDfCYEyKECmNXM8tnY READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-18sjuls2f-applefound.vercel.app. Cache biology-21437f8cca21.

Optional Call cells action in Patrols1–2 teaches hold/release before medication choices: tap calls one defender, full charge up to four,8–14second recovery,30cell cap. Gathered-cell preview, arriving squad animation and quiet recruitment feedback.115unit tests/typecheck/build pass; welcome and later medicine input regressions pass.320px reduced-motion touch cancel/full charge, pause cancellation, assistive tap and full natural90second patrol pass:20cells after first gate at8.61s, victory with15clears/29cells. Actual production charge/release/catch/pause, exact assets/version/no-index, phone/desktop versions and cached-player42Coins/roster/transactions/offline update pass. No save-schema change, clinical timing claim or measured enjoyment claim.

## v0.3.3 — deployed September24,2026

Deployment dpl_D4DXk3oixJv7ajSqr4nAmp4pDfXh READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-2zquhq33i-applefound.vercel.app. Cache biology-069dd1db6bf6.

Play, Next, level cards and shop Play now launch directly with level-appropriate support defaults. Optional Patrol setup shortcuts on map/results expose the full editor; initial welcome remains simple. Suggested squads use only owned/eligible roles without spending Coins or overwriting saved slots; manual formation/slot choices persist, with a Suggested squad restore action. Older mixed lineups migrate as custom. B-cell selection is optional.117unit tests/typecheck/build pass.320px browser checks cover direct levels2/3/4/5/7/9, no mandatory clone screen, map/result editor access, manual choice reload/restore, first-win continuation, untouched Coins/transactions and welcome. Actual production default Doxycycline/direct launch/configuration/custom-choice/Coins checks pass. Exact public files/version/no-index, phone/desktop labels and returning42Coin cached-player save/offline update pass. No subjective enjoyment or physical-device claim.

## v0.3.4 — deployed September24,2026

Deployment dpl_6jqPQcvXrUpUNvmsxrvp8FERGpBS READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-gszf22o18-applefound.vercel.app. Cache biology-5bd970f878d0.

Charging medicine now previews susceptible targets using wall brackets or growth-pause bars, marks unaffected microbes and reports no-match selections. Existing isolate rules drive the feedback; no combat damage/susceptibility changes. Dead targets are excluded from discharge feedback. Preview cleanup covers cancellation, release, switch, pause and terminal frame.119unit tests/typecheck/build pass, including a full ten-level suggested-squad campaign simulation without purchases or the optional selection room.320px mixed-isolate preview and existing pointer/key/touch lifecycle checks pass. Natural90second Patrol3: victory21clears,4full discharges,1reward settlement. Public files/version/no-index, live charge/release and cached-player42Coins/roster/transactions/offline upgrade pass. No real-device, subjective audio, enjoyment or learning claim.

## v0.4.0 — deployed September24,2026

Deployment dpl_67diqkY3rRvRUWoYtSFbgmfecQPr READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-605uiodzc-applefound.vercel.app. Cache biology-dfc4076347f1.

First Hug is a32second opening with one enlarged Neutrophil, enlarged microbes, visible engulfment and sequential cues. Base phagocytes retire after one digestion; purchased Neutrophil upgrades allow two/three. Stable actor identities prevent replacement or role reassignment after retirement. One medicine button charges on hold and applies3–6seconds of exposure on release to currently visible susceptible targets; growth inhibition expires, resistant/non-target organisms remain unaffected, and later arrivals are excluded. Optional Kit preserves medicine/antibody/complement access without a full control grid. Tissue-origin Defensin particles provide membrane-targeting host defense from Patrol2. The one-use rule, encounter susceptibility and timings are explicitly educational gameplay abstractions; MEDICAL_EVIDENCE.md records sources. Optional B-cell selection can be exited without changing affinity. No save-schema change.

120unit tests, typecheck and production build pass, including full campaign policies and Neutrophil upgrade capacity. Browser checks cover natural opening, exact retirement, touch charge, timed medicine,32second victory, exactly-once Coins, direct next and tissue particles;320px reduced-motion pointer/key/touch cancellation, pause, Kit and assistive input pass. Final public build without instrumentation naturally wins the opening and directly enters Patrol2, one settlement, zero browser errors. Final magnified screenshot inspected. Public byte/version/no-index/robots checks and phone/desktop version labels pass. Returning0.3.4 player retains42Coins/roster/transactions and offline play after cache replacement. Real-device, subjective audio, enjoyment and educational efficacy remain unverified. Granuloma/TB formations remain future work.

## v0.5.0 — deployed September24,2026 (Eastern)

Deployment dpl_FgqYVhFFhNRuJhJBzgNQcWgzXzMt READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-1o721u71w-applefound.vercel.app. Cache biology-b36df3432e83.

Original centralized procedural sound system replaces three reused WAV cues and the separate shop Audio path. Soft contact/clearance, deeper macrophages, precise antibody binding, complement cascades, mechanism-specific medicine pulses, Defensin impacts, warm reinforcements, subdued threats and restrained rewards. Compatible combo notes aggregate rapid clearances;30simultaneous kills produce at most3effects plus2harmonic voices. Eight active transient voices, priority replacement with smooth fades, ducking, cooldowns, low-pass filtering and conservative master gain. Charge rise, one readiness cue, quiet held state and release confirmation; interruption clears audio. Independent master/effects/musical-reward controls preserve previous mute/master settings; no background music loop or save-schema change. No new external audio assets or dependencies. AUDIO_DESIGN.md records the original palette and extension points.

127unit tests/typecheck/production build pass. Natural browser audio, charge/release, aggregation/priority, pause/mute, channel persistence/restart pass. Simulated20minute dense policy test stays bounded. Actual26second Web Audio render exposed an initial0.692 peak; corrected envelope replacement, lower gain and wider clustering reduced final full-master peak to0.2322/RMS0.0190, with no residual tail and8active voices maximum. The public browser produces measurable sound, zero waveform when muted, and working Settings preview/channels. Natural public32second opening still wins, one Coin settlement, direct next patrol, zero browser errors. Public bytes/version/no-index/robots and phone/desktop labels match; returning0.4.0 cache migrates with42Coins/roster/transactions and offline play preserved.

These checks do not establish subjective delight, acoustic loudness, physical-device behavior or20minute human listening comfort. No listening assessment was performed. Continue perceptual tuning when actual listening/feedback is available. Broader continuous product objective remains ongoing.

## v0.6.0 — deployed September25,2026

Deployment dpl_C2VbiCrX4YCMxXwTT4YXjTAxZm9v READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-ocw3h3mtj-applefound.vercel.app. Cache biology-b51d50fc9b54.

Simplified kawaii white SVG defenders, translucent staggered three-lane interactive gates, and outcome-specific medicine audio cues:
- Simplified defenders: original 12-frame code-native SVG atlas in `public/assets/defenders-simple-v1.svg` (Neutrophil/Macrophage/Plasma rows; forward/left/right/reaction columns), round chubby white bodies (`0xffffff`), rosy cheeks, and open hugging arms. Macrophage is distinctly larger/fatter (displayWidth 66) than Neutrophil (displayWidth 50). Preserves directional poses, original artwork compatibility, natural engulfment, and scientific mechanisms.
- Translucent staggered three-lane gates: three lanes across the corridor (`left` at x=115, `center` at x=210, `right` at x=305). Waves cycle `pair`, `left`, `right`, and `staggered` with vertical stagger offsets (e.g. `{ left: 0, center: -30, right: -55 }`). Tight vertical stagger (<=25px) enforces dilemma mechanics where opposite gates cannot both be reached; wider stagger rewards agile multi-gate collection. Patrol 1 index 0 gate preserved at `y=250` with `+4 cells` for onboarding learning. Panel face translucency (alpha `0.52`) with glowing neon border (`alpha: 0.88`, 2.5px) shows underlying tissue, cells, and microbes. Approaching defenders (within 38px) and defensin/antibody projectiles trigger luminous pulse reactions (alpha `0.82-0.90`, scale `1.02-1.05`). Crossing creates expanding glowing energy rings.
- Batched audio refinement: ineffective medicine shots with zero susceptible visible targets produce a restrained low no-match cue rather than a success chord (from commit `a431bbe`).

137 unit tests across 11 test suites pass; TypeScript 0 errors. Clean compiled distribution in `/tmp/biology-dash-0.6.0` verified. Live production site verified: public bytes, version.json (`0.6.0`), no-index headers, robots.txt, and phone Settings / desktop sidebar agreement. Returning v0.5.0 cached player smoothly updates to cache revision biology-b51d50fc9b54 with 42 Coins, roster loadout, upgrades, transaction receipts, and offline reload verified. Natural 32-second opening victory, cell retirement, and exactly-once Coin rewards verified on production. Evidence: `artifacts/simple-white-defenders.png`, `artifacts/translucent-three-lane-gates.png`, `artifacts/staggered-gates-reaction.png`, `artifacts/defenders-and-gates-result.json`, `artifacts/first-hug-production.json`, `artifacts/live-cache-upgrade-v14.json`. Real-device tactile feel, subjective listening comfort, and broader continuous roadmap remain ongoing.

## v0.6.1 — deployed September25,2026

Deployment dpl_77R4J3JT8qTfNo5uxB6WcVBeG1Rp READY; shared https://biology-dash-public-demo.vercel.app/; immutable https://biology-dash-public-demo-dneu4jlpk-applefound.vercel.app. Cache biology-f63786102e07.

Polished kawaii defender sizes, role differentiation speeds, and enlarged translucent three-lane gates:
- Chubbier Macrophage & faster Neutrophil: Macrophage SVG expanded with broader body (`rx="50" ry="44"`), thicker hug arms (`stroke-width="14"`), prominent rosy cheeks (`rx="7" ry="4.5"`), and horizontal chubbiness scaling (`displayWidth: 82.08` vs Neutrophil `45.00` — Macrophage is 1.82x wider and visibly chubby). Speed and digestion pacing differentiated: Macrophage approaches at 140 px/s with 1.18s wrap and 0.92s digest, while nimble Neutrophils approach at 180 px/s with 0.88s wrap and 0.65s digest (29% faster reach, 34% faster wrap, 42% faster recovery).
- Enlarged translucent gates & frosted glass shimmer: gate panels enlarged to 102px width (3-lane) / 166px (pair) and 80px height. Added frosted specular shimmer highlight line and expanded luminous contact reaction pulse (fill alpha 0.84-0.92, scale 1.03-1.06 over 0.38s). Vertical dilemma staggers and onboarding Patrol 1 gate at y=250 preserved.

137 unit tests across 11 test suites pass; TypeScript 0 errors. Clean compiled distribution in `/tmp/biology-dash-0.6.1` verified against live production: public bytes, version.json (`0.6.1`), no-index headers, robots.txt, and phone Settings / desktop sidebar agreement. Returning player smoothly updates to cache revision biology-f63786102e07 with 42 Coins, roster loadout, upgrades, transaction receipts, and offline reload verified. Natural 32-second opening victory, cell retirement, and exactly-once Coin rewards verified on production. Evidence: `artifacts/simple-white-defenders.png`, `artifacts/translucent-three-lane-gates.png`, `artifacts/staggered-gates-reaction.png`, `artifacts/defenders-and-gates-result.json`, `artifacts/first-hug-production.json`, `artifacts/live-cache-upgrade-v14.json`. Real-device tactile feel, subjective listening comfort, and broader continuous roadmap remain ongoing.

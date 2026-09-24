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

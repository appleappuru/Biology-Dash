# Biology Dash v0.1 — release preparation

**Partial delivery; verification and distribution gates remain open.** Source implements the ten-level game and native projects have been generated. Browser interaction results are being collected separately; this document does not claim a verified public deployment, native compilation, signed package or store submission.

## Feature / evidence matrix

| Delivery | Implementation | Verification state |
|---|---|---|
| Ten 90-second authored levels and two colony bosses | Present in typed content and simulation | Browser full-flow check pending |
| Movement, engulfment, gates, casualties, restart | Phaser + testable simulation | Automated/browser evidence to be recorded in STATUS.md |
| Three defender roles and two medicines | Present; medical evidence register included | Source-checked; no independent clinician validation |
| Susceptibility and antibody learning decisions | Present; correction opportunities and later transfer | Automated/browser progression checks pending |
| Playable clone selection and matching recall | Present | Human learning evaluation not performed |
| Map, local unlocks, replay and saves | Present | Reopen/corruption/browser checks pending |
| Original art and subdued local sound | Bundled | Phone art and perceptual audio review pending |
| Browser offline assets/service worker | Implemented production generation | Offline cold/reload checks pending; no offline claim yet |
| Public playable URL | Not recorded here | Hosting/account and deployment verification outstanding |
| iOS project | Generated under `ios/` | Xcode unavailable; no native compile/simulator/device evidence |
| Android project | Generated under `android/` | Java/Android SDK unavailable; no APK/AAB build evidence |
| Signed distribution / testing tracks | Not created or uploaded | Owner identity, accounts, signing and explicit upload authorization required |

## Reproducible commands and artifacts

Run from the repository root with a compatible Node runtime and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm preview
pnpm native:sync
```

`pnpm test:browser` is the intended browser-suite entry point; execute after its script is present and the required local preview is running. Exact successful commands/results belong in STATUS.md so a script declaration is not confused with an executed check. `dist/` is the production web bundle; `ios/` and `android/` are Capacitor projects. Original art/audio are under `public/`; generated evidence screenshots belong in `artifacts/`. Local inspection images do not establish public hosting or phone-device performance.

On a configured Android workstation, after web build/sync:

```sh
cd android
./gradlew assembleDebug
./gradlew bundleRelease
```

The debug APK is expected under `android/app/build/outputs/apk/debug/`; the release bundle under `android/app/build/outputs/bundle/release/`. Those are expected paths, **not files claimed to exist**. Release signing must use owner-controlled configuration and secrets outside Git. On a configured Mac, open `ios/App/App.xcodeproj`, select the owner's team and approved bundle identifier, build to simulator/device, then archive and export with the intended distribution method.

`dev.biologydash.immune` is a temporary development identifier, not an inspected permanent identity. Obtain an owner-approved permanent identifier before registering store records or signing distribution. Update Capacitor and generated native project identifiers consistently; rebuild and sync. Do not commit signing keys, certificates, credentials or provisioning secrets.

## Store listing drafts

**Name:** Biology Dash: Immune Patrol

**Short description:** Lead a tiny immune patrol. Match evidence, tag bacteria, and learn through play.

**Description:** Steer a team of friendly white cells through ten short tissue patrols. Recruit defenders, read bacterial lab clues and discover how phagocytes and antibodies cooperate. Compare two external antibiotic supports, match surface markers, and visit a simplified germinal center to select a better-binding B-cell clone. Earn local upgrades and replay your favorite encounters at your own pace.

Single-player, local progress, no ads or purchases. This game simplifies biological time, scale and encounters. It is an educational game abstraction, not treatment guidance. Clinical validation and measured learning gains are not claimed.

**Beta feedback request:** Please report device/OS, level, control or layout problems, audio comfort, and any biology explanation that was unclear. Do not include health records or other sensitive personal information.

Final icon/launch-screen assets, correctly sized actual-gameplay screenshots, category, age rating, support URL, privacy policy URL and accessibility declarations must be reviewed in the owner account. Current local graphics are not a claim that store-specific asset checks have passed.

## Data-practice draft

The gameplay implementation has no account, backend, advertising or analytics SDK. It stores level progress, best stars, research credits, unlocks, tutorial/learning flags and sound/motion preferences in local app/browser storage. There is no designed gameplay-data upload. Clear local site/app data to remove that state; uninstall behavior is platform-dependent. Browser hosting may keep ordinary request logs under the selected provider's policy. Beta platforms may collect diagnostics or tester feedback under their own policies. Inspect the final build's dependencies/network behavior and hosting configuration before submitting privacy disclosures. A publisher contact and public policy URL remain owner inputs; this draft is not an uploaded privacy policy.

## Current beta-distribution requirements

Checked 2026-09-12 against official sources. Recheck account-specific notices immediately before upload.

Apple TestFlight internal testing supports up to 100 eligible App Store Connect users; builds are available for 90 days. The owner needs an appropriate developer membership, app record, signing identity and access roles. External TestFlight testing has a separate beta-review path. See [Apple internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers), [TestFlight](https://developer.apple.com/testflight/) and [Apple distribution overview](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).

Google Play internal testing supports up to 100 testers and uses a testing invitation/link; it is distinct from production access. For personal accounts created after November 13, 2023, the official production-access requirement currently includes a closed test with at least 12 continuously opted-in testers for 14 days before application for access. An internal test alone does not satisfy that closed-test requirement. See [internal/closed test setup](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en-GB) and [new personal-account testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB). Real tester participation and store decisions cannot be completed by this build process.

## Exact remaining external actions

1. Finish automated and real-browser acceptance, including phone viewport screenshots, repeated runs and production offline reload. Record concrete results and repair failures.
2. Verify an already-authorized connected hosting account and publish a new game preview without unrelated deployment changes or charges. Inspect the resulting URL in a browser.
3. Install/activate Xcode and the required simulator runtimes on a Mac, and Java/Android SDK on the Android build host. Build the generated shells; test offline cold launch, safe areas, interruptions, persistence and a full run. Use declared real reference phones for any 60/30-fps device claim.
4. Obtain the owner-approved identifiers, developer-account access and signing configuration. Produce APK for testing, AAB and signed iOS artifacts where credentials permit. Review icon, launch and screenshot outputs.
5. Complete publisher support/privacy details, account-specific ratings and disclosures. Obtain explicit authorization before private-track upload or public submission; the current authorization prepares artifacts, not these uploads.
6. Conduct qualified medical review and the formative human protocol in GAME_DESIGN.md. Address misconceptions before educational-authority marketing. Recruit beta testers through the owner; no invitations have been sent.

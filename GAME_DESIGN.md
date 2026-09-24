# Biology Dash: Immune Patrol

A portrait, single-player arcade game for teens and adults. Steer a cooperative white-cell squad through an abstract tissue corridor, collect arriving cells or wider contact coverage, read isolate reports, and protect the tissue through ten 90-second encounters. The forward lane is a visual teaching convention; phagocytes engulf at close range.

## Play and progression

Relative two-axis drag keeps fingers below the squad. Mouse drag, all arrow keys and WASD move the actual contact zone within the playable corridor. Space activates equipped external medicine; Escape pauses. Input is bounded and canceled on interruption. The first encounter introduces movement, automatic contact attacks and a gate. Breaches visibly cost a defender sent on tissue rescue; collisions have brief protection. Elimination means defeat. Result screens offer restart, the map and the next unlocked encounter.

Gates trade four arriving cells against increased contact coverage. Strength caps prevent exponential growth. First victories earn local research credits, which buy capped starting reinforcements through a separate catalog/entitlement boundary. More starting cells never alter drug susceptibility or antibody specificity. Replays retain the best star result. Three defender roles unlock across the trail: neutrophils and macrophages overlap as phagocytes; plasma cells provide antibody support alongside phagocytes.

Pressure and recovery alternate across authored enemy mixes. Two theatrical colony archetypes supply boss encounters; size is unrelated to resistance. Timing, hit points, speed, contact coverage and population limits are centralized abstractions. Current renderer caps the visible cell formation separately from squad strength and shows the actual count in the HUD.

## Learning embedded in choices

| Levels | Objective | Consequential choice | Transfer |
|---|---|---|---|
| 1–2 | Contact engulfment and overlapping phagocyte roles | Intercept clusters; recruit or widen coverage | Changed lane patterns and later plasma cooperation |
| 3–4 | Medicine mechanisms and isolate susceptibility | Read the report before choosing amoxicillin or doxycycline | Reversed susceptibility in level 9 |
| 5–6 | Antibody tagging requires cooperation and matching epitopes | Retain phagocytes; choose A or B | Matching recall followed by unfamiliar B |
| 7–8 | B-cell clone variation, selection and recall | Compare weak, unchanged and stronger-binding clones | Selected A affinity benefits later matching A encounters |
| 9–10 | No universally best medicine or antibody | Adapt to changed reports and mixed epitopes | Final mixed encounter and replay without original hints |

Wrong report/epitope choices explain why and permit correction without an arbitrary casualty. Each level definition stores its objective, decision, feedback and transfer encounter. Learning flags record encountered mechanics, not proof of understanding. The germinal-center interlude compresses biological time and explains antigen capture, T-follicular-helper assistance and selection. Class switching is described separately. See MEDICAL_EVIDENCE.md for source records and clinician-review questions.

The five bacterial archetypes are explicitly tested fictional extracellular S. aureus isolates, including susceptible and resistant phenotypes and different schematic epitopes. They are rounded coccal clusters, with color/markers distinguishing phenotype. Species alone is never sufficient evidence for drug activity. Doxycycline inhibits modeled growth; amoxicillin damages susceptible growing bacteria. External medicine effects are not doses or white-cell products. Antibody binding, affinity and opsonic effector function are separate fields; antibodies do not kill directly. Complement is explained as a distinct system but not simulated. Antibacterial effects against a viral sentinel are excluded by rule tests; there is no viral combat roster.

## Architecture and practical boundaries

- `src/content.ts`: typed medical compatibility, authored levels, learning prompts and guide.
- `src/simulation.ts`: renderer-independent seeded `Patrol`, capped enemies/squad, contact resolution, gates, medicine effects and learning events. `RULES_VERSION` and replay seeds support reproducibility.
- `src/game.ts`: Phaser scene, scaling, original sprites, contact effects, audio, keyboard/pointer handling and cleanup.
- `src/main.ts` / `src/style.css`: responsive map, loadout, decisions, settings, modal flow and accessible HTML controls surrounding the canvas.
- `src/save.ts`: versioned local storage, corruption fallback, settings, earned unlocks and best results. Local scores are editable and not cheat-resistant.
- `scripts/offline.mjs`: production asset precache generation. Browser offline behavior requires explicit production verification; it must not be inferred from the presence of a service worker.
- `capacitor.config.ts`, `ios/`, `android/`: native shells bundle `dist` locally. Temporary development identity must be replaced before distribution.

Phaser owns rendering, scenes, input, timing, tweens and sound playback. Vite/TypeScript build the app. No backend, ads, purchases, account system, analytics SDK, teams or placeholder network calls are implemented. Future score validation needs a server. Future unlock providers must preserve biological compatibility; additional therapies need explicit evidence before entering content.

## Presentation and comfort

Original generated raster art follows a soft teal/mint, lilac and warm-coral palette, rounded forms and restrained faces. UI gates and ordinary controls use simple geometry. The desktop view adds navigation and contextual cards; phone play remains portrait. Reduced motion removes optional scrolling/shake. Sound is modest, rate-limited local effects with persistent mute/volume, silence between cues and gesture activation. No music loop. Perceptual audio review remains separate from successful file playback.

## Acceptance and unresolved evaluation

Automated checks cover damage/casualty rules, one-time gates, immutable compatibility, determinism, progression, saves and learning triggers. Real browser checks must cover movement, controls, decision correction, victory/defeat/restart, restored settings/progress, repeated runs, phone text/touch layout and production offline reload. Native checks additionally require safe areas, touch interruption, audio/background transitions, Android back behavior and offline cold launch. These are test requirements, not a claim that every environment has passed.

Human learning study: recruit an age-appropriate small pilot with consent; ask four short pre-play questions about susceptibility, opsonization, specificity and maturation; observe an unassisted full sequence; then present new isolate/epitope examples and ask participants to explain choices aloud. Record confusion, correction and transfer separately from scores. Recheck recall after a delay if feasible. Revise explanations when a recurring misconception appears, then test with new participants. This is a formative protocol, not a validated efficacy study; no learning gains are claimed before data exist.

## Gameplay presentation revision — September 13

Every squad member has an individual rendered cell (1–30), with arriving recruitment and casualty transitions. Four gate pairs rotate: +4 cells / +18 reach; +6 cells / 12-second rapid response; −3 cells with +36 reach / 8-second rescue shielding; +8 cells / −2 cells with +28 reach. Shields prevent cell losses but do not cancel a boss breach. Ability timers are visible. These are arcade abstractions.

Pre-rendered 3D-style assets use an elevated rear camera for defenders and approaching enemy views. Three defender rows and five enemy rows each have neutral, left, right and hit poses. Defeats squash/fade; recruited cells enter the formation. Enemy drift changes directional frames. This is a 2.5D Phaser scene, not a realtime skeletal 3D mesh. Illustrated choices clearly equip the selected lead class.

Recruitment and gate effects have short floating callouts beside the squad. End-of-patrol awards recognize a new saved personal-best score and zero forced losses; deliberate gate reassignment does not invalidate flawless defense. These are arcade achievements, not biological outcomes. Version-1 progression migrates intact to version 2.

## Naming preference — September23
Keep names educational and recognizable. Use real medication names (Amoxicillin, Doxycycline, Cefepime, Micafungin), immune-cell names (Neutrophil, Macrophage, Plasma cell), and familiar scientific microbe labels (E. coli, S. aureus, MRSA, Pseudomonas, Candida, Pneumococcus). Do not abbreviate merely to sound cute. Explain full species/resistance terms in the guide. Fictional gameplay variants should describe their tradeoff and remain identified as game specializations. Kawaii art may remain; names should teach. Prefer adapting layout over clipping or inventing shortened names.

## Immediate play — September23
The first patrol starts directly from the map's primary action. Teach steering, engulfment and gates with a compact checklist during play instead of a mandatory reading modal. Both movement axes count. Keep later biological choices and optional map briefings. Victory previews the next patrol's discovery alongside replay/progression and recruitment actions. No extra currency, streak penalties, timers outside patrol, or progression obligations are added.

## Opening pace — September23
Patrol1 brings its first microbe cluster into the middle distance and its first gate closer, so the opening teaches catch then recruitment within roughly12seconds at the rear position. Later waves and the subsequent27/44/61second gate schedule retain their existing travel. Timing and placements are arcade conventions; contact reach, approach/wrap damage, medicine susceptibility and rewards are unchanged. Inspiration: Mob Control's official App Store description emphasizes immediate readable crowd growth and gate decisions (https://apps.apple.com/us/app/mob-control/id1562817072?platform=ipad, checked September23,2026).

## Tissue interception cues — September23
Unwrapped microbes within2.5seconds of the tissue line at their current authored travel speed receive quiet lower arcs and line markers (up to3, nearest first). Directional text points from the squad toward the closest threat; later patrols place it above the medicine kit to avoid occlusion. Wrapping suppresses the cue because it holds travel. Static cues remain in reduced motion. These are gameplay warnings, not forecasts of clinical outcomes or guaranteed cell losses. Combat balance is unchanged.

## Charged external support — September24
From Patrol3, hold the support button or Space to charge for up to1.5seconds; release to fire. Taps retain the original18-impact/12-second recovery pulse. Full wall-targeting bursts reach36impact but take18seconds to recover; charged Doxycycline still suppresses growth without direct damage and reduces recovery to8seconds. Enemies advance while charging; holding after full charge adds no benefit. These are arcade timings and burst effects, not doses or clinical potency comparisons. Mouse/touch capture permits release after slipping off the button. Pause, canceled touches, focus loss and medicine changes cancel safely. Full charge has a growing field marker, fill meter, restrained discharge cue and larger release contour. Reduced motion retains informational charge fill. Early patrol active release, deeper weapon differentiation, richer targeting and broader host-defense progression remain outstanding under the full product goal.

## Simple first run — September24
Before the first victory, the launch screen presents one Play action and Settings. Campaign, Coins, roster and reference panels appear after the first win; players with a prior victory retain their full map. First-patrol coaching reveals one cue at a time. The opening cluster starts closer so a centered squad makes contact in roughly5seconds; recruitment remains a subsequent visible choice. No new mechanics must be learned before playing. This implements the user priority for a less complicated, engaging first experience; it does not establish measured enjoyment or retention.

## First-session reinforcement release — September24
Patrols1–2 provide one optional Call cells button, sharing the later support hold/release interaction. Tap calls one arriving defender; a1.5second hold calls up to four, with8–14second recovery and a30cell cap. A gathered-cell preview, accurate squad increase, arrival animation and quiet recruitment cue make the result visible. No medicine picker or added setup. This is an arcade recruitment abstraction, not cell division, a clinical timing claim or a medication effect. Existing automatic engulfment and gate choices remain. Pausing/canceled input spends nothing; permanent roster and save schema are unchanged.

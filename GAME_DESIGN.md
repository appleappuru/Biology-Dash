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

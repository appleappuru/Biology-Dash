# Biology Dash: Immune Patrol — autonomous build brief

Build an original, polished, portrait mobile game using Phaser and TypeScript. Deliver a deployed web preview and prepare the same game for iOS and Android distribution with Capacitor. Execute the work, test it, fix failures, and maintain resumable checkpoints. This document is an execution prompt; writing it does not itself start a background job.

## Start here: execution contract

This brief is self-contained and reflects settled product decisions. Begin implementation now. Do not respond only with a proposal, repeat the product interview, or stop after scaffolding. First write a short milestone plan, then execute it in the same task. Read the whole brief before planning. If this is a resumed run, inspect STATUS.md and the existing implementation before taking action; preserve completed work.

I explicitly request a long-running goal: deliver the Biology Dash game and distribution artifacts described here. If your environment exposes a goal mechanism, establish that goal and continue across supported automatic continuations. Do not invent commands or claim that ordinary prompting guarantees unattended execution. No token or elapsed-time budget has been specified; do not invent one. Respect platform limits and preserve a precise resume checkpoint if execution ends.

You may use bounded parallel subagents for independent implementation, medical-source verification, asset work, and testing when available. Coordinate integration and avoid concurrent edits to the same files. Do not create separate user-owned tasks as a substitute for subagents.

Authorized work includes creating the game repository inside the selected writable workspace, installing necessary project dependencies subject to system permissions, writing original assets, running tests and local servers, configuring native projects, making local Git checkpoints, and deploying a playable preview through an already-connected hosting account without new charges. Do not overwrite an existing deployment unrelated to this game. Signing identities, developer accounts, and permanent app identifiers must be inspected or obtained rather than invented. Public store submission, paid services, and uploads to private testing tracks require explicit authorization if not already supplied; prepare concrete reviewable artifacts first.

Progress should continue around missing signing credentials or unavailable devices. Report precisely which delivery is blocked while completing independent deliverables. Do not silently reduce the content or medical-learning scope to call the task complete.

Priorities: (1) accurate biological rules and a complete playable loop, (2) reliable controls and understandable feedback, (3) coherent original assets and enjoyable pacing, (4) full ten-level learning progression, (5) verified deployment and native packaging. These priorities determine work order, not permission to omit later requirements.

Use available image-generation tools for the promised original raster art. If unavailable, continue with clearly labeled placeholders while recording final art as outstanding. Read relevant tool/skill instructions and use established libraries rather than custom infrastructure.

Report concise milestone updates and material blockers. At handoff provide the playable URL and artifact paths, a feature/verification matrix, exact test commands and results, screenshots, unresolved medical questions, and the next external action if one is required. Distinguish automated simulation, browser interaction, simulator/emulator testing, physical-device testing, and human learning evaluation.

## Product and scope

Use Mob Control as a reference for visual clarity, rounded toy-like forms, soft shadows, and satisfying groups. Use the lane-shooter portion of Last War: Survival as the mechanical reference: lateral squad movement, automatic forward attacks, approaching enemies, upgrade gates, and a boss. Create original names, artwork, sounds, layouts, and code.

Audience: teens and adults. Working title: Biology Dash: Immune Patrol. Target portrait phones, with adaptable tablet layouts. Use shaded 2D sprites and Phaser effects to suggest depth; actual 3D is unnecessary.

First prove a complete 90-second level. Then deliver ten short, authored levels, three defender classes, five bacterial enemy archetypes, and two bosses. Archetypes may represent different behaviors or documented phenotypes rather than five different species. Include a level map, earned permanent unlocks, replayable levels, local saves, settings, and a short interactive tutorial. Offline gameplay is required in packaged apps. Browser offline support must be explicitly implemented and tested before being claimed.

Keep the initial game single-player. Do not build base management, alliances, purchases, ads, account creation, cloud saves, or a backend in this milestone. Preserve practical extension points for them.

## Core gameplay

The player drags horizontally to steer a squad near the bottom of a vertically scrolling tissue corridor. Support relative dragging so the finger can remain below the squad, plus mouse and keyboard controls. Clamp movement to safe bounds and handle touch cancellation without jumping or firing stuck inputs.

The squad automatically attacks approaching pathogens. The forward attack lane is an explicit arcade visualization of immune interactions, not a literal biological depiction. Use short-range engulfment/contact for phagocytes and appropriately labeled effects for other defenses. Do not portray neutrophils or macrophages as producing antibodies or antibiotics.

Pathogen contact causes readable defender losses, with brief protection against accidental repeated hits. Defeat occurs when the squad is eliminated. Provide a clear victory/defeat screen and immediate restart. Enemies that pass the defense must have a documented consequence; no invisible damage rules.

Introduce steering, combat, and the first gate within the first 20 seconds. Alternate pressure and recovery. Gates offer meaningful tradeoffs, such as recruitment, attack coverage, or a temporary support ability. Explain recruitment as arrival of additional cells, not instantaneous white-cell reproduction. Permanent upgrades may change abstract game attributes but must not override biological incompatibilities.

Use visible telegraphs, readable silhouettes, forgiving early levels, and difficulty that grows through enemy combinations and choices. Avoid arbitrary unavoidable losses and unlimited exponential entity growth. Keep squad strength separate from the number of rendered sprites when needed, without misleading the player about strength.

## Medical fidelity is a core requirement

The biology must be medically grounded. Simplify time, size, space, and encounter structure for play while preserving mechanisms and important limitations. Record each abstraction explicitly in the design documentation. Do not describe the game as clinically validated.

Begin with bacteria and basic antibacterial medicine options. Include real generic medicine names once their modeled actions and limitations have been verified. Implement at least two basic antibacterial loadout options in the initial ten-level build. Select the exact options after reviewing current authoritative references. A medicine loadout is a game configuration, not a prescribing regimen: do not include clinical doses, treatment durations, or patient-specific recommendations.

Build a small evidence table before implementing medical content. For every defender, organism/phenotype, medicine, and interaction, record its stable ID, mechanism, target, susceptibility assumptions, relevant limitations, game representation, source URL, date checked, and verification status. Prefer CDC, NIH/NCBI, FDA labels/DailyMed, and current professional guidelines appropriate to the claim. Do not infer clinical efficacy solely from an isolated mechanism or broad drug class.

Choose three coherent defender roles after evidence review; a reasonable starting point is neutrophils, macrophages, and plasma-cell antibody support. Represent antibodies and complement as distinct supporting mechanisms, not additional white-cell species. Boss size is theatrical; resistance is not implied merely by being large.

Required rules:
- Antibiotics do not damage viruses through antibacterial mechanisms.
- Drug activity depends on organism, susceptibility phenotype, mechanism, and relevant encounter context. Gram stain alone must not determine every interaction.
- Do not model broader-spectrum, more expensive, or higher-tier antibiotics as universally superior.
- Resistance belongs to microbes, not to a player who has become accustomed to a medicine. Do not teach that every exposure instantly creates resistance.
- Where modeled, distinguish growth inhibition from direct killing. Avoid claiming either category guarantees an outcome independent of context.
- Antibodies, complement, phagocytosis, and drugs must retain distinct roles. Do not equate all immune-modulating drugs with boosting immunity.
- Medicines are external support, not manufactured by the white-cell squad. A visual pulse or projectile represents delivery/effect; it is not a literal injection or clinical dose.
- Do not imply every microbe is harmful or every infection requires antibiotics. Frame levels as specified pathogenic encounters.
- Unsupported interactions remain excluded or explicitly provisional in development. Do not invent facts to fill content quotas.

Keep player-facing text short and useful: organism/phenotype labels, why an attack is effective or ineffective, and an optional readable field guide. Include a concise note in the field guide that this is an educational game abstraction, not treatment guidance. Track medical questions needing qualified review before marketing the game as educationally authoritative.

## Learning through decisions, including antibody maturation

Learning correct biological relationships is a primary product outcome. The field guide supports play, but cannot be the only place education occurs. Every level must identify a learning objective, a consequential player decision, explanatory feedback, and a later encounter that tests transfer without the original hint. Do not claim measured learning gains without human evaluation.

Organize the ten levels to progressively introduce phagocyte roles, medicine-target compatibility, susceptibility differences, antibody targeting/opsonization, affinity maturation, and recall. Include a small playable antibody-maturation progression in this release; it is not merely a future extension. Keep it compact enough to preserve the initial scope.

Teach through encounter evidence. Before a medicine choice, expose the relevant organism identity and, when required, a susceptibility result or mechanism clue in plain language. Include explicitly susceptible and resistant phenotypes when supported by sources. Explain that a species name alone does not guarantee susceptibility. Distinguish lack of antibacterial activity from acquired resistance. Failed choices should yield visible, concise explanations and a fair recovery opportunity rather than unexplained damage penalties.

Represent white-cell activities as overlapping, cooperative, context-dependent mechanisms, not a universal one-cell/one-pathogen matching chart. Document extracellular versus intracellular context and host-cell targets when applicable. Future cytotoxic T-cell and NK-cell content must distinguish attacking infected host cells from directly attacking free microbes. Keep these future roles out of the initial roster unless scope is explicitly expanded.

Use epitope/antigen identities, binding affinity, and antibody effector function as distinct data fields. Antibodies bind particular epitopes, not a universal species label; documented shared epitopes/cross-reactivity may be represented. Do not give all antibodies every effector function, or imply binding necessarily kills the target. Show an appropriate supported consequence such as opsonization aiding phagocytosis or neutralization of a relevant toxin.

Model affinity maturation as variation and selection among B-cell clones, with improved-binding clones becoming more represented. Secreted antibody molecules do not learn, mutate, or upgrade themselves. Mutations must not all be depicted as beneficial. Locate this progression in a simplified germinal-center/lymph-node interlude between encounters, with the supporting antigen presentation and T-follicular-helper role explained concisely for the modeled T-dependent response. Explicitly label the compressed biological timescale.

Class switching is distinct from affinity maturation: it changes the constant region and associated effector properties, rather than inherently changing antigen specificity or being a universal damage upgrade. Initial implementation may explain this distinction without adding a separate playable class-switching system. Memory progression should favor recall against an encountered matching antigen, not confer universal protection against unrelated pathogens or imply deliberate infection is desirable.

Add learning acceptance checks: a player must encounter and respond to at least one susceptibility-dependent drug choice, one cooperative cell/antibody interaction, one antigen match versus mismatch, and one improved-affinity selection followed by a matching-antigen recall encounter. Automated tests must verify the underlying rules, feedback, and progression triggers. A later human playtest should test whether players can explain and transfer these relationships; completion metrics alone do not establish understanding.

## Medicine and progression framework

Use data-driven definitions for defenders, pathogens, medicines, resistance traits, abilities, encounters, and unlocks. Separate evidence-backed biological compatibility from tunable game values such as cooldown, visual speed, and abstract power. Game upgrades must never turn an unsupported target into a susceptible one.

Allow future medicine classes, antifungals, antivirals, and immune-modulating therapies through explicit target/effect definitions. Implement only the initial antibacterial content; do not populate speculative medicine lists. Support combinations structurally but require evidence before asserting synergy.

Separate the unlock catalog and entitlement checks from the local earned-currency implementation. Future purchases may unlock equipment, capabilities, and progression, but no payment code or store UI is required now. Any future purchased upgrade must obey the same biological constraints.

Define clean score submission, profile, team, challenge, and save interfaces only where they serve a concrete boundary. Use local implementations now. Keep replay seeds and versioned rules useful for future score validation. Document that real competitive leaderboards will require server validation; local scores are not cheat-resistant. Avoid placeholder networks and premature backend scaffolding.

## Art and audio

Generate a consistent original kawaii asset set: rounded white-cell defenders with restrained expressions, distinguishable pathogens, tissue backgrounds, medicine/ability icons, gates, and menus. Establish a palette, sprite scale, lighting direction, outline treatment, and transparency requirements before batching assets. Maintain an asset manifest with origins and generation instructions.

Inspect generated art in the actual game at phone scale. Verify transparent edges, alignment, contrast, sprite bounds, and animation consistency. Prefer a few good poses animated with Phaser tweens over elaborate inconsistent sprite sheets. Use simple vector or geometric assets for ordinary interface elements where appropriate.

Audio must be minimal, subdued, and satisfying. No cheerful soundtrack, electronic music loops, incessant reward jingles, or escalating sensory intensity. Default to silence between modest effects: soft attacks, gentle impacts, restrained recruitment and upgrade cues, and a short completion sound. Avoid harsh high frequencies and repetitive effects becoming fatiguing. Rate-limit overlapping sounds and control peak levels. A subtle ambient bed is optional only if it improves the experience; it is not required.

Use available synthesis/audio libraries to create original effects rather than writing an audio engine. Provide mute and volume controls, persist preferences, and activate audio after a user gesture. Pause correctly when backgrounded. Assess sound by listening when available and clearly report if perceptual review was unavailable. Support comfortable replay through responsive feedback and clear accomplishment.

## Technology and repository

Use an official Phaser TypeScript starter, Phaser's input/scenes/physics/animation/audio/scaling facilities, and Capacitor for mobile packaging. Pin compatible stable dependencies after checking official documentation. Do not write a renderer, physics engine, scene framework, or native wrapper from scratch.

Work in a dedicated game directory. Treat all files under sources/ as read-only. Inspect applicable AGENTS.md instructions and existing files before modifying anything. Preserve unrelated user changes. Use a Git repository and checkpoints when available, without destructive resets or rewriting history.

Prefer small modules with a simulation layer that can be tested independently of rendering. Use seeded randomness for reproducible encounters, centralized balance data, capped entity counts, offscreen cleanup, and object pooling where measured load warrants it. Version local saves and implement safe fallback for missing/corrupt data.

Maintain concise GAME_DESIGN.md, PLAN.md, STATUS.md, MEDICAL_EVIDENCE.md, ASSET_MANIFEST.md, and RELEASE.md. STATUS.md must contain completed milestones, exact next action, current failures, commands, preview URLs, and external blockers. Keep detailed history out of startup instructions.

## Autonomous iteration and verification

Proceed through bounded milestones. Make routine reversible decisions independently. Run useful work concurrently with subagents where tools permit: for example, evidence verification, asset preparation, or independent test review. Keep file ownership clear and integrate results centrally. Use only available capabilities and report missing ones honestly.

1. Inspect prerequisites and create a concise plan with acceptance criteria.
2. Build one complete placeholder-art level; verify actual movement, attacks, collisions, gates, win/loss, and restart.
3. Add medically verified roles and medicine interactions, original art, and minimal sound. Play through again.
4. Expand to ten levels, progression, saves, settings, and the field guide.
5. Verify and publish a web preview using a supported host within authorized account access and costs.
6. Add and validate native projects early enough to catch platform issues; prepare mobile testing and distribution artifacts.

For each milestone: implement, run relevant checks, inspect the result, repair failures, and record evidence. Do not endlessly rerun passing checks or polish without a concrete problem. If the same failure persists after three materially different attempts, document the diagnosis, change approach or mark that subtask blocked, and continue independent work. Never mark the overall outcome complete while required work remains.

Automate meaningful tests for damage and casualty rules, gate application exactly once, biological compatibility and resistance rules, deterministic encounters, progression/unlocks, and save restoration. Exercise browser flows through real input, including victory, defeat, restart, settings, and reopening saved progress. Use test-only seeds/debug controls for hard-to-reach states, and keep them out of release builds.

Inspect phone-size screenshots for overlap, text clipping, touch targets, visual hierarchy, and enemy readability. Include a repeated-run stability check for leaked scenes, listeners, timers, entities, and audio. Measure representative heavy encounters, targeting 60 fps on a declared reference phone and playable 30 fps on a declared lower-end device; do not claim physical-device performance from browser emulation.

Native checks include safe areas, portrait layout, interrupted touch, audio unlock, background/foreground, save persistence, offline cold launch, Android back behavior, and a complete run. Test on available simulators/emulators and attached devices. Report untested devices and unavailable toolchains separately from failures. A passing browser build does not prove native compatibility.

Long-running execution is subject to actual session, usage, and tool limits. Never claim a background job is running unless it has been started through a supported mechanism. Persist checkpoints before stopping. No paid tools, hosting upgrades, asset purchases, or account enrollment without explicit budget authorization. If a credential or approval is needed, finish independent work and report the exact remaining action.

## Deployment and release deliverables

Deliver source, reproducible commands, a verified playable web URL when hosting is available, and release notes explaining implemented features, checks performed, limitations, and remaining external steps. Keep bundled gameplay assets local to packaged apps; do not require a live web preview URL to play native builds.

Prepare Android debug APK for device testing, release AAB when signing is configured, the iOS Xcode project, and signed iOS distribution artifacts when credentials/tooling permit. Prepare app icons, launch screens, screenshots from actual gameplay, draft store descriptions, and accurate data-practice documentation. Use secure configuration for signing and CI secrets; never commit keys or credentials.

Automate reproducible web and native builds in CI where repository access is available. Clearly separate unsigned build success, signed packaging, private-track upload, store submission, and store approval. Use TestFlight and Google Play internal testing as the initial distribution targets when configured and authorized. Check current store requirements at release time. Do not represent store review, account enrollment, or externally required tester participation as completed by automation.

Final completion requires ten playable levels, functioning progression and saves, consistent original graphics, restrained sound, tested medicine rules with source records, a verified web build, and native build evidence for available environments. If signing, hosting, or accounts prevent a delivery, provide all completed artifacts and explicit blockers; describe the result as partial until the remaining requested deliveries are achieved.

## Initial authoritative reference seeds

Recheck these and add claim-specific primary references during implementation:
- https://www.cdc.gov/antibiotic-use/about/index.html
- https://www.cdc.gov/antimicrobial-resistance/about/index.html
- https://www.cdc.gov/antibiotic-use/communication-resources/how-ar-happens.html
- https://www.ncbi.nlm.nih.gov/books/NBK27142/
- https://www.ncbi.nlm.nih.gov/books/NBK26860/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC4481323/
- https://www.niaid.nih.gov/clinical-trials/molecular-basis-human-phagocyte-interactions-bacterial-pathogens
- https://docs.phaser.io/phaser/getting-started/what-is-phaser
- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/ios
- https://capacitorjs.com/docs/android
- https://developer.apple.com/programs/
- https://support.google.com/googleplay/android-developer/answer/14151465

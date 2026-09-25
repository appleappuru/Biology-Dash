# Biology Dash sonic identity — v0.5.0

Original procedural Web Audio effects, sharing the context supplied to Phaser. No new recordings, external libraries, downloaded sounds or recognizable copied sequences. The three historical WAV assets remain in the repository but gameplay no longer loads them. `src/audio.ts` centralizes both gameplay and shop feedback.

## Palette and hierarchy

Contact begins with a short descending two-part bloop; macrophages have a lower register. Clearance adds a small pentatonic confirmation. Antibody binding uses a precise upper plink without advancing the clearance combo. Complement uses three delicate staggered notes. Beta-lactam wall effects use a low pulse plus snap, fungal-wall support has a deeper paired contour, and growth inhibition uses a restrained descending double tone. Defensin impacts have a brief rising pulse. Breaches and colony arrival use muted low dissonance. Reinforcement gates have warm blooms; purchases and colony clearance have a short chime; victory earns the longest five-note phrase. A cytotoxic cue is available for future mechanics but is not currently triggered.

Charge begins quietly, rises in pitch and amplitude, confirms readiness once, and settles to45% of its already quiet level after2.2seconds. Fully charged release adds a small harmonic confirmation; it confers no additional timing bonus. Cancellation, pause, mute, hidden page, restart, departure and terminal state stop charging and discard queued feedback.

## Density and mixing

AudioDirector consumes simulation events; BioAudio renders envelopes. Successful clearances collect over65ms, with at least240ms between clusters. Each cluster contains at most three effects and occasional two-note harmonic support. Rapid successes rise through compatible notes; a2second gap resets the sequence. Harmony has a1.4second minimum gap. Individual contact/binding/threat and major cues have independent cooldowns. Timing variation comes from small staggered clusters; timbre, pitch and amplitude vary conservatively.

Eight active transient voices maximum, each two oscillators; charging uses two additional continuous oscillators. More important events can retire lower-priority voices with25–40ms fading tails. Sound priorities preserve release/reward/victory cues. Important cues duck ordinary effects and harmonic support. All channels pass through a3kHz low-pass filter and compressor, then a conservative master gain. No background loop. Musical-reward volume controls combo harmonies; effects controls action and celebration cues. Master/mute controls both.

Save schema stays4. Existing mute/master preferences and progress survive; new sfxVolume defaults1 and musicVolume defaults.45. Settings offers independent sliders and a short reward preview. The audio context is initialized/unlocked through player interaction; unsupported audio leaves gameplay working.

## Verification and iteration

127unit tests include event roles, aggregation, harmonic progression without loudness escalation, interruption, channel migration, and a simulated20minute dense-event policy run. `scripts/adaptive-audio-test.mjs` checks real Chrome audio context, natural contact/clearance, charge/release,30kill burst aggregation, voice priorities, pause/mute, channel settings/reload and restart. `scripts/audio-render-test.mjs` renders a26second palette and crowded mix through OfflineAudioContext at full master volume. `scripts/sound-priority-test.mjs` forwards to the current test.

Initial render exposed a0.692 peak during dense voice replacement. Fix: initialize envelopes at zero, hold the instantaneous envelope when fading a replaced voice, reduce master gain, and widen cluster spacing. Refined render: peak0.2322, RMS0.0190, zero residual signal in the final second, peak8active voices, one charge start/stop. Values describe normalized digital samples, not acoustic sound pressure or headphone safety. Variation makes exact repeat values differ slightly. Artifact: artifacts/biology-audio-palette.wav and audio-render-metrics.json.

No subjective listening assessment or physical-device audio test has been performed. The simulated20minute policy test is not a20minute human comfort test. Next tuning should incorporate actual listening on phone speakers/headphones, long-session impressions and natural later-patrol combat. Avoid claiming delight, enjoyment or learning as established by automation.

import './style.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { createGame, PatrolScene } from './game';
import { Patrol } from './simulation';
import { LEVELS, DEFENDERS, FIELD_GUIDE, PATHOGENS, CLONES, medicineEffect, type MedicineId, type DefenderId } from './content';
import { loadSave, writeSave, isUnlocked, completeLevel, purchaseReinforcement } from './save';
const root = document.querySelector<HTMLDivElement>('#app')!;
let save = loadSave();
let page = 'patrol';
let selected = LEVELS.find(l => !save.completed.includes(l.id))?.id ?? 10;
let game: ReturnType<typeof createGame> | null = null;
let scene: PatrolScene | null = null;
let patrol: Patrol | null = null;
let medicine: MedicineId = 'amoxicillin';
let defender: Exclude<DefenderId, 'plasma'> = 'neutrophil';
let notificationTimer: ReturnType<typeof setTimeout>;
let lastHud = -1;
let tutorialStep = 0;
let nextQuiz = 35;
let nextReminder = 22;
const sprite = (frame: number, cls = '', label = '') => `<span class="sprite ${cls}" role="img" aria-label="${label}" style="background-position:${(frame % 4) * 100 / 3}% ${Math.floor(frame / 4) * 50}%"></span>`;
function persist() { if (!writeSave(save))
    notify('Storage unavailable. Keep this tab open to retain progress.'); }
function notify(text: string) { document.querySelector('.notification')?.remove(); const n = document.createElement('div'); n.className = 'notification'; n.role = 'status'; n.textContent = text; document.body.append(n); clearTimeout(notificationTimer); notificationTimer = setTimeout(() => n.remove(), 4500); }
const navigation = () => [['patrol', '◈', 'Patrol map'], ['squad', '♧', 'Your squad'], ['guide', '▤', 'Field guide'], ['settings', '⚙', 'Settings']].map(([id, icon, text]) => `<button data-nav="${id}" class="${page === id ? 'active' : ''}"><span class="nav-icon">${icon}</span>${text}</button>`).join('');
function render() {
    document.body.classList.toggle('game-mode', page === 'game');
    root.innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">✳</div><div><div class="brand-name">biology dash</div><div class="brand-sub">IMMUNE PATROL</div></div></div><nav class="nav" aria-label="Main">${navigation()}</nav><div class="sidebar-note"><strong>Small cells. Big teamwork.</strong>A little adventure inside you.<br>Made for curious minds.<br><br>v0.1 · Local progress</div></aside><main class="content">${page === 'game' ? gameMarkup() : `<header class="topline"><span class="eyebrow">${page === 'patrol' ? 'Your next tiny adventure' : page === 'guide' ? 'Curiosity looks good on you' : 'Immune patrol'}</span><span class="currency" aria-label="${save.credits} research credits"><i>✧</i> ${save.credits}</span></header>${page === 'patrol' ? mapMarkup() : page === 'squad' ? squadMarkup() : page === 'guide' ? guideMarkup() : settingsMarkup()}`}</main><aside class="rightbar">${rightMarkup()}</aside></div>${page === 'game' ? '' : `<nav class="mobile-nav" aria-label="Mobile">${navigation()}</nav>`}`;
    root.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach(b => b.onclick = () => navigate(b.dataset.nav!));
    root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b => b.onclick = () => brief(Number(b.dataset.level)));
    root.querySelector<HTMLButtonElement>('#continue')?.addEventListener('click', () => brief(selected));
    root.querySelector<HTMLButtonElement>('#upgrade')?.addEventListener('click', () => { if (purchaseReinforcement(save)) {
        persist();
        render();
        notify('+1 starting defender unlocked.');
    } });
    root.querySelector<HTMLButtonElement>('#mute')?.addEventListener('click', () => { save.muted = !save.muted; persist(); render(); });
    root.querySelector<HTMLInputElement>('#volume')?.addEventListener('input', e => { save.volume = Number((e.target as HTMLInputElement).value); persist(); });
    root.querySelector<HTMLButtonElement>('#motion')?.addEventListener('click', () => { save.reducedMotion = !save.reducedMotion; persist(); render(); });
    root.querySelector<HTMLButtonElement>('#tutorial')?.addEventListener('click', () => { save.tutorial = false; persist(); brief(1); });
}
function mapMarkup() { const next = LEVELS[selected - 1]; return `<section class="hero"><div class="hero-copy"><span class="pill">CHAPTER 01 · THE FIRST DEFENSE</span><h1>A tiny team.<br>A mighty mission.</h1><p>Guide your cells. Meet the microbes.<br>Protect the world within.</p><button id="continue" class="primary">${save.completed.length ? 'Continue patrol' : 'Start your patrol'} <span aria-hidden="true">↗</span></button></div>${sprite(11, 'hero-sprite', 'Your immune cell team')}</section><section><div class="section-heading"><h2>The tissue trail</h2><span>${save.completed.length} / 10 complete</span></div><div class="campaign">${LEVELS.map(l => { const unlocked = isUnlocked(save, l.id), done = save.completed.includes(l.id); return `<button data-level="${l.id}" ${!unlocked ? 'disabled' : ''} class="level-card ${l.id === selected ? 'current' : ''} ${!unlocked ? 'locked' : ''}" aria-label="Level ${l.id}: ${l.name}${!unlocked ? ', locked' : ''}"><span class="level-num">${done ? '✓' : String(l.id).padStart(2, '0')}</span><div><h3>${l.name}</h3><p>${l.subtitle}</p><div class="level-meta">${done ? '★'.repeat(save.stars[l.id] ?? 1) + ' · REPLAY' : unlocked ? '90 SEC · ' + (l.id === next.id ? 'UP NEXT' : 'READY') : '▣ · COMPLETE LEVEL ' + (l.id - 1)}</div></div></button>`; }).join('')}</div></section><footer class="footer">An arcade journey through biology. Explore the field guide as you go.</footer>`; }
function rightMarkup() { return `<section class="side-card"><h2>Your little defenders</h2><p>Different roles. One remarkable team.</p>${DEFENDERS.map((d, i) => `<div class="roster ${!isUnlocked(save, d.unlockLevel) ? 'locked-row' : ''}">${sprite(i, '', d.name)}<div><b>${d.name}</b><small>${d.role}</small>${isUnlocked(save, d.unlockLevel) ? '<span class="small-tag">READY FOR PATROL</span>' : `<small>Arrives at level ${d.unlockLevel}</small>`}</div></div>`).join('')}</section><section class="side-card"><div class="mini-head">A MOMENT OF BIOLOGY</div><h2>Better, together.</h2><p class="daily-note">Some cells engulf. Others make antibodies that help them find their target. Your best defense is teamwork.</p></section><section class="side-card"><h2>The journey within</h2><div class="progress-track"><div style="width:${save.completed.length * 10}%"></div></div><div class="progress-label"><span>Chapter 01</span><span>${save.completed.length * 10}%</span></div></section>`; }
function squadMarkup() { return `<h1 class="screen-title">Meet your patrol</h1><p class="muted">Shared work, different strengths. Earn new teammates along the tissue trail.</p><div class="guide-grid">${DEFENDERS.map((d, i) => `<article class="guide-card"><div class="roster" style="margin-top:0">${sprite(i, '', d.name)}<div><h3>${d.name}</h3><p>${d.role} · ${isUnlocked(save, d.unlockLevel) ? 'Unlocked' : 'Level ' + d.unlockLevel}</p></div></div><p>${d.feedback}</p></article>`).join('')}<article class="guide-card"><h3>A stronger starting team</h3><p>Spend 30 earned research credits for one additional starting defender. ${save.reinforcement} / 6 recruited. Biological compatibility stays the same.</p><button id="upgrade" class="primary" ${save.credits < 30 || save.reinforcement >= 6 ? 'disabled' : ''}>Recruit · 30 ✧</button></article></div>`; }
function guideMarkup() { return `<h1 class="screen-title">The field guide</h1><p class="muted">A few small ideas behind a remarkable defense.</p><div class="guide-grid">${FIELD_GUIDE.map(g => `<article class="guide-card"><h3>${g.title}</h3><p>${g.text}</p></article>`).join('')}<article class="guide-card"><h3>Encounter evidence</h3><p>All five phenotypes represent fictional, tested extracellular <em>S. aureus</em> isolates. Rounded silhouettes are stylized; A and B are simplified epitope labels.</p>${PATHOGENS.map(p => `<p><strong>${p.name}</strong><br>${p.clue}</p>`).join('')}</article><article class="guide-card"><h3>Sources & review</h3><p>Mechanisms checked against DailyMed medicine labels, CDC antibiotic guidance and NCBI immunology references on September 12, 2026. Qualified medical review and human learning evaluation remain outstanding.</p><p><a href="https://www.cdc.gov/antibiotic-use/about/index.html" target="_blank" rel="noreferrer">CDC: antibiotics</a> · <a href="https://www.ncbi.nlm.nih.gov/books/NBK27142/" target="_blank" rel="noreferrer">NCBI: immune defense</a></p></article></div>`; }
function settingsMarkup() { return `<h1 class="screen-title">Make yourself comfortable</h1><p class="muted">Quiet by nature. Adjust the little things.</p><div class="setting"><div><h3>Sound effects</h3><p>Soft, occasional cues. No music.</p></div><button id="mute" class="toggle" aria-pressed="${!save.muted}">${save.muted ? 'Off' : 'On'}</button></div><div class="setting"><div><h3>Volume</h3><p>Kept gentle, even at full volume.</p></div><input id="volume" aria-label="Volume" type="range" min="0" max="1" step="0.05" value="${save.volume}"></div><div class="setting"><div><h3>Reduce motion</h3><p>Pause floating details and camera effects.</p></div><button id="motion" class="toggle" aria-pressed="${save.reducedMotion}">${save.reducedMotion ? 'On' : 'Off'}</button></div><div class="setting"><div><h3>A little refresher</h3><p>Replay the interactive steering tutorial.</p></div><button id="tutorial" class="secondary">Show me</button></div><article class="guide-card" style="margin-top:24px"><h3>Your progress stays here</h3><p>Progress and preferences are saved on this device. No account, advertising, or game analytics. Clearing browser data removes your local save.</p></article>`; }
function navigate(to: string) { if (page === 'game') {
    pause();
    return;
} page = to; render(); window.scrollTo(0, 0); }
function modal(content: string, actions: Record<string, () => void>) { document.querySelector('.modal-backdrop')?.remove(); const el = document.createElement('div'); el.className = 'modal-backdrop'; el.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-label="Patrol panel" tabindex="-1">${content}</section>`; document.body.append(el); for (const [id, fn] of Object.entries(actions))
    el.querySelector('#' + id)?.addEventListener('click', fn); el.querySelector<HTMLElement>('button')?.focus(); el.addEventListener('keydown', e => { if (e.key !== 'Tab')
    return; const f = Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),a,input')); if (!f.length)
    return; if (e.shiftKey && document.activeElement === f[0]) {
    e.preventDefault();
    f[f.length - 1]?.focus();
}
else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
    e.preventDefault();
    f[0].focus();
} }); }
function closeModal() { document.querySelector('.modal-backdrop')?.remove(); }
function brief(id: number) {
    if (!isUnlocked(save, id))
        return;
    selected = id;
    const l = LEVELS[id - 1];
    const p = PATHOGENS.find(p => p.id === l.pathogens[0])!;
    medicine = id === 4 ? 'doxycycline' : 'amoxicillin';
    if (id === 1) defender = 'neutrophil';
    if (id === 2) defender = 'macrophage';
    modal(`<span class="eyebrow">PATROL ${String(id).padStart(2, '0')} · 90 SECONDS</span><h2>${l.name}</h2><p>${l.objective}</p>${id >= 3 ? `<div class="lab"><b>ISOLATE REPORT · ${p.species}</b>${p.clue}<br>Surface marker: epitope ${p.epitope}</div><p>Choose external support. You can change it during patrol.</p><div class="choice-list"><button id="amoxicillin" class="choice ${medicine === 'amoxicillin' ? 'selected' : ''}"><b>Amoxicillin</b><small>Cell-wall synthesis · damages susceptible bacteria</small></button><button id="doxycycline" class="choice ${medicine === 'doxycycline' ? 'selected' : ''}"><b>Doxycycline</b><small>Protein synthesis · suppresses susceptible bacterial growth</small></button></div><div id="choice-feedback" class="selected-label" role="status">${medicineEffect(medicine, p.id).feedback}</div>` : `${sprite(id === 2 ? 1 : 0, 'modal-art', 'Phagocyte')}<div class="lab"><b>YOUR MISSION</b>Drag in any direction. Engulf nearby bacteria automatically. Cross a gate to recruit cells or widen your reach.</div>`}${id >= 2 ? defenderChoices() : ''}<button id="begin" class="primary">${id === 7 ? 'Visit the selection room' : 'Begin patrol'} →</button><button id="back" class="secondary">Back to map</button>`, { amoxicillin: () => chooseMedicine('amoxicillin', p.id), doxycycline: () => chooseMedicine('doxycycline', p.id), 'select-neutrophil': () => chooseDefender('neutrophil'), 'select-macrophage': () => chooseDefender('macrophage'), begin: () => { closeModal(); id === 7 ? cloneRoom(() => start(id)) : start(id); }, back: closeModal });
}

function defenderChoices() {
    return '<p>Choose your lead defender</p><div class="choice-list defender-choices">' + ['neutrophil','macrophage'].map((id,i) => '<button id="select-'+id+'" class="choice '+(defender===id?'selected':'')+'" aria-pressed="'+(defender===id)+'"><span class="defender-preview" style="background-position:0% '+i*50+'%"></span><b>'+ (i?'Macrophage':'Neutrophil')+'</b><small>'+(i?'Larger, powerful engulfment':'Fast frontline response')+'</small></button>').join('')+'</div>';
}
function chooseDefender(id: 'neutrophil' | 'macrophage') {
    defender=id;
    for (const kind of ['neutrophil','macrophage']) {
        const button=document.getElementById('select-'+kind);
        button?.classList.toggle('selected',kind===id);
        button?.setAttribute('aria-pressed',String(kind===id));
    }
}

function chooseMedicine(m: MedicineId, pid: typeof PATHOGENS[number]['id']) { medicine = m; for (const id of ['amoxicillin', 'doxycycline'])
    document.getElementById(id)?.classList.toggle('selected', id === m); document.querySelector('#choice-feedback')!.textContent = medicineEffect(m, pid).feedback; }
function cloneRoom(done: () => void) { let chosen = ''; modal(`<span class="eyebrow">LYMPH NODE · GERMINAL CENTER</span><h2>Which clone will thrive?</h2><p>B-cell clones vary. Compare their binding to epitope A. Better antigen capture and T-follicular-helper signals favor selection.</p><div class="choice-list">${CLONES.map(c => `<button id="clone-${c.id}" class="choice"><b>${c.name}</b><small>${c.change}</small><div class="progress-track"><div style="width:${c.profile.affinity * 100}%"></div></div></button>`).join('')}</div><p id="clone-feedback" role="status">Not every mutation helps. Select a clone to see its result.</p><div class="lab">Days to weeks are compressed here. B-cell genes vary; secreted antibodies do not learn. Class switching changes effector properties, not binding affinity.</div><button id="select-clone" class="primary" disabled>Continue to encounter</button>`, Object.fromEntries([...CLONES.map(c => ['clone-' + c.id, () => { chosen = c.id; document.querySelectorAll('.choice').forEach(e => e.classList.remove('selected')); document.querySelector('#clone-' + c.id)?.classList.add('selected'); document.querySelector('#clone-feedback')!.textContent = c.id === 'strong' ? 'Stronger binding selected. This clone becomes more represented; matching A recall will benefit.' : 'This clone captures less antigen. Compare it with the stronger-binding clone before selection.'; (document.querySelector('#select-clone') as HTMLButtonElement).disabled = c.id !== 'strong'; }]), ['select-clone', () => { if (chosen !== 'strong')
            return; save.antibody = { ...CLONES[2].profile }; save.checks.affinity = true; persist(); closeModal(); done(); }]])); }
function gameMarkup() { return `<section class="game-shell"><header class="game-heading"><div><span class="eyebrow">PATROL ${String(selected).padStart(2, '0')}</span><h1>${LEVELS[selected - 1].name}</h1></div><button id="pause" class="icon-button" aria-label="Pause patrol">Ⅱ</button></header><div class="stage"><div id="game" aria-label="Immune patrol play area. Drag in any direction or use arrows or WASD." role="application"></div><div class="hud"><div class="hud-item"><small id="squad-kind">DEFENDERS</small><strong id="squad-count">12</strong></div><div class="hud-item hud-time"><small>PROTECT THE TISSUE</small><strong id="clock">1:30</strong><div class="timebar"><div id="time-fill" style="width:0%"></div></div></div><div class="hud-item"><small>CLEARED</small><strong id="cleared">0</strong></div></div><div id="ability-status" class="ability-status"></div><div class="combat-feedback" id="feedback" role="status">${selected === 1 ? 'Drag to steer · engulf bacteria inside your contact zone' : LEVELS[selected - 1].subtitle}</div>${selected >= 3 ? `<div class="battle-actions"><button id="support">${medicine === 'amoxicillin' ? 'Amoxicillin' : 'Doxycycline'} · ready</button><button id="switch-med" aria-label="Change medicine">⇄</button>${selected >= 5 ? '<button id="antibody" class="antibody-btn">Antibody A</button>' : ''}</div>` : '<div class="drag-label">← &nbsp; DRAG ANY DIRECTION · ARROWS / WASD &nbsp; →</div>'}</div></section>`; }
function start(id: number) {
    page = 'game';
    selected = id;
    lastHud = -1;
    tutorialStep = save.tutorial ? 3 : 0;
    nextQuiz = 35;
    nextReminder = 22;
    render();
    game = createGame();
    root.querySelector('#pause')!.addEventListener('click', pause);
    root.querySelector('#support')?.addEventListener('click', () => patrol?.useMedicine());
    root.querySelector('#switch-med')?.addEventListener('click', supportPanel);
    root.querySelector('#antibody')?.addEventListener('click', antibodyPanel);
    const thisGame = game;
    const boot = () => { if (game !== thisGame || page !== 'game')
        return; scene = game!.scene.getScene('Patrol') as PatrolScene; if (!scene || !scene.sys.isActive()) {
        setTimeout(boot, 30);
        return;
    } patrol = new Patrol(id, id * 8917, save.reinforcement); patrol.medicine = medicine; patrol.defender = defender; patrol.antibody = { ...save.antibody }; patrol.plasma = false; patrol.learning.affinity = save.checks.affinity === true; scene.muted = save.muted; scene.volume = save.volume; scene.reducedMotion = save.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches; scene.startPatrol(patrol, { tick, event: feedback, finish, pause, gesture: () => { const audio = scene?.sound as unknown as {
            unlock?: () => void;
        }; audio?.unlock?.(); } }); if (id >= 5) {
        scene.paused = true;
        modal(`<span class="eyebrow">TEAMWORK</span><h2>A little help finding targets</h2><p>Keep your phagocytes and invite plasma-cell support. Matching antibodies tag bacteria; phagocytes perform the clearing.</p>${sprite(2, 'modal-art', 'Plasma cell')}<button id="recruit-plasma" class="primary">Recruit plasma support</button>`, { 'recruit-plasma': () => { patrol!.plasma = true; scene!.paused = false; closeModal(); feedback('Plasma support recruited. Match the epitope to help engulfment.'); } });
    }
    else if (id === 1 && !save.tutorial) {
        scene.paused = true;
        modal(`<span class="eyebrow">A 15-SECOND FIELD LESSON</span><h2>Meet your tiny team</h2><p>Drag anywhere in the corridor to move left, right, forward and back. Your finger can stay below the cells. On a keyboard, use the arrow keys or WASD.</p><p>Cells automatically engulf bacteria in the glowing contact zone. A breach past the bottom line costs one defender.</p><button id="learn" class="primary">Let’s move →</button>`, { learn: () => { closeModal(); scene!.paused = false; } });
    } };
    boot();
}
function feedback(text: string) { const el = document.getElementById('feedback'); if (el)
    el.textContent = text; }
function tick(p: Patrol) {
    const kind=document.getElementById('squad-kind');
    if(kind) kind.textContent=p.defender==='macrophage'?'MACROPHAGES':'NEUTROPHILS';
    const ability=document.getElementById('ability-status');
    if(ability) ability.textContent=[p.tempoRemaining>0?'Rapid response '+Math.ceil(p.tempoRemaining)+'s':'',p.shieldRemaining>0?'Rescue shield '+Math.ceil(p.shieldRemaining)+'s':''].filter(Boolean).join(' · ');

    const sec = Math.ceil(90 - p.time);
    if (sec !== lastHud) {
        lastHud = sec;
        document.querySelector('#clock')!.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        document.querySelector<HTMLElement>('#time-fill')!.style.width = `${p.time / 90 * 100}%`;
    }
    document.querySelector('#squad-count')!.textContent = String(p.squad);
    document.querySelector('#cleared')!.textContent = String(p.kills);
    const b = document.querySelector<HTMLButtonElement>('#support');
    if (b) {
        b.textContent = `${p.medicine === 'amoxicillin' ? 'Amoxicillin' : 'Doxycycline'} · ${p.medicineCooldown > 0 ? Math.ceil(p.medicineCooldown) + 's' : 'ready'}`;
        b.disabled = p.medicineCooldown > 0;
    }
    const a = document.querySelector('#antibody');
    if (a)
        a.textContent = 'Antibody ' + p.antibody.epitope;
    if (selected === 1 && tutorialStep === 0 && Math.abs(p.x - 210) > 45) {
        tutorialStep = 1;
        feedback('Nice steering. Meet the cluster in your contact zone.');
    }
    if (selected === 1 && tutorialStep === 1 && p.kills > 0) {
        tutorialStep = 2;
        feedback('Engulfed! Next, steer through a gate: more cells or wider contact.');
    }
    if (selected === 1 && tutorialStep === 2 && p.learning.gate) {
        tutorialStep = 3;
        save.tutorial = true;
        persist();
        feedback('You’re ready. Keep patrolling; arriving cells keep the team strong.');
    }
    if (p.time >= nextReminder) {
        nextReminder = 999;
        if (selected >= 5)
            feedback('Surface labels show A or B. Tap Antibody to match the epitope.');
        else if (selected >= 3)
            feedback('External support: tap the medicine when bacteria are present.');
    }
    if (p.time >= nextQuiz) {
        nextQuiz = 999;
        if (selected >= 3)
            encounterDecision();
    }
}
function encounterDecision() { if (!scene || !patrol)
    return; scene.paused = true; const p = patrol; const current = p.enemies.find(e => e.y > 100) ?? p.enemies[0]; const target = PATHOGENS.find(x => x.id === (current?.kind ?? LEVELS[selected - 1].pathogens[0]))!; if (selected === 6 || selected === 8 || selected === 10) {
    const epitope = selected === 8 ? 'B' : target.epitope;
    modal(`<span class="eyebrow">ENCOUNTER CHECK</span><h2>A familiar species. A different shape.</h2><div class="lab"><b>SURFACE MARKER · EPITOPE ${epitope}</b>Which antibody profile will bind this surface?</div><div class="choice-list"><button id="match-a" class="choice"><b>Antibody A</b><small>${p.antibody.affinity >= .9 ? 'Selected high-affinity A clone' : 'Original A profile'}</small></button><button id="match-b" class="choice"><b>Antibody B</b><small>Different epitope specificity</small></button></div><p id="answer" role="status">Compare the marker with the profile.</p><button id="continue-check" class="primary" disabled>Return to patrol</button>`, { 'match-a': () => answerAntibody('A', epitope), 'match-b': () => answerAntibody('B', epitope), 'continue-check': () => { closeModal(); scene!.paused = false; } });
}
else {
    modal(`<span class="eyebrow">ENCOUNTER CHECK</span><h2>Read this isolate’s report</h2><div class="lab"><b>${target.species} · ${target.name}</b>${target.clue}</div><div class="choice-list"><button id="pick-amox" class="choice"><b>Amoxicillin</b><small>Damage susceptible multiplying bacteria</small></button><button id="pick-doxy" class="choice"><b>Doxycycline</b><small>Suppress susceptible bacterial growth</small></button></div><p id="answer" role="status">Select external support using this report.</p><button id="continue-check" class="primary" disabled>Return to patrol</button>`, { 'pick-amox': () => answerDrug('amoxicillin', target.id), 'pick-doxy': () => answerDrug('doxycycline', target.id), 'continue-check': () => { closeModal(); scene!.paused = false; } });
} }
function answerDrug(m: MedicineId, id: typeof PATHOGENS[number]['id']) { const r = medicineEffect(m, id); patrol!.medicine = m; document.querySelector('#answer')!.textContent = r.feedback + (r.effective ? ' Ready for the next wave.' : ' Try the other choice. No defenders lost.'); (document.querySelector('#continue-check') as HTMLButtonElement).disabled = !r.effective; patrol!.learning.medicine ||= r.effective; }
function answerAntibody(a: 'A' | 'B', target: 'A' | 'B') { const match = a === target; document.querySelector('#answer')!.textContent = match ? 'Matched. Tags help phagocytes engulf; binding alone does not kill.' : 'Mismatch. Higher affinity to A does not create binding to B. Try another profile.'; (document.querySelector('#continue-check') as HTMLButtonElement).disabled = !match; if (!match)
    patrol!.learning.mismatch = true;
else {
    patrol!.antibody = { epitope: a, affinity: a === 'A' ? save.antibody.affinity : .45, effector: 'opsonization' };
    patrol!.learning.match = true;
} }
function supportPanel() { if (!scene || !patrol)
    return; scene.paused = true; const p = patrol; const ids = [...new Set(p.enemies.map(e => e.kind))]; modal(`<span class="eyebrow">EXTERNAL SUPPORT</span><h2>Use the lab evidence</h2><div class="lab">${(ids.length ? ids : LEVELS[selected - 1].pathogens).map(id => PATHOGENS.find(v => v.id === id)!).map(v => `<b>${v.species} · ${v.name}</b>${v.clue}`).join('<br><br>')}</div><button id="swap-amox" class="primary">Equip amoxicillin</button><button id="swap-doxy" class="secondary">Equip doxycycline</button>`, { 'swap-amox': () => { p.medicine = 'amoxicillin'; closeModal(); scene!.paused = false; }, 'swap-doxy': () => { p.medicine = 'doxycycline'; closeModal(); scene!.paused = false; } }); }
function antibodyPanel() { if (!scene || !patrol)
    return; scene.paused = true; modal(`<span class="eyebrow">ANTIBODY SUPPORT</span><h2>Match the surface marker</h2><p>A and B identify different epitopes. Only matching antibodies tag bacteria for phagocytes.</p><button id="equip-a" class="primary">Antibody A · ${save.antibody.affinity >= .9 ? 'improved' : 'initial'} affinity</button><button id="equip-b" class="secondary">Antibody B · initial affinity</button>`, { 'equip-a': () => equipAntibody('A'), 'equip-b': () => equipAntibody('B') }); }
function equipAntibody(epitope: 'A' | 'B') { patrol!.antibody = { epitope, affinity: epitope === 'A' ? save.antibody.affinity : .45, effector: 'opsonization' }; closeModal(); scene!.paused = false; feedback(`Antibody ${epitope} equipped. Tags require matching epitopes.`); }
function pause() { if (!scene || !patrol || patrol.phase !== 'playing' || document.querySelector('.modal-backdrop'))
    return; scene.paused = true; scene.cancelDrag(); modal(`<span class="eyebrow">TAKE A BREATHER</span><h2>Patrol paused</h2><p>Your team will wait here. Come back when you’re ready.</p><button id="resume" class="primary">Resume patrol</button><button id="restart" class="secondary">Restart level</button><button id="leave" class="secondary">Return to map</button>`, { resume: () => { closeModal(); scene!.paused = false; }, restart: () => { stopGame(); start(selected); }, leave: () => { stopGame(); page = 'patrol'; render(); } }); }
function stopGame() { closeModal(); scene?.sound.stopAll(); game?.destroy(true); game = null; scene = null; patrol = null; }
function finish(p: Patrol) { const won = p.phase === 'victory'; if (won) {
    completeLevel(save, selected, p.squad, p.learning);
    persist();
} const id = selected; modal(`${sprite(won ? 11 : 1, 'modal-art', won ? 'Immune team' : 'Macrophage')}<span class="eyebrow">${won ? 'TISSUE PROTECTED' : 'A CHANCE TO REGROUP'}</span><h2>${won ? 'Tiny team. Mission complete.' : 'Let’s try another approach.'}</h2>${won ? `<div class="stars">${'★'.repeat(save.stars[id])}</div>` : ''}<p>${won ? LEVELS[id - 1].feedback : 'Keep bacteria inside your contact zone and recruit at gates. Breaches cost a defender; medicine compatibility follows the lab report.'}</p><div class="result-stats"><div><strong>${p.kills}</strong><small>cleared</small></div><div><strong>${p.squad}</strong><small>defenders</small></div><div><strong>${p.score}</strong><small>score</small></div></div><button id="next" class="primary">${won && id < 10 ? 'Next patrol →' : 'Replay patrol'}</button><button id="result-map" class="secondary">Back to the trail</button>`, { next: () => { stopGame(); if (won && id < 10) {
        selected = id + 1;
        page = 'patrol';
        render();
        brief(id + 1);
    }
    else
        start(id); }, 'result-map': () => { stopGame(); selected = LEVELS.find(l => !save.completed.includes(l.id))?.id ?? 10; page = 'patrol'; render(); } }); }
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    scene?.sound.stopAll();
    pause();
} });
window.addEventListener('pagehide', persist);
if (Capacitor.isNativePlatform()) {
    App.addListener('appStateChange', ({ isActive }) => { if (!isActive) {
        scene?.cancelDrag();
        pause();
        persist();
    } });
    App.addListener('backButton', () => { if (page === 'game') {
        pause();
    }
    else if (document.querySelector('.modal-backdrop')) {
        closeModal();
    }
    else if (page !== 'patrol') {
        page = 'patrol';
        render();
    }
    else {
        App.exitApp();
    } });
}
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    Object.assign(window, { __BIOLOGY__: { get state() { return patrol; }, get save() { return save; }, get scene() { return scene; }, start: (id: number) => { stopGame(); save.completed = Array.from({ length: id - 1 }, (_, i) => i + 1); save.tutorial = true; start(id); }, advance: (seconds: number, autopilot = false) => { if (!patrol)
                return; for (let i = 0; i < seconds * 20; i++) {
                if (autopilot) {
                    const target = patrol.enemies.filter(e => e.y > 400).sort((a, b) => b.y - a.y)[0];
                    if (target)
                        patrol.move(target.x, Math.max(460, Math.min(635, target.y + 110)));
                    else if (patrol.gates.some(g => g.y > 500 && !g.used))
                        patrol.move(110);
                }
                patrol.step(.05);
            } tick(patrol); if (patrol.phase !== 'playing' && !scene!.finished) {
                scene!.finished = true;
                finish(patrol);
            } }, lose: () => { patrol!.squad = 1; patrol!.protection = 0; patrol!.lose('Test contact'); scene!.finished = true; finish(patrol!); } } });
}
if (import.meta.env.PROD && 'serviceWorker' in navigator)
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { }); });
render();

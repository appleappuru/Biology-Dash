import {bindChargeControl} from './charge-control';
import {ROSTER,rosterOption,upgradePreview,deploymentFor,type RosterId} from './roster';
import {buy,price,swapMember,settleRun,unlockRoster,applyFormation} from './economy';
import './style.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { createGame, PatrolScene, breachWarning } from './game';
import { Patrol } from './simulation';
import { LEVELS, DEFENDERS, FIELD_GUIDE, PATHOGENS, CLONES, MEDICINES, availableMedicines, ANTIBODY_NAMES, antibodyName, medicineStyle, medicineName, medicineEffect, type MedicineId, type DefenderId } from './content';
import { loadSave, writeSave, isUnlocked, purchaseReinforcement } from './save';
const root = document.querySelector<HTMLDivElement>('#app')!;
let save = loadSave();
unlockRoster(save);
let runId = '';
let selectedSlot=0;
let lastPurchaseAt=-Infinity;
let previousBest=0;
let page = 'patrol';
let selected = LEVELS.find(l => !save.completed.includes(l.id))?.id ?? 10;
let game: ReturnType<typeof createGame> | null = null;
let scene: PatrolScene | null = null;
let patrol: Patrol | null = null;
let medicine: MedicineId = 'amoxicillin';
let defender: Exclude<DefenderId, 'plasma'> = 'neutrophil';
let notificationTimer: ReturnType<typeof setTimeout>;
let lastHud = -1;
let lastHudPaint=-Infinity;
let tutorialStep = 0;
let nextQuiz = 35;
let nextReminder = 22;
const sprite = (frame: number, cls = '', label = '') => `<span class="sprite ${cls}" role="img" aria-label="${label}" style="background-position:${(frame % 4) * 100 / 3}% ${Math.floor(frame / 4) * 50}%"></span>`;
const microbeSprite = (p: typeof PATHOGENS[number]) => `<span class="microbe-portrait" role="img" aria-label="${p.species}: ${p.morphology}" style="background-image:url(assets/${p.art.texture}.png);background-size:400% ${p.art.texture === 'enemies-v2' ? 500 : 400}%;background-position:0% ${p.art.row * 100 / (p.art.texture === 'enemies-v2' ? 4 : 3)}%"></span>`;
const drugKey = (id: MedicineId) => id === 'amoxicillin' ? 'amox' : id === 'doxycycline' ? 'doxy' : id;
const drugChoices = (prefix = '') => availableMedicines(selected).map(m => `<button id="${prefix ? prefix + drugKey(m.id) : m.id}" class="choice ${medicine === m.id ? 'selected' : ''}"><b>${m.nickname}</b><small>${m.name} · ${m.action}</small></button>`).join('');
const drugActions = (prefix: string, action: (id: MedicineId) => void) => Object.fromEntries(availableMedicines(selected).map(m => [prefix ? prefix + drugKey(m.id) : m.id, () => action(m.id)]));
const encounterRoster = (level: number) => `<div class="encounter-roster">${LEVELS[level - 1].pathogens.map(id => PATHOGENS.find(p => p.id === id)!).map(p => `<div class="encounter-microbe">${microbeSprite(p)}<div><b>${p.nickname}</b><small>${p.species} · ${p.kind === 'fungus' ? 'FUNGUS · ' : ''}${p.name}</small></div></div>`).join('')}</div>`;
function persist() { if (!writeSave(save))
    notify('Storage unavailable. Keep this tab open to retain progress.'); }
function notify(text: string) { document.querySelector('.notification')?.remove(); const n = document.createElement('div'); n.className = 'notification'; n.role = 'status'; n.textContent = text; document.body.append(n); clearTimeout(notificationTimer); notificationTimer = setTimeout(() => n.remove(), 4500); }
const navigation = () => [['patrol', '◈', 'Patrol map'], ['squad', '♧', 'Your squad'], ['guide', '▤', 'Field guide'], ['settings', '⚙', 'Settings']].map(([id, icon, text]) => `<button data-nav="${id}" class="${page === id ? 'active' : ''}"><span class="nav-icon">${icon}</span>${text}</button>`).join('');
function render() {
    document.body.classList.toggle('game-mode', page === 'game');
    document.body.classList.toggle('reduce-motion',save.reducedMotion);
    root.innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">✳</div><div><div class="brand-name">biology dash</div><div class="brand-sub">IMMUNE PATROL</div></div></div><nav class="nav" aria-label="Main">${navigation()}</nav><div class="sidebar-note"><strong>Small cells. Big teamwork.</strong>A little adventure inside you.<br>Made for curious minds.<br><br>v${__APP_VERSION__} · Local progress</div></aside><main class="content">${page === 'game' ? gameMarkup() : `<header class="topline"><span class="eyebrow">${page === 'patrol' ? 'Your next tiny adventure' : page === 'guide' ? 'Curiosity looks good on you' : 'Immune patrol'}</span><span class="currency" aria-label="${save.credits} Coins"><i class="coin-icon" aria-hidden="true">●</i> ${save.credits} Coins</span></header>${page === 'patrol' ? mapMarkup() : page === 'squad' ? squadMarkup() : page === 'guide' ? guideMarkup() : settingsMarkup()}`}</main><aside class="rightbar">${rightMarkup()}</aside></div>${page === 'game' ? '' : `<nav class="mobile-nav" aria-label="Mobile">${navigation()}</nav>`}`;
    root.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach(b => b.onclick = () => navigate(b.dataset.nav!));
    root.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.onclick=()=>{
        if(performance.now()-lastPurchaseAt<600)return;
        lastPurchaseAt=performance.now();const id=b.dataset.buy!;const message=buy(save,id);persist();render();
        const purchased=message.startsWith('Purchased');
        const receipt=message+(purchased?` Balance: ${save.credits} Coins.`:'');
        document.querySelector('#shop-feedback')!.textContent=receipt;
        const nextId=purchased&&id.startsWith('recruit:')?id.replace('recruit:','upgrade:'):id;
        const target=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-buy]')).find(button=>button.dataset.buy===nextId);
        if(target){const note=document.createElement('p');note.className='card-purchase-feedback'+(purchased?' purchase-pop':'');note.textContent=receipt;note.setAttribute('aria-hidden','true');target.before(note);target.scrollIntoView({block:'center',behavior:'instant'});if(!target.disabled)target.focus({preventScroll:true});else{const card=target.closest<HTMLElement>('article');card?.setAttribute('tabindex','-1');card?.focus({preventScroll:true});}}
        if(purchased&&!save.muted){const chime=new Audio('assets/recruit.wav');chime.volume=save.volume*.4;void chime.play().catch(()=>{});}
    });
    root.querySelector<HTMLButtonElement>('#affordable-choice')?.addEventListener('click',()=>{const id=root.querySelector<HTMLElement>('#affordable-choice')!.dataset.choice;const target=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-buy]')).find(b=>b.dataset.buy===id);target?.scrollIntoView({block:'center',behavior:'instant'});target?.focus({preventScroll:true});});
    root.querySelector('#shop-patrol')?.addEventListener('click',()=>brief(selected));
    root.querySelectorAll<HTMLButtonElement>('[data-build-with]').forEach(button=>button.onclick=()=>{
        const id=button.dataset.buildWith as RosterId;
        brief(Math.max(selected,rosterOption(id).level));
        const option=document.querySelector<HTMLButtonElement>(`[data-swap="${id}"]`);
        option?.scrollIntoView({block:'center',behavior:'instant'});option?.focus({preventScroll:true});
        const hint=document.querySelector('#loadout-feedback');if(hint)hint.textContent=`Choose a slot, then tap ${rosterOption(id).name} to add them. Your lineup stays unchanged until you choose.`;
    });
    root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b => b.onclick = () => brief(Number(b.dataset.level)));
    root.querySelector<HTMLButtonElement>('#continue')?.addEventListener('click', () => { if(selected===1&&!save.completed.length){defender='neutrophil';start(1);}else brief(selected); });
    root.querySelector<HTMLButtonElement>('#upgrade')?.addEventListener('click', () => { if (purchaseReinforcement(save)) {
        persist();
        render();
        notify('+1 starting defender unlocked.');
    } });
    root.querySelector<HTMLButtonElement>('#mute')?.addEventListener('click', () => { save.muted = !save.muted; persist(); render(); });
    root.querySelector<HTMLInputElement>('#volume')?.addEventListener('input', e => { save.volume = Number((e.target as HTMLInputElement).value); persist(); });
    root.querySelector<HTMLButtonElement>('#motion')?.addEventListener('click', () => { save.reducedMotion = !save.reducedMotion; persist(); render(); });
    root.querySelector<HTMLButtonElement>('#reach-aid')?.addEventListener('click', () => { save.showReach = !save.showReach; persist(); render(); });
    root.querySelector<HTMLButtonElement>('#tutorial')?.addEventListener('click', () => { save.tutorial = false; persist(); brief(1); });
}
function mapMarkup() { const next = LEVELS[selected - 1]; return `${save.economy.pending?`<div class="saved-reward"><span class="coin-icon">●</span> Last patrol: +${save.economy.pending.total} Coins · saved to your balance.</div>`:''}<section class="hero"><div class="hero-copy"><span class="pill">CHAPTER 01 · THE FIRST DEFENSE</span><h1>A tiny team.<br>A mighty mission.</h1><p>Guide your cells. Meet the microbes.<br>Protect the world within.</p><button id="continue" class="primary">${save.completed.length ? 'Continue patrol' : 'Start your patrol'} <span aria-hidden="true">↗</span></button></div>${sprite(11, 'hero-sprite', 'Your immune cell team')}</section><section><div class="section-heading"><h2>The tissue trail</h2><span>${save.completed.length} / 10 complete</span></div><div class="campaign">${LEVELS.map(l => { const unlocked = isUnlocked(save, l.id), done = save.completed.includes(l.id); return `<button data-level="${l.id}" ${!unlocked ? 'disabled' : ''} class="level-card ${l.id === selected ? 'current' : ''} ${!unlocked ? 'locked' : ''}" aria-label="Level ${l.id}: ${l.name}${!unlocked ? ', locked' : ''}"><span class="level-num">${done ? '✓' : String(l.id).padStart(2, '0')}</span><div><h3>${l.name}</h3><p>${l.subtitle}</p><div class="level-meta">${done ? '★'.repeat(save.stars[l.id] ?? 1) + ' · REPLAY' : unlocked ? '90 SEC · ' + (l.id === next.id ? 'UP NEXT' : 'READY') : '▣ · COMPLETE LEVEL ' + (l.id - 1)}</div>${(save.bestScores[l.id] ?? 0) > 0 ? `<div class="level-best">PERSONAL BEST · ${save.bestScores[l.id]}</div>` : ''}</div></button>`; }).join('')}</div></section><footer class="footer">An arcade journey through biology. Explore the field guide as you go.</footer>`; }
function rightMarkup() { return `<section class="side-card"><h2>Your little defenders</h2><p>Different roles. One remarkable team.</p>${DEFENDERS.map((d, i) => `<div class="roster ${!isUnlocked(save, d.unlockLevel) ? 'locked-row' : ''}">${sprite(i, '', d.name)}<div><b>${d.nickname}</b><small>${d.name} · ${d.role}</small>${isUnlocked(save, d.unlockLevel) ? '<span class="small-tag">READY FOR PATROL</span>' : `<small>Arrives at level ${d.unlockLevel}</small>`}</div></div>`).join('')}</section><section class="side-card"><div class="mini-head">A MOMENT OF BIOLOGY</div><h2>Better, together.</h2><p class="daily-note">Some cells engulf. Others make antibodies that help them find their target. Your best defense is teamwork.</p></section><section class="side-card"><h2>The journey within</h2><div class="progress-track"><div style="width:${save.completed.length * 10}%"></div></div><div class="progress-label"><span>Chapter 01</span><span>${save.completed.length * 10}%</span></div></section>`; }
function affordableMarkup(){
    const available=ROSTER.filter(r=>r.level===1||save.completed.includes(r.level-1));
    const choices=[...available.filter(r=>!save.roster.owned.includes(r.id)).map(r=>({id:'recruit:'+r.id,title:'Meet '+r.name,detail:r.detail})),...available.filter(r=>save.roster.owned.includes(r.id)).map(r=>({id:'upgrade:'+r.id,title:'Upgrade '+r.name,detail:upgradePreview(r.id,save.roster.upgrades[r.id]??0).next})),{id:'capacity',title:'Make room for one more',detail:'+1 starting slot · permanent capacity'}];
    const choice=choices.find(c=>{const cost=price(save,c.id);return cost!==null&&cost>0&&cost<=save.credits;});
    return choice?`<aside class="affordable-choice"><span class="eyebrow">WITHIN REACH · ${price(save,choice.id)} COINS</span><h2>${choice.title}</h2><p>${choice.detail}</p><button id="affordable-choice" data-choice="${choice.id}" class="secondary">See this option ↓</button><small>Your choice — Coins are spent only when you buy.</small></aside>`:'';
}
function squadMarkup() {
    return `<h1 class="screen-title">Build your tiny team</h1><p class="muted">Permanent roster · cells lost on patrol return next time. Gate recruits last for that patrol only.</p>${save.economy.migrationNotice?'<p class="lab">Your old credits are now Coins, converted 1 for 1. All progress and capacity purchases are kept.</p>':''}<div class="coin-balance"><span class="coin-icon">●</span> ${save.credits} Coins</div><p id="shop-feedback" role="status"></p>${affordableMarkup()}<div class="shop-grid">${ROSTER.map(r=>{
        const owned=save.roster.owned.includes(r.id),locked=r.level>1&&!save.completed.includes(r.level-1),lv=save.roster.upgrades[r.id]??0,preview=upgradePreview(r.id,lv);
        const action=(id:string,label:string)=>{const cost=price(save,id);return `<button data-buy="${id}" class="secondary" ${cost===null||locked?'disabled':''}>${cost===null?'Maxed out':label+' · '+cost+' Coins'}${cost!==null&&save.credits<cost?' · need '+(cost-save.credits):''}</button>`;};
        return `<article class="guide-card roster-card">${sprite(r.role==='macrophage'?4:r.role==='plasma'?8:0,'',r.name)}<span class="variant-avatar" style="--variant:#${r.color.toString(16)}">${r.mark}</span><h3>${r.name} <small>${owned?'Owned':'New teammate'}</small></h3><p>${r.detail}</p><small>${r.role==='neutrophil'?'Neutrophil':r.role==='macrophage'?'Macrophage':'Plasma cell'} · ${save.roster.loadout.includes(r.id)?'Equipped':'Not equipped'}</small>${locked?'<p>Available after patrol '+(r.level-1)+'</p>':owned?`<div class="upgrade-preview"><div class="upgrade-pips" aria-label="Upgrade level ${lv} of 2">${[1,2].map(n=>`<span class="${lv>=n?'filled':''}">${lv>=n?'★':'☆'}</span>`).join('')}<small>Level ${lv}/2</small></div><div><small>NOW</small><b>${preview.current}</b></div>${preview.maxed?'<p>Fully upgraded · role tradeoffs still apply.</p>':`<div class="upgrade-next"><small>NEXT ↑</small><b>${preview.next}</b></div>`}</div>${action('upgrade:'+r.id,'Upgrade')}<button class="secondary" data-build-with="${r.id}">Choose ${r.name} for patrol →</button>`:action('recruit:'+r.id,'Recruit permanently')}</article>`;
    }).join('')}<article class="guide-card"><h3>More room for friends</h3><p>Capacity ${12+save.reinforcement}/18. Next purchase: +1 starting slot. In-patrol gates can still grow your squad to 30.</p><button data-buy="capacity" class="secondary" ${save.reinforcement>=6?'disabled':''}>${save.reinforcement>=6?'Maxed out':'Add slot · 60 Coins'}</button></article></div><button id="shop-patrol" class="primary">Build patrol →</button>`;
}
function loadoutMarkup(){
 const deployment=deploymentFor(save.roster,selected);
 return `<div class="loadout"><h3>Your patrol · ${save.roster.loadout.length}/${12+save.reinforcement} slots</h3><div class="composition-summary"><span>♥ ${deployment.catchers} catchers</span><span>Y ${deployment.taggers} tag makers</span></div>${deployment.substitutions?`<p class="deployment-note">This earlier patrol uses Neutrophil in ${deployment.substitutions} slot${deployment.substitutions===1?'':'s'}. Your saved teammates are kept for later patrols.</p>`:''}<div class="formation-options"><button data-formation="catchers" class="secondary">♥ Catch crew<small>All slots catch microbes</small></button>${selected>=5&&save.roster.owned.includes('pluma')?'<button data-formation="teamwork" class="secondary">Y Tag team<small>Two Plumas help your catchers</small></button>':''}</div><p>Choose a quick setup, or tap a slot and swap a teammate. Keep at least 6 catchers.</p><div class="loadout-slots">${deployment.members.map((id,i)=>`<button data-slot="${i}" aria-label="Slot ${i+1}: ${rosterOption(id).name}${id!==save.roster.loadout[i]?', replacing '+rosterOption(save.roster.loadout[i]).name+' for this patrol':''}" aria-pressed="${selectedSlot===i}">${rosterOption(id).mark}<small>${rosterOption(id).name}</small></button>`).join('')}</div><div class="swap-options">${ROSTER.filter(r=>save.roster.owned.includes(r.id)&&r.level<=selected).map(r=>`<button data-swap="${r.id}" aria-pressed="${deployment.members[selectedSlot]===r.id}" class="secondary">${r.mark} ${r.name}</button>`).join('')}</div><p id="loadout-feedback" role="status">${rosterOption(deployment.members[selectedSlot]??'neutro').detail}</p></div>`;
}
function bindLoadout(){
 document.querySelectorAll<HTMLButtonElement>('[data-formation]').forEach(b=>b.onclick=()=>{if(applyFormation(save,selected,b.dataset.formation as 'catchers'|'teamwork')){persist();refreshLoadout();document.querySelector('#loadout-feedback')!.textContent=b.dataset.formation==='teamwork'?'Tag team ready: match the crest so your catchers can grab on.':'Catch crew ready: more engulfers, without antibody support.';}});

 document.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(b=>b.onclick=()=>{selectedSlot=Number(b.dataset.slot);refreshLoadout();});
 document.querySelectorAll<HTMLButtonElement>('[data-swap]').forEach(b=>b.onclick=()=>{const id=b.dataset.swap as RosterId;if(swapMember(save,selectedSlot,id,selected)){persist();refreshLoadout();document.querySelector('#loadout-feedback')!.textContent=`Slot ${selectedSlot+1}: ${rosterOption(id).name} ready. ${rosterOption(id).detail}`;}else document.querySelector('#loadout-feedback')!.textContent='Keep at least 6 catchers for Plasma cell to help.';});
}
function refreshLoadout(){
 const el=document.querySelector('.loadout');if(!el)return;
 const focused=document.activeElement as HTMLElement|null;
 const key=['data-slot','data-swap','data-formation'].find(attr=>el.contains(focused)&&focused?.hasAttribute(attr));
 const value=key?focused?.getAttribute(key):null;
 el.outerHTML=loadoutMarkup();bindLoadout();
 if(key&&value!==null)Array.from(document.querySelectorAll<HTMLButtonElement>(`.loadout [${key}]`)).find(button=>button.getAttribute(key)===value)?.focus({preventScroll:true});
}
function guideMarkup() { return `<article class="guide-card"><h3>Real cells, game specializations</h3><p>Fast and long-reach neutrophils are fictional gameplay specializations, not established biological subtypes. Their speed/reach tradeoffs, upgrades, permanent roster and Coins are game abstractions. Neutrophils and macrophages engulf; plasma cells secrete matching antibodies that help phagocytes. Additional plasma cells share a capped secretion benefit and take slots away from catchers. Coins cannot be bought for real money.</p></article><h1 class="screen-title">The field guide</h1><p class="muted">A few small ideas behind a remarkable defense.</p><div class="guide-grid">${FIELD_GUIDE.map(g => `<article class="guide-card"><h3>${g.title}</h3><p>${g.text}</p></article>`).join('')}<article class="guide-card"><h3>Encounter evidence</h3><p>Meet the microbes: round staphylococcal clusters, paired pneumococci, flagellated rods and budding yeast. Colors are artistic; lab reports describe fictional tested isolates. Clover IgG and Crown IgG are fictional nicknames for two IgG-like antibody binding profiles. Their crests represent epitopes, not clinical antigen names or cross-protection between species.</p>${PATHOGENS.map(p => `<section class="microbe-entry">${microbeSprite(p)}<div><h3>${p.species}</h3><strong>${p.name}</strong><p>${p.morphology}. ${p.habitat}.</p><p>${p.defense}</p><small>${p.clue}</small></div></section>`).join('')}</article><article class="guide-card"><h3>Sources & review</h3><p>Mechanisms checked against DailyMed medicine labels, CDC antibiotic guidance and NCBI immunology references on September 13, 2026. Qualified medical review and human learning evaluation remain outstanding.</p><p><a href="https://www.cdc.gov/antibiotic-use/about/index.html" target="_blank" rel="noreferrer">CDC: antibiotics</a> · <a href="https://www.cdc.gov/candidiasis/treatment/index.html" target="_blank" rel="noreferrer">CDC: Candida</a> · <a href="https://www.cdc.gov/pseudomonas-aeruginosa/about/index.html" target="_blank" rel="noreferrer">CDC: Pseudomonas</a> · <a href="https://www.ncbi.nlm.nih.gov/books/NBK27142/" target="_blank" rel="noreferrer">NCBI: immune defense</a></p></article></div>`; }
function settingsMarkup() { return `<h1 class="screen-title">Make yourself comfortable</h1><p class="muted">Quiet by nature. Adjust the little things.</p><div class="setting"><div><h3>Sound effects</h3><p>Soft, occasional cues. No music.</p></div><button id="mute" class="toggle" aria-pressed="${!save.muted}">${save.muted ? 'Off' : 'On'}</button></div><div class="setting"><div><h3>Volume</h3><p>Kept gentle, even at full volume.</p></div><input id="volume" aria-label="Volume" type="range" min="0" max="1" step="0.05" value="${save.volume}"></div><div class="setting"><div><h3>Reduce motion</h3><p>Pause floating details and camera effects.</p></div><button id="motion" class="toggle" aria-pressed="${save.reducedMotion}">${save.reducedMotion ? 'On' : 'Off'}</button></div><div class="setting"><div><h3>Approach guide</h3><p>Optional faint dots show nearby cells’ acquisition reach. Contact is still required.</p></div><button id="reach-aid" class="toggle" aria-pressed="${save.showReach}">${save.showReach ? 'On' : 'Off'}</button></div><div class="setting"><div><h3>A little refresher</h3><p>Replay the interactive steering tutorial.</p></div><button id="tutorial" class="secondary">Show me</button></div><article class="guide-card" style="margin-top:24px"><h3>Your progress stays here</h3><p class="release-version">Biology Dash · v${__APP_VERSION__}</p><p>Progress and preferences are saved on this device. No account, advertising, or game analytics. Clearing browser data removes your local save.</p></article>`; }
function navigate(to: string) { if (page === 'game') {
    pause();
    return;
} page = to; render(); window.scrollTo(0, 0); }
function modal(content: string, actions: Record<string, () => void>) { document.querySelector('.modal-backdrop')?.remove(); const el = document.createElement('div'); el.className = 'modal-backdrop'; el.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-label="Patrol panel" tabindex="-1">${content}</section>`; document.body.append(el); for (const [id, fn] of Object.entries(actions))
    el.querySelector('#' + id)?.addEventListener('click', fn); el.querySelector<HTMLElement>('button')?.focus(); el.addEventListener('keydown', e => { if (e.key !== 'Tab')
    return; const f = Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),a,input,summary')); if (!f.length)
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
    medicine = id === 4 ? 'doxycycline' : id === 7 ? 'micafungin' : id === 9 ? 'cefepime' : 'amoxicillin';
    if (id === 1) defender = 'neutrophil';
    if (id === 2) defender = 'macrophage';
    modal(`<span class="eyebrow">PATROL ${String(id).padStart(2, '0')} · 90 SECONDS</span><h2>${l.name}</h2><p>${l.objective}</p>${encounterRoster(id)}${id >= 3 ? `<div class="lab"><b>ISOLATE REPORT · ${p.species}</b>${p.clue}<br>Surface marker: ${ANTIBODY_NAMES[p.epitope].marker}</div><p>Choose external support. You can change it during patrol.</p><div class="choice-list">${drugChoices()}</div><div id="choice-feedback" class="selected-label" role="status">${medicineEffect(medicine, p.id).feedback}</div>` : `${sprite(id === 2 ? 1 : 0, 'modal-art', 'Phagocyte')}<div class="lab"><b>YOUR MISSION</b>Drag in any direction. Cells approach and engulf nearby microbes. Cross a gate to recruit cells or widen your reach.</div>`}<div class="patrol-bonuses"><b>Bonus goals</b><span>Finish without casualties · +10 Coins</span>${id>=5?'<span>Engulf a tagged microbe · +10 Coins on victory</span>':''}</div>${loadoutMarkup()}<button id="begin" class="primary">${id === 7 ? 'Visit the selection room' : 'Begin patrol'} →</button><button id="back" class="secondary">Back to map</button>`, { ...drugActions('', m => chooseMedicine(m, p.id)), 'select-neutrophil': () => chooseDefender('neutrophil'), 'select-macrophage': () => chooseDefender('macrophage'), begin: () => { closeModal(); id === 7 ? cloneRoom(() => start(id)) : start(id); }, back: closeModal });
    bindLoadout();
}

function chooseDefender(id: 'neutrophil' | 'macrophage') {
    defender=id;
    for (const kind of ['neutrophil','macrophage']) {
        const button=document.getElementById('select-'+kind);
        button?.classList.toggle('selected',kind===id);
        button?.setAttribute('aria-pressed',String(kind===id));
    }
}

function chooseMedicine(m: MedicineId, pid: typeof PATHOGENS[number]['id']) { medicine = m; for (const id of MEDICINES.map(m => m.id))
    document.getElementById(id)?.classList.toggle('selected', id === m); document.querySelector('#choice-feedback')!.textContent = medicineEffect(m, pid).feedback; }
function cloneRoom(done: () => void) { let chosen = ''; modal(`<span class="eyebrow">LYMPH NODE · GERMINAL CENTER</span><h2>Which clone will thrive?</h2><p>B-cell clones vary. Compare their binding to the Clover crest. Better antigen capture and T-follicular-helper signals favor selection.</p><div class="choice-list">${CLONES.map(c => `<button id="clone-${c.id}" class="choice"><b>${c.name}</b><small>${c.change}</small><div class="progress-track"><div style="width:${c.profile.affinity * 100}%"></div></div></button>`).join('')}</div><p id="clone-feedback" role="status">Not every mutation helps. Select a clone to see its result.</p><div class="lab">Days to weeks are compressed here. B-cell genes vary; secreted antibodies do not learn. Class switching changes effector properties, not binding affinity.</div><button id="select-clone" class="primary" disabled>Continue to encounter</button>`, Object.fromEntries([...CLONES.map(c => ['clone-' + c.id, () => { chosen = c.id; document.querySelectorAll('.choice').forEach(e => e.classList.remove('selected')); document.querySelector('#clone-' + c.id)?.classList.add('selected'); document.querySelector('#clone-feedback')!.textContent = c.id === 'strong' ? 'Stronger binding selected. This clone becomes more represented; matching Clover recall will benefit.' : 'This clone captures less antigen. Compare it with the stronger-binding clone before selection.'; (document.querySelector('#select-clone') as HTMLButtonElement).disabled = c.id !== 'strong'; }]), ['select-clone', () => { if (chosen !== 'strong')
            return; save.antibody = { ...CLONES[2].profile }; save.checks.affinity = true; persist(); closeModal(); done(); }]])); }

function medicineIcon(id: MedicineId) {
    const pause = id === 'doxycycline';
    return `<svg aria-hidden="true" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="9" fill="currentColor" opacity=".18"/><path d="${pause ? 'M12 10v12M20 10v12' : 'M9 10h14v12H9zM18 8l-5 8h7l-5 8'}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function careKit() {
    return `<div class="care-kit"><div id="breach-warning" class="breach-warning" hidden></div><div class="care-cards">${availableMedicines(selected).map(m => `<button data-medicine="${m.id}" aria-label="Select ${m.name}: ${m.action}" aria-pressed="${medicine===m.id}" style="--medicine:#${m.color.toString(16)}">${medicineIcon(m.id)}<b>${m.nickname}</b><small>Ready</small></button>`).join('')}</div><div class="care-actions"><button id="support">Send ${medicineStyle(medicine).nickname}</button>${selected>=5?'<button id="antibody" aria-expanded="false" aria-controls="tag-picker">♣ Clover</button><button id="complement">Grip Boost</button>':''}</div>${selected>=5?'<section id="tag-picker" class="tag-picker" aria-label="Choose antibody tags" hidden><b>Match the microbe’s crest</b><div><button id="equip-a" aria-pressed="true">♣ Clover IgG</button><button id="equip-b" aria-pressed="false">♛ Crown IgG</button></div><small id="tag-hint">New tags follow this choice. Catchers do the engulfing.</small></section>':''}</div>`;
}

function gameMarkup() { return `<section class="game-shell"><header class="game-heading"><div><span class="eyebrow">PATROL ${String(selected).padStart(2, '0')}</span><h1>${LEVELS[selected - 1].name}</h1></div><button id="pause" class="icon-button" aria-label="Pause patrol">Ⅱ</button></header><div class="stage"><div id="game" aria-label="Immune patrol play area. Drag in any direction or use arrows or WASD." role="application"></div><div class="hud"><div class="hud-item"><small id="squad-kind">DEFENDERS</small><strong id="squad-count">12</strong></div><div class="hud-item hud-time"><div class="patrol-progress-title"><small id="patrol-stage">PROTECT THE HOST</small><span id="clock">90s</span></div><div class="timebar" role="progressbar" aria-label="Patrol progress" aria-valuemin="0" aria-valuemax="90" aria-valuenow="0"><div id="time-fill" style="width:0%"></div><span class="finish-crest" aria-hidden="true">✦</span></div><span id="stretch-label">Keep your team together</span></div><div class="hud-item"><small>CLEARED</small><strong id="cleared">0</strong></div></div><div id="colony-status" class="colony-status" hidden><div><b id="colony-name"></b><span id="colony-state"></span></div><div id="colony-health" role="progressbar" aria-label="Colony health" aria-valuemin="0" aria-valuemax="100"><i></i></div><small id="colony-tip"></small></div><div id="ability-status" class="ability-status"></div>${selected===1&&!save.tutorial?'<div id="field-coach" class="field-coach" aria-label="First patrol goals"><span data-goal="move">1 · Steer</span><span data-goal="catch">2 · Engulf</span><span data-goal="gate">3 · Cross a gate</span></div>':''}<div class="combat-feedback" id="feedback" role="status">${selected === 1 ? 'Steer close · watch cells wrap and engulf microbes' : LEVELS[selected - 1].subtitle}</div>${selected >= 3 ? careKit() : '<div class="drag-label">← &nbsp; DRAG ANY DIRECTION · ARROWS / WASD &nbsp; →</div>'}</div></section>`; }
function start(id: number) {
    previousBest=save.bestScores[id]??0;
    runId=crypto.randomUUID();
    save.economy.pending=null;persist();
    page = 'game';
    selected = id;
    lastHud = -1;lastHudPaint=-Infinity;
    tutorialStep = save.tutorial ? 3 : 0;
    nextQuiz = 35;
    nextReminder = 22;
    render();
    const loading=document.createElement('div');loading.id='patrol-loading';loading.className='patrol-loading';loading.setAttribute('role','status');loading.innerHTML='<span aria-hidden="true">✳</span><strong>Gathering tiny heroes…</strong><small>Your patrol will start when everyone is ready.</small>';
    root.querySelector('.stage')!.append(loading);root.querySelector('#game')!.setAttribute('aria-busy','true');
    const bootControls=Array.from(root.querySelectorAll<HTMLButtonElement>('.game-shell button')).map(button=>({button,disabled:button.disabled}));
    bootControls.forEach(({button})=>button.disabled=true);
    game = createGame();
    root.querySelector('#pause')!.addEventListener('click', pause);
    const fire=root.querySelector<HTMLButtonElement>('#support');
    if(fire)bindChargeControl(fire,{
        begin:()=>{if(!patrol || !scene || scene.paused)return false;scene.hooks.gesture();return patrol.beginMedicineCharge();},
        release:()=>{if(scene?.paused)patrol?.cancelMedicineCharge();else patrol?.releaseMedicineCharge();},
        cancel:()=>patrol?.cancelMedicineCharge(),
        tap:()=>{if(scene && !scene.paused)patrol?.useMedicine();}
    });
    root.querySelectorAll<HTMLButtonElement>('[data-medicine]').forEach(b => b.onclick = () => { if (!patrol || scene?.paused) return; patrol.cancelMedicineCharge(); patrol.medicine = b.dataset.medicine as MedicineId; medicine = patrol.medicine; feedback(medicineStyle(medicine).action + ' · ' + medicineName(medicine)); tick(patrol,true); });
    root.querySelector('#antibody')?.addEventListener('click', antibodyPanel);
    root.querySelector('#equip-a')?.addEventListener('click',()=>equipAntibody('A'));
    root.querySelector('#equip-b')?.addEventListener('click',()=>equipAntibody('B'));
    root.querySelector('#complement')?.addEventListener('click', () => patrol?.useComplement());
    const thisGame = game;
    const bootStarted=performance.now();
    const failBoot=()=>{
        loading.setAttribute('role','alert');
        loading.innerHTML='<span aria-hidden="true">☁</span><strong>Your team couldn’t arrive</strong><small>Some game art didn’t load. Check your connection and try again. Your Coins and roster are safe.</small><button id="retry-loading" class="primary">Try again</button><button id="leave-loading" class="secondary">Back to trail</button>';
        root.querySelector('#game')?.setAttribute('aria-busy','false');
        loading.querySelector<HTMLButtonElement>('#retry-loading')!.onclick=()=>{stopGame();start(id);};
        loading.querySelector<HTMLButtonElement>('#leave-loading')!.onclick=()=>{stopGame();page='patrol';render();};
        loading.querySelector<HTMLButtonElement>('#retry-loading')!.focus();
    };
    const boot = () => { if (game !== thisGame || page !== 'game')
        return; scene = game!.scene.getScene('Patrol') as PatrolScene; if(scene?.startupFailed || performance.now()-bootStarted>20000){failBoot();return;} if (!scene || !scene.sys.isActive()) {
        setTimeout(boot, 30);
        return;
    } patrol = new Patrol(id, id * 8917, save.reinforcement); patrol.medicine = medicine; patrol.defender = defender; patrol.antibody = { ...save.antibody }; patrol.loadout=deploymentFor(save.roster,id).members;patrol.upgrades={...save.roster.upgrades};patrol.syncCells(); patrol.learning.affinity = save.checks.affinity === true; scene.showReach = save.showReach; scene.muted = save.muted; scene.volume = save.volume; scene.reducedMotion = save.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches; scene.startPatrol(patrol, { tick, event: feedback, finish, pause, gesture: () => { const audio = scene?.sound as unknown as {
            unlock?: () => void;
        }; audio?.unlock?.(); } }); loading.remove();root.querySelector('#game')?.setAttribute('aria-busy','false');bootControls.forEach(({button,disabled})=>button.disabled=disabled);tick(patrol,true); if (id === 1 && !save.tutorial) feedback('Drag any direction · your cells engulf nearby microbes.'); };
    boot();
}
function feedback(text: string) { const el = document.getElementById('feedback'); if (el)
    el.textContent = text; }
function tick(p: Patrol,force=false) {
    if(p.phase!=='playing'&&!save.economy.settled.includes(runId)){settleRun(save,p,runId);persist();}
    if(!force&&p.phase==='playing'&&p.time>=lastHudPaint&&p.time-lastHudPaint<.1)return;
    lastHudPaint=p.time;
    const warning=document.getElementById('breach-warning');
    if(warning){const text=breachWarning(p);warning.textContent=text;warning.hidden=!text;}
    const colony=p.enemies.find(e=>e.boss&&e.hp>0);
    const panel=document.getElementById('colony-status')!;
    const show=p.phase==='playing' && (p.time>=57 || !!colony);
    panel.hidden=!show;panel.closest('.stage')?.classList.toggle('colony-visible',show);
    if(show){
        const organism=colony?PATHOGENS.find(k=>k.id===colony.kind):null;
        const ratio=colony?Math.max(0,Math.min(100,colony.hp/colony.maxHp*100)):0;
        document.getElementById('colony-name')!.textContent=colony?organism!.nickname+' colony':p.bossSpawned?'Colony cleared!':'Colony approaching';
        document.getElementById('colony-state')!.textContent=colony?Math.ceil(ratio)+'%':p.bossSpawned?'✓':p.time<60?Math.ceil(60-p.time)+'s':'Incoming';
        document.getElementById('colony-tip')!.textContent=colony?'Engulf fragments · use compatible support':p.bossSpawned?'Keep the host safe until the bar fills.':'Gather your catchers. Get ready!';
        const bar=document.getElementById('colony-health')!;bar.hidden=!colony;bar.setAttribute('aria-valuenow',String(Math.ceil(ratio)));(bar.firstElementChild as HTMLElement).style.width=ratio+'%';
        panel.classList.toggle('colony-cleared',!colony&&p.bossSpawned);
    }
    const kind=document.getElementById('squad-kind');
    if(kind) kind.textContent='YOUR PATROL';
    const ability=document.getElementById('ability-status');
    if(ability) ability.textContent=[p.tempoRemaining>0?'Rapid response '+Math.ceil(p.tempoRemaining)+'s':'',p.shieldRemaining>0?'Rescue shield '+Math.ceil(p.shieldRemaining)+'s':'',p.complementRemaining>0?'C3 opsonins '+Math.ceil(p.complementRemaining)+'s':''].filter(Boolean).join(' · ');

    const sec = Math.max(0, Math.ceil(90 - p.time));
    const progress = document.querySelector<HTMLElement>('#time-fill');
    if (progress) progress.style.width = `${Math.min(100,p.time / 90 * 100)}%`;
    document.querySelector('.hud-time')?.classList.toggle('final-stretch', sec <= 15); 
    if (sec !== lastHud) {
        lastHud = sec;
        document.querySelector('#clock')!.textContent = `${sec}s`;
        document.querySelector('.timebar')?.setAttribute('aria-valuenow',String(Math.min(90,Math.floor(p.time))));
        document.querySelector('.timebar')?.setAttribute('aria-valuetext',`${sec} seconds remaining`);
        document.querySelector('#patrol-stage')!.textContent = sec === 0 ? 'PATROL COMPLETE' : sec <= 15 ? 'FINAL STRETCH' : 'PROTECT THE HOST';
        document.querySelector('#stretch-label')!.textContent = sec === 0 ? 'Time defended!' : sec <= 15 ? (p.enemies.some(e=>e.boss) ? 'Clear the colony to finish!' : 'Hold on — almost home!') : sec <= 30 ? 'Bring it home, tiny heroes' : 'Keep your team together';
    }
    document.querySelector('#squad-count')!.textContent = String(p.squad);
    document.querySelector('#cleared')!.textContent = String(p.kills);
    const b = document.querySelector<HTMLButtonElement>('#support');
    if (b) {
        b.textContent = p.chargingMedicine ? (p.medicineCharge>=1?'FULL · RELEASE!':'Charging '+Math.round(p.medicineCharge*100)+'% · Release') : p.medicineCooldown>0?'Recharging · '+Math.ceil(p.medicineCooldown)+'s':'Hold / release · '+medicineStyle(p.medicine).nickname;
        b.disabled = p.medicineCooldown > 0 || (!p.enemies.length && !p.chargingMedicine);
        b.classList.toggle('charging',p.chargingMedicine);
        b.setAttribute('aria-label',p.chargingMedicine?b.textContent:'Hold to charge and release to fire '+medicineStyle(p.medicine).nickname);
        b.style.setProperty('--charge', `${100 * (p.chargingMedicine?p.medicineCharge:1-p.medicineCooldown/p.medicineCooldownTotal)}%`);
        root.querySelectorAll<HTMLButtonElement>('[data-medicine]').forEach(card => {
            const id = card.dataset.medicine as MedicineId;
            card.setAttribute('aria-pressed', String(id === p.medicine));
            const count = p.enemies.filter(e => e.hp > 0 && medicineEffect(id,e.kind).effective).length;
            card.querySelector('small')!.textContent = p.enemies.length ? (count ? count + ' can help' : 'No match') : 'Ready';
        });
    }
    const complement = document.querySelector<HTMLButtonElement>('#complement');
    if (complement) { complement.disabled = p.complementCooldown > 0; complement.textContent = 'Grip Boost' + (p.complementCooldown > 0 ? ' · ' + Math.ceil(p.complementCooldown) + 's' : ''); }
    const a = document.querySelector('#antibody');
    if (a)
        a.textContent = ANTIBODY_NAMES[p.antibody.epitope].glyph + ' ' + ANTIBODY_NAMES[p.antibody.epitope].short;
    if (selected === 1 && tutorialStep === 0 && (Math.abs(p.x - 210) > 45 || Math.abs(p.y - 635) > 45)) {
        tutorialStep = 1;
        feedback('Nice steering. Bring your cells close enough to approach the cluster.');
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
    const coach=document.getElementById('field-coach');
    if(coach){
        const done=[tutorialStep>=1,p.kills>0,p.learning.gate];
        Array.from(coach.children).forEach((item,index)=>{
            item.classList.toggle('done',done[index]);
            item.setAttribute('aria-label',(['Steer','Engulf a microbe','Cross a gate'][index])+(done[index]?' complete':' incomplete'));
        });
        if(tutorialStep===3)coach.hidden=true;
    }
    if (p.time >= nextReminder) {
        nextReminder = 999;
        if (selected >= 5)
            feedback('Spot a Clover or Crown crest. Tap your tag name to choose its match.');
        else if (selected >= 3)
            feedback('Hold support to charge. Release to fire. A quick tap also works.');
    }
    if (p.time >= nextQuiz) {
        nextQuiz = 999;
        if (selected >= 3)
            encounterDecision();
    }
}
function encounterDecision() {
    if (!patrol) return;
    feedback(selected >= 5 ? 'Match Clover or Crown crests. Your care kit stays live while you steer.' : 'Choose a care card. Hold to charge, release to fire. Look for wall cracks or a growth-pause mark.');
}
function antibodyPanel() {
    if(!scene||!patrol||scene.paused||patrol.phase!=='playing')return;
    scene.cancelControls();
    const picker=document.getElementById('tag-picker')!;
    picker.hidden=!picker.hidden;
    document.getElementById('antibody')!.setAttribute('aria-expanded',String(!picker.hidden));
    document.getElementById('tag-hint')!.textContent=patrol.plasma?'New tags follow this choice. Catchers do the engulfing.':'No Plasma cell in this squad. Add her before a future patrol to make tags.';
    for(const [id,profile] of [['equip-a','A'],['equip-b','B']])document.getElementById(id)!.setAttribute('aria-pressed',String(patrol.antibody.epitope===profile));
}
function equipAntibody(epitope:'A'|'B') {
    if(!patrol||!scene||scene.paused||patrol.phase!=='playing')return;
    patrol.antibody={epitope,affinity:epitope==='A'?save.antibody.affinity:.45,effector:'opsonization'};
    document.getElementById('tag-picker')!.hidden=true;
    document.getElementById('antibody')!.setAttribute('aria-expanded','false');
    feedback(`${antibodyName(epitope)} selected for new tags. Match the crest!`);tick(patrol,true);
}
function pause() { if (!scene || !patrol || patrol.phase !== 'playing' || document.querySelector('.modal-backdrop'))
    return; scene.paused = true; scene.cancelControls(); modal(`<span class="eyebrow">TAKE A BREATHER</span><h2>Patrol paused</h2><p>Your team will wait here. Come back when you’re ready.</p><div class="pause-snapshot" aria-label="Patrol status"><span><strong>${Math.max(0, Math.ceil(90-patrol.time))}s</strong> left to defend</span><span><strong>${patrol.squad}</strong> defenders together</span></div><button id="resume" class="primary">Resume patrol</button><button id="pause-sound" class="secondary" aria-pressed="${!save.muted}">Sound: ${save.muted?'Off':'On'}</button><button id="restart" class="secondary">Restart level</button><button id="leave" class="secondary">Return to map</button>`, { 'pause-sound': () => { save.muted=!save.muted;scene!.muted=save.muted;if(save.muted)scene!.sound.stopAll();persist();const button=document.querySelector<HTMLButtonElement>('#pause-sound')!;button.textContent=save.muted?'Sound: Off':'Sound: On';button.setAttribute('aria-pressed',String(!save.muted)); }, resume: () => { closeModal(); scene!.paused = false; }, restart: () => { stopGame(); start(selected); }, leave: () => { stopGame(); page = 'patrol'; render(); } }); }
function stopGame() { closeModal(); scene?.sound.stopAll(); game?.destroy(true); game = null; scene = null; patrol = null; }
function finish(p: Patrol) { settleRun(save,p,runId);persist(); const reward=save.economy.pending; const won = p.phase === 'victory'; const newBest = won && p.score > previousBest; if (won) {
    settleRun(save,p,runId);
    persist();
} const id = selected; modal(`<div class="result-content">${sprite(won ? 11 : 1, 'modal-art', won ? 'Immune team' : 'Macrophage')}<span class="eyebrow">${won ? 'TISSUE PROTECTED' : 'A CHANCE TO REGROUP'}</span><h2>${won ? 'Host protected!' : 'Let’s regroup.'}</h2><p class="result-summary">${won ? '90 seconds defended · '+p.squad+' tiny heroes home' : 'Your next patrol is a fresh start.'}</p>${won ? `<div class="stars">${'★'.repeat(save.stars[id])}</div>` : ''}<details class="patrol-notes"><summary>${won?'Your teamwork lesson':'Tips for your next try'}</summary><p>${won ? LEVELS[id - 1].feedback : 'Steer close to microbes. Recruit at gates, and check which medicine fits. Your purchased teammates return for the next patrol.'}</p></details>${won ? `<div class="patrol-awards">${newBest ? '<span>✧ New personal best</span>' : ''}${p.casualties === 0 ? '<span>✦ Flawless defense</span>' : ''}</div>` : ''}${reward?`<section class="reward-card"><h3><span class="coin-icon">●</span> You earned ${reward.total} Coins!</h3><p>Balance: ${save.credits} Coins</p><details class="coin-receipt"><summary>See your Coin breakdown</summary>${reward.lines.map(l=>`<div><span>${l.label}</span><b>+${l.coins}</b></div>`).join('')}</details></section>`:''}<div class="result-stats"><div><strong>${p.kills}</strong><small>cleared</small></div><div><strong>${p.squad}</strong><small>defenders</small></div><div><strong>${p.score}</strong><small>score</small></div></div></div><div class="result-actions">${won&&id<10?`<div class="next-discovery"><small>UP NEXT · PATROL ${id+1}</small><b>${LEVELS[id].subtitle}</b></div>`:''}<button id="next" class="primary">${won && id < 10 ? 'Next patrol →' : 'Replay patrol'}</button><button id="reward-shop" class="secondary">Recruit & upgrade · ${save.credits} Coins</button><button id="result-map" class="result-map">Back to the trail</button></div>`, { 'reward-shop':()=>{stopGame();page='squad';render();}, next: () => { stopGame(); if (won && id < 10) {
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
        scene?.cancelControls();
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

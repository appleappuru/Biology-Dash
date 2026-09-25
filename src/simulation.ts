import {rosterOption,upgradeEffect,type RosterId} from './roster';
import { cellOffset } from './formation';
import { LEVELS, PATHOGENS, medicineName, medicineEffect, antibodyMatch, type PathogenId, type MedicineId, type AntibodyProfile, type DefenderId } from './content';
export const RULES_VERSION = 4;
export const BALANCE = { maxEnemies: 32, maxSquad: 30, contactY: 640, breachY: 710, invulnerability: 1.15 };
export const CONTACT_DISTANCE = 25;
// Arcade charge tuning, never a medication dose or clinical potency model.
export const MEDICINE_CHARGE_SECONDS = 1.5;
export interface CellActor {
    id: number; slot: number; captures?: number; spent?: boolean; x: number; y: number; role: DefenderId; variant?: RosterId;
    phase: 'idle' | 'approach' | 'wrap' | 'digest' | 'return';
    progress: number; duration: number; cooldown: number; targetId?: number; digestKind?: PathogenId;
}
export interface AntibodyParticle {
    id: number; sourceId: number; targetId: number; x: number; y: number; startX: number; startY: number;
    age: number; duration: number; profile: AntibodyProfile; phase: 'diffuse' | 'bound' | 'miss';
}
export interface Enemy {
    id: number;
    kind: PathogenId;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    claimedBy?: number;
    lastCause?: 'phagocytosis' | 'defensin' | MedicineId;
    lastCellId?: number;
    medicineReaction?: { id: MedicineId; until: number; effective: boolean; effect: 'kill' | 'inhibit' | 'none' };
    exposure?: {id: MedicineId; remaining: number; rate: number};
    tagged: boolean;
    complementTagged?: boolean;
    tagAffinity?: number;
    inhibited: boolean;
    boss: boolean;
}
export interface GateOption {
    id: string; label: string; detail: string;
    kind: 'recruit' | 'coverage' | 'tempo' | 'shield' | 'risk';
    value: number; cost?: number;
}
const GATE_CYCLE: Array<{left: GateOption; right: GateOption}> = [
    {left:{id:'recruit',label:'+4 cells',detail:'Arriving defenders join your squad.',kind:'recruit',value:4},right:{id:'reach',label:'+18 reach',detail:'Increase individual cells’ approach reach.',kind:'coverage',value:18}},
    {left:{id:'reinforce',label:'+6 cells',detail:'Recruit six arriving defenders.',kind:'recruit',value:6},right:{id:'tempo',label:'Rapid response',detail:'Faster engulfment for 12 seconds.',kind:'tempo',value:12}},
    {left:{id:'risk',label:'−3 cells · +36 reach',detail:'Send three defenders to nearby tissue; extend coverage.',kind:'risk',value:36,cost:3},right:{id:'shield',label:'Rescue shield',detail:'Protect your squad from casualties for 8 seconds.',kind:'shield',value:8}},
    {left:{id:'surge',label:'+8 cells',detail:'A surge of arriving defenders joins the patrol.',kind:'recruit',value:8},right:{id:'tradeoff',label:'−2 cells · +28 reach',detail:'Send two defenders to nearby tissue; extend coverage.',kind:'coverage',value:28,cost:2}},
];
export interface Gate {
    id: number;
    y: number;
    used: boolean;
    layout?: 'pair' | 'left' | 'right';
    passed?: boolean;
    left?: GateOption;
    right?: GateOption;
}
export interface PatrolEvent {
    type: 'peptide' | 'retire' | 'summon' | 'engulf' | 'loss' | 'gate' | 'medicine' | 'tag' | 'boss' | 'win' | 'hit' | 'death' | 'recruit' | 'complement' | 'contact';
    text: string;
    label?: string;
    enemyId?: number;
    cellId?: number;
    assistance?: 'antibody' | 'complement' | 'both';
    cause?: 'phagocytosis' | 'defensin' | MedicineId;
    squad?: number;
    amount?: number;
    charge?: number;
    x?: number;
    y?: number;
}
export interface Learning {
    medicine: boolean;
    cooperation: boolean;
    match: boolean;
    mismatch: boolean;
    affinity: boolean;
    recall: boolean;
    gate: boolean;
}
export class Patrol {
    loadout: RosterId[] = [];
    upgrades: Partial<Record<RosterId,number>> = {};
    level: number;
    seed: number;
    time = 0;
    x = 210;
    y = 635;
    tempoRemaining = 0;
    shieldRemaining = 0;
    complementRemaining = 0;
    complementCooldown = 0;
    squad = 12;
    kills = 0;
    casualties = 0;
    score = 0;
    coverage = 52;
    enemies: Enemy[] = [];
    cells: CellActor[] = [];
    antibodies: AntibodyParticle[] = [];
    antibodyId = 0;
    nextAntibody = 0;
    gates: Gate[] = [];
    events: PatrolEvent[] = [];
    phase: 'playing' | 'victory' | 'defeat' = 'playing';
    medicine: MedicineId = 'amoxicillin';
    defender: Exclude<DefenderId, 'plasma'> = 'neutrophil';
    antibody: AntibodyProfile = { epitope: 'A', affinity: .45, effector: 'opsonization' };
    plasma = false;
    bossSpawned = false;
    protection = 0;
    nextSpawn = 2;
    nextGate = 10;
    wavesSpawned = 0;
    spentCells = 0;
    nextCellId = 0;
    nextDefensin = 6;
    defensins: {id:number; targetId:number; x:number; y:number; age:number}[] = [];
    get duration(){return LEVELS[this.level-1].duration;}
    get visibleTargets(){return this.enemies.filter(e=>e.hp>0&&e.y>100&&e.y<680);}
    activeMedicine:MedicineId='amoxicillin';
    medicineActive = 0;
    medicineCooldown = 0;
    medicineCooldownTotal = 12;
    medicineCharge = 0;
    chargingMedicine = false;
    beginMedicineCharge() {
        if(this.chargingMedicine || this.phase!=='playing' || !this.supportReady)return false;
        this.chargingMedicine=true;this.medicineCharge=0;return true;
    }
    cancelMedicineCharge() { this.chargingMedicine=false;this.medicineCharge=0; }
    releaseMedicineCharge() {
        if(!this.chargingMedicine)return false;
        const charge=this.medicineCharge;this.cancelMedicineCharge();return this.useSupport(charge);
    }
    get supportReady() {
        return this.phase==='playing' && this.medicineCooldown<=0 && this.visibleTargets.length>0 && (this.level!==1 || this.spentCells>0 || this.time>6);
    }
    useSupport(charge = 0) { return this.useMedicine(charge); }
    id = 0;
    gateIndex = 0;
    learning: Learning = { medicine: false, cooperation: false, match: false, mismatch: false, affinity: false, recall: false, gate: false };
    constructor(level: number, seed = level * 8917, strength = 0) { this.level = Math.max(1, Math.min(10, level)); this.seed = seed >>> 0; if(this.level===1)this.nextGate=4; this.squad = this.level===1?1:Math.min(18, 12 + strength);if(this.level===1){this.y=550;this.nextSpawn=.5;} this.syncCells(); }
    random() { this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0; return this.seed / 4294967296; }
    move(x: number, y = this.y) {
        const previousX = this.x, previousY = this.y;
        if (Number.isFinite(x)) this.x = Math.max(82, Math.min(338, x));
        if (Number.isFinite(y)) this.y = Math.max(460, Math.min(635, y));
        for (const c of this.cells) if (c.phase === 'idle' || c.phase === 'return') { c.x += this.x - previousX; c.y += this.y - previousY; }
    }
    spawn(kind?: PathogenId, boss = false) { if (this.enemies.length >= BALANCE.maxEnemies)
        return; const level = LEVELS[this.level - 1]; const k = kind ?? level.pathogens[Math.floor(this.random() * level.pathogens.length)]; const p = PATHOGENS.find(v => v.id === k)!; const hp = boss ? 105 + this.level * 3 : p.hp; this.enemies.push({ id: ++this.id, kind: k, x: boss ? 210 : 60 + this.random() * 300, y: -45, hp, maxHp: hp, tagged: false, inhibited: false, boss }); }
    spawnCluster(opening = false) {
        const level = LEVELS[this.level - 1];
        const kind = level.pathogens[Math.floor(this.random() * level.pathogens.length)];
        const count = this.level===1 ? (opening?1:3) : this.level < 4 ? 2 : 2 + Math.floor(this.random() * 2);
        const cx = opening ? 210 : 100 + this.random() * 220;
        const rotation = this.random() * Math.PI * 2;
        for (let i = 0; i < count && this.enemies.length < BALANCE.maxEnemies; i++) {
            this.spawn(kind);
            const e = this.enemies[this.enemies.length - 1];
            const angle = rotation + i * 2.4;
            e.x = cx + Math.cos(angle) * (17 + this.random() * 22);
            if(opening)e.x=210;
            e.y = (this.level===1 ? (opening?480:280) : -55) - i * 24 - this.random() * 15;
        }
        return count;
    }
    useComplement() {
        if (this.level < 5 || this.complementCooldown > 0 || this.phase !== 'playing') return false;
        this.complementRemaining = 8;
        this.complementCooldown = 18;
        this.events.push({ type: 'complement', text: 'C3 opsonins · easier phagocyte uptake for 8s' });
        return true;
    }
    lose(reason: string) {
        if (this.protection > 0 || this.shieldRemaining > 0 || this.phase !== 'playing') return;
        this.squad = Math.max(0, this.squad - 1);
        this.casualties++;
        this.protection = BALANCE.invulnerability;
        this.events.push({type:'loss',text:reason,x:this.x,y:this.y,squad:this.squad,amount:-1});
        if (this.squad === 0) this.phase = 'defeat';
    }
    gateOptions(gate: Gate): {left: GateOption; right: GateOption} {
        return {left:gate.left ?? GATE_CYCLE[0].left, right:gate.right ?? GATE_CYCLE[0].right};
    }
    applyGate(gate: Gate, choice: 'left' | 'right' | 'recruit' | 'coverage') {
        if (gate.used || gate.passed || this.phase !== 'playing') return false;
        const side = choice === 'recruit' ? 'left' : choice === 'coverage' ? 'right' : choice;
        if (gate.layout && gate.layout !== 'pair' && gate.layout !== side) return false;
        const options = this.gateOptions(gate);
        const option = choice === 'left' || choice === 'right' ? options[choice] : GATE_CYCLE[0][choice === 'recruit' ? 'left' : 'right'];
        gate.used = true;
        this.learning.gate = true;
        const before = this.squad;
        this.squad = Math.max(0, this.squad - (option.cost ?? 0));
        if (option.kind === 'recruit') this.squad = Math.min(BALANCE.maxSquad, this.squad + option.value);
        if (option.kind === 'coverage' || option.kind === 'risk') this.coverage = Math.min(115, this.coverage + option.value);
        if (option.kind === 'tempo') this.tempoRemaining = Math.max(this.tempoRemaining, option.value);
        if (option.kind === 'shield') this.shieldRemaining = Math.max(this.shieldRemaining, option.value);
        const recruited=this.squad-before;
        const gateLabel=option.kind==='recruit'?(recruited>0?'+'+recruited+' '+(recruited===1?'cell':'cells'):'Squad full · 30 cells'):option.label;
        this.events.push({type:'gate',text:option.kind==='recruit'?gateLabel:option.detail,label:gateLabel,x:this.x,y:this.y,squad:this.squad});
        if (this.squad !== before) this.events.push({type:this.squad > before ? 'recruit' : 'loss',text:gateLabel,x:this.x,y:this.y,squad:this.squad,amount:this.squad-before});
        if (this.squad === 0) this.phase = 'defeat';
        return true;
    }
    damage(enemy: Enemy, amount: number, cause: 'phagocytosis' | 'defensin' | MedicineId, cellId?: number) {
        if (enemy.hp <= 0) return;
        enemy.hp -= amount; enemy.lastCause = cause; enemy.lastCellId = cellId;
        this.events.push({type:'hit',text:'',x:enemy.x,y:enemy.y,enemyId:enemy.id,amount,cause,cellId});
    }
    useMedicine(charge = 0) { if (this.medicineCooldown > 0 || this.phase !== 'playing' || !this.visibleTargets.length)
        return false;
        charge=Number.isFinite(charge)?Math.max(0,Math.min(1,charge)):0;
        this.cancelMedicineCharge();
        // Charged exposure lasts longer; suppression remains nonlethal.
        // Durations and rates are arcade abstractions, never clinical doses.
        const duration=3+3*charge;
        this.activeMedicine=this.medicine;
        this.medicineActive=duration;
        this.medicineCooldownTotal=duration+3;
        this.medicineCooldown = this.medicineCooldownTotal; let success = false; let affected=0, resistant=0, noTarget=0; for (const e of this.visibleTargets) {
        const effect = medicineEffect(this.medicine, e.kind);
        if(effect.effective)affected++;else if(PATHOGENS.find(p=>p.id===e.kind)?.susceptibility[this.medicine]==='not-targeted')noTarget++;else resistant++;
        e.medicineReaction = { id: this.medicine, until: this.time + duration, effective: effect.effective, effect: effect.effect };
        if (effect.effective) {
            success = true;
            e.exposure={id:this.medicine,remaining:duration,rate:effect.effect==='kill'?10:0};
            if(effect.effect==='inhibit')e.inhibited=true;
        }
    } this.learning.medicine ||= success; this.events.push({ type: 'medicine', charge, cause: this.medicine, text: `${medicineName(this.medicine)} · ${affected} ${this.medicine==='doxycycline'?'growth paused':'wall stress'}${resistant?' · '+resistant+' resistant':''}${noTarget?' · '+noTarget+' no target':''}` }); return true; }
    syncCells() {
        for (const c of this.cells.slice(this.squad)) {
            const target = this.enemies.find(e => e.id === c.targetId);
            if (target?.claimedBy === c.id) target.claimedBy = undefined;
        }
        this.cells.length = Math.min(this.cells.length, this.squad);
        while (this.cells.length < this.squad) {
            const i = this.cells.length, o = cellOffset(i);
            this.cells.push({ id: ++this.nextCellId, slot:i, x: this.x + o.x + (this.time>0 ? (i%2?38:-38) : 0), y: this.y + o.y + (this.time>0?20:0), phase: 'idle', progress: 0, duration: 1, cooldown: .4 + i * .043, role: this.defender });
        }
        this.cells.forEach((c,i)=>{if(this.loadout.length){c.variant=this.loadout[c.slot%this.loadout.length];c.role=rosterOption(c.variant).role;}else c.role=this.plasma&&i===this.squad-1?'plasma':this.defender;});
        if(this.loadout.length)this.plasma=this.cells.some(c=>c.role==='plasma');
    }
    cellHome(c: CellActor) {
        const o = cellOffset(this.cells.indexOf(c));
        if(this.level===1){o.x*=1.8;o.y*=1.8;}
        return { x: Math.max(20, Math.min(400, this.x + o.x)), y: this.y + o.y };
    }
    release(c: CellActor) {
        const e = this.enemies.find(e => e.id === c.targetId);
        if (e?.claimedBy === c.id) e.claimedBy = undefined;
        c.targetId = undefined; c.phase = 'return'; c.progress = 0; c.cooldown = .18 + (c.id % 4) * .06;
    }
    moveCell(c: CellActor, x: number, y: number, speed: number, dt: number) {
        const dx = x - c.x, dy = y - c.y, d = Math.hypot(dx, dy);
        if (d) { const k = Math.min(1, speed * dt / d); c.x += dx * k; c.y += dy * k; }
    }
    stepCells(dt: number) {
        this.syncCells();
        for (const c of this.cells) {
            const home = this.cellHome(c);
            const effect=upgradeEffect(c.variant??'neutro',this.upgrades[c.variant??'neutro']??0);
            const reach=this.reach*(c.variant==='scout'?1.25:c.variant==='zip'?.82:1)+effect.reachBonus;
            c.cooldown = Math.max(0, c.cooldown - dt);
            const target = this.enemies.find(e => e.id === c.targetId && e.hp > 0);
            if ((c.phase === 'approach' || c.phase === 'wrap') && (!target || c.role === 'plasma' || Math.hypot(target.x - home.x, target.y - home.y) > reach + 45)) this.release(c);
            if (c.phase === 'idle' || c.phase === 'return') {
                this.moveCell(c, home.x, home.y, 310, dt);
                if (c.role === 'plasma' || c.cooldown > 0) continue;
                // Reserve one defender per target, choosing the nearest available defender below.
                const candidate = this.enemies.filter(e => e.hp > 0 && e.claimedBy === undefined && e.y < BALANCE.breachY && Math.hypot(e.x - c.x, e.y - c.y) <= reach)
                    .sort((a,b) => Math.hypot(a.x-c.x,a.y-c.y) - Math.hypot(b.x-c.x,b.y-c.y))[0];
                if (candidate) {
                    const nearer = this.cells.some(other => other.id !== c.id && other.role !== 'plasma' && (other.phase === 'idle' || other.phase === 'return') && other.cooldown === 0 && Math.hypot(candidate.x-other.x,candidate.y-other.y) <= this.reach*(other.variant==='scout'?1.25:other.variant==='zip'?.82:1)+(other.variant==='scout'?(this.upgrades.scout??0)*6:0) && Math.hypot(candidate.x-other.x,candidate.y-other.y) + .1 < Math.hypot(candidate.x-c.x,candidate.y-c.y));
                    if (!nearer) { c.targetId = candidate.id; candidate.claimedBy = c.id; c.phase = 'approach'; c.progress = 0; }
                }
            }
            if (c.phase === 'approach' && target) {
                const distance = Math.hypot(target.x - c.x, target.y - c.y);
                if (distance > CONTACT_DISTANCE) this.moveCell(c, target.x, target.y, c.role === 'macrophage' ? 148 : c.variant==='zip'?234*effect.approachFactor:180, dt);
                if (Math.hypot(target.x-c.x,target.y-c.y) <= CONTACT_DISTANCE) {
                    c.phase = 'wrap'; c.progress = 0;
                    const organism = PATHOGENS.find(p => p.id === target.kind)!;
                    const capsule = organism.capsule && !target.tagged && !target.complementTagged ? 1.85 : 1;
                    const help = (target.tagged ? 1 + (target.tagAffinity ?? .45) * .55 : 1) * (target.complementTagged ? 1.2 : 1);
                    c.duration = (c.role === 'macrophage' ? 1.12 : .88) * (c.variant==='scout'?1.2:1) * (target.tagged?effect.taggedWrapFactor:1) * capsule / help * (this.tempoRemaining > 0 ? .7 : 1) * (target.boss ? 1 : Math.max(.65, target.hp / target.maxHp));
                    this.events.push({type:'contact',text:'',enemyId:target.id,cellId:c.id,x:target.x,y:target.y});
                }
            }
            if (c.phase === 'wrap' && target) {
                // Microbe is physically held. No damage can occur before this contact stage.
                if (Math.hypot(target.x-c.x,target.y-c.y) > CONTACT_DISTANCE + 2) { this.release(c); continue; }
                c.progress = Math.min(1, c.progress + dt / c.duration);
                if (c.progress >= 1) {
                    const amount = target.boss ? (c.role === 'macrophage' ? 36 : 29) * (target.tagged ? 1 + (target.tagAffinity ?? .45) : 1) * (target.complementTagged ? 1.25 : 1) : target.hp;
                    this.damage(target, amount, 'phagocytosis', c.id);
                    c.digestKind = target.kind;
                    c.phase = 'digest'; c.progress = 0; c.duration = c.role === 'macrophage' ? .85 : .65*effect.recoveryFactor;
                    if (target.tagged || target.complementTagged) this.learning.cooperation = true;
                    this.events.push({type:'engulf',assistance:target.tagged?(target.complementTagged?'both':'antibody'):target.complementTagged?'complement':undefined,text:target.boss ? 'Colony fragment engulfed' : 'Microbe enclosed in a phagosome',enemyId:target.id,cellId:c.id,x:target.x,y:target.y});
                    target.claimedBy = undefined; c.targetId = undefined;
                }
            } else if (c.phase === 'digest') {
                c.progress = Math.min(1,c.progress + dt / c.duration);
                this.moveCell(c, home.x, home.y, 125, dt);
                if (c.progress >= 1) { c.digestKind = undefined;c.captures=(c.captures??0)+1;const capacity=1+(c.variant==='neutro'?Math.min(2,this.upgrades.neutro??0):0);if(c.captures<capacity){this.release(c);}else{c.spent=true;this.spentCells++;this.events.push({type:'retire',text:'Cell used · bring fresh defenders',cellId:c.id,x:c.x,y:c.y});} }
            }
        }
        const retired=this.cells.filter(c=>c.spent).length;
        this.cells=this.cells.filter(c=>!c.spent);this.squad=Math.max(0,this.squad-retired);
        // Gentle separation avoids idle sprites piling up while leaving contact geometry intact.
        for (let i=0;i<this.cells.length;i++) for (let j=i+1;j<this.cells.length;j++) {
            const a=this.cells[i], b=this.cells[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
            if (d > .01 && d < 19) {
                const push = Math.min((19-d)*.5,dt*24);
                if (a.phase === 'idle' || a.phase === 'return') {a.x+=dx/d*push;a.y+=dy/d*push;}
                if (b.phase === 'idle' || b.phase === 'return') {b.x-=dx/d*push;b.y-=dy/d*push;}
            }
        }
    }
    get reach() { return 92 + Math.max(0,this.coverage - 52) * .55; }
    tag() {
        if (!this.plasma || this.time < this.nextAntibody) return;
        this.syncCells();
        const sources=this.cells.filter(c=>c.role==='plasma');
        const source=sources[this.antibodyId % Math.max(1,sources.length)];
        if (!source) return;
        this.nextAntibody = this.time + .65 / Math.min(2,Math.sqrt(sources.length)) * upgradeEffect('pluma',this.upgrades.pluma??0).secretionFactor;
        const target = this.enemies.filter(e => !e.tagged && e.hp > 0 && e.y > 100 && e.y < 675 && !this.antibodies.some(a => a.targetId === e.id))
            .sort((a,b) => b.y - a.y)[0];
        if (!target || this.antibodies.length >= 10) return;
        this.antibodies.push({ id: ++this.antibodyId, sourceId:source.id, targetId:target.id, x:source.x, y:source.y, startX:source.x, startY:source.y, age:0, duration:1.5 + (target.id % 3)*.25, profile:{...this.antibody}, phase:'diffuse' });
    }
    stepAntibodies(dt: number) {
        this.tag();
        for (const a of this.antibodies) {
            a.age += dt;
            const target=this.enemies.find(e => e.id === a.targetId && e.hp > 0);
            if (!target) { a.phase='miss'; continue; }
            if (a.phase === 'diffuse') {
                const t=Math.min(1,a.age/a.duration), ease=t*t*(3-2*t);
                // Curved, slow diffusion is a teaching compression, never a damage projectile.
                const sway=Math.sin(t*Math.PI*3+a.id)*Math.sin(t*Math.PI)*24;
                a.x=a.startX+(target.x-a.startX)*ease+sway;
                a.y=a.startY+(target.y-a.startY)*ease+Math.sin(t*Math.PI*2)*12;
                if (t >= 1) {
                    const match=antibodyMatch(a.profile,target.kind);
                    if (match) {
                        target.tagged=true;target.tagAffinity=a.profile.affinity;
                        this.learning.match=true;
                        if(this.level>=8 && a.profile.affinity>=.9 && a.profile.epitope==='A')this.learning.recall=true;
                        this.events.push({type:'tag',text:'',enemyId:target.id,cellId:a.sourceId,x:target.x,y:target.y});
                        a.phase='bound';
                    } else {this.learning.mismatch=true;a.phase='miss';}
                    a.age=0;
                }
            } else if(a.phase==='miss') {a.x+=dt*18;a.y-=dt*9;}
        }
        this.antibodies=this.antibodies.filter(a => a.phase==='diffuse' ? a.age<a.duration+.1 : a.phase==='miss' && a.age<.65);
    }
    stepDefensins(dt:number){
        if(this.level<2)return;
        if(this.time>=this.nextDefensin){
            const target=this.visibleTargets.sort((a,b)=>b.y-a.y)[0];
            if(target){if(this.nextDefensin===6)this.events.push({type:'peptide',text:'Defensins · membrane-targeting tissue support'});this.defensins.push({id:++this.id,targetId:target.id,x:this.id%2?35:385,y:550,age:0});this.nextDefensin=this.time+1.5;}
        }
        for(const shot of this.defensins){
            shot.age+=dt;const target=this.enemies.find(e=>e.id===shot.targetId&&e.hp>0);
            if(!target){shot.age=2;continue;}
            const dx=target.x-shot.x,dy=target.y-shot.y,d=Math.hypot(dx,dy),k=Math.min(1,dt*480/Math.max(1,d));shot.x+=dx*k;shot.y+=dy*k;
            if(d<18){this.damage(target,10,'defensin');shot.age=2;}
        }
        this.defensins=this.defensins.filter(s=>s.age<2);
    }
    step(delta: number) {
        if (this.phase !== 'playing')
            return;
        if (!Number.isFinite(delta) || delta <= 0) return;
        const dt = Math.min(delta, .05);
        this.time += dt;
        if(this.chargingMedicine)this.medicineCharge=Math.min(1,this.medicineCharge+dt/MEDICINE_CHARGE_SECONDS);
        this.complementRemaining = Math.max(0, this.complementRemaining - dt);
        this.complementCooldown = Math.max(0, this.complementCooldown - dt);
        this.protection = Math.max(0, this.protection - dt);
        this.medicineActive=Math.max(0,this.medicineActive-dt);
        this.medicineCooldown = Math.max(0, this.medicineCooldown - dt);
        this.tempoRemaining = Math.max(0, this.tempoRemaining - dt);
        this.shieldRemaining = Math.max(0, this.shieldRemaining - dt);
        const level = LEVELS[this.level - 1];
        if (this.time >= this.nextSpawn && this.time < this.duration-10) {
            const groupSize = this.spawnCluster(this.level===1 && this.wavesSpawned===0);
            this.wavesSpawned++;
            const pressure = (Math.floor(this.time / 12) % 3) !== 2;
            this.nextSpawn = this.time + (this.level===1?6:(pressure ? Math.max(1.65, 3.65 - this.level * .14) : 5.4) * groupSize);
        }
        if (this.time >= this.nextGate && this.nextGate < 70) {
            const index = this.gateIndex++;
            const options = this.level===1?{left:GATE_CYCLE[0].left,right:GATE_CYCLE[0].left}:GATE_CYCLE[index % GATE_CYCLE.length];
            const layout = this.level === 1 && index < 2 ? 'pair' : (['pair', 'left', 'right', 'pair'] as const)[index % 4];
            this.gates.push({ id: ++this.id, y: this.level===1&&index===0?250:-40, used: false, layout, left:{...options.left}, right:{...options.right} });
            this.nextGate = this.level===1 ? this.nextGate+10 : this.nextGate+17;
        }
        if (this.time >= 60 && !this.bossSpawned && this.enemies.length < BALANCE.maxEnemies) {
            this.bossSpawned = true;
            this.spawn(level.boss === 'shield-colony' ? 'dual-resistant' : level.pathogens[0], true);
            this.events.push({ type: 'boss', text: level.boss === 'shield-colony' ? 'MRSA colony · resistant to all modeled antibiotics.' : 'Colony incoming · size does not mean resistance.' });
        }
        this.stepAntibodies(dt);
        for (const e of this.enemies) {
            if (e.hp <= 0) continue;
            const pathogen = PATHOGENS.find(v => v.id === e.kind)!;
            e.complementTagged = this.complementRemaining > 0 && e.y > 130 && e.y < 680;
            const held = this.cells.some(c => c.targetId === e.id && c.phase === 'wrap');
            if (held) continue;
            e.y += dt * (e.boss ? 30 : pathogen.speed);
            e.x = Math.max(45, Math.min(375, e.x + Math.sin(this.time * 1.2 + e.id) * dt * (e.boss ? 6 : 12)));
            if (!e.inhibited && !e.boss) e.hp = Math.min(e.maxHp + 10, e.hp + dt * .65);
        }
        for(const e of this.enemies){
            if(!e.exposure)continue;
            const exposure=e.exposure, elapsed=Math.min(dt,exposure.remaining);
            if(exposure.rate)this.damage(e,exposure.rate*elapsed,exposure.id);
            exposure.remaining-=dt;
            if(exposure.remaining<=0){if(exposure.id==='doxycycline')e.inhibited=false;e.exposure=undefined;}
        }
        this.stepDefensins(dt);
        this.stepCells(dt);
        for (const e of this.enemies) {
            if (e.hp <= 0) {
                this.kills++;
                this.score += e.boss ? 250 : 25;
                this.events.push({type:'death',text:'Cleared',x:e.x,y:e.y,enemyId:e.id,cellId:e.lastCellId,cause:e.lastCause});
            } else if (e.y > BALANCE.breachY) {
                this.lose('Breach rescue: one defender leaves to protect the tissue.');
                if (e.boss) {
                    this.phase = 'defeat';
                    this.events.push({type:'loss',text:'Colony breached the tissue. Regroup and intercept it.',x:e.x,y:e.y,enemyId:e.id,squad:this.squad});
                }
                e.hp = 0;
            }
        }
        this.enemies = this.enemies.filter(e => e.hp > 0);
        for (const g of this.gates) {
            g.y += dt * 78;
            if (!g.used && !g.passed && g.y >= this.y - 25) {
                const side = this.x < 210 ? 'left' : 'right';
                if (!g.layout || g.layout === 'pair' || Math.abs(this.x - (g.layout === 'left' ? 122 : 298)) <= 78) this.applyGate(g, side);
                g.passed = true;
            }
        }
        this.gates = this.gates.filter(g => g.y < 760);
        if (this.time >= level.duration && this.phase === 'playing') {
            if (this.enemies.some(e => e.boss)) {
                this.events.push({ type: 'loss', text: 'Colony escaped. Regroup and try again.' });
                this.phase = 'defeat';
            }
            else {
                this.phase = 'victory';
                this.events.push({ type: 'win', text: 'Patrol complete. Tissue protected.' });
            }
        }
    }
    drainEvents() { return this.events.splice(0); }
}

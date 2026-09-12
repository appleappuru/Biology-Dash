import { LEVELS, PATHOGENS, medicineEffect, antibodyMatch, type PathogenId, type MedicineId, type AntibodyProfile, type DefenderId } from './content';
export const RULES_VERSION = 1;
export const BALANCE = { maxEnemies: 32, maxSquad: 30, contactY: 640, breachY: 710, invulnerability: 1.15 };
export interface Enemy {
    id: number;
    kind: PathogenId;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    tagged: boolean;
    tagAffinity?: number;
    inhibited: boolean;
    boss: boolean;
}
export interface Gate {
    id: number;
    y: number;
    used: boolean;
}
export interface PatrolEvent {
    type: 'engulf' | 'loss' | 'gate' | 'medicine' | 'tag' | 'boss' | 'win';
    text: string;
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
    level: number;
    seed: number;
    time = 0;
    x = 210;
    squad = 12;
    kills = 0;
    score = 0;
    coverage = 52;
    enemies: Enemy[] = [];
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
    attackTimer = 0;
    medicineCooldown = 0;
    id = 0;
    gateIndex = 0;
    learning: Learning = { medicine: false, cooperation: false, match: false, mismatch: false, affinity: false, recall: false, gate: false };
    constructor(level: number, seed = level * 8917, strength = 0) { this.level = Math.max(1, Math.min(10, level)); this.seed = seed >>> 0; this.squad = Math.min(18, 12 + strength); }
    random() { this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0; return this.seed / 4294967296; }
    move(x: number) { if (Number.isFinite(x))
        this.x = Math.max(52, Math.min(368, x)); }
    spawn(kind?: PathogenId, boss = false) { if (this.enemies.length >= BALANCE.maxEnemies)
        return; const level = LEVELS[this.level - 1]; const k = kind ?? level.pathogens[Math.floor(this.random() * level.pathogens.length)]; const p = PATHOGENS.find(v => v.id === k)!; const hp = boss ? 155 + this.level * 4 : p.hp; this.enemies.push({ id: ++this.id, kind: k, x: boss ? 210 : 60 + this.random() * 300, y: -45, hp, maxHp: hp, tagged: false, inhibited: false, boss }); }
    lose(reason: string) { if (this.protection > 0)
        return; this.squad = Math.max(0, this.squad - 1); this.protection = BALANCE.invulnerability; this.events.push({ type: 'loss', text: reason }); if (this.squad === 0)
        this.phase = 'defeat'; }
    applyGate(gate: Gate, choice: 'recruit' | 'coverage') { if (gate.used)
        return false; gate.used = true; this.learning.gate = true; if (choice === 'recruit')
        this.squad = Math.min(BALANCE.maxSquad, this.squad + 4);
    else
        this.coverage = Math.min(115, this.coverage + 18); this.events.push({ type: 'gate', text: choice === 'recruit' ? '+4 arriving defenders. Recruitment, not reproduction.' : 'Wider contact zone. No recruitment this time.' }); return true; }
    useMedicine() { if (this.medicineCooldown > 0 || this.phase !== 'playing' || this.level < 3)
        return false; this.medicineCooldown = 12; let success = false; const results = new Set<string>(); for (const e of this.enemies) {
        const effect = medicineEffect(this.medicine, e.kind);
        results.add(effect.feedback);
        if (effect.effective) {
            success = true;
            if (effect.effect === 'kill')
                e.hp -= 18;
            else
                e.inhibited = true;
        }
    } this.learning.medicine ||= success; this.events.push({ type: 'medicine', text: results.size ? [...results].join(' ') : 'External support ready. Wait for bacteria before using it.' }); return true; }
    tag() { if (!this.plasma)
        return; for (const e of this.enemies) {
        if (e.y < 130 || e.y > 680)
            continue;
        const match = antibodyMatch(this.antibody, e.kind);
        if (match) {
            if (!e.tagged) {
                e.tagged = true;
                e.tagAffinity = this.antibody.affinity;
                this.events.push({ type: 'tag', text: `Epitope ${this.antibody.epitope} matched. Tagged for engulfment.`, x: e.x, y: e.y });
            }
            this.learning.match = true;
            if (this.level >= 8 && this.antibody.affinity >= .9 && this.antibody.epitope === 'A')
                this.learning.recall = true;
        }
        else
            this.learning.mismatch = true;
    } }
    step(delta: number) {
        if (this.phase !== 'playing')
            return;
        const dt = Math.min(Math.max(delta, 0), .05);
        this.time += dt;
        this.protection = Math.max(0, this.protection - dt);
        this.medicineCooldown = Math.max(0, this.medicineCooldown - dt);
        this.attackTimer -= dt;
        const level = LEVELS[this.level - 1];
        if (this.time >= this.nextSpawn && this.time < 75) {
            this.spawn();
            const pressure = (Math.floor(this.time / 12) % 3) !== 2;
            this.nextSpawn = this.time + (pressure ? Math.max(1.65, 3.65 - this.level * .14) : 5.4);
        }
        if (this.time >= this.nextGate && this.nextGate < 70) {
            this.gates.push({ id: ++this.id, y: -40, used: false });
            this.nextGate += 24;
        }
        if (this.time >= 68 && !this.bossSpawned) {
            this.bossSpawned = true;
            this.spawn(level.boss === 'shield-colony' ? 'dual-resistant' : level.pathogens[0], true);
            this.events.push({ type: 'boss', text: level.boss === 'shield-colony' ? 'Mosaic Monarch · Lab: both drugs resistant.' : 'Colony incoming · size does not mean resistance.' });
        }
        this.tag();
        for (const e of this.enemies) {
            const p = PATHOGENS.find(v => v.id === e.kind)!;
            e.y += dt * (e.boss ? 36 : p.speed);
            if (!e.inhibited && !e.boss)
                e.hp = Math.min(e.maxHp + 10, e.hp + dt * .65);
        }
        if (this.attackTimer <= 0) {
            this.attackTimer = this.defender === 'macrophage' ? .38 : .3;
            for (const e of this.enemies) {
                if (e.y > 500 && e.y < 680 && Math.abs(e.x - this.x) < this.coverage + (e.boss ? 25 : 0)) {
                    const power = (this.defender === 'macrophage' ? 9 : 7) + Math.min(this.squad, 20) * .35;
                    e.hp -= power * (e.tagged ? 1 + (e.tagAffinity ?? .45) : 1);
                    if (e.tagged)
                        this.learning.cooperation = true;
                    this.events.push({ type: 'engulf', text: e.tagged ? 'Tag + phagocyte: stronger engulfment' : 'Close-range engulfment', x: e.x, y: e.y });
                }
            }
        }
        for (const e of this.enemies) {
            if (e.hp <= 0) {
                this.kills++;
                this.score += e.boss ? 250 : 25;
            }
            else if (e.y > 668 && Math.abs(e.x - this.x) < 36) {
                this.lose('Contact! One defender lost. Brief protection active.');
                if (!e.boss)
                    e.hp = 0;
            }
            else if (e.y > BALANCE.breachY) {
                if (e.boss) {
                    this.phase = 'defeat';
                    this.events.push({ type: 'loss', text: 'Colony breached the tissue. Regroup and intercept it.' });
                }
                this.lose('Breach rescue: one defender leaves to protect the tissue.');
                e.hp = 0;
            }
        }
        this.enemies = this.enemies.filter(e => e.hp > 0);
        for (const g of this.gates) {
            g.y += dt * 78;
            if (!g.used && g.y >= 615)
                this.applyGate(g, this.x < 210 ? 'recruit' : 'coverage');
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

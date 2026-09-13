import { describe, expect, it } from 'vitest';
import { BALANCE, Patrol } from '../src/simulation';
import { antibodyMatch, CLONES, LEVELS, MEDICINES, medicineEffect, PATHOGENS } from '../src/content';
import { completeLevel, freshSave, isUnlocked, parseSave, purchaseReinforcement } from '../src/save';
const advance = (patrol: Patrol, seconds: number) => {
    for (let i = 0; i < Math.round(seconds / .05); i++)
        patrol.step(.05);
};
const stationaryTarget = (patrol: Patrol, kind: Parameters<Patrol['spawn']>[0] = 'susceptible') => {
    patrol.spawn(kind);
    const target = patrol.enemies.at(-1)!;
    target.y = 200;
    return target;
};
describe('deterministic patrol and bounded resources', () => {
    it('replays the same seed and input schedule identically', () => {
        const a = new Patrol(6, 417), b = new Patrol(6, 417);
        for (let i = 0; i < 900; i++) {
            const x = i % 120 < 60 ? 90 : 310;
            a.move(x);
            b.move(x);
            a.step(.05);
            b.step(.05);
        }
        expect(a).toEqual(b);
        const other = new Patrol(6, 418);
        advance(other, 45);
        expect(other.enemies).not.toEqual(a.enemies);
    });
    it('caps a delayed frame to prevent huge simulation jumps and ignores negative elapsed time', () => {
        const patrol = new Patrol(1);
        patrol.step(10);
        expect(patrol.time).toBe(.05);
        patrol.step(-1);
        expect(patrol.time).toBe(.05);
    });
    it('clamps steering and ignores nonfinite pointer positions', () => {
        const patrol = new Patrol(1);
        patrol.move(-100);
        expect(patrol.x).toBe(82);
        patrol.move(900);
        expect(patrol.x).toBe(338);
        patrol.move(NaN);
        expect(patrol.x).toBe(338);
    });
    it('allows each gate exactly once and respects the squad cap', () => {
        const patrol = new Patrol(1);
        patrol.squad = BALANCE.maxSquad - 1;
        const gate = { id: 1, y: 615, used: false };
        expect(patrol.applyGate(gate, 'recruit')).toBe(true);
        expect(patrol.squad).toBe(BALANCE.maxSquad);
        expect(patrol.applyGate(gate, 'coverage')).toBe(false);
        expect(patrol.coverage).toBe(52);
        expect(patrol.drainEvents().filter(e => e.type === 'gate')).toHaveLength(1);
    });
    it('caps coverage and enemy count', () => {
        const patrol = new Patrol(1);
        for (let id = 0; id < 100; id++) {
            patrol.applyGate({ id, y: 615, used: false }, 'coverage');
            patrol.spawn();
        }
        expect(patrol.coverage).toBe(115);
        expect(patrol.enemies).toHaveLength(BALANCE.maxEnemies);
    });
    it('protects against a cluster of casualties, then permits the next loss and defeat', () => {
        const patrol = new Patrol(1);
        patrol.squad = 2;
        patrol.lose('first');
        patrol.lose('simultaneous');
        expect(patrol.squad).toBe(1);
        advance(patrol, 1.2);
        patrol.lose('second');
        expect(patrol.squad).toBe(0);
        expect(patrol.phase).toBe('defeat');
        const time = patrol.time;
        patrol.step(.05);
        expect(patrol.time).toBe(time);
    });
});
describe('medicine compatibility', () => {
    it.each(PATHOGENS.flatMap(p => MEDICINES.map(m => [p.id, m.id, p.susceptibility[m.id], m.effect] as const)))('%s + %s respects its isolate report', (pathogen, medicine, susceptibility, effect) => {
        expect(medicineEffect(medicine, pathogen)).toMatchObject({
            effective: susceptibility === 'susceptible', effect: susceptibility === 'susceptible' ? effect : 'none',
        });
    });
    it.each(MEDICINES)('$name cannot override the absence of an antibacterial target in viruses', medicine => {
        expect(medicineEffect(medicine.id, 'virus')).toMatchObject({ effective: false, effect: 'none' });
    });
    it('doxycycline inhibits growth without directly removing health', () => {
        const treated = new Patrol(3), untreated = new Patrol(3);
        treated.medicine = 'doxycycline';
        const a = stationaryTarget(treated), b = stationaryTarget(untreated);
        const initialHealth = a.hp;
        expect(treated.useMedicine()).toBe(true);
        expect(a.hp).toBe(initialHealth);
        expect(a.inhibited).toBe(true);
        advance(treated, 1);
        advance(untreated, 1);
        expect(a.hp).toBe(initialHealth);
        expect(b.hp).toBeGreaterThan(initialHealth);
        expect(treated.kills).toBe(0);
    });
    it('resistance prevents damage and inhibition and successful pulses have a cooldown', () => {
        const patrol = new Patrol(4);
        const target = stationaryTarget(patrol, 'dual-resistant');
        const initialHealth = target.hp;
        patrol.useMedicine();
        expect(target.hp).toBe(initialHealth);
        expect(target.inhibited).toBe(false);
        expect(patrol.useMedicine()).toBe(false);
        expect(patrol.learning.medicine).toBe(false);
    });
});
describe('specific binding, opsonization and recall', () => {
    it('every clone retains specificity and effector while affinity varies', () => {
        expect(CLONES.map(c => c.profile.affinity)).toEqual([.2, .45, .9]);
        for (const { profile } of CLONES) {
            expect(profile.effector).toBe('opsonization');
            expect(antibodyMatch(profile, 'susceptible')).toBe(true);
            expect(antibodyMatch(profile, 'antigen-b')).toBe(false);
        }
    });
    it('matching tags cause no direct damage; a mismatch remains untagged', () => {
        const patrol = new Patrol(6);
        patrol.plasma = true;
        const a = stationaryTarget(patrol), b = stationaryTarget(patrol, 'antigen-b');
        const hp = [a.hp, b.hp];
        patrol.tag();
        expect([a.hp, b.hp]).toEqual(hp);
        expect([a.tagged, b.tagged]).toEqual([true, false]);
        expect(patrol.learning).toMatchObject({ match: true, mismatch: true, cooperation: false });
    });
    it('matching tags strengthen contact engulfment only with a phagocyte', () => {
        const tagged = new Patrol(5), plain = new Patrol(5);
        tagged.plasma = true;
        const a = stationaryTarget(tagged), b = stationaryTarget(plain);
        a.x = b.x = 210;
        a.y = b.y = 550;
        tagged.step(.05);
        plain.step(.05);
        expect(a.hp).toBeLessThan(b.hp);
        expect(tagged.learning.cooperation).toBe(true);
        expect(plain.learning.cooperation).toBe(false);
    });
    it('strong affinity sets matching recall only in a recall encounter', () => {
        for (const [level, kind, affinity, expected] of [[7, 'susceptible', .9, false], [8, 'antigen-b', .9, false], [8, 'susceptible', .45, false], [8, 'susceptible', .9, true]] as const) {
            const patrol = new Patrol(level);
            patrol.plasma = true;
            patrol.antibody = { epitope: 'A', affinity, effector: 'opsonization' };
            stationaryTarget(patrol, kind);
            patrol.tag();
            expect(patrol.learning.recall).toBe(expected);
        }
    });
});
describe('save validation and progression', () => {
    it.each([null, '', 'broken JSON', 'null', '{"version":999}'])('recovers a fresh save from %s', raw => {
        expect(parseSave(raw)).toEqual(freshSave());
    });
    it('validates bounds, duplicates, star values and boolean flags', () => {
        const parsed = parseSave(JSON.stringify({ ...freshSave(), completed: [1, 1, 0, 11, 2.5, '3'], credits: -9, reinforcement: 100, volume: 4, muted: 'true', stars: { 1: 3, 2: 9, 11: 1 }, checks: { medicine: 'yes', match: true } }));
        expect(parsed.completed).toEqual([1]);
        expect(parsed.credits).toBe(0);
        expect(parsed.reinforcement).toBe(6);
        expect(parsed.volume).toBe(1);
        expect(parsed.muted).toBe(false);
        expect(parsed.stars).toEqual({ '1': 3 });
        expect(parsed.checks).toMatchObject({ medicine: false, match: true });
    });
    it('rejects corrupted antibody effector values rather than persisting them', () => {
        const parsed = parseSave(JSON.stringify({ ...freshSave(), antibody: { epitope: 'A', affinity: .9, effector: 'direct-damage' } }));
        expect(parsed.antibody).toEqual(freshSave().antibody);
    });
    it('awards credits once while keeping the best stars and accumulated learning', () => {
        const save = freshSave();
        expect(isUnlocked(save, 1)).toBe(true);
        expect(isUnlocked(save, 2)).toBe(false);
        expect(completeLevel(save, 1, 7, { medicine: true })).toBe(true);
        expect(completeLevel(save, 1, 15, { medicine: false, gate: true })).toBe(false);
        expect(completeLevel(save, 1, 1, {})).toBe(false);
        expect(save.completed).toEqual([1]);
        expect(save.credits).toBe(30);
        expect(save.stars[1]).toBe(3);
        expect(save.checks).toMatchObject({ medicine: true, gate: true });
        expect(isUnlocked(save, 2)).toBe(true);
        expect(isUnlocked(save, 3)).toBe(false);
    });
    it('purchases only within available credits and the upgrade cap', () => {
        const save = freshSave();
        expect(purchaseReinforcement(save)).toBe(false);
        save.credits = 210;
        for (let i = 0; i < 6; i++)
            expect(purchaseReinforcement(save)).toBe(true);
        expect(purchaseReinforcement(save)).toBe(false);
        expect(save.credits).toBe(30);
        expect(save.reinforcement).toBe(6);
    });
    it('includes ten ordered encounters and matching transfer objectives', () => {
        expect(LEVELS.map(l => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(LEVELS.every(l => l.objective && l.decision && l.feedback && l.transfer)).toBe(true);
    });
});

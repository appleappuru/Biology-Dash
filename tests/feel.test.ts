import { describe, expect, it } from 'vitest';
import { BALANCE, Patrol, type Gate } from '../src/simulation';

const tick = (p: Patrol, seconds: number) => {
    for (let i = 0; i < Math.round(seconds / .05); i++) p.step(.05);
};
const authoredGates = () => {
    const p = new Patrol(1);
    const gates: Gate[] = [];
    p.nextSpawn = Infinity;
    p.bossSpawned = true;
    // Capture each freshly authored gate without traversing the lane.
    for (let i = 0; i < 4; i++) {
        p.time = p.nextGate;
        p.step(.05);
        gates.push(p.gates[p.gates.length - 1]);
    }
    p.gates = [];
    return { p, gates };
};

describe('two-axis patrol', () => {
    it('moves on both axes while keeping the entire squad in the corridor', () => {
        const p = new Patrol(1);
        p.move(-100, -100);
        expect([p.x,p.y]).toEqual([82,460]);
        p.move(900,900);
        expect([p.x,p.y]).toEqual([338,635]);
        p.move(180);
        expect([p.x,p.y]).toEqual([180,635]);
        p.move(NaN,NaN);
        expect([p.x,p.y]).toEqual([180,635]);
    });
    it('advancing moves the actual engulfment zone, not just the artwork', () => {
        const forward = new Patrol(1), rear = new Patrol(1);
        for (const p of [forward,rear]) {
            p.spawn('susceptible');
            p.enemies[0].x = 210; p.enemies[0].y = 390;
        }
        forward.move(210,490);
        forward.step(.05); rear.step(.05);
        expect(forward.enemies[0].hp).toBeLessThan(rear.enemies[0].hp);
        expect(forward.events.some(e=>e.type==='hit')).toBe(true);
        expect(rear.events.some(e=>e.type==='hit')).toBe(false);
    });
    it('collects a passed gate once even after retreat and advance', () => {
        const p = new Patrol(1);
        const g = {id:1,y:500,used:false};
        p.gates.push(g);
        p.move(110,635); p.step(.05);
        expect(g.used).toBe(false);
        p.move(110,490); p.step(.05);
        expect(g.used).toBe(true);
        const squad = p.squad;
        p.move(110,635); p.step(.05);
        p.move(110,460); p.step(.05);
        expect(p.squad).toBe(squad);
        expect(p.events.filter(e=>e.type==='gate')).toHaveLength(1);
    });
    it('does not erase an enemy simply because the squad moved ahead of it', () => {
        const p = new Patrol(1);
        p.spawn('susceptible');
        p.enemies[0].x = p.x; p.enemies[0].y = 620;
        p.move(p.x,460); p.step(.05);
        expect(p.enemies).toHaveLength(1);
        expect(p.squad).toBe(12);
    });
});

describe('authored gate abilities and tradeoffs', () => {
    it('cycles through four distinct pairs with explicit effects', () => {
        const {p,gates} = authoredGates();
        expect(gates.map(g=>p.gateOptions(g).left.value)).toEqual([4,6,36,8]);
        expect(gates.map(g=>p.gateOptions(g).right.kind)).toEqual(['coverage','tempo','shield','coverage']);
        expect(gates.every(g=>g.left?.label && g.right?.detail)).toBe(true);
    });
    it('risk spends exactly three cells and increases reach once', () => {
        const {p,gates} = authoredGates();
        p.applyGate(gates[2],'left');
        expect(p.squad).toBe(9);
        expect(p.coverage).toBe(88);
        expect(p.applyGate(gates[2],'left')).toBe(false);
        expect(p.squad).toBe(9);
        expect(p.events.at(-1)).toMatchObject({type:'loss',amount:-3,squad:9,x:p.x,y:p.y});
    });
    it('risk cannot produce a negative squad or silently avoid defeat', () => {
        const {p,gates} = authoredGates(); p.squad=2;
        p.applyGate(gates[2],'left');
        expect(p.squad).toBe(0); expect(p.phase).toBe('defeat');
    });
    it('surge recruits the actual number of remaining squad slots', () => {
        const {p,gates} = authoredGates(); p.squad=28;
        p.applyGate(gates[3],'left');
        expect(p.squad).toBe(BALANCE.maxSquad);
        expect(p.events.at(-1)).toMatchObject({type:'recruit',amount:2,squad:30});
    });
    it('shield prevents losses temporarily and then expires', () => {
        const {p,gates} = authoredGates();
        p.applyGate(gates[2],'right');
        expect(p.shieldRemaining).toBe(8);
        p.lose('protected'); expect(p.squad).toBe(12);
        tick(p,8.05);
        expect(p.shieldRemaining).toBe(0);
        p.lose('expired'); expect(p.squad).toBe(11);
    });
    it('tempo accelerates engulfment and expires without a permanent upgrade', () => {
        const {p,gates} = authoredGates();
        const ordinary = new Patrol(1);
        p.applyGate(gates[1],'right');
        for (const patrol of [p,ordinary]) {
            patrol.spawn('susceptible',true);
            patrol.enemies[0].x=210; patrol.enemies[0].y=510;
            patrol.enemies[0].hp=10000;
            patrol.attackTimer=0;
        }
        tick(p,1); tick(ordinary,1);
        expect(p.enemies[0].hp).toBeLessThan(ordinary.enemies[0].hp);
        p.enemies=[]; tick(p,11.05);
        expect(p.tempoRemaining).toBe(0);
    });
});

describe('feedback and terminal outcomes', () => {
    it('emits addressable hit and death events exactly once for a cleared enemy', () => {
        const p = new Patrol(3);
        p.spawn('susceptible');
        const enemy = p.enemies[0]; enemy.hp=1; enemy.y=550; enemy.x=p.x;
        p.step(.05); p.step(.05);
        expect(p.events.filter(e=>e.type==='hit')).toEqual([expect.objectContaining({enemyId:enemy.id,x:enemy.x,y:enemy.y})]);
        expect(p.events.filter(e=>e.type==='death')).toEqual([expect.objectContaining({enemyId:enemy.id,x:enemy.x,y:enemy.y})]);
        expect(p.kills).toBe(1);
    });
    it('medicine kills are not resurrected by growth before the death pass', () => {
        const p = new Patrol(3); p.spawn('susceptible');
        p.enemies[0].hp=18; p.enemies[0].y=200;
        p.useMedicine(); p.step(.05);
        expect(p.enemies).toHaveLength(0); expect(p.kills).toBe(1);
        expect(p.events.filter(e=>e.type==='death')).toHaveLength(1);
    });
    it('a breached boss loses the patrol even in the squad lane under a shield', () => {
        const p = new Patrol(1); p.shieldRemaining=8;
        p.spawn('susceptible',true);
        p.enemies[0].x=p.x; p.enemies[0].y=714;
        p.step(.05);
        expect(p.phase).toBe('defeat'); expect(p.kills).toBe(0);
    });
    it('nonfinite and zero frames do not mutate simulation or attack timers', () => {
        const p=new Patrol(1); const before=JSON.stringify(p);
        p.step(NaN); p.step(Infinity); p.step(0);
        expect(JSON.stringify(p)).toBe(before);
    });
});

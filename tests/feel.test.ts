import { parseSave, freshSave, completeLevel } from '../src/save';
import { describe, expect, it } from 'vitest';
import { BALANCE, Patrol, type Gate } from '../src/simulation';

const tick = (p: Patrol, seconds: number) => {
    for (let i = 0; i < Math.round(seconds / .05); i++) p.step(.05);
};
const authoredGates = () => {
    const p = new Patrol(2);
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
        const p = new Patrol(2);
        p.move(-100, -100);
        expect([p.x,p.y]).toEqual([82,460]);
        p.move(900,900);
        expect([p.x,p.y]).toEqual([338,635]);
        p.move(180);
        expect([p.x,p.y]).toEqual([180,635]);
        p.move(NaN,NaN);
        expect([p.x,p.y]).toEqual([180,635]);
    });
    it('advancing brings individual cells within approach reach', () => {
        const forward = new Patrol(2), rear = new Patrol(2);
        for (const p of [forward,rear]) {
            p.spawn('susceptible');
            p.enemies[0].x = 210; p.enemies[0].y = 390;
        }
        forward.move(210,490);
        tick(forward,2); tick(rear,2);
        expect(forward.kills).toBe(1);
        expect(rear.kills).toBe(0);
        expect(forward.events.some(e=>e.type==='hit')).toBe(true);
        expect(rear.events.some(e=>e.type==='hit')).toBe(false);
    });
    it('collects a passed gate once even after retreat and advance', () => {
        const p = new Patrol(2);
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
        const p = new Patrol(2);
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
        gates[2].layout = 'pair'; p.applyGate(gates[2],'left');
        expect(p.squad).toBe(9);
        expect(p.coverage).toBe(88);
        expect(p.applyGate(gates[2],'left')).toBe(false);
        expect(p.squad).toBe(9);
        expect(p.events.at(-1)).toMatchObject({type:'loss',amount:-3,squad:9,x:p.x,y:p.y});
    });
    it('risk cannot produce a negative squad or silently avoid defeat', () => {
        const {p,gates} = authoredGates(); p.squad=2;
        gates[2].layout = 'pair'; p.applyGate(gates[2],'left');
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
        const ordinary = new Patrol(2);p.time=0;p.nextSpawn=999;p.nextGate=999;ordinary.nextSpawn=999;ordinary.nextGate=999;
        p.applyGate(gates[1],'right');
        for (const patrol of [p,ordinary]) {
            patrol.spawn('susceptible',true);
            patrol.enemies[0].x=210; patrol.enemies[0].y=510;
            patrol.enemies[0].hp=10000;
        }
        tick(p,5); tick(ordinary,5);
        expect(p.enemies[0].hp).toBeLessThan(ordinary.enemies[0].hp);
        p.enemies=[]; tick(p,7.05);
        expect(p.tempoRemaining).toBe(0);
    });
});

describe('feedback and terminal outcomes', () => {
    it('emits addressable hit and death events exactly once for a cleared enemy', () => {
        const p = new Patrol(3);
        p.spawn('susceptible');
        const enemy = p.enemies[0]; enemy.hp=1; enemy.y=550; enemy.x=p.x;
        tick(p,2);
        expect(p.events.filter(e=>e.type==='hit')).toEqual([expect.objectContaining({enemyId:enemy.id,x:enemy.x,y:enemy.y})]);
        expect(p.events.filter(e=>e.type==='death')).toEqual([expect.objectContaining({enemyId:enemy.id,x:enemy.x,y:enemy.y})]);
        expect(p.kills).toBe(1);
    });
    it('medicine kills are not resurrected by growth before the death pass', () => {
        const p = new Patrol(3); p.spawn('susceptible');
        p.enemies[0].hp=.2; p.enemies[0].y=200;
        p.useMedicine(); p.step(.05);
        expect(p.enemies).toHaveLength(0); expect(p.kills).toBe(1);
        expect(p.events.filter(e=>e.type==='death')).toHaveLength(1);
    });
    it('a breached boss loses the patrol even in the squad lane under a shield', () => {
        const p = new Patrol(2); p.shieldRemaining=8;
        p.spawn('susceptible',true);
        p.enemies[0].x=p.x; p.enemies[0].y=714;
        p.step(.05);
        expect(p.phase).toBe('defeat'); expect(p.kills).toBe(0);
    });
    it('nonfinite and zero frames do not mutate simulation or attack timers', () => {
        const p=new Patrol(2); const before=JSON.stringify(p);
        p.step(NaN); p.step(Infinity); p.step(0);
        expect(JSON.stringify(p)).toBe(before);
    });
});


describe('rules upgrade save migration', () => {
    it('retains earned progress, resources and preferences from version 1', () => {
        const save=parseSave(JSON.stringify({version:1,completed:[1,2],credits:60,stars:{1:3,2:2},reinforcement:1,muted:true,volume:.1,reducedMotion:true,tutorial:true,antibody:{epitope:'A',affinity:.9,effector:'opsonization'},checks:{affinity:true}}));
        expect(save.version).toBe(4);
        expect(save.completed).toEqual([1,2]);
        expect(save.credits).toBe(60);
        expect(save.stars).toEqual({1:3,2:2});
        expect(save.reinforcement).toBe(1);
        expect(save.muted && save.reducedMotion && save.tutorial && save.checks.affinity).toBe(true);
        expect(save.antibody.affinity).toBe(.9);
    });
});

describe('patrol recognition', () => {
    it('records actual casualties without penalizing strategic reassignment or shielded contact', () => {
        const p=new Patrol(2);
        p.applyGate({id:1,y:500,used:false,left:{id:'risk',label:'Trade',detail:'Trade',kind:'risk',cost:3,value:36}},'left');
        expect(p.casualties).toBe(0);
        p.shieldRemaining=8;p.lose('shielded');
        expect(p.casualties).toBe(0);
        p.shieldRemaining=0;p.lose('contact');p.lose('invulnerable');
        expect(p.casualties).toBe(1);
    });
    it('retains the personal best while replay credits remain one-time', () => {
        const save=freshSave();
        completeLevel(save,1,12,{},500);
        completeLevel(save,1,12,{},300);
        expect(save.bestScores[1]).toBe(500);
        expect(save.credits).toBe(30);
        completeLevel(save,1,12,{},650);
        expect(parseSave(JSON.stringify(save)).bestScores[1]).toBe(650);
    });
});

describe('single gates', () => {
    it('never grants the absent side or a missed gate after crossing', () => {
        const p=new Patrol(3);p.nextSpawn=999;p.nextGate=999;
        const g={id:999,y:610,used:false,layout:'left' as const,passed:false};p.gates=[g];
        expect(p.applyGate(g,'right')).toBe(false);
        p.move(320,635);p.step(.05);expect(g.passed).toBe(true);expect(g.used).toBe(false);
        p.move(110,635);p.step(.05);expect(p.squad).toBe(12);expect(p.applyGate(g,'left')).toBe(false);
    });
    it('collects the visible side exactly once', () => {
        const p=new Patrol(3);p.nextSpawn=999;p.nextGate=999;
        const g={id:999,y:610,used:false,layout:'left' as const};p.gates=[g];p.move(110,635);p.step(.05);
        expect(g.used).toBe(true);expect(p.squad).toBe(16);p.step(.05);expect(p.squad).toBe(16);
    });
    it('does not spend medicine cooldown on an empty field',()=>{
        const p=new Patrol(3);expect(p.useMedicine()).toBe(false);expect(p.medicineCooldown).toBe(0);
    });
});

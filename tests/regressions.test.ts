import { it, expect } from 'vitest';
import { Patrol } from '../src/simulation';
it('escaping boss causes defeat even when removed from live entities', () => { const p = new Patrol(1); p.spawn('susceptible', true); p.enemies[0].y = 714; p.enemies[0].x = 350; p.step(.05); expect(p.phase).toBe('defeat'); });
it('switching antibody profile cannot strengthen old tags', () => { const a = new Patrol(8), b = new Patrol(8); for (const p of [a, b]) {
    p.plasma = true;
    p.spawn('susceptible');
    p.enemies[0].y = 200;
    for(let i=0;i<50;i++)p.stepAntibodies(.05);
    p.enemies[0].y = 550;
    p.enemies[0].x = 210;
} a.antibody = { epitope: 'B', affinity: .9, effector: 'opsonization' }; a.step(.05); b.step(.05); expect(a.enemies[0].hp).toBe(b.enemies[0].hp); });
it('ten levels are winnable with a bounded interception policy', () => { for (let level = 1; level <= 10; level++) {
    const p = new Patrol(level);p.medicine=level===4?'doxycycline':level===7?'micafungin':level>=9?'cefepime':'amoxicillin';
    p.plasma = level >= 5;
    p.antibody.affinity = level >= 7 ? .9 : .45;
    for (let i = 0; i < 1801 && p.phase === 'playing'; i++) {
            const e = p.enemies.filter(e => e.y > 440).sort((a, b) => b.y - a.y)[0];
            if (e && level >= 5) p.antibody.epitope = e.kind === 'antigen-b' ? 'B' : 'A';
        if (e)
            p.move(e.x, Math.max(460, Math.min(635, e.y + 110)));
        else if (p.gates.some(g => !g.used && g.y > 490))
            p.move(110, 635);
        if(p.supportReady)p.useMedicine(1);
        p.step(.05);
    }
    expect(p.phase, `level ${level}, ${p.squad} cells`).toBe('victory');
} });
it('boss contact does not erase a surviving boss', () => { const p = new Patrol(2); p.spawn('susceptible', true); p.enemies[0].y = 669; p.enemies[0].x = p.x; p.enemies[0].hp = 1000; p.step(.05); expect(p.enemies).toHaveLength(1); expect(p.squad).toBe(12); });

it('does not skip the colony when its arrival finds a full field',()=>{
 const p=new Patrol(3);p.time=60;p.nextSpawn=999;p.nextGate=999;
 for(let i=0;i<32;i++){p.spawn('susceptible');p.enemies[i].y=200;}
 p.step(.05);expect(p.bossSpawned).toBe(false);p.enemies.pop();p.step(.05);expect(p.bossSpawned).toBe(true);expect(p.enemies.filter(e=>e.boss)).toHaveLength(1);
});

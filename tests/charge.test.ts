import {expect,it} from 'vitest';
import {Patrol} from '../src/simulation';
function fixture(){const p=new Patrol(3);p.nextSpawn=999;p.nextGate=999;p.nextDefensin=999;p.squad=0;p.syncCells();p.spawn('susceptible');const e=p.enemies[0];e.hp=e.maxHp=1000;e.y=180;return p;}
const advance=(p:Patrol,n:number)=>{for(let i=0;i<n*20;i++)p.step(.05);};
it('charge caps, release applies a timed exposure once, and taps use a shorter duration',()=>{
 const p=fixture();expect(p.beginMedicineCharge()).toBe(true);advance(p,2);expect(p.medicineCharge).toBe(1);expect(p.enemies[0].hp).toBeGreaterThanOrEqual(1000);
 expect(p.releaseMedicineCharge()).toBe(true);expect(p.enemies[0].exposure?.remaining).toBe(6);expect(p.releaseMedicineCharge()).toBe(false);expect(p.medicineCooldown).toBe(9);
 const before=p.enemies[0].hp;advance(p,1);expect(p.enemies[0].hp).toBeLessThan(before-9);expect(p.beginMedicineCharge()).toBe(false);
 const tap=fixture();tap.useSupport();expect(tap.enemies[0].exposure?.remaining).toBe(3);expect(tap.medicineCooldown).toBe(6);
});
it('cancellation and terminal state spend nothing and never apply medicine',()=>{
 const p=fixture();p.beginMedicineCharge();p.cancelMedicineCharge();expect(p.releaseMedicineCharge()).toBe(false);expect(p.enemies[0].exposure).toBeUndefined();
 p.beginMedicineCharge();p.phase='victory';expect(p.releaseMedicineCharge()).toBe(false);expect(p.medicineCooldown).toBe(0);
});
it('exposure only reaches living visible susceptible targets present at release',()=>{
 const p=fixture();for(const kind of ['dual-resistant','candida','susceptible','susceptible'] as const)p.spawn(kind);
 p.enemies[1].y=p.enemies[2].y=250;p.enemies[3].y=-40;p.enemies[4].y=250;p.enemies[4].hp=0;
 p.useMedicine(1);expect(p.enemies.slice(1).every(e=>!e.exposure)).toBe(true);p.spawn('susceptible');p.enemies.at(-1)!.y=250;advance(p,.1);expect(p.enemies.at(-1)?.exposure).toBeUndefined();
 const text=p.events.find(e=>e.type==='medicine')?.text;expect(text).toContain('1 wall stress');expect(text).toContain('1 resistant');
});
it('growth suppression expires and never directly damages its target',()=>{
 const p=fixture();p.medicine='doxycycline';p.useMedicine();expect(p.enemies[0].inhibited).toBe(true);const hp=p.enemies[0].hp;advance(p,2);expect(p.enemies[0].hp).toBe(hp);advance(p,1.1);expect(p.enemies[0].inhibited).toBe(false);expect(p.enemies[0].exposure).toBeUndefined();
});
it('one engulfing actor leaves after digestion without retiring another actor or respawning',()=>{
 const p=new Patrol(2);p.nextSpawn=p.nextGate=p.nextDefensin=999;p.spawn('susceptible');p.enemies[0].x=p.x;p.enemies[0].y=550;
 let cellId:number|undefined;for(let i=0;i<100&&p.spentCells===0;i++){p.step(.05);cellId??=p.events.find(e=>e.type==='engulf')?.cellId;}
 expect(p.kills).toBe(1);expect(p.spentCells).toBe(1);expect(p.squad).toBe(11);expect(p.cells.some(c=>c.id===cellId)).toBe(false);expect(new Set(p.cells.map(c=>c.id)).size).toBe(11);
 p.squad++;p.syncCells();expect(p.cells.some(c=>c.id===cellId)).toBe(false);expect(new Set(p.cells.map(c=>c.id)).size).toBe(12);
});
it('defensin particles travel from tissue and do not claim phagocyte kills',()=>{
 const p=fixture();p.nextDefensin=0;p.step(.05);expect(p.defensins).toHaveLength(1);expect(p.events.some(e=>e.type==='hit')).toBe(false);advance(p,1);expect(p.events.some(e=>e.type==='hit'&&e.cause==='defensin')).toBe(true);expect(p.spentCells).toBe(0);
});
it('a purchased Neutrophil strength upgrade permits two hugs, then retires that same cell',()=>{
 const p=new Patrol(2);p.squad=1;p.loadout=['neutro'];p.upgrades.neutro=1;p.syncCells();p.nextSpawn=p.nextGate=p.nextDefensin=999;const id=p.cells[0].id;
 for(let n=0;n<2;n++){p.spawn('susceptible');p.enemies.at(-1)!.x=p.x;p.enemies.at(-1)!.y=570;for(let i=0;i<90&&p.spentCells===0&&(p.cells[0]?.captures??0)<=n;i++)p.step(.05);if(n===0){expect(p.cells[0].id).toBe(id);expect(p.cells[0].captures).toBe(1);expect(p.squad).toBe(1);}}
 expect(p.kills).toBe(2);expect(p.spentCells).toBe(1);expect(p.squad).toBe(0);
});

import {expect,it} from 'vitest';
import {Patrol} from '../src/simulation';
function fixture(){const p=new Patrol(10);p.nextSpawn=999;p.nextGate=999;p.spawn('susceptible');p.enemies[0].hp=100;p.enemies[0].maxHp=100;p.enemies[0].y=100;return p;}
it('builds charge without damage, caps it and releases exactly once',()=>{
 const p=fixture();expect(p.beginMedicineCharge()).toBe(true);
 const y=p.enemies[0].y;for(let i=0;i<60;i++)p.step(.05);
 expect(p.medicineCharge).toBe(1);expect(p.enemies[0].hp).toBeGreaterThanOrEqual(100);expect(p.enemies[0].y).toBeGreaterThan(y);
 const hp=p.enemies[0].hp;expect(p.releaseMedicineCharge()).toBe(true);expect(hp-p.enemies[0].hp).toBe(36);expect(p.medicineCooldown).toBe(18);
 expect(p.releaseMedicineCharge()).toBe(false);expect(p.beginMedicineCharge()).toBe(false);
 expect(p.events.filter(e=>e.type==='medicine')).toHaveLength(1);
});
it('cancel and terminal state never discharge, quick taps retain the baseline',()=>{
 const p=fixture();p.beginMedicineCharge();p.cancelMedicineCharge();expect(p.releaseMedicineCharge()).toBe(false);expect(p.medicineCooldown).toBe(0);
 p.beginMedicineCharge();expect(p.releaseMedicineCharge()).toBe(true);expect(p.enemies[0].hp).toBe(82);expect(p.medicineCooldown).toBe(12);
 const q=fixture();q.beginMedicineCharge();q.phase='victory';expect(q.releaseMedicineCharge()).toBe(false);expect(q.enemies[0].hp).toBe(100);
});
it('charged support cannot bypass susceptibility or turn growth suppression into damage',()=>{
 const p=fixture();p.spawn('dual-resistant');p.spawn('candida');const hp=p.enemies.slice(1).map(e=>e.hp);p.useMedicine(1);expect(p.enemies.slice(1).map(e=>e.hp)).toEqual(hp);
 const q=fixture();q.medicine='doxycycline';q.useMedicine(1);expect(q.enemies[0].hp).toBe(100);expect(q.enemies[0].inhibited).toBe(true);expect(q.medicineCooldown).toBe(8);
});
it('early support calls arriving cells without medicine and respects capacity',()=>{
 const p=new Patrol(1);p.nextSpawn=999;p.nextGate=999;
 expect(p.beginMedicineCharge()).toBe(true);
 for(let i=0;i<31;i++)p.step(.05);
 expect(p.squad).toBe(12);expect(p.releaseMedicineCharge()).toBe(true);
 expect(p.squad).toBe(16);expect(p.cells).toHaveLength(16);expect(p.medicineCooldown).toBe(14);
 expect(p.learning.medicine).toBe(false);expect(p.events.filter(e=>e.type==='summon')).toHaveLength(1);
 expect(p.releaseMedicineCharge()).toBe(false);expect(p.useSupport()).toBe(false);
 p.squad=29;p.medicineCooldown=0;expect(p.useSupport(1)).toBe(true);expect(p.squad).toBe(30);
 expect(p.events.at(-1)?.amount).toBe(1);p.medicineCooldown=0;expect(p.beginMedicineCharge()).toBe(false);expect(p.useSupport()).toBe(false);
});
it('early calls cancel safely, tap recruits one, and terminal patrols reject calls',()=>{
 const p=new Patrol(2);p.beginMedicineCharge();p.cancelMedicineCharge();expect(p.releaseMedicineCharge()).toBe(false);expect(p.squad).toBe(12);
 expect(p.useSupport()).toBe(true);expect(p.squad).toBe(13);expect(p.medicineCooldown).toBe(8);
 p.medicineCooldown=0;p.beginMedicineCharge();p.phase='defeat';expect(p.releaseMedicineCharge()).toBe(false);expect(p.squad).toBe(13);
 expect(p.useMedicine(1)).toBe(false);
});
it('medicine feedback excludes already-cleared enemies waiting for cleanup',()=>{
 const p=fixture();p.spawn('dual-resistant');p.enemies[1].hp=0;p.useMedicine();
 const event=p.events.find(e=>e.type==='medicine');expect(event?.text).toContain('1 wall stress');expect(event?.text).not.toContain('resistant');expect(p.enemies[1].medicineReaction).toBeUndefined();
});

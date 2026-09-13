import { describe, expect, it } from 'vitest';
import { Patrol, CONTACT_DISTANCE } from '../src/simulation';
import { cellOffset } from '../src/formation';
import { medicineEffect, PATHOGENS, availableMedicines } from '../src/content';
const tick=(p:Patrol,n:number)=>{for(let i=0;i<n*20;i++)p.step(.05);};
function encounter(level=5,kind:Parameters<Patrol['spawn']>[0]='susceptible'){
    const p=new Patrol(level);p.nextSpawn=999;p.nextGate=999;p.bossSpawned=true;p.spawn(kind);
    const e=p.enemies[0];e.x=210;e.y=530;return {p,e};
}
describe('individual phagocytosis',()=>{
    it('cannot damage remote microbes and reserves only one nearby cell per target',()=>{
        const {p,e}=encounter();e.y=200;tick(p,1);expect(p.events.some(e=>e.type==='hit')).toBe(false);
        e.y=530;tick(p,.7);expect(p.cells.filter(c=>c.targetId===e.id)).toHaveLength(1);
        expect(e.hp).toBeGreaterThanOrEqual(e.maxHp); // approach has no damaging field
    });
    it('every phagocytic defeat follows contact, wrapping, and a specific digesting cell',()=>{
        const {p,e}=encounter();let contact=false,cleared=false;
        for(let i=0;i<100&&!cleared;i++){
            p.step(.05);
            const c=p.cells.find(c=>c.targetId===e.id);
            if(c?.phase==='wrap'){contact=true;expect(Math.hypot(c.x-e.x,c.y-e.y)).toBeLessThanOrEqual(CONTACT_DISTANCE+2);}
            for(const ev of p.drainEvents())if(ev.type==='death'){
                expect(contact).toBe(true);expect(ev.cause).toBe('phagocytosis');expect(ev.cellId).toBeDefined();
                expect(p.cells.find(c=>c.id===ev.cellId)).toMatchObject({phase:'digest',digestKind:'susceptible'});cleared=true;
            }
        }
        expect(cleared).toBe(true);
    });
    it('steering away cancels distant approach without remote damage',()=>{
        const {p,e}=encounter();tick(p,.5);p.move(338,460);tick(p,.1);
        expect(p.events.some(e=>e.type==='hit')).toBe(false);
        expect(p.cells.filter(c=>c.targetId===e.id)).toHaveLength(0);
    });
    it('losing the assigned cell releases its target without erasing the microbe',()=>{
        const {p,e}=encounter();p.squad=1;p.syncCells();e.y=585;tick(p,.6);
        expect(e.claimedBy).toBe(1);p.squad=0;p.syncCells();expect(e.claimedBy).toBeUndefined();expect(p.enemies).toContain(e);
    });
    it('plasma support never performs phagocytosis',()=>{
        const {p,e}=encounter();p.plasma=true;p.squad=1;p.syncCells();e.y=600;tick(p,1);
        expect(p.cells[0].role).toBe('plasma');expect(p.events.some(e=>e.type==='engulf')).toBe(false);
    });
    it('medication interruption never produces a false engulfment/digestion',()=>{
        const {p,e}=encounter();while(!p.cells.some(c=>c.phase==='wrap'))p.step(.05);
        e.hp=10;p.useMedicine();p.step(.05);
        expect(p.events.find(e=>e.type==='death')).toMatchObject({cause:'amoxicillin'});
        expect(p.cells.some(c=>c.phase==='digest')).toBe(false);
    });
});
describe('antibody and host-defense specificity',()=>{
    it('waits for diffusion; bound antibody changes no health',()=>{
        const {p,e}=encounter();e.y=200;p.plasma=true;p.tag();expect(e.tagged).toBe(false);expect(p.antibodies).toHaveLength(1);
        const hp=e.hp;for(let i=0;i<50;i++)p.stepAntibodies(.05);
        expect(e.tagged).toBe(true);expect(e.hp).toBe(hp);expect(p.events.some(e=>e.type==='hit')).toBe(false);
    });
    it('an emitted antibody retains its profile if the player switches during diffusion',()=>{
        const {p,e}=encounter();e.y=200;p.plasma=true;p.tag();p.antibody={epitope:'B',affinity:.9,effector:'opsonization'};
        for(let i=0;i<50;i++)p.stepAntibodies(.05);
        expect(e.tagAffinity).toBe(.45);expect(e.tagged).toBe(true);
    });
    it('complement aids capsule uptake without directly damaging microbes',()=>{
        const {p,e}=encounter(5,'pneumococcus');e.y=200;const hp=e.hp;
        p.useComplement();p.step(.05);expect(e.complementTagged).toBe(true);expect(e.hp).toBeGreaterThanOrEqual(hp);
        const {p:plain,e:b}=encounter(5,'pneumococcus');e.y=b.y=540;
        for(const x of [p,plain])while(!x.cells.some(c=>c.phase==='wrap'))x.step(.05);
        expect(p.cells.find(c=>c.phase==='wrap')!.duration).toBeLessThan(plain.cells.find(c=>c.phase==='wrap')!.duration);
    });
    it('distinguishes fungal target mismatch from bacterial resistance',()=>{
        expect(medicineEffect('amoxicillin','candida').feedback).toContain('target');
        expect(medicineEffect('amoxicillin','pseudomonas').feedback).toContain('resistant');
        expect(medicineEffect('micafungin','candida').effective).toBe(true);
        expect(availableMedicines(6).some(m=>m.id==='micafungin')).toBe(false);
        expect(availableMedicines(9)).toHaveLength(4);
    });
});
describe('roster and organic layouts',()=>{
    it('has five actual species with correct distinct art and a fungus',()=>{
        expect(new Set(PATHOGENS.map(p=>p.species)).size).toBe(5);
        expect(PATHOGENS.find(p=>p.id==='candida')?.kind).toBe('fungus');
        expect(new Set(PATHOGENS.filter(p=>p.art.texture==='microbes-v3').map(p=>p.art.row)).size).toBe(4);
    });
    it('uses bounded irregular slots and recruitment leaves existing slots stable',()=>{
        const slots=Array.from({length:30},(_,i)=>cellOffset(i));
        expect(new Set(slots.map(p=>p.y)).size).toBe(30);
        expect(slots.every(p=>Math.abs(p.x)<95&&Math.abs(p.y)<65)).toBe(true);
        const {p}=encounter();const before=p.cells.map(c=>[c.x,c.y]);p.squad=30;p.syncCells();
        expect(p.cells.slice(0,12).map(c=>[c.x,c.y])).toEqual(before);
    });
});

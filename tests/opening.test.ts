import {expect,it} from 'vitest';
import {Patrol} from '../src/simulation';
it('offers a real catch in the first eight seconds and a gate choice by twelve',()=>{
 const p=new Patrol(1);let firstCatch=0,firstGate=0;
 for(let i=0;i<240;i++){
  if(p.kills>0)p.move(110,635);
  p.step(.05);
  if(p.kills&&!firstCatch)firstCatch=p.time;
  if(p.learning.gate&&!firstGate)firstGate=p.time;
 }
 expect(firstCatch).toBeGreaterThan(0);expect(firstCatch).toBeLessThan(8);
 expect(firstGate).toBeGreaterThan(firstCatch);expect(firstGate).toBeLessThan(12);
 expect(p.casualties).toBe(0);
 expect(p.events.some(e=>e.type==='death'&&e.cause==='phagocytosis')).toBe(true);
});
it('reports actual recruits at capacity rather than the advertised gate amount',()=>{
 const p=new Patrol(1);p.squad=29;p.syncCells();
 p.applyGate({id:99,y:p.y,used:false},'left');
 expect(p.events.find(e=>e.type==='gate')?.label).toBe('+1 cell');
 p.events=[];p.applyGate({id:100,y:p.y,used:false},'left');
 expect(p.events.find(e=>e.type==='gate')?.label).toBe('Squad full · 30 cells');
 expect(p.events.some(e=>e.type==='recruit')).toBe(false);
});

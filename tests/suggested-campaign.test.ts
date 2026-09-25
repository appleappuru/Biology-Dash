import {it,expect} from 'vitest';
import {Patrol} from '../src/simulation';
import {freshSave} from '../src/save';
import {deploymentFor} from '../src/roster';
import {settleRun} from '../src/economy';
it('suggested squads can progress through the campaign without purchases or the optional selection room',()=>{
 const s=freshSave();
 for(let level=1;level<=10;level++){
  const p=new Patrol(level);p.medicine=level===4?'doxycycline':level===7?'micafungin':level>=9?'cefepime':'amoxicillin';p.loadout=deploymentFor(s.roster,level,true).members;p.syncCells();
  for(let i=0;i<1801&&p.phase==='playing';i++){
   const e=p.enemies.filter(e=>e.y>440).sort((a,b)=>b.y-a.y)[0];
   if(e)p.move(e.x,Math.max(460,Math.min(635,e.y+110)));else if(p.gates.some(g=>!g.used&&g.y>490))p.move(110,635);
   if(p.supportReady)p.useMedicine(1);
   p.step(.05);
  }
  expect(p.phase,`level ${level}: ${p.squad} cells, ${p.kills} clears`).toBe('victory');
  settleRun(s,p,'suggested-'+level);
 }
});

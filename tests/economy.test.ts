import {deploymentFor} from '../src/roster';
import {it,expect} from 'vitest';
import {freshSave,parseSave} from '../src/save';
import {buy,settleRun,swapMember,unlockRoster,applyFormation} from '../src/economy';
import {Patrol} from '../src/simulation';
it('first win funds a permanent teammate; purchases and rewards cannot repeat',()=>{const s=freshSave(),p=new Patrol(1);p.phase='victory';p.kills=12;p.time=90;const r=settleRun(s,p,'one')!;expect(r.total).toBe(94);expect(buy(s,'recruit:zip')).toContain('Purchased');expect(s.roster.owned).toContain('zip');const n=s.credits;buy(s,'recruit:zip');settleRun(s,p,'one');expect(s.credits).toBe(n);const restored=parseSave(JSON.stringify(s));settleRun(restored,p,'one');expect(restored.credits).toBe(n);expect(restored.economy.pending?.total).toBe(94);});
it('replays earn less; failed runs require meaningful progress',()=>{const s=freshSave(),p=new Patrol(1);p.phase='defeat';p.time=2;p.kills=20;expect(settleRun(s,p,'early')?.total).toBe(0);p.time=30;p.kills=7;expect(settleRun(s,p,'failure')?.total).toBe(7);p.phase='victory';p.kills=10;expect(settleRun(s,p,'first')!.total).toBeGreaterThan(settleRun(s,p,'replay')!.total);});
it('legacy conversion preserves progress, balances, and purchased slots',()=>{const s=parseSave(JSON.stringify({version:3,credits:75,reinforcement:3,completed:[1,2,3,4],stars:{1:3}}));expect(s.credits).toBe(75);expect(s.roster.loadout).toHaveLength(15);expect(s.roster.owned).toContain('pluma');expect(s.stars[1]).toBe(3);expect(s.economy.migrationNotice).toBe(true);});
it('loadouts keep catchers, owned membership, and capacity safe',()=>{const s=freshSave();s.completed=[1,2,3,4];unlockRoster(s);expect(swapMember(s,0,'zip',5)).toBe(false);for(let i=0;i<6;i++)expect(swapMember(s,i,'pluma',5)).toBe(true);expect(swapMember(s,6,'pluma',5)).toBe(false);const p=new Patrol(5);p.loadout=s.roster.loadout;p.syncCells();expect(p.cells.filter(c=>c.role==='plasma')).toHaveLength(6);p.squad=6;p.syncCells();expect(s.roster.loadout).toHaveLength(12);});
it('upgrades are bounded and insufficient funds never spend',()=>{const s=freshSave();expect(buy(s,'upgrade:neutro')).toContain('Need');expect(s.credits).toBe(0);s.credits=1000;buy(s,'upgrade:neutro');buy(s,'upgrade:neutro');const n=s.credits;buy(s,'upgrade:neutro');expect(s.credits).toBe(n);expect(s.roster.upgrades.neutro).toBe(2);});
it('all ten patrols remain achievable with a mixed earned roster',()=>{const s=freshSave();for(let level=1;level<=10;level++){unlockRoster(s);const p=new Patrol(level);p.loadout=Array.from({length:12},(_,i)=>level>=5&&i===11?'pluma':level>=2&&i%3===0?'maco':'neutro');p.medicine=level===4?'doxycycline':level===7?'micafungin':level>=9?'cefepime':'amoxicillin';for(let i=0;i<1900&&p.phase==='playing';i++){const e=p.enemies.filter(e=>e.y>350).sort((a,b)=>b.y-a.y)[0];if(e)p.move(e.x,Math.max(460,Math.min(635,e.y+65)));else p.move(110);if(p.enemies.length)p.useMedicine();if(level>=5)p.useComplement();p.step(.05);}expect(p.phase,`patrol ${level}`).toBe('victory');settleRun(s,p,'campaign-'+level);if(level===1)expect(buy(s,'recruit:zip')).toContain('Purchased');}expect(s.credits).toBeGreaterThan(500);});

it('quick formations respect ownership, level gates and catchers',()=>{
 const s=freshSave();expect(applyFormation(s,1,'teamwork')).toBe(false);applyFormation(s,1,'catchers');expect(new Set(s.roster.loadout)).toEqual(new Set(['neutro']));
 s.completed=[1,2,3,4];unlockRoster(s);s.reinforcement=2;expect(applyFormation(s,5,'teamwork')).toBe(true);expect(s.roster.loadout).toHaveLength(14);expect(s.roster.loadout.filter(id=>id==='pluma')).toHaveLength(2);expect(s.roster.loadout).not.toContain('zip');applyFormation(s,2,'catchers');expect(s.roster.loadout).not.toContain('pluma');
});

it('earlier patrol previews match deployment without changing the saved team',()=>{
 const s=freshSave();s.completed=[1,2,3,4];unlockRoster(s);applyFormation(s,5,'teamwork');const saved=[...s.roster.loadout];
 const early=deploymentFor(s.roster,1);expect(early.members.every(id=>id==='neutro')).toBe(true);expect(early.taggers).toBe(0);expect(early.substitutions).toBeGreaterThan(0);expect(s.roster.loadout).toEqual(saved);
 expect(deploymentFor(s.roster,5).taggers).toBe(2);
});

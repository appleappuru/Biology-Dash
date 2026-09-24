import {expect,it} from 'vitest';
import {freshSave,parseSave} from '../src/save';
import {deploymentFor} from '../src/roster';
import {swapMember,applyFormation} from '../src/economy';
it('suggested squads add only owned and level-appropriate roles without changing the saved lineup',()=>{
 const s=freshSave();s.roster.owned=['neutro','maco','pluma'];const original=[...s.roster.loadout];
 expect(deploymentFor(s.roster,1,true).members).toEqual(original);
 expect(deploymentFor(s.roster,2,true).members.filter(x=>x==='maco')).toHaveLength(3);
 expect(deploymentFor(s.roster,5,true).taggers).toBe(2);expect(deploymentFor(s.roster,5,true).catchers).toBe(10);
 expect(s.roster.loadout).toEqual(original);expect(deploymentFor(freshSave().roster,5,true).taggers).toBe(0);
});
it('manual all-neutrophil choices persist, and old mixed saves retain their team',()=>{
 const s=freshSave();expect(swapMember(s,0,'neutro',1)).toBe(true);expect(s.customLoadout).toBe(true);
 expect(parseSave(JSON.stringify(s)).customLoadout).toBe(true);
 const old={...freshSave(),customLoadout:undefined};old.roster.owned.push('maco');old.roster.loadout[0]='maco';
 const migrated=parseSave(JSON.stringify(old));expect(migrated.customLoadout).toBe(true);expect(deploymentFor(migrated.roster,2,!migrated.customLoadout).members[0]).toBe('maco');
 expect(applyFormation(s,1,'catchers')).toBe(true);expect(s.customLoadout).toBe(true);
});

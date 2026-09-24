import type {Save} from './save';
import {completeLevel} from './save';
import type {Patrol} from './simulation';
import {ECONOMY,ROSTER,rosterOption,type RosterId} from './roster';
export interface Transaction {id:string;source:string;amount:number}
export interface Reward {id:string;level:number;won:boolean;lines:{label:string;coins:number}[];total:number}
export interface EconomyState {transactions:Transaction[];settled:string[];pending:Reward|null;migrationNotice:boolean}
export const freshEconomy=():EconomyState=>({transactions:[],settled:[],pending:null,migrationNotice:false});
export function transact(s:Save,id:string,amount:number,source:string){
 if(!id||!Number.isSafeInteger(amount)||s.economy.transactions.some(t=>t.id===id)||s.credits+amount<0)return false;
 s.credits+=amount;s.economy.transactions.push({id,source,amount});return true;
}
export function unlockRoster(s:Save){for(const r of ROSTER)if(!r.cost&&(r.level===1||s.completed.includes(r.level-1))&&!s.roster.owned.includes(r.id))s.roster.owned.push(r.id);}
export function price(s:Save,id:string){if(id==='capacity')return s.reinforcement<6?ECONOMY.capacityCost:null;const [kind,key]=id.split(':');const r=ROSTER.find(r=>r.id===key);if(!r)return null;if(kind==='recruit')return s.roster.owned.includes(r.id)?null:r.cost;const n=s.roster.upgrades[r.id]??0;return kind==='upgrade'&&s.roster.owned.includes(r.id)?ECONOMY.upgradeCosts[n]??null:null;}
export function buy(s:Save,id:string){const cost=price(s,id);if(cost===null)return 'Already owned or maxed out.';const [kind,key]=id.split(':');const r=ROSTER.find(r=>r.id===key);if(r&&r.level>1&&!s.completed.includes(r.level-1))return `Complete patrol ${r.level-1} first.`;if(s.credits<cost)return `Need ${cost-s.credits} more Coins.`;
 const current=id==='capacity'?s.reinforcement:kind==='upgrade'?(s.roster.upgrades[key as RosterId]??0):0;
 if(!transact(s,`buy:${id}:${current}`,-cost,`purchase:${id}`))return 'Already purchased.';
 if(id==='capacity'){s.reinforcement++;s.roster.loadout.push('neutro');}else if(kind==='recruit')s.roster.owned.push(key as RosterId);else s.roster.upgrades[key as RosterId]=current+1;
 return 'Purchased! Ready for your next patrol.';
}
export function swapMember(s:Save,index:number,id:RosterId,level:number){if(!s.roster.owned.includes(id)||rosterOption(id).level>level||index<0||index>=s.roster.loadout.length)return false;const copy=[...s.roster.loadout];copy[index]=id;if(copy.filter(x=>rosterOption(x).role!=='plasma').length<6)return false;s.roster.loadout=copy;return true;}
export function rewardFor(s:Save,p:Patrol,id:string):Reward{const won=p.phase==='victory',lines=[];if(won){lines.push({label:s.completed.includes(p.level)?'Patrol replay':'First patrol clear',coins:s.completed.includes(p.level)?ECONOMY.completion:ECONOMY.first});lines.push({label:`${p.kills} microbes cleared (cap ${ECONOMY.clearCap})`,coins:Math.min(ECONOMY.clearCap,p.kills*ECONOMY.perClear)});if(p.casualties===0)lines.push({label:'No casualties',coins:ECONOMY.flawless});if(p.learning.cooperation)lines.push({label:'Tag teamwork',coins:ECONOMY.teamwork});}else lines.push({label:'Progress made · 20s + 3 clears required',coins:p.time>=20&&p.kills>=3?Math.min(ECONOMY.failureCap,p.kills):0});return{id,level:p.level,won,lines,total:lines.reduce((n,l)=>n+l.coins,0)};}
export function settleRun(s:Save,p:Patrol,id:string){if(s.economy.settled.includes(id))return s.economy.pending?.id===id?s.economy.pending:null;const reward=rewardFor(s,p,id);if(p.phase==='playing')return null;
 if(!transact(s,`reward:${id}`,reward.total, reward.won?'patrol-completion':'patrol-progress'))return null;
 s.economy.settled.push(id);if(reward.won)completeLevel(s,p.level,p.squad,p.learning,p.score,false);unlockRoster(s);s.economy.pending=reward;return reward;}

/** Optional starting formations; ownership and level gates remain authoritative. */
export function applyFormation(s:Save,level:number,kind:'catchers'|'teamwork'){
 const available=ROSTER.filter(r=>s.roster.owned.includes(r.id)&&r.level<=level);
 const catchers=available.filter(r=>r.role!=='plasma');
 if(!catchers.length)return false;
 const size=12+s.reinforcement;
 const next=Array.from({length:size},(_,i)=>catchers[i%catchers.length].id);
 if(kind==='teamwork'){
  if(!available.some(r=>r.id==='pluma'))return false;
  next[size-1]='pluma';next[size-2]='pluma';
 }
 s.roster.loadout=next;return true;
}

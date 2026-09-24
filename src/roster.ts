import type { DefenderId } from './content';
export type RosterId = 'neutro'|'zip'|'scout'|'maco'|'pluma';
export const ROSTER: {id:RosterId;name:string;role:DefenderId;level:number;cost:number;mark:string;color:number;detail:string;upgrade:string}[] = [
 {id:'neutro',name:'Neutrophil',role:'neutrophil',level:1,cost:0,mark:'●',color:0xc4e5f5,detail:'Balanced catcher. Reliable reach and recovery.',upgrade:'Recovery time −8% per level'},
 {id:'zip',name:'Fast neutrophil',role:'neutrophil',level:2,cost:60,mark:'»',color:0xffd897,detail:'30% faster approach; 18% less reach. Great close up.',upgrade:'Approach 8% faster per level'},
 {id:'scout',name:'Long-reach neutrophil',role:'neutrophil',level:3,cost:90,mark:'◇',color:0xc9b4ed,detail:'25% more reach; 20% slower wrapping. Finds stragglers.',upgrade:'Reach +6 per level'},
 {id:'maco',name:'Macrophage',role:'macrophage',level:2,cost:0,mark:'♥',color:0x86d6c1,detail:'Broad hugs; stronger colony bites, slower approach.',upgrade:'Tagged wrapping time −10% per level'},
 {id:'pluma',name:'Plasma cell',role:'plasma',level:5,cost:0,mark:'Y',color:0xe1b5f1,detail:'Makes matching tags. Cannot engulf; needs catchers.',upgrade:'Secretion interval −10% per level'},
];
export const rosterOption=(id:RosterId)=>ROSTER.find(r=>r.id===id)!;
export const ECONOMY={first:60,completion:20,perClear:2,clearCap:40,flawless:10,teamwork:10,failureCap:15,upgradeCosts:[70,110],capacityCost:60,maxCapacity:6};
export interface RosterState {owned:RosterId[];loadout:RosterId[];upgrades:Partial<Record<RosterId,number>>}
export const defaultRoster=():RosterState=>({owned:['neutro'],loadout:Array(12).fill('neutro'),upgrades:{}});

/** Shared by gameplay and purchase previews; values are game tuning, not clinical measurements. */
export function upgradeEffect(id:RosterId,level:number){
 const n=Math.max(0,Math.min(2,Math.floor(level)));
 return {recoveryFactor:id==='neutro'?1-n*.08:1,approachFactor:id==='zip'?1+n*.08:1,reachBonus:id==='scout'?n*6:0,taggedWrapFactor:id==='maco'?1-n*.1:1,secretionFactor:id==='pluma'?1-n*.1:1};
}
export function upgradePreview(id:RosterId,level:number){
 const current=Math.max(0,Math.min(2,Math.floor(level))),next=Math.min(2,current+1);
 const format=(n:number)=>{
  const e=upgradeEffect(id,n);
  if(id==='neutro')return `${Math.round((1-e.recoveryFactor)*100)}% shorter recovery`;
  if(id==='zip')return `+${Math.round((e.approachFactor-1)*100)}% approach speed`;
  if(id==='scout')return `+${e.reachBonus} reach`;
  if(id==='maco')return `${Math.round((1-e.taggedWrapFactor)*100)}% shorter tagged wraps`;
  return `${Math.round((1-e.secretionFactor)*100)}% shorter secretion interval`;
 };
 return {current:format(current),next:format(next),maxed:current===2};
}

/** Resolve a replay's available cast without mutating the player's saved team. */
export function deploymentFor(roster:RosterState,level:number){
 const members=roster.loadout.map(id=>roster.owned.includes(id)&&rosterOption(id).level<=level?id:'neutro') as RosterId[];
 const substitutions=members.filter((id,i)=>id!==roster.loadout[i]).length;
 const taggers=members.filter(id=>rosterOption(id).role==='plasma').length;
 return {members,substitutions,taggers,catchers:members.length-taggers};
}

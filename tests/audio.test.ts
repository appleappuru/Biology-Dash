import {describe,it,expect} from 'vitest';
import {AudioDirector,type Note} from '../src/audio';
import {freshSave,parseSave} from '../src/save';
const harness=()=>{const notes:Note[]=[];const d=new AudioDirector(n=>notes.push(n),()=>.5);return{notes,d};};
describe('original audio direction',()=>{
 it('aggregates thirty simultaneous clearances into at most three effects and two quiet harmonics',()=>{const{d,notes}=harness();for(let i=0;i<30;i++)d.clearance(1);d.update(1.064);expect(notes).toHaveLength(0);d.update(1.066);expect(notes.filter(n=>n.bus==='sfx')).toHaveLength(3);expect(notes.filter(n=>n.bus==='music')).toHaveLength(2);expect(Math.max(...notes.map(n=>n.gain))).toBeLessThan(.07);d.update(2);expect(notes).toHaveLength(5);});
 it('rises harmonically without getting louder and resets after a gap',()=>{const{d,notes}=harness();for(let i=0;i<7;i++){d.clearance(i*.3);d.update(i*.3+.07);}const melody=notes.filter(n=>n.bus==='sfx');expect(melody.at(-1)!.frequency).toBeGreaterThan(melody[0].frequency);expect(new Set(melody.map(n=>n.gain)).size).toBe(1);d.clearance(5);d.update(5.07);expect(notes.at(-1)!.frequency).toBe(melody[0].frequency);});
 it('distinguishes mechanisms, uses deeper macrophage contacts, and never scores antibody binding as a kill',()=>{const{d,notes}=harness();d.event({type:'contact',text:''},0);d.event({type:'contact',text:''},.2,true);expect(notes[1].frequency).toBeLessThan(notes[0].frequency);d.event({type:'tag',text:''},1);expect(notes.at(-1)!.cue).toBe('bind');expect(d.combo).toBe(0);for(const [cause,cue] of [['amoxicillin','wall'],['doxycycline','growth'],['micafungin','fungal']] as const){d.event({type:'medicine',text:'',cause},2);expect(notes.at(-1)!.cue).toBe(cue);}});
 it('rate limits threats and tiny contacts but preserves meaningful rewards',()=>{const{d,notes}=harness();for(let i=0;i<100;i++){d.cue('hug',i*.001);d.cue('threat',i*.001);}expect(notes).toHaveLength(2);d.cue('victory',.1);expect(notes.filter(n=>n.priority===4)).toHaveLength(5);});
 it('discards queued clears and combo state on interruption',()=>{const{d,notes}=harness();d.clearance(0);d.reset();d.update(1);expect(notes).toHaveLength(0);expect(d.combo).toBe(0);});
 it('preserves old mute/master preferences while migrating independent channel controls',()=>{const old=parseSave(JSON.stringify({version:4,muted:true,volume:0,credits:123}));expect(old.muted).toBe(true);expect(old.volume).toBe(0);expect(old.credits).toBe(123);expect(old.sfxVolume).toBe(1);expect(old.musicVolume).toBe(.45);const saved=parseSave(JSON.stringify({...freshSave(),sfxVolume:0,musicVolume:.2}));expect(saved.sfxVolume).toBe(0);expect(saved.musicVolume).toBe(.2);const invalid=parseSave(JSON.stringify({...freshSave(),sfxVolume:-1,musicVolume:99}));expect(invalid.sfxVolume).toBe(0);expect(invalid.musicVolume).toBe(1);});
});

it('keeps twenty minutes of dense successes bounded with periodic musical space',()=>{
 let count=0,maxWindow=0;const windows=new Map<number,number>();let now=0;
 const director=new AudioDirector(n=>{count++;const second=Math.floor(now+(n.delay??0));windows.set(second,(windows.get(second)??0)+1);maxWindow=Math.max(maxWindow,windows.get(second)!);},()=>.5);
 for(let i=0;i<60000;i++){now=i*.02;if(i%5===0){for(let k=0;k<30;k++)director.clearance(now);director.cue('hug',now);director.cue('bind',now);}if(i%250===0)director.cue('wall',now,false,1);director.update(now);}
 expect(director.pending).toBeLessThanOrEqual(30);expect(director.combo).toBeLessThanOrEqual(64);expect(maxWindow).toBeLessThanOrEqual(33);expect(count).toBeLessThan(36000);
});

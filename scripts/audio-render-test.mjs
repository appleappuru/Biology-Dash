import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
try{
 await page.goto('http://127.0.0.1:4190');
 const result=await page.evaluate(async()=>{
  const ctx=new OfflineAudioContext(1,24000*26,24000),a=new __BIOLOGY__.audio.constructor();a.context=ctx;a.connect(ctx);a.configure({muted:false,volume:1,sfxVolume:1,musicVolume:.45});
  // Independent checks cover original isolated colors, a charged discharge, burst,
  // repeated crowded play, and the rare completion hierarchy in one render.
  const suspends=[];
  for(let i=1;i<260;i++)suspends.push(ctx.suspend(i*.1).then(()=>{
   const t=ctx.currentTime;
   if(i===2)a.director.cue('hug',t);
   if(i===5)a.director.clearance(t);
   if(i===12)a.director.cue('hug',t,true);
   if(i===16)a.director.clearance(t);
   if(i===22)a.director.cue('bind',t);
   if(i===29)a.director.cue('complement',t);
   if(i===36)a.director.cue('wall',t,false,1);
   if(i===46)a.director.cue('growth',t);
   if(i===56)a.director.cue('fungal',t);
   if(i===66)a.director.cue('peptide',t);
   if(i===73)a.director.cue('threat',t);
   if(i===81)a.director.cue('heal',t);
   if(i===91)a.director.cue('reward',t);
   if(i>=100&&i<116)a.update(true,(i-100)/15);
   if(i===116){a.stopCharge();a.director.cue('wall',t,false,1);}
   if(i===123)for(let n=0;n<30;n++)a.director.clearance(t);
   if(i>=140&&i<220){a.director.cue('hug',t,i%3===0);a.director.cue('bind',t);for(let n=0;n<3;n++)a.director.clearance(t);if(i%10===0)a.director.cue('wall',t,false,1);}
   if(i===226){a.stop();a.director.cue('victory',t);}
   if(i<100||i>=116)a.update();
   return ctx.resume();
  }));
  const rendered=await ctx.startRendering();await Promise.all(suspends);const samples=rendered.getChannelData(0);let peak=0,sum=0,late=0;for(let i=0;i<samples.length;i++){peak=Math.max(peak,Math.abs(samples[i]));sum+=samples[i]**2;if(i>24000*25)late=Math.max(late,Math.abs(samples[i]));}
  const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++)pcm[i]=Math.round(Math.max(-1,Math.min(1,samples[i]))*32767);
  let binary='';const bytes=new Uint8Array(pcm.buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return{peak,rms:Math.sqrt(sum/samples.length),late,stats:a.stats,pcm:btoa(binary)};
 });
 const pcm=Buffer.from(result.pcm,'base64');delete result.pcm;
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 await writeFile('artifacts/biology-audio-palette.wav',Buffer.concat([header,pcm]));await writeFile('artifacts/audio-render-metrics.json',JSON.stringify(result,null,2));
 expect(result.peak).toBeLessThan(.3);expect(result.peak).toBeGreaterThan(.02);expect(result.rms).toBeLessThan(.06);expect(result.late).toBeLessThan(.0001);expect(result.stats.peakVoices).toBeLessThanOrEqual(8);
 console.log('PASS rendered original palette and crowded mix at full master volume',JSON.stringify(result));
}finally{await browser.close();}

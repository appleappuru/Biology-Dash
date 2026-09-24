import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.evaluate(()=>__BIOLOGY__.start(3));await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await page.evaluate(()=>{window.chargedEvents=[];const s=__BIOLOGY__.scene,original=s.reaction.bind(s);s.reaction=e=>{if(e.type==='medicine')window.chargedEvents.push({time:s.patrol.time,charge:e.charge});original(e);};});
 for(let i=0;i<70;i++){
  const state=await page.evaluate(()=>({phase:__BIOLOGY__.state.phase,ready:__BIOLOGY__.state.medicineCooldown===0&&__BIOLOGY__.state.enemies.length>0}));
  if(state.phase!=='playing')break;
  if(state.ready){await page.keyboard.down('Space');await page.waitForTimeout(1650);await page.keyboard.up('Space');}
  await page.waitForTimeout(1500);
 }
 await page.locator('.reward-card').waitFor({timeout:5000});
 const result=await page.evaluate(()=>({time:__BIOLOGY__.state.time,phase:__BIOLOGY__.state.phase,kills:__BIOLOGY__.state.kills,events:window.chargedEvents,settled:__BIOLOGY__.save.economy.settled.length}));
 expect(result.events.length).toBeGreaterThanOrEqual(3);expect(result.events.every(e=>e.charge===1)).toBe(true);expect(result.settled).toBe(1);expect(errors).toEqual([]);
 await writeFile('artifacts/charged-patrol.json',JSON.stringify({result,errors,note:'Natural clock/spawns; level unlocked by test entry only; keyboard charged support from center.'},null,2));console.log('PASS natural charged patrol',JSON.stringify(result));
}finally{await browser.close();}

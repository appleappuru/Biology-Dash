import {chromium,expect} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.locator('#continue').click();await page.evaluate(()=>__BIOLOGY__.start(3));await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await page.evaluate(()=>{const a=__BIOLOGY__.audio,original=a.director.note.bind(a.director);window.heard=[];a.director.note=(...args)=>{heard.push(args[0]);return original(...args);};});
 const results=[];
 for(const [medicine,kinds,expected] of [['amoxicillin',['dual-resistant'],'noMatch'],['amoxicillin',['candida'],'noMatch'],['amoxicillin',['dual-resistant','susceptible'],'wall'],['doxycycline',['susceptible'],'growth']]){
  await page.evaluate(({medicine,kinds})=>{const p=__BIOLOGY__.state,a=__BIOLOGY__.audio;p.nextSpawn=p.nextGate=p.nextDefensin=999;p.squad=0;p.syncCells();p.enemies=[];p.events=[];p.medicine=medicine;p.medicineCooldown=0;p.cancelMedicineCharge();for(const kind of kinds){p.spawn(kind);p.enemies.at(-1).y=200;p.enemies.at(-1).hp=1000;}a.stop();heard.length=0;},{medicine,kinds});
  await expect(page.locator('#support')).toBeEnabled();await page.locator('#support').focus();await page.keyboard.down('Space');await expect(page.locator('#support')).toContainText('Release!');await page.waitForTimeout(100);await page.evaluate(()=>heard.length=0);await page.keyboard.up('Space');await page.waitForTimeout(150);
  const result=await page.evaluate(()=>({heard:[...heard],combo:__BIOLOGY__.audio.director.combo,exposures:__BIOLOGY__.state.enemies.filter(e=>e.exposure).length}));
  expect(result.heard[0]).toBe(expected);if(expected==='noMatch'){expect(result.heard).toEqual(['noMatch']);expect(result.exposures).toBe(0);}else{expect(result.heard).toContain('ready');expect(result.exposures).toBe(1);}expect(result.combo).toBe(0);results.push({medicine,kinds,...result});
 }
 expect(errors).toEqual([]);await writeFile('artifacts/medicine-audio-match.json',JSON.stringify({results,errors},null,2));console.log('PASS charged resistant, non-target, mixed and growth-suppression audio agrees with actual exposure');
}finally{await browser.close();}

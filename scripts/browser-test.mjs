import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await ctx.newPage();const errors=[];const results=[];page.on('pageerror',e=>errors.push(e.message));
const ok=(name,data={})=>{results.push({name,pass:true,...data});console.log('PASS',name,JSON.stringify(data));};
try {
await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
await expect(page.locator('#continue')).toBeVisible();await page.screenshot({path:'artifacts/map-phone.png',fullPage:true});
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);ok('Phone map has no horizontal overflow');
await page.locator('.mobile-nav [data-nav="settings"]').click();await page.locator('#mute').click();await page.locator('#motion').click();await page.reload();await page.locator('.mobile-nav [data-nav="settings"]').click();await expect(page.locator('#mute')).toHaveText('Off');await expect(page.locator('#motion')).toHaveText('On');ok('Settings persist after reload');
await page.locator('.mobile-nav [data-nav="patrol"]').click();await page.locator('#continue').click();await page.locator('#begin').click();await page.locator('#learn').click();
await page.waitForFunction(()=>window.__BIOLOGY__?.state?.time>0);
const box=await page.locator('canvas').boundingBox();
await page.mouse.move(box.x+box.width*.5,box.y+box.height*.85);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.85,{steps:8});await page.mouse.up();
expect(await page.evaluate(()=>window.__BIOLOGY__.state.x)).toBeGreaterThan(280);ok('Relative pointer steering works below squad');
await page.keyboard.down('ArrowLeft');await page.waitForTimeout(500);await page.keyboard.up('ArrowLeft');expect(await page.evaluate(()=>window.__BIOLOGY__.state.x)).toBeLessThan(250);ok('Keyboard steering');
await page.locator('#pause').click();const t=await page.evaluate(()=>window.__BIOLOGY__.state.time);await page.waitForTimeout(250);expect(await page.evaluate(()=>window.__BIOLOGY__.state.time)).toBe(t);await page.locator('#resume').click();ok('Pause freezes simulation and resumes');
// Real-time run with actual mouse input; internal state is read only to select target lanes.
let captured=false;const begin=Date.now();
while(await page.evaluate(()=>window.__BIOLOGY__.state?.phase==='playing')){
 const target=await page.evaluate(()=>{const p=window.__BIOLOGY__.state;const e=p.enemies.filter(e=>e.y>425).sort((a,b)=>b.y-a.y)[0];return {x:e?.x??(p.gates.some(g=>!g.used&&g.y>480)?110:p.x),current:p.x,time:p.time,kills:p.kills};});
 const dx=(target.x-target.current)/420*box.width;const start=box.x+box.width/2;
 await page.mouse.move(start,box.y+box.height*.87);await page.mouse.down();await page.mouse.move(start+dx,box.y+box.height*.87,{steps:2});await page.mouse.up();
 if(!captured&&target.time>18){await page.screenshot({path:'artifacts/patrol-phone.png'});captured=true;}
 if(Date.now()-begin>180000)throw Error('real-time patrol exceeded 180 seconds');
 await page.waitForTimeout(220);
}
await expect(page.getByRole('heading',{name:'Tiny team. Mission complete.'})).toBeVisible();await page.screenshot({path:'artifacts/victory-phone.png'});ok('Complete real-time 90-second first patrol',{wallSeconds:Math.round((Date.now()-begin)/1000)});
await page.locator('#result-map').click();await page.reload();await expect(page.locator('[data-level="2"]')).toBeEnabled();expect(await page.evaluate(()=>window.__BIOLOGY__.save.completed)).toContain(1);ok('Earned unlock and save restoration');
await page.evaluate(()=>window.__BIOLOGY__.start(3));await page.waitForFunction(()=>window.__BIOLOGY__.state?.level===3);await page.evaluate(()=>window.__BIOLOGY__.lose());await expect(page.getByRole('heading',{name:'Let’s try another approach.'})).toBeVisible();await page.locator('#next').click();await page.waitForFunction(()=>window.__BIOLOGY__.state?.squad===12);ok('Defeat and immediate restart');
await page.locator('#pause').click();await page.locator('#leave').click();
for(const level of [4,6,7,8,9,10]){
 await page.evaluate(id=>window.__BIOLOGY__.start(id),level);await page.waitForFunction(id=>window.__BIOLOGY__.state?.level===id,level);
 if(level>=5)await page.locator('#recruit-plasma').click();
 if(level===7){await page.locator('#pause').click();await page.locator('#leave').click();await page.locator('[data-level="7"]').click();await page.locator('#begin').click();await page.locator('#clone-weak').click();await expect(page.locator('#select-clone')).toBeDisabled();await page.locator('#clone-strong').click();await page.locator('#select-clone').click();await page.locator('#recruit-plasma').click();expect(await page.evaluate(()=>window.__BIOLOGY__.save.antibody.affinity)).toBe(.9);ok('Playable clone variation and improved-affinity selection');}
 await page.evaluate(()=>window.__BIOLOGY__.advance(36,true));
 if(level===6||level===8||level===10){const prompt=await page.locator('.lab').innerText();const a=prompt.includes('EPITOPE A');await page.locator(a?'#match-b':'#match-a').click();await expect(page.locator('#continue-check')).toBeDisabled();await page.locator(a?'#match-a':'#match-b').click();}
 else {const report=await page.locator('.lab').innerText();const doxy=report.includes('amoxicillin resistant')||report.includes('Beta-lactamase');if(level===4){await page.locator('#pick-amox').click();await expect(page.locator('#continue-check')).toBeDisabled();await expect(page.locator('#answer')).toContainText('resistant');}await page.locator(doxy?'#pick-doxy':'#pick-amox').click();}
 await page.locator('#continue-check').click();if(level>=5){await page.locator('#antibody').click();await page.locator(level===6?'#equip-b':'#equip-a').click();}await page.evaluate(()=>window.__BIOLOGY__.advance(55,true));await expect(page.locator('#result-map')).toBeVisible();ok(`Level ${level} accelerated simulation and real learning-panel inputs`,{phase:await page.evaluate(()=>window.__BIOLOGY__.state.phase)});await page.locator('#result-map').click();
}
// Repeated-run resource inspection uses test-only state controls.
const counts=[];for(let i=0;i<6;i++){await page.evaluate(()=>window.__BIOLOGY__.start(1));await page.waitForFunction(()=>window.__BIOLOGY__.state?.level===1);await page.evaluate(()=>window.__BIOLOGY__.advance(20,true));counts.push(await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,scenes:window.__BIOLOGY__.scene.game.scene.scenes.length,children:window.__BIOLOGY__.scene.children.length,listeners:window.__BIOLOGY__.scene.input.listenerCount('pointermove')})));await page.locator('#pause').click();await page.locator('#leave').click();}
expect(counts.every(c=>c.canvases===1&&c.scenes===1&&c.listeners===1)).toBe(true);ok('Six repeated runs keep one scene canvas and pointer listener',{counts});
expect(errors).toEqual([]);ok('No uncaught browser errors');
}catch(e){console.error(e);results.push({name:'browser suite',pass:false,error:String(e)});await page.screenshot({path:'artifacts/browser-failure.png',fullPage:true});process.exitCode=1;}finally{await writeFile('artifacts/browser-results.json',JSON.stringify({results,errors},null,2));await browser.close();}

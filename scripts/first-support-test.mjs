import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:320,height:568},hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.locator('#continue').click();
 await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 const support=page.locator('#support');await expect(support).toBeEnabled();
 await expect(page.locator('[data-medicine]')).toHaveCount(0);
 const box=await support.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.y+box.height).toBeLessThanOrEqual(568);
 const cdp=await context.newCDPSession(page),x=box.x+box.width/2,y=box.y+box.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await page.waitForTimeout(400);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 expect(await page.evaluate(()=>__BIOLOGY__.state.squad)).toBe(12);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await expect(support).toHaveText('+4 cells · RELEASE!');
 await page.screenshot({path:'artifacts/first-support-charge-320.png'});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(await page.evaluate(()=>__BIOLOGY__.state.squad)).toBe(16);
 await expect(support).toBeDisabled();await page.waitForTimeout(500);
 await page.screenshot({path:'artifacts/first-support-arrival-320.png'});
 // Continue a real patrol without changing the clock, spawns or enemies.
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(350);await page.keyboard.up('ArrowLeft');
 await page.waitForFunction(()=>__BIOLOGY__.state.learning.gate);
 const afterGate=await page.evaluate(()=>({squad:__BIOLOGY__.state.squad,kills:__BIOLOGY__.state.kills,time:__BIOLOGY__.state.time}));
 expect(afterGate.squad).toBe(20);expect(afterGate.kills).toBeGreaterThan(0);
 await expect(support).toBeEnabled({timeout:16000});await support.focus();await page.keyboard.down('Space');await page.waitForTimeout(350);
 await page.locator('#pause').click();await page.keyboard.up('Space');
 expect(await page.evaluate(()=>__BIOLOGY__.state.chargingMedicine)).toBe(false);
 expect(await page.evaluate(()=>__BIOLOGY__.state.squad)).toBe(20);
 await page.locator('#resume').click();await support.evaluate(b=>b.click());expect(await page.evaluate(()=>__BIOLOGY__.state.squad)).toBe(21);
 await page.waitForFunction(()=>__BIOLOGY__.state.phase!=='playing',{},{timeout:100000});
 const result=await page.evaluate(()=>({phase:__BIOLOGY__.state.phase,time:__BIOLOGY__.state.time,kills:__BIOLOGY__.state.kills,squad:__BIOLOGY__.state.squad}));
 expect(result.phase).toBe('victory');expect(errors).toEqual([]);
 console.log('PASS early touch charge/cancel, +4 arrival, natural gate/catches, pause cancel, assistive tap and full natural patrol',JSON.stringify({afterGate,result}));
}finally{await browser.close();}

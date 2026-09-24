import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.locator('#continue').click();await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await page.evaluate(()=>{const scene=__BIOLOGY__.scene,original=scene.reaction.bind(scene);window.firstCatchTime=null;scene.reaction=e=>{if(e.type==='death'&&window.firstCatchTime===null)window.firstCatchTime=scene.patrol.time;original(e);};});
 await page.waitForFunction(()=>__BIOLOGY__.state.kills>0,{},{timeout:12000});
 const caught=await page.evaluate(()=>window.firstCatchTime);expect(caught).toBeGreaterThan(0);expect(caught).toBeLessThan(8.5); // Event time, with a half-second variable-frame allowance; deterministic timing is unit-tested.
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(340);await page.keyboard.up('ArrowLeft');
 await page.waitForFunction(()=>__BIOLOGY__.state.learning.gate,{},{timeout:10000});
 await page.waitForFunction(()=>__BIOLOGY__.save.tutorial);
 const result=await page.evaluate(()=>({time:__BIOLOGY__.state.time,squad:__BIOLOGY__.state.squad,casualties:__BIOLOGY__.state.casualties,tutorial:__BIOLOGY__.save.tutorial}));
 expect(result.time).toBeLessThan(12);expect(result.squad).toBe(16);expect(result.casualties).toBe(0);expect(result.tutorial).toBe(true);
 await page.screenshot({path:'artifacts/opening-pace-phone.png'});expect(errors).toEqual([]);console.log('PASS natural opening',JSON.stringify({firstCatch:caught,...result}));
}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,2000))]);}

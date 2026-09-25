import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.locator('#continue').click();await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await expect(page.locator('.game-heading h1')).toHaveText('First Hug');await expect(page.locator('.care-cards')).toHaveCount(0);await expect(page.locator('#support')).toBeHidden();
 await page.waitForFunction(()=>__BIOLOGY__.state.cells.some(c=>c.phase==='wrap'));
 await page.screenshot({path:'artifacts/first-hug-closeup.png'});
 const initial=await page.evaluate(()=>({squad:__BIOLOGY__.state.squad,id:__BIOLOGY__.state.cells[0].id,size:__BIOLOGY__.scene.cells.find(v=>v.node.visible).body.displayWidth}));expect(initial.squad).toBe(1);expect(initial.size).toBeGreaterThan(70);
 await page.waitForFunction(()=>__BIOLOGY__.state.spentCells===1);expect(await page.evaluate(()=>__BIOLOGY__.state.cells.some(c=>c.id===1))).toBe(false);
 await expect(page.locator('#support')).toBeVisible();await expect(page.locator('#support')).toBeEnabled({timeout:10000});
 const box=await page.locator('#support').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2,cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await expect(page.locator('#support')).toContainText('Release!');await page.screenshot({path:'artifacts/first-hug-charge.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(await page.evaluate(()=>__BIOLOGY__.state.medicineActive)).toBeGreaterThan(5);await page.waitForTimeout(700);await page.screenshot({path:'artifacts/first-hug-medicine.png'});
 for(let i=0;i<35;i++){
  if(await page.evaluate(()=>__BIOLOGY__.state.phase!=='playing'))break;
  if(await page.evaluate(()=>__BIOLOGY__.state.supportReady)){await page.locator('#support').focus();await page.keyboard.down('Space');await page.waitForTimeout(1650);await page.keyboard.up('Space');}
  await page.waitForTimeout(1000);
 }
 await expect(page.locator('#next')).toBeVisible({timeout:5000});const result=await page.evaluate(()=>({time:__BIOLOGY__.state.time,kills:__BIOLOGY__.state.kills,spent:__BIOLOGY__.state.spentCells,phase:__BIOLOGY__.state.phase,settled:__BIOLOGY__.save.economy.settled.length}));expect(result.phase).toBe('victory');expect(result.time).toBeLessThan(33);expect(result.settled).toBe(1);
 await page.locator('#next').click();await page.waitForFunction(()=>__BIOLOGY__.state?.level===2&&!!__BIOLOGY__.scene?.patrol);await expect(page.locator('.modal-backdrop')).toHaveCount(0);await page.locator('#care-options').click();await expect(page.locator('#amoxicillin')).toBeVisible();await page.locator('#kit-done').click();
 await page.waitForFunction(()=>__BIOLOGY__.state.defensins.length>0,{},{timeout:12000});await page.screenshot({path:'artifacts/defensin-particles.png'});expect(errors).toEqual([]);
 await writeFile('artifacts/first-hug-result.json',JSON.stringify({initial,result,errors},null,2));console.log('PASS magnified first contact, exact cell retirement, touch charge, timed medicine, natural short victory, once-only reward, direct next and tissue projectiles',JSON.stringify(result));
}finally{await browser.close();}

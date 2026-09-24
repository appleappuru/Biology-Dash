import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>{if(!sessionStorage.getItem('quick-fixture')){localStorage.setItem('biology-dash-v1',JSON.stringify({version:4,completed:[1,2,3,4,5,6,7,8,9,10],credits:42,tutorial:true}));sessionStorage.setItem('quick-fixture','1');}});
 await page.goto('http://127.0.0.1:4190');await page.locator('#configure').click();await expect(page.locator('.loadout')).toBeVisible();await page.locator('#back').click();
 for(const [level,med] of [[2,'amoxicillin'],[3,'amoxicillin'],[4,'doxycycline'],[5,'amoxicillin'],[7,'micafungin'],[9,'cefepime']]){
  await page.locator(`[data-level="${level}"]`).click();await page.waitForFunction(l=>__BIOLOGY__.state?.level===l&&!!__BIOLOGY__.scene?.patrol,level);
  await expect(page.locator('.modal-backdrop')).toHaveCount(0);expect(await page.evaluate(()=>__BIOLOGY__.state.medicine)).toBe(med);
  expect(await page.evaluate(()=>__BIOLOGY__.state.cells.some(c=>c.role==='macrophage'))).toBe(true);
  if(level>=5)expect(await page.evaluate(()=>__BIOLOGY__.state.cells.some(c=>c.role==='plasma'))).toBe(true);
  await page.locator('#pause').click();await page.locator('#leave').click();
 }
 await page.locator('#configure').click();await page.locator('[data-formation=catchers]').click();await page.locator('#begin').click();
 await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);expect(await page.evaluate(()=>__BIOLOGY__.state.plasma)).toBe(false);
 await page.locator('#pause').click();await page.locator('#leave').click();await page.reload();
 expect(await page.evaluate(()=>__BIOLOGY__.save.customLoadout)).toBe(true);
 await page.locator('#continue').click();await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);expect(await page.evaluate(()=>__BIOLOGY__.state.plasma)).toBe(false);
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=89.99;p.enemies=[];p.bossSpawned=true;});
 await expect(page.locator('#result-setup')).toBeVisible();const b=await page.locator('#result-setup').boundingBox();expect(b.height).toBeGreaterThanOrEqual(44);expect(b.y+b.height).toBeLessThanOrEqual(568);
 await page.screenshot({path:'artifacts/optional-setup-result-320.png'});await page.locator('#result-setup').click();await expect(page.locator('.loadout')).toBeVisible();
 await page.locator('#suggested-squad').click();await page.locator('#begin').click();await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);expect(await page.evaluate(()=>__BIOLOGY__.state.plasma)).toBe(true);
 expect(errors).toEqual([]);console.log('PASS direct early/later launches, sensible medicines and squads, no mandatory clone screen, optional map/result setup, custom squad reload and suggested restore.');
}finally{await browser.close();}

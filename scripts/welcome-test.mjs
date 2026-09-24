import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await expect(page.locator('#continue')).toHaveText('Play →');
 await expect(page.locator('.campaign')).toHaveCount(0);await expect(page.locator('.currency')).toBeHidden();await expect(page.locator('.rightbar')).toBeHidden();
 const b=await page.locator('#continue').boundingBox();expect(b.y+b.height).toBeLessThan(568);expect(b.height).toBeGreaterThanOrEqual(44);
 await page.screenshot({path:'artifacts/welcome-320.png'});
 await page.locator('[data-nav=settings]:visible').click();await expect(page.locator('#motion')).toBeVisible();await page.locator('[data-nav=patrol]:visible').click();await page.locator('#continue').click();
 await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 await expect(page.locator('#field-coach span:visible')).toHaveCount(1);
 await page.waitForFunction(()=>__BIOLOGY__.state.kills>0,{},{timeout:7000});
 const first=await page.evaluate(()=>__BIOLOGY__.state.time);expect(first).toBeLessThan(5.5);
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(350);await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__BIOLOGY__.state.learning.gate,{},{timeout:7000});
 await expect(page.locator('#field-coach')).toBeHidden();await page.screenshot({path:'artifacts/welcome-first-recruit.png'});
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=89.99;p.bossSpawned=true;p.enemies=[];});await page.locator('#result-map').click();await expect(page.locator('.campaign')).toBeVisible();
 await page.reload();await expect(page.locator('.campaign')).toBeVisible();
 expect(errors).toEqual([]);console.log('PASS single Play CTA, settings access, sequential cues, first catch',first,'natural gate, campaign reveal and returning save.');
}finally{await browser.close();}

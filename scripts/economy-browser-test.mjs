import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>__BIOLOGY__.start(1));await page.waitForFunction(()=>__BIOLOGY__.state?.level===1);
await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=89.99;p.enemies=[];p.bossSpawned=true;p.kills=12;});await page.waitForFunction(()=>__BIOLOGY__.scene.finished);
const balance=await page.evaluate(()=>__BIOLOGY__.save.credits);expect(balance).toBe(94);await page.reload();await expect(page.locator('.saved-reward')).toContainText('+94 Coins');
await page.locator('[data-nav="squad"]:visible').first().click();await page.locator('[data-buy="recruit:zip"]').click();await expect(page.locator('#shop-feedback')).toContainText('Purchased');expect(await page.evaluate(()=>__BIOLOGY__.save.credits)).toBe(34);
await page.screenshot({path:'artifacts/coin-roster-v6.png'});
await page.locator('#shop-patrol').click();await page.locator('[data-slot="0"]').click();await page.locator('[data-swap="zip"]').click();await page.locator('[data-slot="1"]').click();await page.locator('[data-swap="maco"]').click();await page.screenshot({path:'artifacts/mixed-squad-builder-v6.png'});
await page.locator('#begin').click();await page.waitForFunction(()=>__BIOLOGY__.state?.level===2);expect(await page.evaluate(()=>__BIOLOGY__.state.cells.slice(0,2).map(c=>c.variant))).toEqual(['zip','maco']);
await page.keyboard.down('ArrowUp');await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');expect(await page.evaluate(()=>__BIOLOGY__.state.y)).toBeLessThan(635);
await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=30;p.kills=7;p.phase='defeat';});await expect(page.locator('.reward-card')).toContainText('7 Coins');await page.screenshot({path:'artifacts/coins-results-v6.png'});
await page.reload();expect(await page.evaluate(()=>__BIOLOGY__.save.credits)).toBe(41);await page.locator('[data-nav="squad"]:visible').first().click();await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/roster-320-v6.png'});expect(errors).toEqual([]);console.log('PASS reward saved before animation; reload no duplicate; permanent purchase; mixed deployment; steering; failed rewards; 320px; no errors');
}finally{await browser.close();}

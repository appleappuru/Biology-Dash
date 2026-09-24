import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:320,height:740}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.goto('http://127.0.0.1:4173');
const setup=async()=>{await page.evaluate(()=>__BIOLOGY__.start(3));await page.waitForFunction(()=>__BIOLOGY__.state?.level===3);await page.evaluate(()=>{const p=__BIOLOGY__.state;p.enemies=[];p.nextSpawn=999;p.nextGate=999;p.bossSpawned=true;p.time=76;});};
await setup();await expect(page.locator('#patrol-stage')).toHaveText('FINAL STRETCH');await page.screenshot({path:'artifacts/final-stretch-v5.png'});
await page.evaluate(()=>__BIOLOGY__.state.time=89.95);await page.waitForFunction(()=>__BIOLOGY__.scene.finished);await expect(page.locator('.modal-backdrop')).toHaveCount(0);await expect(page.locator('#support')).toBeDisabled();await page.waitForTimeout(450);await page.screenshot({path:'artifacts/victory-celebration-v5.png'});
await expect(page.locator('.modal h2')).toHaveText('Host protected!');const credits=await page.evaluate(()=>__BIOLOGY__.save.credits);await page.waitForTimeout(300);expect(await page.evaluate(()=>__BIOLOGY__.save.credits)).toBe(credits);
await page.screenshot({path:'artifacts/victory-results-v5.png'});
await setup();await page.evaluate(()=>{__BIOLOGY__.scene.reducedMotion=true;__BIOLOGY__.state.phase='defeat';});await expect(page.locator('.modal h2')).toHaveText('Let’s regroup.');
await setup();expect(await page.evaluate(()=>__BIOLOGY__.scene.finished)).toBe(false);expect(errors).toEqual([]);console.log('PASS: final stretch, celebration before results, locked end controls, single award, defeat, reduced motion, replay');
}finally{await browser.close();}

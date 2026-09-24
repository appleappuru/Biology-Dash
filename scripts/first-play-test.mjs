import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:4190');
 await page.locator('#continue').click();
 await page.waitForFunction(()=>!!window.__BIOLOGY__?.scene?.patrol);
 await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 await expect(page.locator('#field-coach')).toBeVisible();
 expect(await page.evaluate(()=>__BIOLOGY__.scene.paused)).toBe(false);
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(650);await page.keyboard.up('ArrowUp');
 await expect(page.locator('[data-goal="move"]')).toHaveClass(/done/);
 // Drive actual phagocytosis at close range rather than setting the kill counter.
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.spawn('susceptible');const e=p.enemies.at(-1);e.x=p.x;e.y=p.y-35;e.hp=1;});
 await expect(page.locator('[data-goal="catch"]')).toHaveClass(/done/,{timeout:15000});
 await page.screenshot({path:'artifacts/first-play-phone.png'});
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.applyGate({id:999,y:p.y,used:false,passed:false},'left');});
 await expect(page.locator('#field-coach')).toBeHidden();
 expect(await page.evaluate(()=>__BIOLOGY__.save.tutorial)).toBe(true);
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.kills=18;p.time=89.99;p.enemies=[];p.bossSpawned=true;});
 await expect(page.locator('#next')).toBeVisible();
 await expect(page.locator('.next-discovery')).toContainText('Macrophage');
 for(const id of ['next','reward-shop','result-map']){const b=await page.locator('#'+id).boundingBox();expect(b.height).toBeGreaterThanOrEqual(44);expect(b.y+b.height).toBeLessThanOrEqual(568);}
 await page.screenshot({path:'artifacts/next-discovery-phone.png'});
 const earned=await page.evaluate(()=>({credits:__BIOLOGY__.save.credits,team:[...__BIOLOGY__.save.roster.loadout],transactions:__BIOLOGY__.save.economy.transactions.length}));
 await page.locator('#next').click();await page.waitForFunction(()=>__BIOLOGY__.state?.level===2 && !!__BIOLOGY__.scene?.patrol);
 await expect(page.locator('.modal-backdrop')).toHaveCount(0);await expect(page.locator('#support')).toBeEnabled();
 expect(await page.evaluate(()=>__BIOLOGY__.state.loadout)).toEqual(earned.team);
 expect(await page.evaluate(()=>__BIOLOGY__.save.credits)).toBe(earned.credits);
 expect(await page.evaluate(()=>__BIOLOGY__.save.economy.transactions.length)).toBe(earned.transactions);
 await page.screenshot({path:'artifacts/direct-second-patrol.png'});
 // A later victory still offers medicine preparation before Patrol3.
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=89.99;p.enemies=[];p.bossSpawned=true;});
 await page.locator('#next').click();await expect(page.locator('#begin')).toBeVisible();await expect(page.locator('.choice-list')).toBeVisible();
 await page.reload();await page.waitForFunction(()=>!!window.__BIOLOGY__);
 expect(await page.evaluate(()=>__BIOLOGY__.save.tutorial)).toBe(true);
 await page.evaluate(()=>__BIOLOGY__.start(1));await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await expect(page.locator('#field-coach')).toHaveCount(0);await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 expect(errors).toEqual([]);console.log('PASS one-tap first patrol, vertical steering, real engulfment, recruitment lesson, next discovery and phone result actions');
}finally{await browser.close();}

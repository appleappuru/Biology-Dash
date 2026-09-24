import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const url=process.env.GAME_URL||'http://127.0.0.1:4175';
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.goto(url);await page.addInitScript(()=>{if(!sessionStorage.getItem('migration-fixture')){localStorage.setItem('biology-dash-v1',JSON.stringify({version:3,completed:[1],credits:150,reinforcement:1,tutorial:true,muted:true,reducedMotion:true}));sessionStorage.setItem('migration-fixture','1');}});await page.reload();
expect(await page.evaluate(()=>typeof window.__BIOLOGY__)).toBe('undefined');await page.locator('[data-nav="squad"]:visible').click();await expect(page.locator('.coin-balance')).toContainText('150 Coins');await page.locator('[data-buy="recruit:zip"]').click();await expect(page.locator('#shop-feedback')).toContainText('Purchased');await page.waitForTimeout(650);await page.locator('[data-buy="upgrade:zip"]').click();await expect(page.locator('#shop-feedback')).toContainText('Purchased');
await page.locator('#shop-patrol').click();await page.locator('[data-slot="0"]').click();await page.locator('[data-swap="zip"]').click();await page.locator('[data-slot="1"]').click();await page.locator('[data-swap="maco"]').click();await page.locator('#begin').click();
await page.keyboard.down('ArrowUp');await page.waitForTimeout(500);await page.keyboard.up('ArrowUp');
console.log('Production purchase, migration, mixed loadout and patrol started; playing full 90-second run.');
for(let i=0;i<24;i++){if(await page.locator('.reward-card').count())break;await page.waitForTimeout(5000);console.log('Patrol clock',await page.locator('#clock').textContent());}
await page.locator('.reward-card').waitFor({timeout:5000});await expect(page.locator('.reward-card')).toContainText('Coins');
const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('biology-dash-v1')));expect(after.roster.owned).toContain('zip');expect(after.roster.upgrades.zip).toBe(1);expect(after.economy.settled).toHaveLength(1);expect(after.economy.transactions.filter(t=>t.source.startsWith('patrol'))).toHaveLength(1);
await page.screenshot({path:'artifacts/'+(url.startsWith('https')?'live':'local')+'-coins-production.png'});await page.reload();const balance=await page.evaluate(()=>JSON.parse(localStorage.getItem('biology-dash-v1')).credits);expect(balance).toBe(after.credits);
await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForTimeout(1200);await page.reload();await context.setOffline(true);await page.reload();await expect(page.locator('.brand-name')).toHaveText('biology dash');await context.setOffline(false);expect(errors).toEqual([]);
const report={url,balance,reward:after.economy.pending,errors,offline:true};await writeFile('artifacts/'+(url.startsWith('https')?'live':'local')+'-coins-verification.json',JSON.stringify(report,null,2));console.log('PASS production migration, purchases, full patrol, once-only rewards, reload and offline',report);
}catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,3000))]);process.exit(process.exitCode||0);}

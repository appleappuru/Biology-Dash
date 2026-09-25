import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const version=JSON.parse(await readFile('package.json','utf8')).version;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.GAME_URL||'https://biology-dash-public-demo.vercel.app');
 expect(await page.evaluate(()=>typeof window.__BIOLOGY__)).toBe('undefined');
 await page.locator('#continue').click();
 await expect(page.locator('.game-heading h1')).toHaveText('First Hug');
 await expect(page.locator('#squad-count')).toHaveText('1');
 await expect(page.locator('#support')).toBeHidden();
 await page.waitForTimeout(1100);await page.screenshot({path:'artifacts/first-hug-production-closeup.png'});
 await expect(page.locator('#squad-count')).toHaveText('0',{timeout:7000});
 await expect(page.locator('#support')).toBeVisible();
 await expect(page.locator('#support')).toBeEnabled({timeout:10000});
 await page.locator('#support').focus();await page.keyboard.down('Space');
 await expect(page.locator('#support')).toContainText('Release!');await page.keyboard.up('Space');
 await expect(page.locator('#support')).toContainText('active');
 await page.screenshot({path:'artifacts/first-hug-production-medicine.png'});
 for(let i=0;i<35;i++){
  if(await page.locator('#next').isVisible())break;
  if(await page.locator('#support').isEnabled()){await page.locator('#support').focus();await page.keyboard.down('Space');await page.waitForTimeout(1650);await page.keyboard.up('Space');}
  await page.waitForTimeout(1000);
 }
 await expect(page.locator('.result-summary')).toContainText('32 seconds defended');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('biology-dash-v1')));
 expect(saved.economy.settled.length).toBe(1);expect(saved.completed).toContain(1);
 await page.locator('#next').click();await expect(page.locator('.game-heading .eyebrow')).toHaveText('PATROL 02');
 await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 expect(errors).toEqual([]);
 await writeFile('artifacts/first-hug-production.json',JSON.stringify({version,completed:saved.completed,settled:saved.economy.settled.length,errors},null,2));
 console.log('PASS production opening, one-use cell, charged timed medicine, natural 32-second victory, single settlement, direct next patrol');
}finally{await browser.close();}

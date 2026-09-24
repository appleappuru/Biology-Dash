import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>{if(!sessionStorage.getItem('quick-live-fixture')){localStorage.setItem('biology-dash-v1',JSON.stringify({version:4,completed:[1,2,3],credits:42,tutorial:true}));sessionStorage.setItem('quick-live-fixture','1');}});
 await page.goto(process.env.GAME_URL||'https://biology-dash-public-demo.vercel.app');expect(await page.evaluate(()=>typeof __BIOLOGY__)).toBe('undefined');
 await page.locator('#continue').click();await expect(page.locator('#pause')).toBeEnabled();await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 await expect(page.locator('[data-medicine=doxycycline]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#pause').click();await page.locator('#leave').click();await page.locator('#configure').click();await expect(page.locator('.loadout')).toBeVisible();
 await page.locator('[data-formation=catchers]').click();await page.locator('#begin').click();await expect(page.locator('#pause')).toBeEnabled();
 await page.locator('#pause').click();await page.locator('#leave').click();await page.reload();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('biology-dash-v1')));expect(saved.customLoadout).toBe(true);expect(saved.credits).toBe(42);
 await page.locator('#continue').click();await expect(page.locator('#pause')).toBeEnabled();await expect(page.locator('.modal-backdrop')).toHaveCount(0);
 expect(errors).toEqual([]);console.log('PASS public direct launch, default Doxycycline, optional setup, custom choice persistence, unchanged Coins and no instrumentation.');
}finally{await browser.close();}

import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.GAME_URL||'https://biology-dash-public-demo.vercel.app');
 expect(await page.evaluate(()=>typeof window.__BIOLOGY__)).toBe('undefined');
 await expect(page.locator('#continue')).toHaveText('Play →');await expect(page.locator('.campaign')).toHaveCount(0);
 await page.locator('#continue').click();await expect(page.locator('#patrol-loading')).toHaveCount(0,{timeout:25000});
 await expect(page.locator('.modal-backdrop')).toHaveCount(0);await expect(page.locator('#field-coach span:visible')).toHaveCount(1);
 await expect(page.locator('#cleared')).not.toHaveText('0',{timeout:8000});
 const remaining=parseInt(await page.locator('#clock').textContent());expect(remaining).toBeGreaterThanOrEqual(84);
 await page.screenshot({path:'artifacts/welcome-live-first-catch.png'});
 await page.locator('#pause').click();await expect(page.locator('#resume')).toBeVisible();expect(errors).toEqual([]);
 console.log('PASS live fresh-player one-tap start, early real catch, one cue and working Pause without instrumentation.');
}finally{await browser.close();}

import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:320,height:568}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.GAME_URL||'https://biology-dash-public-demo.vercel.app');
 expect(await page.evaluate(()=>typeof window.__BIOLOGY__)).toBe('undefined');
 await page.locator('#continue').click();const support=page.locator('#support');await expect(support).toBeEnabled();await expect(page.locator('#squad-count')).toHaveText('12');
 await support.focus();await page.keyboard.down('Space');await expect(support).toHaveText('+4 cells · RELEASE!');await page.keyboard.up('Space');
 await expect(page.locator('#squad-count')).toHaveText('16');await expect(support).toBeDisabled();
 await expect(page.locator('#cleared')).not.toHaveText('0',{timeout:7000});
 await page.locator('#pause').click();await expect(page.locator('#resume')).toBeVisible();
 expect(errors).toEqual([]);console.log('PASS public 320px charge/release, four arriving cells, cooldown, natural first catch and pause; no test instrumentation.');
}finally{await browser.close();}

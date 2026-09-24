import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>localStorage.setItem('biology-dash-v1',JSON.stringify({version:4,completed:[1,2],credits:42,tutorial:true})));
 await page.goto('https://biology-dash-public-demo.vercel.app');expect(await page.evaluate(()=>typeof __BIOLOGY__)).toBe('undefined');
 await page.locator('#continue').click();const b=page.locator('#support');await expect(b).toBeEnabled();await b.focus();await page.keyboard.down('Space');await expect(b).toContainText('matched');await expect(b).toContainText('FULL');await page.screenshot({path:'artifacts/live-medicine-preview.png'});await page.keyboard.up('Space');await expect(b).toBeDisabled();await page.locator('#pause').click();expect(errors).toEqual([]);
 console.log('PASS public natural charge matching count, full charge/release, cooldown and pause without instrumentation.');
}finally{await browser.close();}

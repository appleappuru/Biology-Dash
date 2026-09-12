import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
try{
await page.goto('http://127.0.0.1:4175');await expect(page.locator('#continue')).toBeVisible();
expect(await page.evaluate(()=>window.__BIOLOGY__)).toBeUndefined();results.push('Production excludes test controls');
await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
await context.setOffline(true);await page.reload();await expect(page.locator('#continue')).toBeVisible();results.push('Production offline navigation reload');
await page.locator('#continue').click();await page.locator('#begin').click();await page.locator('#learn').click();await expect(page.locator('canvas')).toBeVisible();await page.waitForTimeout(3000);await expect(page.locator('#clock')).not.toHaveText('1:30');await page.screenshot({path:'artifacts/offline-patrol-phone.png'});results.push('Offline cold game start with local assets and running clock');
await page.locator('#pause').click();await page.locator('#leave').click();await page.setViewportSize({width:320,height:740});await page.screenshot({path:'artifacts/map-small-phone.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);results.push('320px viewport no overflow');
expect(errors).toEqual([]);console.log('PASS',results);
}catch(e){console.error(e);process.exitCode=1;results.push('FAIL '+String(e));await page.screenshot({path:'artifacts/production-failure.png'});}finally{await writeFile('artifacts/production-results.json',JSON.stringify({results,errors},null,2));await browser.close();}

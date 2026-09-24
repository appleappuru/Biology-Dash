import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.evaluate(()=>__BIOLOGY__.start(10));await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.nextSpawn=999;p.nextGate=999;p.enemies=[];['susceptible','dual-resistant','candida'].forEach((kind,i)=>{p.spawn(kind);const e=p.enemies.at(-1);e.x=80+i*130;e.y=280;e.hp=e.maxHp=10000;});});
 const previews=()=>page.evaluate(()=>__BIOLOGY__.state.enemies.map(e=>{const g=__BIOLOGY__.scene.views.get(e.id)?.preview;return{kind:e.kind,visible:g?.visible,effect:g?.getData('effect')};}));
 const support=page.locator('#support');await support.focus();await page.keyboard.down('Space');await expect(support).toContainText('1 matched');
 expect((await previews()).map(p=>p.effect)).toEqual(['kill','unaffected','unaffected']);await page.screenshot({path:'artifacts/medicine-target-preview-320.png'});
 await page.keyboard.up('Space');await page.waitForTimeout(100);expect((await previews()).every(p=>!p.visible)).toBe(true);
 await page.evaluate(()=>__BIOLOGY__.state.medicineCooldown=0);await page.locator('[data-medicine=doxycycline]').click();await support.focus();await page.keyboard.down('Space');await page.waitForTimeout(150);
 expect((await previews())[0].effect).toBe('inhibit');await page.locator('[data-medicine=micafungin]').click();await page.keyboard.up('Space');await page.waitForTimeout(100);expect((await previews()).every(p=>!p.visible)).toBe(true);
 await support.focus();await page.keyboard.down('Space');await expect(support).toContainText('1 matched');expect((await previews()).map(p=>p.effect)).toEqual(['unaffected','unaffected','kill']);
 await page.locator('#pause').click();await page.keyboard.up('Space');await page.waitForTimeout(100);expect((await previews()).every(p=>!p.visible)).toBe(true);await page.locator('#resume').click();
 await page.evaluate(()=>{__BIOLOGY__.state.enemies=__BIOLOGY__.state.enemies.filter(e=>e.kind==='dual-resistant');});await page.locator('[data-medicine=amoxicillin]').click();await support.focus();await page.keyboard.down('Space');await expect(support).toHaveText('No match · switch support');await page.keyboard.up('Space');
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.medicineCooldown=0;p.beginMedicineCharge();p.time=89.99;p.bossSpawned=true;});await page.waitForFunction(()=>__BIOLOGY__.state.phase==='victory');expect((await previews()).every(p=>!p.visible)).toBe(true);
 expect(errors).toEqual([]);console.log('PASS live-compatible wall/growth/fungal previews, mismatch cue, release/switch/pause cleanup and 320px reduced motion.');
}finally{await browser.close();}

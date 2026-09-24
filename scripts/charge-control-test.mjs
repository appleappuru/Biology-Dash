import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.evaluate(()=>__BIOLOGY__.start(10));await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
 async function reset(){await page.evaluate(()=>{const p=__BIOLOGY__.state;p.cancelMedicineCharge();p.medicine='amoxicillin';p.medicineCooldown=0;p.nextSpawn=999;p.nextGate=999;p.enemies=[];p.spawn('susceptible');p.enemies[0].hp=p.enemies[0].maxHp=10000;p.enemies[0].inhibited=true;p.enemies[0].y=180;});await expect(page.locator('#support')).toBeEnabled();}
 const state=()=>page.evaluate(()=>({charge:__BIOLOGY__.state.medicineCharge,charging:__BIOLOGY__.state.chargingMedicine,hp:__BIOLOGY__.state.enemies[0]?.hp,cooldown:__BIOLOGY__.state.medicineCooldown}));
 await reset();let box=await page.locator('#support').boundingBox();let x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.waitForTimeout(1750);
 expect((await state()).charge).toBe(1);expect((await state()).hp).toBe(10000);await expect(page.locator('#support')).toContainText('FULL');
 await page.screenshot({path:'artifacts/charged-support-phone.png'});
 await page.mouse.move(x,y-160);await page.mouse.up();await page.waitForTimeout(120);
 expect((await state()).hp).toBe(9964);expect((await state()).cooldown).toBeGreaterThan(17);
 await reset();await page.locator('#support').focus();await page.keyboard.down('Space');await page.waitForTimeout(800);expect((await state()).charge).toBeGreaterThan(.35);await page.keyboard.up('Space');expect((await state()).hp).toBeLessThan(9982);
 await reset();await page.locator('#support').evaluate(b=>b.blur());await page.keyboard.down('Space');await page.waitForTimeout(500);expect((await state()).charging).toBe(true);await page.locator('#pause').click();await page.keyboard.up('Space');expect((await state()).charging).toBe(false);expect((await state()).hp).toBe(10000);await page.locator('#resume').click();
 await reset();box=await page.locator('#support').boundingBox();x=box.x+box.width/2;y=box.y+box.height/2;const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await page.waitForTimeout(500);expect((await state()).charge).toBeGreaterThan(.15);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect((await state()).hp).toBe(10000);expect((await state()).charging).toBe(false);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await page.waitForTimeout(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect((await state()).hp).toBeLessThan(9982);
 await reset();await page.locator('#support').evaluate(b=>b.click());expect((await state()).hp).toBe(9982);
 await page.setViewportSize({width:320,height:568});await page.emulateMedia({reducedMotion:'reduce'});await reset();await page.locator('#support').focus();await page.keyboard.down('Enter');await page.waitForTimeout(1700);await page.screenshot({path:'artifacts/charged-support-320.png'});await page.keyboard.up('Enter');expect((await state()).hp).toBe(9964);
 expect(errors).toEqual([]);console.log('PASS mouse capture, focused/global keyboard, pause cancellation, touch cancel/release, assistive click, reduced-motion 320px charge.');
}finally{await browser.close();}

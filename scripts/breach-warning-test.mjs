import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:4190');
  await page.locator('#continue').click();
  await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol);
  await page.evaluate(()=>{
    const s=__BIOLOGY__.scene,p=s.patrol;s.paused=true;p.enemies=[];
    p.spawn('susceptible');const e=p.enemies[0];e.x=350;e.y=620;
    p.x=100;p.syncCells();s.drawEnemies(s.time.now);s.drawBreachWarnings();
  });
  const label=()=>page.evaluate(()=>__BIOLOGY__.scene.tissueLabel.text);
  expect(await label()).toContain('RIGHT');
  expect(await label()).toContain('1 NEAR TISSUE');
  expect(await page.evaluate(()=>{const r=__BIOLOGY__.scene.tissueLabel.getBounds();return r.left>=0 && r.right<=420;})).toBe(true);
  await page.screenshot({path:'artifacts/breach-warning-phone.png'});
  await page.evaluate(()=>{const s=__BIOLOGY__.scene;s.patrol.x=375;s.patrol.enemies[0].x=70;s.drawBreachWarnings();});
  expect(await label()).toContain('LEFT');
  await page.evaluate(()=>{const s=__BIOLOGY__.scene;const c=s.patrol.cells[0];c.targetId=s.patrol.enemies[0].id;c.phase='wrap';s.drawBreachWarnings();});
  expect(await label()).toContain('TISSUE LINE');
  await page.evaluate(()=>{const s=__BIOLOGY__.scene;s.patrol.cells[0].phase='idle';s.patrol.enemies[0].y=400;s.drawBreachWarnings();});
  expect(await label()).toContain('TISSUE LINE');
  await page.evaluate(()=>{const s=__BIOLOGY__.scene,p=s.patrol;p.enemies[0].y=620;p.spawn('susceptible');p.enemies[1].y=700;p.enemies[1].x=350;s.drawBreachWarnings();});
  expect(await label()).toContain('HERE');expect(await label()).toContain('2 NEAR TISSUE');
  await page.evaluate(()=>{const s=__BIOLOGY__.scene;s.patrol.phase='victory';s.drawBreachWarnings();});
  expect(await label()).toContain('TISSUE LINE');
  await page.evaluate(()=>__BIOLOGY__.start(10));
  await page.waitForFunction(()=>__BIOLOGY__.scene?.patrol?.level===10);
  await page.evaluate(()=>{const p=__BIOLOGY__.state;p.enemies=[];p.nextSpawn=999;p.nextGate=999;p.spawn('susceptible');p.enemies[0].x=350;p.enemies[0].y=610;});
  await expect(page.locator('#breach-warning')).toBeVisible();
  const warning=await page.locator('#breach-warning').boundingBox(),kit=await page.locator('.care-kit').boundingBox();
  expect(warning.y+warning.height).toBeLessThan(kit.y);expect(warning.x).toBeGreaterThanOrEqual(0);expect(warning.x+warning.width).toBeLessThanOrEqual(320);
  await page.screenshot({path:'artifacts/breach-warning-kit-phone.png'});
  expect(errors).toEqual([]);
  console.log('PASS phone warning bounds, both directions, nearest threat, wrap/distance/end cleanup, reduced motion; staged fixture, not natural gameplay.');
} finally {await browser.close();}

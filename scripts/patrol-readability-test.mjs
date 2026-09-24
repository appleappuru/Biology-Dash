import {chromium, expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:390,height:844}});
const errors=[], samples=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190');
  await page.locator('#continue').click();
  await page.waitForFunction(()=>!!window.__BIOLOGY__?.scene?.patrol);
  // Natural clock and spawns; stay left after collecting the opening gate.
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowLeft');
  for(let i=0;i<46;i++) {
    await page.waitForTimeout(2000);
    const sample=await page.evaluate(()=>{
      const p=__BIOLOGY__.state;
      return {time:p.time,phase:p.phase,squad:p.squad,kills:p.kills,casualties:p.casualties,
        threats:p.enemies.filter(e=>e.y>550).map(e=>({x:e.x,y:e.y,kind:e.kind,boss:e.boss}))};
    });
    samples.push(sample);
    if(sample.threats.length && !samples.slice(0,-1).some(s=>s.threats.length))
      await page.screenshot({path:'artifacts/patrol-threat-baseline.png'});
    if(sample.phase!=='playing')break;
  }
  expect(samples.at(-1).phase).not.toBe('playing');
  expect(errors).toEqual([]);
  await writeFile('artifacts/patrol-readability.json',JSON.stringify({samples,errors},null,2));
  console.log(JSON.stringify({result:samples.at(-1),threatSamples:samples.filter(s=>s.threats.length).length,errors}));
} finally { await browser.close(); }

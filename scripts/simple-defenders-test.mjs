import {chromium,expect} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const GAME_URL=process.env.GAME_URL||'http://127.0.0.1:4190';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
let svgStatus=0;page.on('response',res=>{if(res.url().includes('defenders-simple-v1.svg'))svgStatus=res.status();});
try{
 await page.goto(GAME_URL);await page.locator('#continue').click();await page.waitForFunction(()=>__BIOLOGY__.state?.cells.some(c=>c.phase==='wrap'));
 await page.screenshot({path:'artifacts/simple-defender-first-hug.png'});
 const first=await page.evaluate(()=>{
  const tex=__BIOLOGY__.scene.textures.get('defenders-v2');
  return {
   key:tex.key,
   frameTotal:tex.frameTotal,
   frameWidth:tex.frames['0']?.width,
   frameHeight:tex.frames['0']?.height,
   blobSrc:tex.getSourceImage()?.src,
   width:__BIOLOGY__.scene.cells.find(c=>c.node.visible).body.displayWidth
  };
 });
 expect(svgStatus).toBe(200);
 expect(first.frameWidth).toBe(128);
 expect(first.frameHeight).toBe(128);
 expect(first.frameTotal).toBeGreaterThanOrEqual(12);
 expect(first.width).toBeGreaterThan(110);
 await page.evaluate(()=>__BIOLOGY__.start(2));await page.waitForFunction(()=>__BIOLOGY__.scene?.patrol?.level===2);
 await page.evaluate(()=>{const p=__BIOLOGY__.state;p.loadout=['neutro','maco','pluma'];p.squad=6;p.syncCells();p.nextSpawn=p.nextGate=999;});await page.waitForTimeout(350);await page.screenshot({path:'artifacts/simple-defender-squad.png'});
 const sizes=await page.evaluate(()=>{const s=__BIOLOGY__.scene;return __BIOLOGY__.state.cells.map(c=>({role:c.role,size:s.cells.find(v=>v.boundId===c.id).body.displayWidth,tint:s.cells.find(v=>v.boundId===c.id).body.tintTopLeft}));});
 expect(sizes.find(c=>c.role==='macrophage').size).toBeGreaterThan(sizes.find(c=>c.role==='neutrophil').size);
 expect(sizes.every(c=>c.tint===0xffffff)).toBe(true);
 expect(errors).toEqual([]);
 await page.goto(`${GAME_URL}/assets/defenders-simple-v1.svg`);
 await page.screenshot({path:'artifacts/simple-defenders-sheet.png'});
 await writeFile('artifacts/simple-defenders.json',JSON.stringify({first,sizes,errors},null,2));
 console.log('PASS original SVG atlas, enlarged white defenders, larger Macrophage, directional frames and no browser errors');
}finally{await browser.close();}


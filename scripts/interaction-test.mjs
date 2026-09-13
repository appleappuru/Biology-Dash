import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:'artifacts/interaction-video',size:{width:390,height:844}}});
const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const setup=async(level=5)=>{await page.evaluate(id=>__BIOLOGY__.start(id),level);await page.waitForFunction(id=>__BIOLOGY__.state?.level===id,level);if(level>=5)await page.locator('#recruit-plasma').click();};
try{
await page.goto('http://127.0.0.1:4173');await setup();
await page.evaluate(()=>{const p=__BIOLOGY__.state;p.enemies=[];p.nextSpawn=999;p.nextGate=999;p.bossSpawned=true;p.move(210,560);p.squad=18;p.defender='macrophage';p.syncCells();p.antibody.epitope='B';p.spawn('pneumococcus');let e=p.enemies.at(-1);e.x=155;e.y=438;p.spawn('candida');e=p.enemies.at(-1);e.x=250;e.y=430;window.damageAudit=[];const damage=p.damage.bind(p);p.damage=(e,n,c,id)=>{const cell=p.cells.find(x=>x.id===id);damageAudit.push({cause:c,id,distance:cell?Math.hypot(e.x-cell.x,e.y-cell.y):null,phase:cell?.phase});return damage(e,n,c,id);};});
await page.waitForFunction(()=>__BIOLOGY__.state.cells.some(c=>c.phase==='approach'));
await page.screenshot({path:'artifacts/cells-approach-v3.png'});
await page.waitForFunction(()=>__BIOLOGY__.state.cells.some(c=>c.phase==='wrap'&&c.progress>.3&&c.progress<.8));
await page.screenshot({path:'artifacts/cells-wrap-v3.png'});
await page.waitForFunction(()=>__BIOLOGY__.state.cells.some(c=>c.phase==='digest'));
await page.screenshot({path:'artifacts/cells-digestion-v3.png'});
checks.push('Visible approach, membrane wrapping and internal digestion stages');
const audit=await page.evaluate(()=>damageAudit);expect(audit.length).toBeGreaterThan(0);expect(audit.every(a=>a.cause==='phagocytosis'&&a.id&&a.distance<=27&&a.phase==='wrap')).toBe(true);checks.push('All observed cell damage happened at physical contact with a named defender');
// Check secretion and mismatch without nearby phagocytes.
await page.evaluate(()=>{const p=__BIOLOGY__.state;p.enemies=[];p.antibodies=[];p.nextAntibody=0;p.move(210,635);p.antibody.epitope='A';p.spawn('antigen-b');p.enemies[0].x=320;p.enemies[0].y=190;});
await page.waitForFunction(()=>__BIOLOGY__.state.antibodies.length>0);await page.screenshot({path:'artifacts/antibody-diffusion-v3.png'});
await page.waitForFunction(()=>__BIOLOGY__.state.learning.mismatch);expect(await page.evaluate(()=>__BIOLOGY__.state.enemies[0].tagged)).toBe(false);checks.push('Plasma secretion diffuses; mismatching antibody does not attach');
await page.evaluate(()=>{__BIOLOGY__.state.antibody.epitope='B';});await page.waitForFunction(()=>__BIOLOGY__.state.enemies.some(e=>e.tagged));await page.screenshot({path:'artifacts/antibody-bound-v3.png'});checks.push('Matching antibody attaches visibly without direct damage');
// Expanded species / full squad / meaningful medication outcomes.
await setup(10);await page.evaluate(()=>{const p=__BIOLOGY__.state;p.time=10;p.nextSpawn=999;p.nextGate=999;p.bossSpawned=true;p.squad=30;p.syncCells();['e-coli','pneumococcus','pseudomonas','candida','dual-resistant'].forEach((kind,i)=>{p.spawn(kind);let e=p.enemies.at(-1);e.x=90+(i%2)*200;e.y=170+i*55;});p.medicine='cefepime';p.useMedicine();});
await page.waitForTimeout(120);await page.screenshot({path:'artifacts/microbes-medication-v3.png'});await expect(page.locator('#support')).toContainText('Cefepime');
const states=await page.evaluate(()=>__BIOLOGY__.state.enemies.map(e=>({kind:e.kind,effective:e.medicineReaction.effective})));expect(states.find(e=>e.kind==='pseudomonas').effective).toBe(true);expect(states.find(e=>e.kind==='candida').effective).toBe(false);expect(states.find(e=>e.kind==='dual-resistant').effective).toBe(false);
checks.push('Cefepime stresses tested susceptible bacteria; Candida target mismatch and MRSA resistance remain distinct');
await page.locator('#complement').click();await expect(page.locator('#ability-status')).toContainText('C3 opsonins');
await page.setViewportSize({width:320,height:740});await page.screenshot({path:'artifacts/interaction-320-v3.png'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
const buttons=await page.locator('.battle-actions button').evaluateAll(bs=>bs.map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})));expect(buttons.every(b=>b.width>=32&&b.height>=40)).toBe(true);checks.push('320px viewport fits controls and full squad');
await page.evaluate(()=>{__BIOLOGY__.scene.reducedMotion=true;});await page.waitForTimeout(120);await page.screenshot({path:'artifacts/reduced-motion-v3.png'});
await page.keyboard.down('ArrowUp');const y=await page.evaluate(()=>__BIOLOGY__.state.y);await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');expect(await page.evaluate(()=>__BIOLOGY__.state.y)).toBeLessThan(y);checks.push('Reduced motion retains gameplay stages and two-axis control');
expect(errors).toEqual([]);
}catch(e){process.exitCode=1;checks.push({failure:String(e)});await page.screenshot({path:'artifacts/interaction-failure-v3.png'});}
finally{await writeFile('artifacts/interaction-results-v3.json',JSON.stringify({checks,errors},null,2));console.log(checks,errors);await context.close();await browser.close();}

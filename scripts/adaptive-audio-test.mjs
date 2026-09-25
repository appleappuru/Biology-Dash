import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const ctx=await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4190');await page.locator('#continue').click();await page.waitForFunction(()=>!!__BIOLOGY__.scene?.patrol&&__BIOLOGY__.audio.context?.state==='running');
 await page.waitForFunction(()=>__BIOLOGY__.audio.stats.played>=2,{},{timeout:8000});
 const natural=await page.evaluate(()=>({...__BIOLOGY__.audio.stats,combo:__BIOLOGY__.audio.director.combo}));
 await expect(page.locator('#support')).toBeEnabled({timeout:10000});await page.locator('#support').focus();await page.keyboard.down('Space');await page.waitForFunction(()=>__BIOLOGY__.audio.charging);await page.waitForTimeout(1750);await page.keyboard.up('Space');await page.waitForFunction(()=>!__BIOLOGY__.audio.charging);
 const release=await page.evaluate(()=>({...__BIOLOGY__.audio.stats,active:__BIOLOGY__.state.medicineActive}));expect(release.active).toBeGreaterThan(5);expect(release.chargeStarts).toBe(1);expect(release.chargeStops).toBe(1);
 const burst=await page.evaluate(async()=>{const a=__BIOLOGY__.audio;__BIOLOGY__.scene.paused=true;a.stop();const before=a.stats.played;for(let i=0;i<30;i++)a.event({type:'death',text:''});await new Promise(r=>setTimeout(r,80));a.update();return{played:a.stats.played-before,active:a.activeVoices,combo:a.director.combo};});expect(burst.played).toBe(5);expect(burst.active).toBeLessThanOrEqual(8);
 const hierarchy=await page.evaluate(()=>{const a=__BIOLOGY__.audio;a.stop();for(let i=0;i<12;i++)a.director.note('hug',220,.7,.1);const before=a.stats.played;a.cue('victory');return{played:a.stats.played-before,active:a.activeVoices,peak:a.stats.peakVoices,dropped:a.stats.dropped};});expect(hierarchy.played).toBe(5);expect(hierarchy.active).toBeLessThanOrEqual(8);expect(hierarchy.dropped).toBeGreaterThan(0);
 const cancellation=await page.evaluate(()=>{const a=__BIOLOGY__.audio;a.update(true,.4);__BIOLOGY__.scene.cancelControls();return{charging:a.charging,voices:a.activeVoices,pending:a.director.pending};});expect(cancellation).toEqual({charging:false,voices:0,pending:0});
 await page.evaluate(()=>{__BIOLOGY__.scene.paused=false;});await page.locator('#pause').click();await page.locator('#pause-sound').click();
 const muted=await page.evaluate(()=>{const a=__BIOLOGY__.audio,n=a.stats.played;a.cue('victory');a.update(true,1);return{played:a.stats.played-n,charging:a.charging};});expect(muted).toEqual({played:0,charging:false});
 await page.locator('#leave').click();await page.locator('[data-nav="settings"]:visible').click();await expect(page.locator('#musicVolume')).toBeVisible();
 await page.locator('#mute').click();for(const [id,value] of [['volume',.4],['sfxVolume',.6],['musicVolume',.2]])await page.locator('#'+id).evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},value);
 await page.locator('#sound-preview').click();await page.waitForTimeout(100);await page.screenshot({path:'artifacts/adaptive-audio-settings.png'});await page.reload();
 const saved=await page.evaluate(()=>({volume:__BIOLOGY__.save.volume,sfxVolume:__BIOLOGY__.save.sfxVolume,musicVolume:__BIOLOGY__.save.musicVolume}));expect(saved).toEqual({volume:.4,sfxVolume:.6,musicVolume:.2});
 await page.locator('#continue').click();await page.waitForFunction(()=>__BIOLOGY__.audio.context?.state==='running'&&!!__BIOLOGY__.scene?.patrol);expect(errors).toEqual([]);
 await writeFile('artifacts/adaptive-audio-browser.json',JSON.stringify({natural,release,burst,hierarchy,cancellation,saved,errors},null,2));console.log('PASS natural sound, charge/release, 30-kill aggregation, priority voice stealing, pause/mute, independent channels, save/restart and no errors');
}finally{await browser.close();}

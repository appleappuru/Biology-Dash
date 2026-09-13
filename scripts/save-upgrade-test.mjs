import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage(), errors=[], results=[];
page.on('pageerror',e=>errors.push(e.message));
try {
    await page.goto('http://127.0.0.1:4175/');
    await page.evaluate(()=>{
        localStorage.setItem('biology-dash-v1',JSON.stringify({
            version:1,completed:[1],stars:{1:3},credits:30,reinforcement:0,
            muted:true,volume:.15,reducedMotion:true,tutorial:true,
            antibody:{epitope:'A',affinity:.45,effector:'opsonization'},checks:{gate:true}
        }));
    });
    // Navigate to a new document without the old app's pagehide save overwriting the fixture.
    const migrated=await context.newPage();
    await migrated.goto('http://127.0.0.1:4175/');
    await expect(migrated.locator('[data-level="2"]')).toBeEnabled();
    await expect(migrated.locator('.currency')).toContainText('30');
    await migrated.locator('.mobile-nav [data-nav="settings"]').click();
    await expect(migrated.locator('#mute')).toHaveText('Off');
    await expect(migrated.locator('#motion')).toHaveText('On');
    await expect(migrated.locator('#volume')).toHaveValue('0.15');
    await migrated.reload();
    await expect(migrated.locator('[data-level="2"]')).toBeEnabled();
    await expect(migrated.locator('.currency')).toContainText('30');
    const stored=await migrated.evaluate(()=>JSON.parse(localStorage.getItem('biology-dash-v1')));
    expect(stored.version).toBe(3);
    expect(stored.stars['1']).toBe(3);
    expect(stored.checks.gate).toBe(true);
    results.push('Production migrates version-1 progression, stars, credits, settings and learning flags; retains them after reload');
    await migrated.locator('[data-level="2"]').click();
    await expect(migrated.locator('#select-macrophage')).toHaveAttribute('aria-pressed','true');
    await migrated.screenshot({path:'artifacts/save-migration-production.png'});
    results.push('Updated illustrated defender selection remains accessible after migration');
    expect(errors).toEqual([]);
}catch(e){results.push({failure:String(e)});process.exitCode=1;}
finally{console.log(results);await writeFile('artifacts/save-upgrade-results.json',JSON.stringify({results,errors},null,2));await browser.close();}

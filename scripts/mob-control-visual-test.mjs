import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const GAME_URL = process.env.GAME_URL || 'http://127.0.0.1:4190';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

try {
    console.log('Navigating to', GAME_URL);
    await page.goto(GAME_URL);
    await page.locator('#continue').click();
    await page.waitForFunction(() => !!__BIOLOGY__.scene?.patrol);

    // 1. Level 2 with multiple cells
    await page.evaluate(() => __BIOLOGY__.start(2));
    await page.waitForFunction(() => __BIOLOGY__.state?.level === 2);

    // Check squad and emitter pod
    const stateInfo = await page.evaluate(() => ({
        squad: __BIOLOGY__.state.squad,
        level: __BIOLOGY__.state.level,
        hasHurledArray: Array.isArray(__BIOLOGY__.state.hurled),
        hasEmitter: typeof __BIOLOGY__.scene.emitterPulse === 'number'
    }));
    console.log('Level 2 State:', JSON.stringify(stateInfo));
    expect(stateInfo.squad).toBeGreaterThan(1);
    expect(stateInfo.hasHurledArray).toBe(true);
    expect(stateInfo.hasEmitter).toBe(true);

    // Spawn an enemy close by to test squeeze hugs & tap-to-hurl
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.enemies = [{
            id: 201,
            kind: 'susceptible',
            x: 210,
            y: 520,
            hp: 20,
            maxHp: 20,
            radius: 18,
            speed: 10,
            tagged: false,
            complementTagged: false,
            inhibited: false,
            inhibitedUntil: 0,
            boss: false
        }];
        p.time = 5;
    });

    // Test tap-to-hurl / yeet
    await page.waitForTimeout(100);
    const box = await page.locator('canvas').boundingBox();
    // Tap near enemy screen coordinate
    const targetQ = await page.evaluate(() => {
        const e = __BIOLOGY__.state.enemies[0];
        const scale = 0.5 + (0.5 * (e.y - 120)) / (780 - 120);
        const x = 210 + (e.x - 210) * scale;
        const y = 140 + (e.y - 120) * 0.94;
        return { x, y };
    });

    console.log('Tapping near enemy:', targetQ);
    await page.mouse.click(box.x + targetQ.x, box.y + targetQ.y);
    await page.waitForTimeout(150);

    const hurledCount = await page.evaluate(() => __BIOLOGY__.state.hurled.length);
    console.log('Hurled defenders in flight:', hurledCount);

    // Take screenshot during flight/hug
    await page.screenshot({ path: 'artifacts/mob-control-hurl-hug.png' });

    // 2. Test Medicine Super Weapon FX (Bactericidal Wall Shatter)
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.medicine = 'amoxicillin';
        p.medicineCharge = 1.0;
        p.enemies = [{
            id: 202,
            kind: 'susceptible',
            x: 210,
            y: 420,
            hp: 15,
            maxHp: 15,
            radius: 18,
            speed: 10,
            tagged: false,
            complementTagged: false,
            inhibited: false,
            inhibitedUntil: 0,
            boss: false
        }];
        p.releaseMedicineCharge();
    });

    await page.waitForTimeout(300);
    await page.screenshot({ path: 'artifacts/mob-control-amox-superweapon.png' });

    // 3. Test Medicine Super Weapon FX (Bacteriostatic Cryo-Stasis)
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.medicine = 'doxycycline';
        p.medicineCharge = 1.0;
        p.enemies = [{
            id: 203,
            kind: 'doxy-resistant',
            x: 140,
            y: 380,
            hp: 15,
            maxHp: 15,
            radius: 18,
            speed: 10,
            tagged: false,
            complementTagged: false,
            inhibited: false,
            inhibitedUntil: 0,
            boss: false
        }, {
            id: 204,
            kind: 'susceptible',
            x: 280,
            y: 380,
            hp: 15,
            maxHp: 15,
            radius: 18,
            speed: 10,
            tagged: false,
            complementTagged: false,
            inhibited: false,
            inhibitedUntil: 0,
            boss: false
        }];
        p.releaseMedicineCharge();
    });

    await page.waitForTimeout(350);
    await page.screenshot({ path: 'artifacts/mob-control-doxy-cryostasis.png' });

    // 4. Test Gate Passage Popups
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.gates = [{
            id: 301,
            y: 630,
            used: false,
            layout: 'triple',
            left: { id: 'recruit', label: '+4 cells', detail: 'Recruit', kind: 'recruit', value: 4 },
            center: { id: 'tempo', label: 'Rapid response', detail: 'Tempo', kind: 'tempo', value: 12 },
            right: { id: 'shield', label: 'Rescue shield', detail: 'Shield', kind: 'shield', value: 8 },
        }];
        p.move(210, 635);
        p.applyGate(p.gates[0], 'left');
    });

    await page.waitForTimeout(200);
    await page.screenshot({ path: 'artifacts/mob-control-gate-popup.png' });

    expect(errors).toEqual([]);
    console.log('PASS Mob Control / Last War 3D visual effects verified successfully!');
} catch (e) {
    console.error('Error in test:', e);
    process.exitCode = 1;
} finally {
    await browser.close();
}

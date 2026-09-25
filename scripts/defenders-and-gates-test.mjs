import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const GAME_URL = process.env.GAME_URL || 'http://127.0.0.1:4190';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

try {
    // 1. First Hug Opening: Kawaii white defender verification
    await page.goto(GAME_URL);
    await page.locator('#continue').click();
    await page.waitForFunction(() => !!__BIOLOGY__.scene?.patrol);
    await page.waitForFunction(() => __BIOLOGY__.state?.cells.some(c => c.phase === 'wrap'));
    await page.screenshot({ path: 'artifacts/simple-white-defenders.png' });

    const defenderCheck = await page.evaluate(() => {
        const tex = __BIOLOGY__.scene.textures.get('defenders-v2');
        const visibleCell = __BIOLOGY__.scene.cells.find(c => c.node.visible);
        return {
            frameWidth: tex.frames['0']?.width,
            frameHeight: tex.frames['0']?.height,
            frameTotal: tex.frameTotal,
            cellWidth: visibleCell?.body.displayWidth,
            cellTint: visibleCell?.body.tintTopLeft,
        };
    });

    expect(defenderCheck.frameWidth).toBe(128);
    expect(defenderCheck.frameHeight).toBe(128);
    expect(defenderCheck.frameTotal).toBeGreaterThanOrEqual(12);
    expect(defenderCheck.cellWidth).toBeGreaterThan(110);
    expect(defenderCheck.cellTint).toBe(0xffffff);

    // 2. Patrol 2 Roster size check: Macrophage vs Neutrophil
    await page.evaluate(() => __BIOLOGY__.start(2));
    await page.waitForFunction(() => __BIOLOGY__.scene?.patrol?.level === 2);
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.loadout = ['neutro', 'maco', 'pluma'];
        p.squad = 6;
        p.syncCells();
        p.nextSpawn = p.nextGate = 999;
    });
    await page.waitForTimeout(600);

    const sizes = await page.evaluate(() => {
        const s = __BIOLOGY__.scene;
        return __BIOLOGY__.state.cells.map(c => ({
            role: c.role,
            size: s.cells.find(v => v.boundId === c.id)?.body.displayWidth,
            tint: s.cells.find(v => v.boundId === c.id)?.body.tintTopLeft,
        }));
    });

    const maco = sizes.find(c => c.role === 'macrophage');
    const neutro = sizes.find(c => c.role === 'neutrophil');
    expect(maco.size).toBeGreaterThan(neutro.size);
    expect(sizes.every(c => c.tint === 0xffffff)).toBe(true);

    // 3. Translucent Three-Lane Gates: Rendering & Dimensions
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.gates = [{
            id: 850,
            y: 350,
            used: false,
            layout: 'staggered',
            stagger: { left: 0, center: -30, right: -55 },
            left: { id: 'recruit', label: '+4 cells', detail: 'Join squad', kind: 'recruit', value: 4 },
            center: { id: 'reach', label: '+18 reach', detail: 'Extended reach', kind: 'coverage', value: 18 },
            right: { id: 'shield', label: 'Rescue shield', detail: 'Loss protection', kind: 'shield', value: 8 },
        }];
    });
    await page.waitForTimeout(300);

    const gateData = await page.evaluate(() => {
        const gv = __BIOLOGY__.scene.gateViews.get(850);
        if (!gv) return null;
        return {
            panelCount: gv.panels.length,
            panels: gv.panels.map(p => {
                const face = p.list[1];
                const top = p.list[2];
                const title = p.list[3];
                return {
                    visible: p.visible,
                    x: p.x,
                    y: p.y,
                    faceAlpha: face.fillAlpha ?? face.alpha,
                    faceWidth: face.width,
                    faceHeight: face.height,
                    titleText: title.text,
                };
            }),
            containerAlpha: gv.node.alpha,
        };
    });

    expect(gateData).not.toBeNull();
    expect(gateData.panelCount).toBe(3);
    // Three lanes: left (x=-95), center (x=0), right (x=95)
    expect(gateData.panels[0].x).toBe(-95);
    expect(gateData.panels[1].x).toBe(95);
    expect(gateData.panels[2].x).toBe(0);

    // Translucent face alpha (~0.52)
    expect(gateData.panels[0].faceAlpha).toBeCloseTo(0.52, 1);
    expect(gateData.panels[1].faceAlpha).toBeCloseTo(0.52, 1);
    expect(gateData.panels[2].faceAlpha).toBeCloseTo(0.52, 1);

    // Staggered vertical positioning:
    // Left: y = 0
    // Right: y = -55 * scale
    // Center: y = -30 * scale
    expect(gateData.panels[0].y).toBe(0);
    expect(gateData.panels[1].y).toBeLessThan(gateData.panels[2].y);
    expect(gateData.panels[2].y).toBeLessThan(gateData.panels[0].y);

    await page.screenshot({ path: 'artifacts/translucent-three-lane-gates.png' });

    // 4. Contact Reaction (Defender proximity & Projectile reach)
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        const gate = p.gates[0];
        gate.hitReaction = { lane: 'center', time: p.time, kind: 'projectile' };
    });
    await page.waitForTimeout(100);

    const reactingAlpha = await page.evaluate(() => {
        const gv = __BIOLOGY__.scene.gateViews.get(850);
        const centerFace = gv.panels[2].list[1];
        return centerFace.fillAlpha ?? centerFace.alpha;
    });
    expect(reactingAlpha).toBeGreaterThan(0.75); // Luminous pulse reaction
    await page.screenshot({ path: 'artifacts/staggered-gates-reaction.png' });

    // 5. Successful Crossing: collect center gate
    const squadBefore = await page.evaluate(() => __BIOLOGY__.state.coverage);
    await page.evaluate(() => {
        const p = __BIOLOGY__.state;
        p.applyGate(p.gates[0], 'center');
    });
    await page.waitForTimeout(200);

    const coverageAfter = await page.evaluate(() => __BIOLOGY__.state.coverage);
    expect(coverageAfter).toBe(squadBefore + 18);

    const result = {
        defenderCheck,
        sizes,
        gateData,
        reactingAlpha,
        coverageAfter,
        errors,
    };

    expect(errors).toEqual([]);
    await writeFile('artifacts/defenders-and-gates-result.json', JSON.stringify(result, null, 2));
    console.log('PASS simplified kawaii white defenders, translucent three-lane gates, vertical stagger, and contact reactions verified in browser');
} finally {
    await browser.close();
}

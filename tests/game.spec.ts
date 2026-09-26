import { test, expect } from '@playwright/test';

test.describe('Biology Dash: Immune Patrol Browser Checks', () => {
  test('boots application and loads storybook campaign screen', async ({ page }) => {
    await page.goto('/');

    // Check main container
    const appContainer = page.locator('#app-container');
    await expect(appContainer).toBeVisible();

    // Check Campaign screen header
    const title = page.locator('.logo-title');
    await expect(title).toHaveText('BIOLOGY DASH');

    // Check that 10 patrol cards are present
    const cards = page.locator('.patrol-card');
    await expect(cards).toHaveCount(10);

    // Patrol 1 should be unlocked
    const p1Card = page.locator('.patrol-card[data-id="1"]');
    await expect(p1Card).toHaveClass(/unlocked/);
  });

  test('navigates through barracks and field guide tabs', async ({ page }) => {
    await page.goto('/');

    // Click Barracks tab
    await page.click('#tab-barracks');
    const barracksHeader = page.locator('.logo-title');
    await expect(barracksHeader).toHaveText('SQUAD BARRACKS');
    const barracksCards = page.locator('.barracks-card');
    await expect(barracksCards).toHaveCount(4);

    // Click Field Guide tab
    await page.click('#tab-guide');
    const guideHeader = page.locator('.logo-title');
    await expect(guideHeader).toHaveText('FIELD GUIDE');
    const guideRecords = page.locator('.guide-record-card');
    await expect(guideRecords).toHaveCount(12);
  });

  test('launches Patrol 1, mounts Phaser canvas and interacts with HUD', async ({ page }) => {
    await page.goto('/');

    // Click on Patrol 1 to open Briefing
    await page.click('.patrol-card[data-id="1"]');

    // Verify Briefing modal
    const briefing = page.locator('.briefing-card');
    await expect(briefing).toBeVisible();
    await expect(page.locator('.briefing-subtitle')).toHaveText('The Capillary Breach (Tutorial)');

    // Start Patrol
    await page.click('#briefing-start-btn');

    // Canvas should be created inside container
    const canvas = page.locator('#game-canvas-container canvas');
    await expect(canvas).toBeVisible();

    // Candy HUD should be rendered
    const hud = page.locator('.candy-hud');
    await expect(hud).toBeVisible();

    // Squad badge should be displaying starting cells
    const squadBadge = page.locator('#squad-badge');
    await expect(squadBadge).toBeVisible();

    // Open Care Kit
    await page.click('#care-kit-btn');
    const careKit = page.locator('.care-kit-modal');
    await expect(careKit).toBeVisible();
    await expect(page.locator('.bento-med-card')).toHaveCount(4);

    // Close Care Kit
    await page.click('#care-kit-close');
    await expect(careKit).not.toBeVisible();

    // Advance 3 seconds into patrol to see cells and microbes in action
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'public/assets/gameplay-preview-biological.png' });

    // Advance to 6.5 seconds when swarm has multiplied and engages S. aureus horde
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'public/assets/gameplay-combat-biological.png' });
  });
});

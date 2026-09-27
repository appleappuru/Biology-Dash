import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

try {
  // 1. Render enemies-v2
  const enemiesSvg = await readFile('public/assets/enemies-3d.svg', 'utf8');
  await page.setViewportSize({ width: 1024, height: 1280 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${enemiesSvg}</body></html>`);
  await page.screenshot({ path: 'public/assets/enemies-v2.png', omitBackground: true });
  console.log('Rendered public/assets/enemies-v2.png (1024x1280)');

  // 2. Render microbes-v3
  const microbesSvg = await readFile('public/assets/microbes-3d.svg', 'utf8');
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${microbesSvg}</body></html>`);
  await page.screenshot({ path: 'public/assets/microbes-v3.png', omitBackground: true });
  console.log('Rendered public/assets/microbes-v3.png (1024x1024)');
} finally {
  await browser.close();
}

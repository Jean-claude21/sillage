// Full-page captures for design review: node scripts/shots.mjs <url> <name> [width]
import { chromium } from '@playwright/test';
const [, , url, name, width = '1440'] = process.argv;
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(800);
await page.screenshot({ path: `review/${name}.png`, fullPage: true });
await browser.close();
console.log(`review/${name}.png`);

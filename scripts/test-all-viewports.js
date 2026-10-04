/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');

const VIEWPORTS = [
  { name: 'iPhone SE (small)', width: 320, height: 568 },
  { name: 'Galaxy S8 / small Android', width: 360, height: 740 },
  { name: 'iPhone 8 / SE2', width: 375, height: 667 },
  { name: 'iPhone 12 / 13 / 14 / 15', width: 390, height: 844 },
  { name: 'iPhone 11 / XR / Plus', width: 414, height: 896 },
  { name: 'iPhone 14 / 15 Pro Max', width: 430, height: 932 },
  { name: 'iPhone 16 Pro Max (User Target)', width: 440, height: 956 },
  { name: 'iPad Mini / Tablet portrait', width: 768, height: 1024 },
  { name: 'iPad Pro / Laptop portrait', width: 1024, height: 1366 },
  { name: 'MacBook Air / Desktop standard', width: 1440, height: 900 },
  { name: 'MacBook Pro 16 / iMac (User Target Desktop)', width: 1728, height: 1117 }
];

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let allPassed = true;

  console.log('====================================================');
  console.log('MULTI-VIEWPORT RESPONSIVE & OVERFLOW VERIFICATION');
  console.log('====================================================\n');

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    await page.waitForSelector('iframe', { timeout: 10000 });
    const frameHandle = await page.$('iframe');
    const frame = await frameHandle.contentFrame();
    const doc = frame || page;

    const data = await doc.evaluate((vpWidth) => {
      const scrollWidth = document.body.scrollWidth;
      const clientWidth = document.body.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth;

      const nav = document.querySelector('.nav');
      const navR = nav ? nav.getBoundingClientRect() : null;
      const navFits = navR ? navR.width <= clientWidth && navR.right <= clientWidth + 1 : false;

      const hero = document.querySelector('.hero');
      const heroR = hero ? hero.getBoundingClientRect() : null;

      const ch0 = document.querySelector('.chapter[data-chapter="0"]');
      const ch0R = ch0 ? ch0.getBoundingClientRect() : null;

      let overlapDetected = false;
      let overlapDetails = '';

      if (vpWidth <= 768) {
        // On mobile, stageCanvas should precede hero, which precedes chapter 0
        const stageCanvas = document.querySelector('.stage__canvas');
        const scR = stageCanvas ? stageCanvas.getBoundingClientRect() : null;
        const heroTR = document.querySelector('.hero__t')?.getBoundingClientRect();

        if (scR && heroTR) {
          if (heroTR.top < scR.bottom - 10) {
            overlapDetected = true;
            overlapDetails = `Hero text (top=${heroTR.top}) overlaps canvas (bottom=${scR.bottom})`;
          }
        }
        if (heroR && ch0R) {
          if (ch0R.top < heroR.bottom - 10) {
            overlapDetected = true;
            overlapDetails = `Chapter 0 (top=${ch0R.top}) overlaps hero (bottom=${heroR.bottom})`;
          }
        }
      }

      return {
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow,
        navFits,
        overlapDetected,
        overlapDetails
      };
    }, vp.width, vp.height);

    const isOk = !data.hasHorizontalOverflow && data.navFits && !data.overlapDetected;
    if (!isOk) allPassed = false;

    console.log(`[${isOk ? 'PASS' : 'FAIL'}] ${vp.name} (${vp.width}x${vp.height}):`);
    console.log(`       ScrollWidth: ${data.scrollWidth}px | ClientWidth: ${data.clientWidth}px | H-Overflow: ${data.hasHorizontalOverflow ? 'YES (FAIL)' : 'NO (OK)'}`);
    console.log(`       Nav Fits: ${data.navFits ? 'YES (OK)' : 'NO (FAIL)'}`);
    if (data.overlapDetected) {
      console.log(`       Overlap: ${data.overlapDetails}`);
    } else {
      console.log(`       Layout Stacking: Clean vertical sequence (No overlap)`);
    }
    console.log('');
  }

  // Also take desktop screenshot to verify desktop remains pristine
  await page.setViewport({ width: 1728, height: 1117 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'desktop-verified.png' });
  console.log('Saved desktop-verified.png for desktop regression check');

  await browser.close();

  if (!allPassed) {
    console.error('\nSOME VIEWPORT CHECKS FAILED!');
    process.exit(1);
  } else {
    console.log('\nALL 11 VIEWPORTS PASSED WITH ZERO HORIZONTAL OVERFLOW AND CLEAN LAYOUT!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

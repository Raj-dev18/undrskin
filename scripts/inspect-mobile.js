/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 956 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const frameHandle = await page.$('iframe');
  const frame = await frameHandle.contentFrame();
  const doc = frame || page;
  
  const layout = await doc.evaluate(() => {
    const nav = document.querySelector('.nav');
    const stage = document.querySelector('.stage');
    const stageCanvas = document.querySelector('.stage__canvas');
    const hero = document.querySelector('.hero');
    const heroEyebrow = document.querySelector('.hero__eyebrow');
    const heroT = document.querySelector('.hero__t');
    const heroMeta = document.querySelector('.hero__meta');
    const chapters = document.querySelector('.chapters');
    const ch0 = document.querySelector('.chapter[data-chapter="0"]');
    const ch0Box = document.querySelector('.chapter[data-chapter="0"] .chapter__box');

    const getB = (el, name) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        name,
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        height: Math.round(r.height)
      };
    };

    return {
      nav: getB(nav, 'nav'),
      stage: getB(stage, 'stage'),
      stageCanvas: getB(stageCanvas, 'stageCanvas'),
      hero: getB(hero, 'hero'),
      heroEyebrow: getB(heroEyebrow, 'heroEyebrow'),
      heroT: getB(heroT, 'heroT'),
      heroMeta: getB(heroMeta, 'heroMeta'),
      chapters: getB(chapters, 'chapters'),
      ch0: getB(ch0, 'ch0'),
      ch0Box: getB(ch0Box, 'ch0Box'),
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth
    };
  });
  console.log('RESULT LAYOUT AT 440x956:\n', JSON.stringify(layout, null, 2));
  await page.screenshot({ path: 'mobile-result.png' });
  console.log('Saved mobile-result.png');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', 'checkout-screenshots');
if (!fs.existsSync(SHOT_DIR)) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Transparent Navbar at top
  await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-clean-navbar.png'), fullPage: false });

  // 2. 4 Products
  const iframeHandle = await page.$('iframe');
  const frame = await iframeHandle.contentFrame();
  await frame.evaluate(() => {
    const el = document.getElementById('trios');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-clean-4products.png'), fullPage: false });

  // 3. Bottom of page (reviews + site footer, NO boxed upper footer)
  await frame.evaluate(() => {
    const rev = document.getElementById('reviews');
    if (rev) rev.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-clean-reviews-footer.png'), fullPage: false });

  await browser.close();
  console.log('Clean screenshots captured successfully.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

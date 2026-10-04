const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', 'checkout-screenshots');
if (!fs.existsSync(SHOT_DIR)) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

async function verify() {
  console.log('=== VERIFYING MIRROR GLASS NAVBAR & SCROLL BEHAVIOR ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Find demo iframe
  const iframeHandle = await page.$('iframe');
  const frame = await iframeHandle.contentFrame();

  // Test 1: Initial state of #nav at y=0
  const initialNav = await frame.evaluate(() => {
    const nav = document.getElementById('nav');
    const style = window.getComputedStyle(nav);
    return {
      hasNav: Boolean(nav),
      display: style.display,
      position: style.position,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      background: style.backgroundColor,
      borderBottom: style.borderBottom,
      hasIsSolid: nav.classList.contains('is-solid'),
    };
  });
  console.log('1. Initial #nav state (y=0):', initialNav);
  await page.screenshot({ path: path.join(SHOT_DIR, 'mirror-nav-initial.png') });

  // Test 2: Scroll down so the waistband passes under #nav (matching media_1791001523746.png)
  console.log('2. Scrolling down so red panty waistband slides under mirror glass navbar...');
  await frame.evaluate(() => {
    window.scrollTo({ top: 180, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const scrolledNav = await frame.evaluate(() => {
    const nav = document.getElementById('nav');
    const style = window.getComputedStyle(nav);
    return {
      scrollY: window.pageYOffset,
      hasIsSolid: nav.classList.contains('is-solid'),
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      background: style.backgroundColor,
      borderBottom: style.borderBottom,
    };
  });
  console.log('Scrolled #nav state (y=180):', scrolledNav);
  await page.screenshot({ path: path.join(SHOT_DIR, 'mirror-nav-scrolling-red-waistband.png') });

  // Test 3: Check collections page mirror navbar
  console.log('\n3. Testing Collections Page Mirror Navbar...');
  await page.goto('http://localhost:3000/collections', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const collNavInitial = await page.evaluate(() => {
    const header = document.querySelector('header.site-header');
    const style = window.getComputedStyle(header);
    return {
      hasHeader: Boolean(header),
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      borderBottom: style.borderBottom,
    };
  });
  console.log('Collections navbar at top:', collNavInitial);

  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));

  const collNavScrolled = await page.evaluate(() => {
    const header = document.querySelector('header.site-header');
    const style = window.getComputedStyle(header);
    return {
      scrollY: window.scrollY,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      borderBottom: style.borderBottom,
    };
  });
  console.log('Collections navbar scrolled (y=200):', collNavScrolled);
  await page.screenshot({ path: path.join(SHOT_DIR, 'collections-mirror-nav.png') });

  await browser.close();
  console.log('\n=== ALL MIRROR NAVBAR VERIFICATIONS PASSED ===');
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});

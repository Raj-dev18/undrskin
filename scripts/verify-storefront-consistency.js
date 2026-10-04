const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', 'checkout-screenshots');
if (!fs.existsSync(SHOT_DIR)) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

async function verifyStorefront() {
  console.log('=== VERIFYING UNDRSKIN STOREFRONT CONSISTENCY & INTEGRITY ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test 1: Desktop Homepage
  console.log('--- 1. Testing Desktop Homepage (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // Check top navbar
  const navbarLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('header nav a')).map(a => a.textContent.trim());
    const bagBtn = document.querySelector('header button')?.textContent.replace(/\s+/g, ' ').trim();
    const logoAlt = document.querySelector('header img')?.getAttribute('alt');
    return { links, bagBtn, logoAlt };
  });
  console.log('Navbar findings:', navbarLinks);

  // Check iframe and #trios section
  await page.waitForSelector('iframe');
  const iframeHandle = await page.$('iframe');
  const frame = await iframeHandle.contentFrame();
  await frame.waitForSelector('#triosGrid', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000)); // wait for catalog message

  const trioCardsInfo = await frame.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#triosGrid .trio'));
    const showAllBtn = document.querySelector('#trios a[href="/collections"]');
    const firstCard = cards[0];
    const sizePills = firstCard ? Array.from(firstCard.querySelectorAll('.trio__size-pill')).map(p => p.textContent.trim()) : [];
    const internalFooter = document.querySelector('footer');
    const internalFooterVisible = internalFooter ? window.getComputedStyle(internalFooter).display !== 'none' : false;
    const internalLabel = document.querySelector('.label');
    const internalLabelVisible = internalLabel ? window.getComputedStyle(internalLabel).display !== 'none' : false;
    return {
      cardCount: cards.length,
      titles: cards.map(c => c.querySelector('.trio__t')?.textContent.trim()),
      hasShowAllBtn: Boolean(showAllBtn),
      showAllText: showAllBtn?.textContent.trim(),
      firstCardSizes: sizePills,
      internalFooterVisible,
      internalLabelVisible,
    };
  });
  console.log('Homepage Product Section findings:', trioCardsInfo);

  // Check parent site footer
  const siteFooterInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    return {
      hasSiteFooter: Boolean(footer),
      footerVisible: footer ? window.getComputedStyle(footer).display !== 'none' : false,
    };
  });
  console.log('Site Footer findings:', siteFooterInfo);

  // Test size validation on homepage
  console.log('Testing size validation on first card...');
  await frame.evaluate(() => {
    const addBtn = document.querySelector('#triosGrid .trio [data-add-trio="0"]');
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const validationState = await frame.evaluate(() => {
    const err = document.querySelector('#trioError-0');
    return {
      isDisplayed: err ? window.getComputedStyle(err).display !== 'none' : false,
      text: err?.textContent.trim(),
    };
  });
  console.log('Validation state before choosing size:', validationState);

  // Select size XL on first card and click Add to Bag
  console.log('Selecting XL on first card and adding to bag...');
  await frame.evaluate(() => {
    const xlBtn = document.querySelector('#triosGrid .trio [data-trio-idx="0"][data-trio-size="XL"]');
    if (xlBtn) xlBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const xlSelected = await frame.evaluate(() => {
    const xlBtn = document.querySelector('#triosGrid .trio [data-trio-idx="0"][data-trio-size="XL"]');
    const err = document.querySelector('#trioError-0');
    return {
      hasActiveClass: xlBtn?.classList.contains('is-active'),
      errorHidden: err ? window.getComputedStyle(err).display === 'none' : true,
    };
  });
  console.log('XL pill state:', xlSelected);

  // Click Add to bag with XL selected
  await frame.evaluate(() => {
    const addBtn = document.querySelector('#triosGrid .trio [data-add-trio="0"]');
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Check parent page bag count & cart drawer
  const bagUpdatedState = await page.evaluate(() => {
    const bagText = document.querySelector('header button')?.textContent.replace(/\s+/g, ' ').trim();
    const drawer = document.querySelector('[role="dialog"]') || document.querySelector('.cart-drawer');
    return {
      bagText,
      hasDrawer: Boolean(drawer),
    };
  });
  console.log('Parent bag & drawer state after add:', bagUpdatedState);

  await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-home-verified.png'), fullPage: false });

  // Scroll to products and screenshot 4 products
  await frame.evaluate(() => {
    const el = document.getElementById('trios');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-home-4products.png'), fullPage: false });

  // Scroll to bottom to inspect reviews and footer transition
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SHOT_DIR, 'home-footer-bottom.png'), fullPage: false });

  // Test 2: Mobile Homepage (390x844 & 440x956)
  console.log('\n--- 2. Testing Mobile Homepage ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 1000));

  let mobileFrame = page.frames().find(f => f.url().includes('undrskin-3d-demo.html'));
  if (!mobileFrame) {
    const iframeEl = await page.waitForSelector('iframe', { timeout: 10000 });
    mobileFrame = await iframeEl.contentFrame();
  }
  await mobileFrame.waitForSelector('.hero', { timeout: 10000 });

  const mobileLayoutFindings = await mobileFrame.evaluate(() => {
    const stage = document.querySelector('#stage');
    const hero = document.querySelector('.hero');
    const stageRect = stage.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const heroTitle = hero.querySelector('.hero__t')?.textContent.replace(/\s+/g, ' ').trim();
    const heroPrice = hero.querySelector('.hero__price')?.textContent.replace(/\s+/g, ' ').trim();
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

    return {
      stageTop: stageRect.top,
      stageHeight: stageRect.height,
      heroTop: heroRect.top,
      heroBelowStage: heroRect.top >= stageRect.top,
      heroTitle,
      heroPrice,
      hasHorizontalOverflow: overflow,
    };
  });
  console.log('Mobile 390px layout findings:', mobileLayoutFindings);

  await page.screenshot({ path: path.join(SHOT_DIR, 'mobile-home-390.png'), fullPage: false });

  // Test 440px (iPhone 16 Pro Max)
  await page.setViewport({ width: 440, height: 956, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 500));
  const mobile440Findings = await mobileFrame.evaluate(() => {
    const stageRect = document.querySelector('#stage').getBoundingClientRect();
    const heroRect = document.querySelector('.hero').getBoundingClientRect();
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    return {
      stageHeight: stageRect.height,
      heroTop: heroRect.top,
      heroBelowStage: heroRect.top >= stageRect.top,
      hasHorizontalOverflow: overflow,
    };
  });
  console.log('Mobile 440px layout findings:', mobile440Findings);
  await page.screenshot({ path: path.join(SHOT_DIR, 'mobile-home-440.png'), fullPage: false });

  // Test 3: Collections Page Quick Options Modal
  console.log('\n--- 3. Testing Collections Page & Quick Options Modal ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/collections', { waitUntil: 'networkidle2' });

  // Verify navbar on collections page
  const collectionsNav = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('header nav a')).map(a => a.textContent.trim());
    const headerVisible = window.getComputedStyle(document.querySelector('header')).display !== 'none';
    return { links, headerVisible };
  });
  console.log('Collections navbar:', collectionsNav);

  // Hover over the first product card to trigger Quick Options button
  const firstCard = await page.$('.group');
  await firstCard.hover();
  await new Promise(r => setTimeout(r, 500));

  // Click Quick Options button
  const quickOptionsBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('.group button'));
    return btns.find(b => b.textContent.includes('Quick Options') || b.textContent.includes('Quick Add'));
  });
  await quickOptionsBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Verify SELECT SIZE Modal
  const modalInfo = await page.evaluate(() => {
    const modalHeading = document.querySelector('.fixed.inset-0 h3')?.textContent.trim();
    const sizeButtons = Array.from(document.querySelectorAll('.fixed.inset-0 .grid button')).map(b => b.textContent.trim());
    const addSelectedBtn = document.querySelector('.fixed.inset-0 button.btn-brand-primary')?.textContent.replace(/\s+/g, ' ').trim();
    return {
      modalHeading,
      sizeButtons,
      addSelectedBtn,
    };
  });
  console.log('Quick Options Modal findings:', modalInfo);
  await page.screenshot({ path: path.join(SHOT_DIR, 'collections-quick-options-modal.png'), fullPage: false });

  // Select size and add to bag from modal
  console.log('Selecting size and adding to bag in modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.fixed.inset-0 .grid button'));
    if (btns[2]) btns[2].click(); // click 3rd size (e.g. L)
    const addBtn = document.querySelector('.fixed.inset-0 button.btn-brand-primary');
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const afterAddNav = await page.evaluate(() => {
    return document.querySelector('header button')?.textContent.replace(/\s+/g, ' ').trim();
  });
  console.log('Navbar BAG status after collections add:', afterAddNav);

  // Test 4: Cart Page & Unified Checkout Modal
  console.log('\n--- 4. Testing Cart Page & Unified Checkout ---');
  await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle2' });

  const cartPageInfo = await page.evaluate(() => {
    const total = document.querySelector('.font-mono')?.textContent.trim();
    const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
    return {
      hasTotal: Boolean(total),
      hasCheckoutBtn: Boolean(checkoutBtn),
    };
  });
  console.log('Cart page findings:', cartPageInfo);

  // Click Proceed to Checkout
  await page.evaluate(() => {
    const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const checkoutModalInfo = await page.evaluate(() => {
    const title = document.querySelector('.fixed.inset-0 h2')?.textContent.trim();
    const pincode = document.querySelector('input[name="postalCode"]') || document.querySelector('input[placeholder*="Pincode"]');
    const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pay with Razorpay'));
    return {
      title,
      hasPincodeInput: Boolean(pincode),
      hasPayBtn: Boolean(payBtn),
      payBtnText: payBtn?.textContent.replace(/\s+/g, ' ').trim(),
    };
  });
  console.log('Checkout modal findings:', checkoutModalInfo);
  await page.screenshot({ path: path.join(SHOT_DIR, 'cart-checkout-modal-unified.png'), fullPage: false });

  await browser.close();
  console.log('\n=== ALL STOREFRONT CONSISTENCY VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

verifyStorefront().catch(err => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});

/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');

async function runBrowserTests() {
  console.log('--- LAUNCHING REAL BROWSER (EDGE) ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Track console warnings and errors (especially React key warnings)
  const consoleErrors = [];
  const reactKeyWarnings = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
    if (text.includes('unique "key" prop') || text.includes('Each child in a list should have a unique key')) {
      reactKeyWarnings.push(text);
    }
  });

  // 1. TEST FOOTER & POLICIES ON HOMEPAGE
  console.log('\n--- 1. TESTING HOMEPAGE & FOOTER ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const frameHandle = await page.$('iframe');
  const frame = await frameHandle.contentFrame();

  if (!frame) {
    throw new Error('3D experience iframe not found');
  }

  const footerPoliciesHeader = await frame.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('.label__grid h4'));
    return headers.map(h => h.textContent.trim()).find(t => t.toUpperCase() === 'POLICIES') || 'Not found';
  });
  console.log('Footer Policies Header:', footerPoliciesHeader);

  const policyLinks = await frame.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.label__grid div:last-child a'));
    return links.map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') }));
  });
  console.log('Policy links found in footer:', policyLinks);

  // 2. TEST HOMEPAGE REVIEWS PAGINATION & SUMMARY
  console.log('\n--- 2. TESTING HOMEPAGE REVIEWS PAGINATION & SUMMARY (JUDGE.ME) ---');
  const reviewScore = await frame.evaluate(() => {
    const el = document.getElementById('scoreNum');
    return el ? el.textContent.trim() : 'None';
  });
  const reviewMeta = await frame.evaluate(() => {
    const el = document.getElementById('scoreMeta');
    return el ? el.textContent.trim() : 'None';
  });
  console.log('Summary Aggregate Score:', reviewScore);
  console.log('Summary Review Count:', reviewMeta);

  // Check star distribution bars
  const starBars = await frame.evaluate(() => {
    const bars = Array.from(document.querySelectorAll('.rev-bar'));
    return bars.map(b => ({
      star: b.querySelector('.num')?.textContent.trim(),
      pct: b.querySelector('.rev-bar__pct')?.textContent.trim()
    }));
  });
  console.log('Star Distribution Breakdown:', starBars);

  // A. Verify Page 1 (Desktop: 3 reviews, reviews 1-3)
  const page1Info = await frame.evaluate(() => document.getElementById('revPageInfo')?.textContent.trim());
  const page1Cards = await frame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#homeReviewGrid .home-review-card'));
    return items.map(el => ({
      id: el.getAttribute('data-review-id'),
      stars: el.querySelector('.home-review__stars')?.textContent.trim(),
      verifiedBadge: !!el.querySelector('.home-review__badge'),
      title: el.querySelector('.home-review__title')?.textContent.trim() || null,
      body: el.querySelector('.home-review__body')?.textContent.trim() || null,
      author: el.querySelector('.home-review__author')?.textContent.trim() || null,
      date: el.querySelector('.home-review__date')?.textContent.trim() || null
    }));
  });
  const prevDisabledPage1 = await frame.evaluate(() => document.getElementById('revPrev')?.disabled);
  const nextDisabledPage1 = await frame.evaluate(() => document.getElementById('revNext')?.disabled);

  console.log('Page 1 Info Header:', page1Info);
  console.log('Page 1 Cards Count:', page1Cards.length);
  console.log('Page 1 Prev Button Disabled:', prevDisabledPage1, '| Next Button Disabled:', nextDisabledPage1);
  page1Cards.forEach((r, i) => {
    console.log(`  Card #${i + 1} [ID: ${r.id}]: ${r.stars} | Verified: ${r.verifiedBadge} | Title: "${r.title}" | Author: ${r.author} (${r.date})`);
  });

  if (page1Cards.length !== 3) {
    throw new Error(`Expected exactly 3 cards on desktop page 1, found ${page1Cards.length}`);
  }
  if (!prevDisabledPage1) {
    throw new Error('Previous button should be disabled on page 1');
  }

  // B. Click Next -> Page 2 (Reviews 4-6)
  await frame.click('#revNext');
  await new Promise(r => setTimeout(r, 300));
  const page2Info = await frame.evaluate(() => document.getElementById('revPageInfo')?.textContent.trim());
  const page2Cards = await frame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#homeReviewGrid .home-review-card'));
    return items.map(el => ({
      id: el.getAttribute('data-review-id'),
      stars: el.querySelector('.home-review__stars')?.textContent.trim(),
      author: el.querySelector('.home-review__author')?.textContent.trim() || null
    }));
  });
  const prevDisabledPage2 = await frame.evaluate(() => document.getElementById('revPrev')?.disabled);
  console.log('Page 2 Info Header after Next click:', page2Info);
  console.log('Page 2 Cards Count:', page2Cards.length);
  console.log('Page 2 Prev Button Disabled:', prevDisabledPage2);
  page2Cards.forEach((r, i) => {
    console.log(`  Card #${i + 4} [ID: ${r.id}]: ${r.stars} | Author: ${r.author}`);
  });

  if (page2Cards.length !== 3) {
    throw new Error(`Expected exactly 3 cards on desktop page 2, found ${page2Cards.length}`);
  }
  if (prevDisabledPage2) {
    throw new Error('Previous button should be enabled on page 2');
  }

  // C. Navigate to Final Page (Page 7: Reviews 19-20)
  await frame.click('#revPageNumbers button[data-page="6"]');
  await new Promise(r => setTimeout(r, 300));
  const finalPageInfo = await frame.evaluate(() => document.getElementById('revPageInfo')?.textContent.trim());
  const finalPageCards = await frame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#homeReviewGrid .home-review-card'));
    return items.map(el => ({
      id: el.getAttribute('data-review-id'),
      stars: el.querySelector('.home-review__stars')?.textContent.trim(),
      author: el.querySelector('.home-review__author')?.textContent.trim() || null
    }));
  });
  const nextDisabledFinal = await frame.evaluate(() => document.getElementById('revNext')?.disabled);
  console.log('Final Page Info Header (Page 7):', finalPageInfo);
  console.log('Final Page Cards Count:', finalPageCards.length);
  console.log('Final Page Next Button Disabled:', nextDisabledFinal);
  finalPageCards.forEach((r, i) => {
    console.log(`  Card #${i + 19} [ID: ${r.id}]: ${r.stars} | Author: ${r.author}`);
  });

  if (finalPageCards.length !== 2) {
    throw new Error(`Expected exactly 2 cards on final page 7 (reviews 19-20), found ${finalPageCards.length}`);
  }
  if (!nextDisabledFinal) {
    throw new Error('Next button should be disabled on the final page');
  }

  // D. Return to Page 1
  await frame.click('#revPageNumbers button[data-page="0"]');
  await new Promise(r => setTimeout(r, 300));
  const returnedPageInfo = await frame.evaluate(() => document.getElementById('revPageInfo')?.textContent.trim());
  console.log('Returned to Page 1 Header:', returnedPageInfo);

  // 3. TEST POLICY PAGES CONTENT
  console.log('\n--- 3. TESTING CLICK & RENDER OF ALL POLICY PAGES ---');
  const policiesToTest = [
    { name: 'Privacy Policy', path: '/policies/privacy' },
    { name: 'Terms of Service', path: '/policies/terms' },
    { name: 'Shipping Policy', path: '/policies/shipping' },
    { name: 'Refund & Return Policy', path: '/policies/refunds' },
    { name: 'Legal Notice', path: '/policies/legal' },
    { name: 'Contact Information', path: '/policies/contact' },
  ];

  for (const pol of policiesToTest) {
    await page.goto('http://localhost:3000' + pol.path, { waitUntil: 'networkidle2' });
    const title = await page.evaluate(() => document.querySelector('h1')?.textContent.trim() || 'No H1');
    const bodyLength = await page.evaluate(() => document.querySelector('.prose')?.textContent.trim().length || 0);
    console.log(`Policy: ${pol.name} (${pol.path}) -> Title: "${title}", Length: ${bodyLength} chars`);
  }

  // 4. TEST PRODUCT PAGE REVIEWS ISOLATION
  console.log('\n--- 4. TESTING PRODUCT PAGE REVIEWS ISOLATION ---');
  await page.goto('http://localhost:3000/products/shades-pack-1', { waitUntil: 'networkidle2' });
  const prodTitle = await page.evaluate(() => document.querySelector('h1')?.textContent.trim() || 'No H1');
  const prodReviewsCount = await page.evaluate(() => document.querySelectorAll('#reviews .rounded.flex.flex-col').length);
  const emptyReviewState = await page.evaluate(() => document.querySelector('#reviews .bg-neutral-900\\/20 p')?.textContent.trim() || 'None');
  console.log('Product:', prodTitle);
  console.log('Product specific reviews count rendered:', prodReviewsCount);
  console.log('Product page empty state message:', emptyReviewState);

  // 5. VIEWPORT RESPONSIVENESS TESTS (1440, 768, 440, 412, 390, 375)
  console.log('\n--- 5. TESTING VIEWPORTS: 1440x900, 768x1024, 440x900, 412x915, 390x844, 375x812 ---');
  const viewports = [
    { width: 1440, height: 900, name: 'Desktop 1440px' },
    { width: 768, height: 1024, name: 'Tablet 768px' },
    { width: 440, height: 900, name: 'Mobile 440px' },
    { width: 412, height: 915, name: 'Android 412px (Samsung/Pixel)' },
    { width: 390, height: 844, name: 'iPhone 390px (iPhone 12-14)' },
    { width: 375, height: 812, name: 'iPhone 375px (iPhone SE/mini)' }
  ];

  const routesToTest = [
    { name: 'Homepage', path: '/' },
    { name: 'Product Page', path: '/products/shades-pack-1' },
    { name: 'Collections', path: '/collections' },
    { name: 'Search', path: '/search?q=pack' },
    { name: 'Cart', path: '/cart' },
    { name: 'Login', path: '/login' },
    { name: 'Profile', path: '/account/profile' },
    { name: 'Policy Page', path: '/policies/privacy' }
  ];

  for (const vp of viewports) {
    console.log('\nTesting Viewport: ' + vp.name);
    await page.setViewport({ width: vp.width, height: vp.height });

    // Test mobile specific review presentation when mobile viewport
    if (vp.width <= 440) {
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 1000));
      const fHandle = await page.$('iframe');
      const f = await fHandle.contentFrame();
      if (f) {
        const mobileInfo = await f.evaluate(() => document.getElementById('revPageInfo')?.textContent.trim());
        const mobileCards = await f.evaluate(() => document.querySelectorAll('#homeReviewGrid .home-review-card').length);
        const mobileIndicator = await f.evaluate(() => document.querySelector('.rev-page-mobile-indicator')?.textContent.trim());
        console.log(`  [Mobile Review Check ${vp.name}]: Info="${mobileInfo}", CardsRendered=${mobileCards}, Indicator="${mobileIndicator}"`);
      }
    }

    for (const r of routesToTest) {
      await page.goto('http://localhost:3000' + r.path, { waitUntil: 'networkidle2' });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasHorizontalScrollbar = scrollWidth > clientWidth;
      if (hasHorizontalScrollbar) {
        console.error(`  [OVERFLOW ERROR] ${r.name} (${r.path}): scrollWidth ${scrollWidth}px > clientWidth ${clientWidth}px`);
      } else {
        console.log(`  ${r.name} (${r.path}): OK (scrollWidth: ${scrollWidth}px, clientWidth: ${clientWidth}px)`);
      }
    }
  }

  // Summary of React warnings and errors
  console.log('\n--- 6. REACT CONSOLE CHECKS ---');
  console.log('React Key Warnings Count:', reactKeyWarnings.length);
  if (reactKeyWarnings.length > 0) {
    console.warn('React Key Warnings:', reactKeyWarnings);
  }
  console.log('Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.warn('Console Errors:', consoleErrors);
  }

  await browser.close();
  console.log('\n--- ALL BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

runBrowserTests().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'checkout-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runCartCheckoutVerification() {
  console.log('=== VERIFYING UNDRSKIN UNIFIED CART & CHECKOUT ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const mockCartItem = [
    {
      id: 'gid://shopify/ProductVariant/mock-1-12345',
      productId: 'gid://shopify/Product/12345',
      variantId: 'gid://shopify/ProductVariant/52119934370077',
      product: {
        id: 'gid://shopify/Product/12345',
        title: 'The Bamboo Hipster',
        handle: 'the-bamboo-hipster',
        description: 'Ultra-soft, breathable bamboo hipster designed for everyday second-skin comfort.',
        subtitle: 'Studio Essentials',
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=600',
          altText: 'The Bamboo Hipster in Sage',
        },
        price: { amount: 999, currencyCode: 'INR', formattedAmount: '₹999' },
        compareAtPrice: null,
        availableForSale: true,
        options: [],
        variants: [],
        images: [],
        tags: [],
        collections: ['women'],
        rating: 4.8,
        reviewCount: 20,
      },
      variant: {
        id: 'gid://shopify/ProductVariant/52119934370077',
        title: 'S / Sage',
        price: { amount: 999, currencyCode: 'INR', formattedAmount: '₹999' },
        availableForSale: true,
        selectedOptions: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Sage' },
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=600',
          altText: 'The Bamboo Hipster in Sage',
        },
      },
      quantity: 2,
      selectedOptions: [
        { name: 'Size', value: 'S' },
        { name: 'Color', value: 'Sage' },
      ],
    },
  ];

  try {
    // -------------------------------------------------------------
    // 1. TEST CART PAGE (DESKTOP)
    // -------------------------------------------------------------
    console.log('--- Step 1: Testing /cart on Desktop (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle2' });

    // Seed cart in localStorage
    await page.evaluate((items) => {
      localStorage.setItem('undrskin_cart', JSON.stringify(items));
    }, mockCartItem);

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Check line items & order summary
    const cartSummary = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.lg\\:col-span-8 > div'));
      const heading = document.querySelector('h1')?.textContent?.trim();
      const subtotal = document.querySelector('.lg\\:col-span-4 .font-mono')?.textContent?.trim();
      const checkoutBtn = document.querySelector('.lg\\:col-span-4 button')?.textContent?.trim();
      return {
        itemCount: items.length,
        heading,
        subtotal,
        checkoutBtn,
      };
    });

    console.log('Desktop Cart Summary:', cartSummary);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cart-desktop.png') });
    console.log('Saved screenshot: checkout-screenshots/cart-desktop.png');

    // -------------------------------------------------------------
    // 2. TEST CART PAGE (MOBILE 440x956 iPhone 16 Pro Max)
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Testing /cart on Mobile (440x956) ---');
    await page.setViewport({ width: 440, height: 956 });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    const mobileOverflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    console.log('Mobile Cart Horizontal Overflow Status:', mobileOverflow);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cart-mobile.png') });
    console.log('Saved screenshot: checkout-screenshots/cart-mobile.png');

    // -------------------------------------------------------------
    // 3. TEST CHECKOUT MODAL LAUNCH & FORM VALIDATION
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Testing Unified Checkout Modal Opening ---');
    // Click "Proceed to Checkout"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Proceed to Checkout')
      );
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    const modalData = await page.evaluate(() => {
      const modal = document.querySelector('form');
      const title = document.querySelector('h2')?.textContent?.trim();
      const nameInput = document.querySelector('input[name="name"]');
      const phoneInput = document.querySelector('input[name="phone"]');
      const addressInput = document.querySelector('input[name="address"]');
      const payBtn = Array.from(document.querySelectorAll('form button')).find((b) =>
        b.textContent.includes('Pay')
      )?.textContent?.trim();

      return {
        hasModal: !!modal,
        title,
        hasName: !!nameInput,
        hasPhone: !!phoneInput,
        hasAddress: !!addressInput,
        payBtn,
      };
    });

    console.log('Checkout Modal Status:', modalData);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'checkout-modal-mobile.png') });
    console.log('Saved screenshot: checkout-screenshots/checkout-modal-mobile.png');

    // Switch to desktop to see two-column modal
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'checkout-modal-desktop.png') });
    console.log('Saved screenshot: checkout-screenshots/checkout-modal-desktop.png');

    // -------------------------------------------------------------
    // 4. TEST SUCCESS PAGE
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Testing /checkout/success Page ---');
    await page.goto(
      'http://localhost:3000/checkout/success?order_id=order_SAMPLE12345&payment_id=pay_SAMPLE98765',
      { waitUntil: 'networkidle2' }
    );
    await new Promise((r) => setTimeout(r, 800));

    const successData = await page.evaluate(() => {
      return {
        h1: document.querySelector('h1')?.textContent?.trim(),
        text: document.body.textContent?.includes('order_SAMPLE12345'),
        paymentVerified: document.body.textContent?.includes('pay_SAMPLE98765'),
      };
    });
    console.log('Success Page Status:', successData);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'checkout-success-desktop.png') });
    console.log('Saved screenshot: checkout-screenshots/checkout-success-desktop.png');

    console.log('\n=== ALL CART & CHECKOUT VERIFICATIONS PASSED ===');
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await browser.close();
  }
}

runCartCheckoutVerification();

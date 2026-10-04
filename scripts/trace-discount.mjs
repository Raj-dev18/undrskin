const rawDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
const domain = rawDomain.includes('.') ? rawDomain : `${rawDomain}.myshopify.com`;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2025-01';

async function run() {
  let token = adminToken;
  if (!token && clientId && clientSecret) {
    const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    if (authRes.ok) {
      const authData = await authRes.json();
      token = authData.access_token;
    }
  }

  // 1. Get products and variants
  const prodRes = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: `
        query {
          products(first: 5) {
            nodes {
              id
              title
              variants(first: 5) {
                nodes {
                  id
                  title
                  price
                  compareAtPrice
                }
              }
            }
          }
        }
      `
    })
  });
  const prodData = await prodRes.json();
  console.log('PRODUCTS & VARIANTS:', JSON.stringify(prodData, null, 2));

  const firstVariant = prodData.data?.products?.nodes?.[0]?.variants?.nodes?.[0];
  if (!firstVariant) return;

  const numericId = firstVariant.id.replace('gid://shopify/ProductVariant/', '');
  console.log(`Testing cart permalink for variant: ${firstVariant.id} (numeric: ${numericId})`);

  // 2. Fetch the cart permalink and check redirects
  const permalink = `https://${domain}/cart/${numericId}:1`;
  console.log('Fetching permalink:', permalink);

  const cartRes = await fetch(permalink, {
    method: 'GET',
    redirect: 'manual'
  });
  console.log('Cart permalink status:', cartRes.status);
  const location = cartRes.headers.get('location');
  console.log('Redirect Location:', location);

  if (location) {
    const checkoutRes = await fetch(location, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Checkout page status:', checkoutRes.status);
    const html = await checkoutRes.text();
    
    // Look for "LAUNCH OFFER", "149.85", "discount" in the HTML
    const hasLaunchOffer = html.includes('LAUNCH OFFER');
    const hasDiscount = html.includes('149.85') || html.includes('849.15');
    console.log('Checkout HTML contains "LAUNCH OFFER":', hasLaunchOffer);
    console.log('Checkout HTML contains "149.85" or "849.15":', hasDiscount);

    // Regex extract discount mentions
    const matches = html.match(/.{0,50}(?:LAUNCH OFFER|discount|149\.85|849\.15).{0,50}/gi);
    if (matches) {
      console.log('Matches found in Checkout HTML:', matches.slice(0, 10));
    }
  }
}

run().catch(console.error);

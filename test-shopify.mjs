const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2025-01';

console.log('Domain:', domain);
console.log('Has Admin Token:', Boolean(adminToken));
console.log('Has Client ID/Secret:', Boolean(clientId && clientSecret));

async function run() {
  let token = adminToken;
  if (!token && clientId && clientSecret) {
    console.log('Attempting OAuth token exchange...');
    const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    console.log('Auth status:', authRes.status);
    const authData = await authRes.json();
    token = authData.access_token;
    console.log('Got token:', Boolean(token));
  }

  if (token) {
    const query = `
      query StorePolicies {
        shop {
          privacyPolicy { title body }
          refundPolicy { title body }
          shippingPolicy { title body }
          termsOfService { title body }
          legalNotice { title body }
          contactInformation { title body }
        }
      }
    `;
    const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query })
    });
    console.log('Query status:', res.status);
    const data = await res.json();
    console.log('Policies response:', JSON.stringify(data, null, 2));
  }
}
run().catch(console.error);

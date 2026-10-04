const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP;
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
    const authData = await authRes.json();
    token = authData.access_token;
  }

  const query = `
    query IntrospectShop {
      __type(name: "Shop") {
        fields {
          name
        }
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
  const data = await res.json();
  const policyFields = data.data?.__type?.fields.filter(f => f.name.toLowerCase().includes('polic') || f.name.toLowerCase().includes('term') || f.name.toLowerCase().includes('legal') || f.name.toLowerCase().includes('contact'));
  console.log('Matching fields on Shop in Admin API:', policyFields);
  console.log('All fields on Shop:', data.data?.__type?.fields.map(f => f.name).join(', '));
}
run().catch(console.error);

async function run() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' })
  });
  const { access_token } = await authRes.json();
  const query = `
    mutation {
      storefrontAccessTokenCreate(input: { title: "Headless Storefront" }) {
        storefrontAccessToken {
          accessToken
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': access_token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('CREATE STOREFRONT ACCESS TOKEN:', JSON.stringify(data, null, 2));
}
run();

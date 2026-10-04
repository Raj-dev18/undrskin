const rawDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP || '';
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

  if (!token) {
    console.log('Unable to authenticate to Shopify Admin.');
    return;
  }

  // Query automatic discounts and price rules
  const query = `
    query {
      discountNodes(first: 20) {
        nodes {
          id
          discount {
            __typename
            ... on DiscountAutomaticApp {
              title
              status
            }
            ... on DiscountAutomaticBasic {
              title
              status
              summary
              customerGets {
                value {
                  __typename
                  ... on DiscountPercentage {
                    percentage
                  }
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            ... on DiscountCodeBasic {
              title
              status
              summary
            }
            ... on DiscountCodeApp {
              title
              status
            }
          }
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
  console.log('SHOPIFY DISCOUNT NODES:', JSON.stringify(data, null, 2));

  // Also query price rules via REST to be thorough
  try {
    const prRes = await fetch(`https://${domain}/admin/api/${version}/price_rules.json`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      }
    });
    if (prRes.ok) {
      const prData = await prRes.json();
      console.log('SHOPIFY PRICE RULES (REST):', JSON.stringify(prData, null, 2));
    }
  } catch (e) {
    console.log('Price rules query failed:', e.message);
  }
}

run().catch(console.error);

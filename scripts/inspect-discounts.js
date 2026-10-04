/* eslint-disable @typescript-eslint/no-require-imports */

async function inspectDiscounts() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    console.log('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN');
    return;
  }

  // 1. Check Automatic Discounts via GraphQL
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
              startsAt
              endsAt
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
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    console.log('DISCOUNT NODES IN SHOPIFY ADMIN:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error querying discounts:', err);
  }
}

inspectDiscounts();

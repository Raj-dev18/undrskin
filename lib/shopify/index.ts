import { Product, Collection, FAQItem } from '@/types/product';
import { MOCK_FAQS } from '@/lib/mock-data';

/* ============================================================
   ENV & CONFIGURATION
============================================================ */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || '';
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || '';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-07';

const SHOP_DOMAIN = SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/* ============================================================
   AUTHENTICATION: SHOPIFY ADMIN ACCESS TOKEN
============================================================ */

async function getAdminAccessToken(): Promise<string> {
  if (!SHOP_DOMAIN || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    throw new Error('Shopify environment variables missing (SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET)');
  }

  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken!;
  }

  const response = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify authentication failed: ${response.status} ${error}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('Shopify authentication succeeded but no access_token was returned.');
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 24 * 3600 * 1000);

  return cachedToken!;
}

/* ============================================================
   GRAPHQL REQUEST RUNNER
============================================================ */

export async function shopifyAdminRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getAdminAccessToken();

  const response = await fetch(
    `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API request failed: ${response.status} ${error}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('SHOPIFY GRAPHQL ERRORS:\n', JSON.stringify(result.errors, null, 2));
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(result.errors, null, 2)}`);
  }

  return result.data;
}

/* ============================================================
   GRAPHQL QUERIES
============================================================ */

const PRODUCTS_QUERY = `
  query Products(
    $first: Int!
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        id
        title
        handle
        description
        descriptionHtml
        vendor
        productType
        tags

        featuredImage {
          id
          url
          altText
          width
          height
        }

        images(first: 20) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }

        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }

        options {
          id
          name
          optionValues {
            name
            swatch {
              color
            }
          }
        }

        variants(first: 100) {
          nodes {
            id
            title
            sku
            availableForSale
            price
            compareAtPrice
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
              width
              height
            }
          }
        }

        collections(first: 20) {
          nodes {
            id
            handle
            title
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      productType

      featuredImage {
        id
        url
        altText
        width
        height
      }

      images(first: 20) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }

      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }

      options {
        id
        name
        optionValues {
          name
          swatch {
            color
          }
        }
      }

      variants(first: 100) {
        nodes {
          id
          title
          sku
          availableForSale
          price
          compareAtPrice
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }

      collections(first: 20) {
        nodes {
          id
          handle
          title
        }
      }
    }
  }
`;

/* ============================================================
   PRODUCT MAPPER
============================================================ */

function mapShopifyProduct(product: any): Product {
  const currencyCode = product.priceRangeV2?.minVariantPrice?.currencyCode || 'USD';

  let badge: 'NEW' | 'BESTSELLER' | 'LIMITED' | 'RESTOCKED' | null = null;
  const tagList = Array.isArray(product.tags) ? product.tags.map((t: string) => t.toLowerCase()) : [];
  if (tagList.includes('new') || tagList.includes('new arrival')) badge = 'NEW';
  else if (tagList.includes('bestseller') || tagList.includes('best seller')) badge = 'BESTSELLER';
  else if (tagList.includes('limited') || tagList.includes('limited edition')) badge = 'LIMITED';
  else if (tagList.includes('restocked')) badge = 'RESTOCKED';

  const defaultImage = {
    id: 'placeholder',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    altText: product.title || 'UNDRSKIN Silhouette',
    width: 1000,
    height: 1333,
  };

  const featuredImage = product.featuredImage
    ? {
        id: product.featuredImage.id || 'feat-img',
        url: product.featuredImage.url,
        altText: product.featuredImage.altText || product.title,
        width: product.featuredImage.width,
        height: product.featuredImage.height,
      }
    : defaultImage;

  const images = product.images?.nodes?.length
    ? product.images.nodes.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || product.title,
        width: img.width,
        height: img.height,
      }))
    : [featuredImage];

  const rawDesc = product.description || '';
  const descParagraphs = rawDesc.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
  const details = descParagraphs.slice(1, 5);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    subtitle: product.productType || undefined,
    description: product.description || '',
    descriptionHtml: product.descriptionHtml || undefined,
    details: details.length > 0 ? details : [
      'Second-skin ergonomic cut with zero-pressure seam technology',
      'Breathable, lightweight textile architecture',
      'OEKO-TEX Standard certified hypoallergenic finish',
    ],
    fabricAndCare: [
      'Gentle cold machine wash in wash bag',
      'Do not tumble dry or bleach',
      'Flat dry in shade to preserve stretch elasticity',
    ],
    shippingAndReturns: [
      'Complimentary express delivery on orders over $150',
      '30-day discreet returns on unworn items with tags intact',
    ],
    price: {
      amount: Number(product.priceRangeV2?.minVariantPrice?.amount || 0),
      currencyCode,
      compareAtAmount: product.variants?.nodes?.[0]?.compareAtPrice
        ? Number(product.variants.nodes[0].compareAtPrice)
        : undefined,
    },
    featuredImage,
    images,
    options:
      product.options?.map((option: any) => ({
        id: option.id,
        name: option.name,
        values:
          option.optionValues?.map((value: any) => ({
            name: value.name,
            value: value.name,
            hexColor: value.swatch?.color || undefined,
            inStock: true,
          })) || [],
      })) || [],
    variants:
      product.variants?.nodes?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku || '',
        availableForSale: variant.availableForSale ?? true,
        selectedOptions: variant.selectedOptions || [],
        price: {
          amount: Number(variant.price || 0),
          currencyCode,
          compareAtAmount: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
        },
        image: variant.image
          ? {
              id: variant.image.id,
              url: variant.image.url,
              altText: variant.image.altText || product.title,
              width: variant.image.width,
              height: variant.image.height,
            }
          : undefined,
      })) || [],
    tags: product.tags || [],
    collections:
      product.collections?.nodes?.map((col: any) => col.handle) || [],
    availableForSale:
      product.variants?.nodes?.some((v: any) => v.availableForSale) ?? true,
    badge,
    rating: 4.9,
    reviewCount: 48,
  };
}

/* ============================================================
   CATALOG API FUNCTIONS
============================================================ */

export async function getProducts(options?: {
  collection?: string;
  query?: string;
  sortKey?: 'PRICE' | 'BEST_SELLING' | 'CREATED_AT';
  reverse?: boolean;
}): Promise<Product[]> {
  try {
    const data = await shopifyAdminRequest<any>(PRODUCTS_QUERY, {
      first: 100,
      query: options?.query,
      sortKey: options?.sortKey,
      reverse: options?.reverse ?? false,
    });

    let products = data?.products?.nodes || [];

    if (options?.collection && options.collection !== 'all') {
      products = products.filter((product: any) =>
        product.collections?.nodes?.some(
          (col: any) => col.handle === options.collection
        )
      );
    }

    return products.map(mapShopifyProduct);
  } catch (error: any) {
    console.error('getProducts failed:', error.message || error);
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  try {
    const data = await shopifyAdminRequest<any>(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data?.productByHandle) return undefined;
    return mapShopifyProduct(data.productByHandle);
  } catch (error: any) {
    console.error(`getProductByHandle(${handle}) failed:`, error.message || error);
    return undefined;
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products.slice(0, limit);
}

/* ============================================================
   COLLECTIONS API FUNCTIONS
============================================================ */

export async function getCollections(): Promise<Collection[]> {
  try {
    const COLLECTIONS_QUERY = `
      query Collections {
        collections(first: 20) {
          nodes {
            id
            handle
            title
            description
            image {
              id
              url
              altText
              width
              height
            }
            productsCount {
              count
            }
          }
        }
      }
    `;

    const data = await shopifyAdminRequest<any>(COLLECTIONS_QUERY);
    if (data?.collections?.nodes?.length) {
      return data.collections.nodes.map((c: any) => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description || `Architectural exploration of ${c.title.toLowerCase()}.`,
        image: c.image
          ? {
              id: c.image.id,
              url: c.image.url,
              altText: c.image.altText || c.title,
              width: c.image.width,
              height: c.image.height,
            }
          : {
              id: 'col-placeholder',
              url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
              altText: c.title,
            },
        productCount: c.productsCount?.count ?? 0,
      }));
    }
  } catch {
    // Fallback: derive collections dynamically from active products
  }

  try {
    const products = await getProducts();
    const map = new Map<string, Collection>();

    for (const prod of products) {
      for (const colHandle of prod.collections) {
        if (!map.has(colHandle)) {
          const title = colHandle
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          map.set(colHandle, {
            id: `col-${colHandle}`,
            handle: colHandle,
            title,
            description: `Curated silhouettes in the ${title} archive.`,
            image: prod.featuredImage,
            productCount: 1,
          });
        } else {
          const existing = map.get(colHandle)!;
          existing.productCount += 1;
        }
      }
    }

    return Array.from(map.values());
  } catch (error: any) {
    console.error('getCollections fallback error:', error.message || error);
    return [];
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | undefined> {
  const collections = await getCollections();
  const found = collections.find((c) => c.handle === handle);
  if (found) return found;

  const title = handle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: `col-${handle}`,
    handle,
    title,
    description: `Curated archive silhouettes for ${title}.`,
    image: {
      id: 'default',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      altText: title,
    },
    productCount: 0,
  };
}

/* ============================================================
   SEARCH API FUNCTION (SHOPIFY NATIVE QUERY SYNTAX)
============================================================ */

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || !query.trim()) return [];

  const clean = query.trim().replace(/['"]/g, '');
  const searchQuery = `title:*${clean}* OR tag:*${clean}* OR product_type:*${clean}*`;

  return getProducts({ query: searchQuery });
}

/* ============================================================
   CHECKOUT SESSION GENERATOR (SHOPIFY DRAFT ORDER / CHECKOUT)
============================================================ */

export async function createShopifyCheckoutUrl(
  lineItems: { variantId: string; quantity: number }[]
): Promise<string> {
  const mutation = `
    mutation DraftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const formattedLines = lineItems.map((item) => ({
    variantId: item.variantId.startsWith('gid://')
      ? item.variantId
      : `gid://shopify/ProductVariant/${item.variantId.replace(/\D/g, '')}`,
    quantity: item.quantity,
  }));

  const data = await shopifyAdminRequest<any>(mutation, {
    input: {
      lineItems: formattedLines,
    },
  });

  const errors = data?.draftOrderCreate?.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const invoiceUrl = data?.draftOrderCreate?.draftOrder?.invoiceUrl;
  if (!invoiceUrl) {
    throw new Error('Shopify failed to generate a valid checkout invoice URL.');
  }

  return invoiceUrl;
}

/* ============================================================
   FAQ (METAOBJECT / EXTENSION SUPPORT)
============================================================ */

export async function getFAQs(): Promise<FAQItem[]> {
  return MOCK_FAQS;
}

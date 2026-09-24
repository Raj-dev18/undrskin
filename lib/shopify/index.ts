import { Product, Collection, FAQItem } from '@/types/product';
import { MOCK_FAQS } from '@/lib/mock-data';
import { enrichProductsWithReviews } from '@/lib/judgeme';

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

function isDynamicServerError(err: any): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err.digest === 'DYNAMIC_SERVER_USAGE' ||
      (typeof err.message === 'string' && err.message.includes('Dynamic server usage')))
  );
}

/* ============================================================
   AUTHENTICATION: SHOPIFY ADMIN ACCESS TOKEN
============================================================ */

async function getAdminAccessToken(): Promise<string> {
  if (!SHOP_DOMAIN || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    throw new Error(
      'Shopify environment variables missing (SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET)'
    );
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
        status

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
          values
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
      status

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
        values
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

const COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
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

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
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
      products(first: 100) {
        nodes {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          tags
          status

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
            values
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
  }
`;

const formatPrice = (amount: number, currencyCode: string) => {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/* ============================================================
   PRODUCT MAPPER
============================================================ */

function mapShopifyProduct(product: any): Product {
  const currencyCode = product.priceRangeV2?.minVariantPrice?.currencyCode || 'USD';

  // Badges derived from real Shopify tags
  let badge: 'NEW' | 'BESTSELLER' | 'LIMITED' | 'RESTOCKED' | null = null;
  const tagList = Array.isArray(product.tags)
    ? product.tags.map((t: string) => t.toLowerCase())
    : [];
  if (tagList.includes('new') || tagList.includes('new arrival')) badge = 'NEW';
  else if (tagList.includes('bestseller') || tagList.includes('best seller')) badge = 'BESTSELLER';
  else if (tagList.includes('limited') || tagList.includes('limited edition')) badge = 'LIMITED';
  else if (tagList.includes('restocked')) badge = 'RESTOCKED';

  // Neutral placeholder for products with no image yet in Shopify
  const fallbackPlaceholder = {
    id: 'placeholder',
    url: '/placeholder.svg',
    altText: product.title || 'UNDRSKIN Silhouette',
    width: 800,
    height: 1067,
  };

  const featuredImage = product.featuredImage
    ? {
        id: product.featuredImage.id || 'feat-img',
        url: product.featuredImage.url,
        altText: product.featuredImage.altText || product.title,
        width: product.featuredImage.width || 800,
        height: product.featuredImage.height || 1067,
      }
    : fallbackPlaceholder;

  const rawImages = product.images?.nodes || [];
  const images = rawImages.length
    ? rawImages.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || product.title,
        width: img.width || 800,
        height: img.height || 1067,
      }))
    : [featuredImage];

  // Dynamically extract real bullet point features from Shopify descriptionHtml
  let details: string[] = [];
  if (product.descriptionHtml) {
    const listMatches = Array.from(
      product.descriptionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
    ).map((m: any) =>
      m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim()
    ).filter(Boolean);

    if (listMatches.length > 0) {
      details = listMatches;
    }
  }

  // If no HTML list items exist, derive from paragraph sentences if available
  if (details.length === 0 && product.description) {
    const rawDesc = product.description.trim();
    const sentences = rawDesc
      .split(/\n+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10 && !s.startsWith('#'));
    if (sentences.length > 1) {
      details = sentences.slice(1, 6);
    }
  }

  // Find compare-at price from variants if available
  const variantWithCompareAt = product.variants?.nodes?.find(
    (v: any) => v.compareAtPrice && Number(v.compareAtPrice) > 0
  );
  const compareAtAmount = variantWithCompareAt
    ? Number(variantWithCompareAt.compareAtPrice)
    : undefined;

  // Options mapping with availability calculation per option value
  const variantNodes = product.variants?.nodes || [];
  const options = (product.options || []).map((option: any) => {
    let valuesList: Array<{ name: string; value: string; hexColor?: string; inStock?: boolean }> = [];

    if (option.optionValues && option.optionValues.length > 0) {
      valuesList = option.optionValues.map((ov: any) => {
        const valName = ov.name || '';
        const inStock = variantNodes.some(
          (v: any) =>
            v.availableForSale &&
            v.selectedOptions?.some((so: any) => so.name === option.name && so.value === valName)
        );
        return {
          name: valName,
          value: valName,
          hexColor: ov.swatch?.color || undefined,
          inStock: inStock || variantNodes.length === 0,
        };
      });
    } else if (option.values && option.values.length > 0) {
      valuesList = option.values.map((v: string) => {
        const inStock = variantNodes.some(
          (vn: any) =>
            vn.availableForSale &&
            vn.selectedOptions?.some((so: any) => so.name === option.name && so.value === v)
        );
        return {
          name: v,
          value: v,
          inStock: inStock || variantNodes.length === 0,
        };
      });
    }

    return {
      id: option.id || `opt-${option.name}`,
      name: option.name,
      values: valuesList,
    };
  });

  const variants = variantNodes.map((variant: any) => {
    const vAmount = Number(variant.price || 0);
    const vCompareAtAmount = variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined;
    return {
      id: variant.id,
      title: variant.title,
      sku: variant.sku || '',
      availableForSale: Boolean(variant.availableForSale),
      selectedOptions: variant.selectedOptions || [],
      price: {
        amount: vAmount,
        currencyCode,
        compareAtAmount: vCompareAtAmount,
        formattedAmount: formatPrice(vAmount, currencyCode),
        formattedCompareAtAmount: vCompareAtAmount ? formatPrice(vCompareAtAmount, currencyCode) : undefined,
      },
      image: variant.image
        ? {
            id: variant.image.id,
            url: variant.image.url,
            altText: variant.image.altText || product.title,
            width: variant.image.width || 800,
            height: variant.image.height || 1067,
          }
        : undefined,
    };
  });

  const availableForSale = variants.length > 0
    ? variants.some((v: any) => v.availableForSale)
    : false;

  const productAmount = Number(product.priceRangeV2?.minVariantPrice?.amount || (variants.length > 0 ? variants[0].price.amount : 0));

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    subtitle: product.productType || undefined,
    description: product.description || '',
    descriptionHtml: product.descriptionHtml || undefined,
    details,
    fabricAndCare: [
      'Gentle cold machine wash in wash bag with like neutrals',
      'Do not tumble dry or bleach',
      'Flat dry in shade to preserve stretch elasticity',
    ],
    shippingAndReturns: [
      'Complimentary express delivery on orders over $150',
      '30-day discreet returns on unworn items with tags intact',
    ],
    price: {
      amount: productAmount,
      currencyCode,
      compareAtAmount,
      formattedAmount: formatPrice(productAmount, currencyCode),
      formattedCompareAtAmount: compareAtAmount ? formatPrice(compareAtAmount, currencyCode) : undefined,
    },
    featuredImage,
    images,
    options,
    variants,
    tags: product.tags || [],
    collections: product.collections?.nodes?.map((col: any) => col.handle) || [],
    availableForSale,
    badge,
    rating: 0,
    reviewCount: 0,
  };
}

/* ============================================================
   CATALOG API FUNCTIONS
============================================================ */

export async function getProducts(options?: {
  collection?: string;
  query?: string;
  sortKey?:
    | 'CREATED_AT'
    | 'ID'
    | 'INVENTORY_TOTAL'
    | 'PRODUCT_TYPE'
    | 'PUBLISHED_AT'
    | 'RELEVANCE'
    | 'TITLE'
    | 'UPDATED_AT'
    | 'VENDOR'
    | 'PRICE'
    | 'BEST_SELLING';
  reverse?: boolean;
}): Promise<Product[]> {
  try {
    // If collection is specified, prefer direct Shopify collection query
    if (options?.collection && options.collection !== 'all') {
      const colData = await shopifyAdminRequest<any>(COLLECTION_BY_HANDLE_QUERY, {
        handle: options.collection,
      });

      if (colData?.collectionByHandle?.products?.nodes) {
        const prods = colData.collectionByHandle.products.nodes
          .filter((p: any) => p.status === 'ACTIVE')
          .map(mapShopifyProduct);

        if (options.sortKey === 'PRICE') {
          prods.sort((a: Product, b: Product) =>
            options.reverse ? b.price.amount - a.price.amount : a.price.amount - b.price.amount
          );
        }

        return await enrichProductsWithReviews(prods);
      }
    }

    // Prepare Shopify Admin GraphQL query parameters
    let shopifyQuery = 'status:active';
    if (options?.query && options.query.trim()) {
      shopifyQuery = `status:active AND (${options.query.trim()})`;
    }

    // Only pass valid Shopify Admin API ProductSortKeys
    const allowedSortKeys = [
      'CREATED_AT',
      'ID',
      'INVENTORY_TOTAL',
      'PRODUCT_TYPE',
      'PUBLISHED_AT',
      'RELEVANCE',
      'TITLE',
      'UPDATED_AT',
      'VENDOR',
    ];

    const sortKeyToPass =
      options?.sortKey && allowedSortKeys.includes(options.sortKey)
        ? options.sortKey
        : undefined;

    const data = await shopifyAdminRequest<any>(PRODUCTS_QUERY, {
      first: 100,
      query: shopifyQuery,
      sortKey: sortKeyToPass,
      reverse: options?.reverse ?? false,
    });

    let rawProducts = data?.products?.nodes || [];

    if (options?.collection && options.collection !== 'all') {
      rawProducts = rawProducts.filter((product: any) =>
        product.collections?.nodes?.some((col: any) => col.handle === options.collection)
      );
    }

    const products = rawProducts.map(mapShopifyProduct);

    // In-memory sorting when sortKey is PRICE
    if (options?.sortKey === 'PRICE') {
      products.sort((a: Product, b: Product) =>
        options.reverse ? b.price.amount - a.price.amount : a.price.amount - b.price.amount
      );
    }

    return await enrichProductsWithReviews(products);
  } catch (error: any) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    console.error('getProducts failed:', error.message || error);
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  try {
    const data = await shopifyAdminRequest<any>(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data?.productByHandle) return undefined;
    if (data.productByHandle.status && data.productByHandle.status !== 'ACTIVE') {
      return undefined;
    }
    const mapped = mapShopifyProduct(data.productByHandle);
    const enriched = await enrichProductsWithReviews([mapped]);
    return enriched[0];
  } catch (error: any) {
    if (isDynamicServerError(error)) {
      throw error;
    }
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
    const data = await shopifyAdminRequest<any>(COLLECTIONS_QUERY, { first: 50 });
    if (data?.collections?.nodes?.length) {
      return data.collections.nodes.map((c: any) => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description || `Curated silhouettes in the ${c.title.toLowerCase()} archive.`,
        image: c.image
          ? {
              id: c.image.id,
              url: c.image.url,
              altText: c.image.altText || c.title,
              width: c.image.width || 800,
              height: c.image.height || 1067,
            }
          : {
              id: 'col-placeholder',
              url: '/placeholder.svg',
              altText: c.title,
              width: 800,
              height: 1067,
            },
        productCount: c.productsCount?.count ?? 0,
      }));
    }
    return [];
  } catch (error: any) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    console.error('getCollections failed:', error.message || error);
    return [];
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | undefined> {
  try {
    const data = await shopifyAdminRequest<any>(COLLECTION_BY_HANDLE_QUERY, { handle });
    const c = data?.collectionByHandle;
    if (!c) return undefined;

    return {
      id: c.id,
      handle: c.handle,
      title: c.title,
      description: c.description || `Curated silhouettes in the ${c.title.toLowerCase()} archive.`,
      image: c.image
        ? {
            id: c.image.id,
            url: c.image.url,
            altText: c.image.altText || c.title,
            width: c.image.width || 800,
            height: c.image.height || 1067,
          }
        : {
            id: 'col-placeholder',
            url: '/placeholder.svg',
            altText: c.title,
            width: 800,
            height: 1067,
          },
      productCount: c.productsCount?.count ?? 0,
    };
  } catch (error: any) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    console.error(`getCollectionByHandle(${handle}) failed:`, error.message || error);
    return undefined;
  }
}

/* ============================================================
   SEARCH API FUNCTION (SHOPIFY NATIVE QUERY SYNTAX)
============================================================ */

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || !query.trim()) return [];

  // Sanitize query to prevent GraphQL search syntax breakage
  const clean = query.replace(/[\\:()"]/g, ' ').trim();
  if (!clean) return [];

  const searchQuery = `(${clean} OR title:*${clean}* OR tag:*${clean}* OR product_type:*${clean}*)`;

  return getProducts({ query: searchQuery });
}

/* ============================================================
   CHECKOUT SESSION GENERATOR (SHOPIFY DRAFT ORDER / PERMALINK)
============================================================ */

export async function createShopifyCheckoutUrl(
  lineItems: { variantId: string; quantity: number }[]
): Promise<string> {
  if (!lineItems || lineItems.length === 0) {
    throw new Error('No line items provided for checkout.');
  }

  const formattedLines = lineItems.map((item) => {
    const rawId = String(item.variantId || '');
    const numericId = rawId.replace(/\D/g, '');
    const gid = rawId.startsWith('gid://')
      ? rawId
      : `gid://shopify/ProductVariant/${numericId}`;
    return {
      gid,
      numericId,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };
  });

  // Safe fallback builder: native Shopify Cart Checkout permalink
  const permalinkUrl = `https://${SHOP_DOMAIN}/cart/${formattedLines
    .map((item) => `${item.numericId}:${item.quantity}`)
    .join(',')}`;

  // Try DraftOrderCreate mutation
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

  try {
    const data = await shopifyAdminRequest<any>(mutation, {
      input: {
        lineItems: formattedLines.map((item) => ({
          variantId: item.gid,
          quantity: item.quantity,
        })),
      },
    });

    const userErrors = data?.draftOrderCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.warn('Shopify DraftOrder user errors, falling back to cart permalink:', userErrors[0].message);
      return permalinkUrl;
    }

    const invoiceUrl = data?.draftOrderCreate?.draftOrder?.invoiceUrl;
    if (invoiceUrl) {
      return invoiceUrl;
    }
  } catch (err: any) {
    // When custom app lacks `write_draft_orders` scope, log and safely return direct checkout permalink
    console.warn(
      'DraftOrder creation not available for current app scopes. Falling back to secure Shopify cart permalink:',
      err.message || err
    );
  }

  return permalinkUrl;
}

/* ============================================================
   FAQ (METAOBJECT / EXTENSION SUPPORT)
============================================================ */

export async function getFAQs(): Promise<FAQItem[]> {
  return MOCK_FAQS;
}

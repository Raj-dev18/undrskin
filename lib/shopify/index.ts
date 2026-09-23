import { Product, Collection, FAQItem } from '@/types/product';

/* ============================================================
   ENV
============================================================ */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION || '2026-07';

if (!SHOPIFY_STORE_DOMAIN) {
  throw new Error('Missing SHOPIFY_STORE_DOMAIN');
}

if (!SHOPIFY_CLIENT_ID) {
  throw new Error('Missing SHOPIFY_CLIENT_ID');
}

if (!SHOPIFY_CLIENT_SECRET) {
  throw new Error('Missing SHOPIFY_CLIENT_SECRET');
}

/*
  Accept both:

  my-store.myshopify.com

  and

  https://my-store.myshopify.com
*/

const SHOP_DOMAIN = SHOPIFY_STORE_DOMAIN
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');


/* ============================================================
   TOKEN CACHE
============================================================ */

let cachedToken: string | null = null;


/* ============================================================
   GET SHOPIFY ADMIN ACCESS TOKEN
============================================================ */

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetch(
    `https://${SHOP_DOMAIN}/admin/oauth/access_token`,
    {
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
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Shopify authentication failed: ${response.status} ${error}`
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      'Shopify authentication succeeded but no access_token was returned.'
    );
  }

  cachedToken = data.access_token;

  return cachedToken;
}


/* ============================================================
   SHOPIFY ADMIN GRAPHQL REQUEST
============================================================ */

async function shopifyAdminRequest<T>(
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

    throw new Error(
      `Shopify API request failed: ${response.status} ${error}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    console.error(
      'SHOPIFY GRAPHQL ERRORS:\n',
      JSON.stringify(result.errors, null, 2)
    );

    throw new Error(
      `Shopify GraphQL error: ${JSON.stringify(
        result.errors,
        null,
        2
      )}`
    );
  }

  return result.data;
}


/* ============================================================
   PRODUCTS QUERY
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


/* ============================================================
   GET PRODUCTS
============================================================ */

export async function getProducts(options?: {
  collection?: string;

  query?: string;

  sortKey?:
    | 'PRICE'
    | 'BEST_SELLING'
    | 'CREATED_AT';

  reverse?: boolean;
}): Promise<Product[]> {
  const data = await shopifyAdminRequest<any>(
    PRODUCTS_QUERY,
    {
      first: 50,

      query: options?.query,

      sortKey: options?.sortKey,

      reverse: options?.reverse ?? false,
    }
  );

  let products = data.products.nodes;


  /* ==========================================================
     COLLECTION FILTER
  ========================================================== */

  if (options?.collection) {
    products = products.filter((product: any) =>
      product.collections.nodes.some(
        (collection: any) =>
          collection.handle === options.collection
      )
    );
  }


  /* ==========================================================
     MAP SHOPIFY → YOUR PRODUCT TYPE
  ========================================================== */

  return products.map((product: any): Product => {
    const currencyCode =
      product.priceRangeV2?.minVariantPrice
        ?.currencyCode || 'INR';

    return {
      id: product.id,

      handle: product.handle,

      title: product.title,

      description: product.description || '',

      details: [],

      fabricAndCare: [],

      shippingAndReturns: [],


      /* --------------------------------------------------------
         PRICE
      -------------------------------------------------------- */

      price: {
        amount: Number(
          product.priceRangeV2?.minVariantPrice?.amount || 0
        ),

        currencyCode,
      },


      /* --------------------------------------------------------
         FEATURED IMAGE
      -------------------------------------------------------- */

      featuredImage: product.featuredImage
        ? {
            id: product.featuredImage.id,

            url: product.featuredImage.url,

            altText:
              product.featuredImage.altText ||
              product.title,

            width: product.featuredImage.width,

            height: product.featuredImage.height,
          }
        : {
            id: '',

            url: '',

            altText: product.title,
          },


      /* --------------------------------------------------------
         IMAGES
      -------------------------------------------------------- */

      images:
        product.images?.nodes?.map(
          (image: any) => ({
            id: image.id,

            url: image.url,

            altText:
              image.altText ||
              product.title,

            width: image.width,

            height: image.height,
          })
        ) || [],


      /* --------------------------------------------------------
         OPTIONS
      -------------------------------------------------------- */

      options:
        product.options?.map(
          (option: any) => ({
            id: option.id,

            name: option.name,

            values:
              option.optionValues?.map(
                (value: any) => ({
                  name: value.name,

                  value: value.name,

                  hexColor:
                    value.swatch?.color ||
                    undefined,

                  inStock: true,
                })
              ) || [],
          })
        ) || [],


      /* --------------------------------------------------------
         VARIANTS
      -------------------------------------------------------- */

      variants:
        product.variants?.nodes?.map(
          (variant: any) => ({
            id: variant.id,

            title: variant.title,

            sku: variant.sku || '',

            availableForSale:
              variant.availableForSale,

            selectedOptions:
              variant.selectedOptions || [],

            price: {
              amount: Number(
                variant.price || 0
              ),

              currencyCode,

              compareAtAmount:
                variant.compareAtPrice
                  ? Number(
                      variant.compareAtPrice
                    )
                  : undefined,
            },

            image: variant.image
              ? {
                  id: variant.image.id,

                  url: variant.image.url,

                  altText:
                    variant.image.altText ||
                    product.title,

                  width:
                    variant.image.width,

                  height:
                    variant.image.height,
                }
              : undefined,
          })
        ) || [],


      /* --------------------------------------------------------
         TAGS
      -------------------------------------------------------- */

      tags: product.tags || [],


      /* --------------------------------------------------------
         COLLECTIONS
      -------------------------------------------------------- */

      collections:
        product.collections?.nodes?.map(
          (collection: any) =>
            collection.handle
        ) || [],


      /* --------------------------------------------------------
         AVAILABLE
      -------------------------------------------------------- */

      availableForSale:
        product.variants?.nodes?.some(
          (variant: any) =>
            variant.availableForSale
        ) || false,


      badge: null,

      rating: 0,

      reviewCount: 0,
    };
  });
}


/* ============================================================
   SINGLE PRODUCT QUERY
============================================================ */

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
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
`;


/* ============================================================
   GET PRODUCT BY HANDLE
============================================================ */

export async function getProductByHandle(
  handle: string
): Promise<Product | undefined> {
  const data =
    await shopifyAdminRequest<any>(
      PRODUCT_BY_HANDLE_QUERY,
      {
        handle,
      }
    );

  const product =
    data.productByHandle;

  if (!product) {
    return undefined;
  }

  const currencyCode =
    product.priceRangeV2?.minVariantPrice
      ?.currencyCode || 'INR';


  return {
    id: product.id,

    handle: product.handle,

    title: product.title,

    description:
      product.description || '',

    details: [],

    fabricAndCare: [],

    shippingAndReturns: [],

    price: {
      amount: Number(
        product.priceRangeV2?.minVariantPrice
          ?.amount || 0
      ),

      currencyCode,
    },

    featuredImage:
      product.featuredImage
        ? {
            id:
              product.featuredImage.id,

            url:
              product.featuredImage.url,

            altText:
              product.featuredImage.altText ||
              product.title,

            width:
              product.featuredImage.width,

            height:
              product.featuredImage.height,
          }
        : {
            id: '',

            url: '',

            altText: product.title,
          },

    images:
      product.images?.nodes?.map(
        (image: any) => ({
          id: image.id,

          url: image.url,

          altText:
            image.altText ||
            product.title,

          width: image.width,

          height: image.height,
        })
      ) || [],

    options:
      product.options?.map(
        (option: any) => ({
          id: option.id,

          name: option.name,

          values:
            option.optionValues?.map(
              (value: any) => ({
                name: value.name,

                value: value.name,

                hexColor:
                  value.swatch?.color ||
                  undefined,

                inStock: true,
              })
            ) || [],
        })
      ) || [],

    variants:
      product.variants?.nodes?.map(
        (variant: any) => ({
          id: variant.id,

          title: variant.title,

          sku: variant.sku || '',

          availableForSale:
            variant.availableForSale,

          selectedOptions:
            variant.selectedOptions || [],

          price: {
            amount: Number(
              variant.price || 0
            ),

            currencyCode,

            compareAtAmount:
              variant.compareAtPrice
                ? Number(
                    variant.compareAtPrice
                  )
                : undefined,
          },

          image: variant.image
            ? {
                id: variant.image.id,

                url: variant.image.url,

                altText:
                  variant.image.altText ||
                  product.title,

                width:
                  variant.image.width,

                height:
                  variant.image.height,
              }
            : undefined,
        })
      ) || [],

    tags: product.tags || [],

    collections:
      product.collections?.nodes?.map(
        (collection: any) =>
          collection.handle
      ) || [],

    availableForSale:
      product.variants?.nodes?.some(
        (variant: any) =>
          variant.availableForSale
      ) || false,

    badge: null,

    rating: 0,

    reviewCount: 0,
  };
}


/* ============================================================
   FEATURED PRODUCTS
============================================================ */

export async function getFeaturedProducts(
  limit = 4
): Promise<Product[]> {
  const products =
    await getProducts();

  return products.slice(0, limit);
}


/* ============================================================
   COLLECTIONS
============================================================ */

/*
  IMPORTANT:

  Your current Shopify app/token is returning:

  Access denied for collections field.

  So we intentionally don't call the Admin
  `collections` query here.

  Returning [] prevents the entire homepage
  from crashing.

  Once read_products permission is available,
  this function can be switched back to the
  real Shopify collections query.
*/

export async function getCollections(): Promise<
  Collection[]
> {
  console.warn(
    'Shopify collections are not accessible with the current app permissions.'
  );

  return [];
}


/* ============================================================
   COLLECTION BY HANDLE
============================================================ */

export async function getCollectionByHandle(
  handle: string
): Promise<Collection | undefined> {
  const collections =
    await getCollections();

  return collections.find(
    (collection) =>
      collection.handle === handle
  );
}


/* ============================================================
   FAQ
============================================================ */

export async function getFAQs(): Promise<
  FAQItem[]
> {
  /*
    Shopify does not have a native FAQ resource.

    Keep empty for now.
    Later we can use Shopify Metaobjects.
  */

  return [];
}
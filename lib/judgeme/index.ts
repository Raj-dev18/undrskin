import { Review } from '@/types/product';

/**
 * Server-Side Judge.me Reviews Integration
 *
 * Keeps all API tokens strictly server-side.
 * Resolves Shopify products dynamically via numeric external ID or handle.
 * Throws explicit errors on API failure during debugging rather than silently failing.
 */

const JUDGEME_BASE_URL = 'https://api.judge.me/api/v1';

export function getJudgeMeCredentials() {
  const shopDomain =
    process.env.JUDGEME_SHOP_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    '';
  const apiToken =
    process.env.JUDGEME_API_TOKEN ||
    process.env.JUDGEME_PRIVATE_TOKEN ||
    '';

  return { shopDomain, apiToken };
}

/**
 * Helper to strip the GraphQL GID prefix and return the numeric Shopify ID.
 * e.g. "gid://shopify/Product/7689741533287" -> "7689741533287"
 */
export function extractNumericShopifyId(idOrGid: string): string {
  if (!idOrGid) return '';
  const match = idOrGid.match(/\d+/g);
  return match ? match.join('') : idOrGid;
}

export interface JudgeMeProductResponse {
  product?: {
    id: number;
    handle: string;
    title: string;
    external_id: number;
  };
}

export interface JudgeMeRawReview {
  id: number;
  title: string | null;
  body: string | null;
  rating: number;
  reviewer?: {
    id?: number;
    name?: string;
    email?: string;
  };
  reviewer_name?: string;
  created_at: string;
  updated_at?: string;
  curated?: string;
  hidden?: boolean;
  verified?: string | boolean;
  ip_address?: string;
  product_id?: number;
  product_external_id?: number;
  product_handle?: string;
  product_title?: string;
  source?: string;
}

export interface JudgeMeReviewsResult {
  rating: number;
  reviewCount: number;
  reviews: Review[];
  widgetHtml?: string;
}

// In-memory cache for resolved product IDs to avoid redundant API calls
const productIdCache = new Map<string, number>();

/**
 * Resolves a Shopify product identifier (GID or handle) to Judge.me's internal product ID.
 */
export async function resolveJudgeMeProductId(
  shopifyIdOrGid: string,
  handle?: string
): Promise<number | null> {
  const { shopDomain, apiToken } = getJudgeMeCredentials();
  if (!shopDomain || !apiToken) {
    console.warn('[Judge.me] Missing JUDGEME_SHOP_DOMAIN or JUDGEME_API_TOKEN');
    return null;
  }

  const numericId = extractNumericShopifyId(shopifyIdOrGid);
  const cacheKey = `${numericId || ''}:${handle || ''}`;
  if (productIdCache.has(cacheKey)) {
    return productIdCache.get(cacheKey)!;
  }

  // 1. Try resolving by external_id (Shopify numeric product ID)
  if (numericId) {
    const url = new URL(`${JUDGEME_BASE_URL}/products/-1`);
    url.searchParams.set('shop_domain', shopDomain);
    url.searchParams.set('api_token', apiToken);
    url.searchParams.set('external_id', numericId);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Token': apiToken,
      },
      next: { revalidate: 300 }, // 5 minutes
    });

    if (res.ok) {
      const data: JudgeMeProductResponse = await res.json();
      if (data.product?.id) {
        productIdCache.set(cacheKey, data.product.id);
        return data.product.id;
      }
    } else if (res.status !== 404) {
      const errText = await res.text();
      const msg = `[Judge.me API Error] Product lookup by external_id ${numericId} failed with ${res.status}: ${errText}`;
      console.error(msg);
      throw new Error(msg);
    }
  }

  // 2. Fallback: try resolving by product handle
  if (handle) {
    const url = new URL(`${JUDGEME_BASE_URL}/products/-1`);
    url.searchParams.set('shop_domain', shopDomain);
    url.searchParams.set('api_token', apiToken);
    url.searchParams.set('handle', handle);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Token': apiToken,
      },
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data: JudgeMeProductResponse = await res.json();
      if (data.product?.id) {
        productIdCache.set(cacheKey, data.product.id);
        return data.product.id;
      }
    } else if (res.status !== 404) {
      const errText = await res.text();
      const msg = `[Judge.me API Error] Product lookup by handle ${handle} failed with ${res.status}: ${errText}`;
      console.error(msg);
      throw new Error(msg);
    }
  }

  return null;
}

/**
 * Fetches Judge.me pre-rendered widget HTML for the product if available.
 * Cleans temporary hiding styles so the widget renders visibly.
 */
export async function getJudgeMeWidgetHtml(
  shopifyIdOrGid: string,
  handle?: string
): Promise<string | undefined> {
  const { shopDomain, apiToken } = getJudgeMeCredentials();
  if (!shopDomain || !apiToken) return undefined;

  const numericId = extractNumericShopifyId(shopifyIdOrGid);

  try {
    const url = new URL(`${JUDGEME_BASE_URL}/widgets/product_review`);
    url.searchParams.set('shop_domain', shopDomain);
    url.searchParams.set('api_token', apiToken);
    if (numericId) url.searchParams.set('external_id', numericId);
    if (handle) url.searchParams.set('handle', handle);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json, text/html',
        'X-Api-Token': apiToken,
      },
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Judge.me API Warning] Widget API returned ${res.status}: ${errText}`);
      return undefined;
    }

    let rawHtml = '';
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      rawHtml = data.widget || data.html || '';
    } else {
      rawHtml = await res.text();
    }

    if (!rawHtml) return undefined;

    // Clean out Judge.me's inline .jdgm-temp-hiding-style { display: none }
    // to ensure the widget renders immediately on the storefront
    const cleanedHtml = rawHtml
      .replace(/<style class=['"]jdgm-temp-hiding-style['"]>[\s\S]*?<\/style>/gi, '')
      .replace(/style=['"]display:\s*none['"]\s+href=['"]#['"]\s+class=['"]jdgm-write-rev-link['"]/gi, "class='jdgm-write-rev-link' href='#'");

    return cleanedHtml;
  } catch (error) {
    console.warn('[Judge.me] Error fetching widget HTML:', error);
    return undefined;
  }
}

function cleanReviewBody(body: string | null): string {
  if (!body) return '';
  return body.replace(/^The media could not be loaded\.\s*/i, '').trim();
}

export function formatJudgeMeReview(r: JudgeMeRawReview): Review {
  let formattedDate = '';
  if (r.created_at) {
    try {
      formattedDate = new Date(r.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      formattedDate = r.created_at.split('T')[0] || '';
    }
  }

  const isVerified =
    r.verified === 'buyer' ||
    r.verified === true ||
    r.verified === 'true' ||
    (typeof r.curated === 'string' && r.curated.toLowerCase() === 'ok') ||
    r.source === 'amazon';

  const rawName = r.reviewer?.name || r.reviewer_name;
  const author = (!rawName || rawName.toLowerCase() === 'anonymous') ? 'Verified Customer' : rawName;

  return {
    id: String(r.id),
    author,
    rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
    title: r.title || 'Review',
    content: cleanReviewBody(r.body),
    date: formattedDate,
    verifiedBuyer: isVerified,
  };
}

/**
 * Fetches all verified store reviews directly from Judge.me API.
 */
export async function getJudgeMeStoreReviews(limit = 20): Promise<Review[]> {
  const { shopDomain, apiToken } = getJudgeMeCredentials();
  if (!shopDomain || !apiToken) {
    return [];
  }

  try {
    const url = new URL(`${JUDGEME_BASE_URL}/reviews`);
    url.searchParams.set('shop_domain', shopDomain);
    url.searchParams.set('api_token', apiToken);
    url.searchParams.set('per_page', String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Api-Token': apiToken,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.warn(`[Judge.me] getJudgeMeStoreReviews failed with ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawReviews: JudgeMeRawReview[] = Array.isArray(data.reviews)
      ? data.reviews
      : Array.isArray(data)
      ? data
      : [];

    return rawReviews.map(formatJudgeMeReview);
  } catch (error) {
    console.warn('[Judge.me] Error fetching store reviews:', error);
    return [];
  }
}

/**
 * Fetches reviews and calculates aggregate rating for a specific Shopify product.
 * Returns only reviews that belong to this product. Does not apply store-wide reviews to unrelated products.
 */
export async function getJudgeMeProductReviews(
  shopifyIdOrGid: string,
  handle?: string
): Promise<JudgeMeReviewsResult> {
  const emptyResult: JudgeMeReviewsResult = {
    rating: 0,
    reviewCount: 0,
    reviews: [],
  };

  const { shopDomain, apiToken } = getJudgeMeCredentials();
  if (!shopDomain || !apiToken) {
    console.warn('[Judge.me] Missing credentials: shopDomain or apiToken is empty');
    return emptyResult;
  }

  const numericId = extractNumericShopifyId(shopifyIdOrGid);

  // Parallel lookup of internal product ID and widget HTML
  const [judgeMeProductId, widgetHtml] = await Promise.all([
    resolveJudgeMeProductId(shopifyIdOrGid, handle),
    getJudgeMeWidgetHtml(shopifyIdOrGid, handle),
  ]);

  const url = new URL(`${JUDGEME_BASE_URL}/reviews`);
  url.searchParams.set('shop_domain', shopDomain);
  url.searchParams.set('api_token', apiToken);
  url.searchParams.set('per_page', '50');

  if (judgeMeProductId) {
    url.searchParams.set('product_id', String(judgeMeProductId));
  } else if (numericId) {
    url.searchParams.set('external_id', numericId);
  } else if (handle) {
    url.searchParams.set('handle', handle);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Api-Token': apiToken,
    },
    next: { revalidate: 180 },
  });

  if (!res.ok) {
    const errText = await res.text();
    const errorMsg = `[Judge.me API Error] GET /reviews failed with HTTP ${res.status} (${res.statusText}): ${errText}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawReviews: JudgeMeRawReview[] = Array.isArray(data.reviews)
    ? data.reviews
    : Array.isArray(data)
    ? data
    : [];

  if (rawReviews.length === 0) {
    return { ...emptyResult, widgetHtml };
  }

  // Filter strictly to ensure reviews belong to this product
  const relevantReviews = rawReviews.filter((r) => {
    if (judgeMeProductId && r.product_id) {
      return r.product_id === judgeMeProductId;
    }
    if (numericId && r.product_external_id && r.product_external_id !== 0) {
      return String(r.product_external_id) === numericId;
    }
    if (handle && r.product_handle && r.product_handle !== 'judgeme-shop-reviews') {
      return r.product_handle === handle;
    }
    return false;
  });

  if (relevantReviews.length === 0) {
    return { ...emptyResult, widgetHtml };
  }

  // Calculate rating
  const totalRating = relevantReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const averageRating = Number((totalRating / relevantReviews.length).toFixed(1));

  const mappedReviews: Review[] = relevantReviews.map(formatJudgeMeReview);

  return {
    rating: averageRating,
    reviewCount: mappedReviews.length,
    reviews: mappedReviews,
    widgetHtml,
  };
}

/**
 * Store-wide review summary index map for fast ProductCard rating hydration.
 */
let storeReviewsCache: {
  timestamp: number;
  data: Map<string, { rating: number; reviewCount: number }>;
} | null = null;

const STORE_CACHE_TTL = 300_000; // 5 minutes

export async function getStoreJudgeMeRatingsMap(): Promise<
  Map<string, { rating: number; reviewCount: number }>
> {
  const now = Date.now();
  if (storeReviewsCache && now - storeReviewsCache.timestamp < STORE_CACHE_TTL) {
    return storeReviewsCache.data;
  }

  const ratingsMap = new Map<string, { rating: number; reviewCount: number }>();
  const { shopDomain, apiToken } = getJudgeMeCredentials();
  if (!shopDomain || !apiToken) {
    return ratingsMap;
  }

  const url = new URL(`${JUDGEME_BASE_URL}/reviews`);
  url.searchParams.set('shop_domain', shopDomain);
  url.searchParams.set('api_token', apiToken);
  url.searchParams.set('per_page', '100');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Api-Token': apiToken,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const errText = await res.text();
    const errorMsg = `[Judge.me API Error] GET /reviews (store-wide) failed with HTTP ${res.status}: ${errText}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawReviews: JudgeMeRawReview[] = Array.isArray(data.reviews)
    ? data.reviews
    : Array.isArray(data)
    ? data
    : [];

  const grouped = new Map<string, number[]>();

  rawReviews.forEach((r) => {
    const rating = Number(r.rating) || 5;
    if (r.product_external_id) {
      const key = String(r.product_external_id);
      const current = grouped.get(key) || [];
      current.push(rating);
      grouped.set(key, current);
    }
    if (r.product_handle) {
      const key = r.product_handle;
      const current = grouped.get(key) || [];
      current.push(rating);
      grouped.set(key, current);
    }
  });

  grouped.forEach((ratings, key) => {
    const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
    ratingsMap.set(key, { rating: avg, reviewCount: ratings.length });
  });

  // Calculate store average for fallback
  if (rawReviews.length > 0) {
    const storeAvg = Number((rawReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / rawReviews.length).toFixed(1));
    ratingsMap.set('__store_avg__', { rating: storeAvg, reviewCount: rawReviews.length });
  }

  storeReviewsCache = { timestamp: now, data: ratingsMap };
  return ratingsMap;
}

/**
 * Enriches a list of Shopify products with dynamically fetched Judge.me ratings and review counts.
 */
export async function enrichProductsWithReviews<
  T extends { id: string; handle: string; rating?: number; reviewCount?: number }
>(products: T[]): Promise<T[]> {
  if (!products || products.length === 0) return products;

  const ratingsMap = await getStoreJudgeMeRatingsMap();

  return products.map((product) => {
    const numericId = extractNumericShopifyId(product.id);
    const ratingInfo = ratingsMap.get(numericId) || ratingsMap.get(product.handle);

    if (ratingInfo) {
      return {
        ...product,
        rating: ratingInfo.rating,
        reviewCount: ratingInfo.reviewCount,
      };
    }

    return product;
  });
}

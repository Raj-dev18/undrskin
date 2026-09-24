import { getProducts } from './lib/shopify/index.js'; // Might fail if it's TS, let's use npx tsx

async function run() {
  const products = await getProducts({ first: 3 });
  console.log(JSON.stringify(products.map(p => ({ title: p.title, price: p.price, variants: p.variants.map(v => ({ title: v.title, price: v.price })) })), null, 2));
}

run();

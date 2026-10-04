import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  trioColours?: string[];
}

export interface CartCost {
  subtotalAmount: {
    amount: number;
    currencyCode: string;
  };
  totalAmount: {
    amount: number;
    currencyCode: string;
  };
  formattedSubtotalAmount?: string;
  formattedTotalAmount?: string;
  totalTaxAmount?: {
    amount: number;
    currencyCode: string;
  };
}

export interface Cart {
  id?: string;
  checkoutUrl?: string;
  lines: CartItem[];
  totalQuantity: number;
  cost: CartCost;
}

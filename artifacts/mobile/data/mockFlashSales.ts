import type { Product } from "./mockData";

export interface FlashSale {
  id: string;
  productId: string;
  discountPercent: number;
  salePrice: number;
  originalPrice: number;
  endsAt: string;
  label: string;
  product?: Product;
}

const now = Date.now();
const HOUR = 3600000;

export const FLASH_SALES: FlashSale[] = [
  {
    id: "fs1",
    productId: "p6",
    discountPercent: 30,
    salePrice: 84000,
    originalPrice: 120000,
    endsAt: new Date(now + 5 * HOUR).toISOString(),
    label: "Flash Deal",
  },
  {
    id: "fs2",
    productId: "p4",
    discountPercent: 25,
    salePrice: 240000,
    originalPrice: 320000,
    endsAt: new Date(now + 2.5 * HOUR).toISOString(),
    label: "Lightning Deal",
  },
  {
    id: "fs3",
    productId: "p8",
    discountPercent: 20,
    salePrice: 22400,
    originalPrice: 28000,
    endsAt: new Date(now + 8 * HOUR).toISOString(),
    label: "Daily Deal",
  },
  {
    id: "fs4",
    productId: "p2",
    discountPercent: 15,
    salePrice: 807500,
    originalPrice: 950000,
    endsAt: new Date(now + 1.2 * HOUR).toISOString(),
    label: "Flash Deal",
  },
];

export function getActiveFlashSales(products: Product[]): (FlashSale & { product: Product })[] {
  return FLASH_SALES.map((sale) => ({
    ...sale,
    product: products.find((p) => p.id === sale.productId),
  })).filter((s): s is FlashSale & { product: Product } => !!s.product && new Date(s.endsAt).getTime() > Date.now());
}

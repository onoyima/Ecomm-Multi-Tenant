import { type Product } from "./mockData";

export interface FlashSale {
  productId: string;
  discountPercent: number;
  salePrice: number;
  originalPrice: number;
  endsAt: number;
  label: string;
}

export const FLASH_SALES: FlashSale[] = [
  {
    productId: "p1",
    discountPercent: 20,
    salePrice: 68000,
    originalPrice: 85000,
    endsAt: Date.now() + 5 * 3600 * 1000,
    label: "Flash Deal",
  },
  {
    productId: "p8",
    discountPercent: 25,
    salePrice: 21000,
    originalPrice: 28000,
    endsAt: Date.now() + 8 * 3600 * 1000,
    label: "Limited Offer",
  },
  {
    productId: "p6",
    discountPercent: 30,
    salePrice: 84000,
    originalPrice: 120000,
    endsAt: Date.now() + 12 * 3600 * 1000,
    label: "Flash Sale",
  },
  {
    productId: "p10",
    discountPercent: 15,
    salePrice: 63750,
    originalPrice: 75000,
    endsAt: Date.now() + 3 * 3600 * 1000,
    label: "Deal of the Day",
  },
  {
    productId: "p16",
    discountPercent: 22,
    salePrice: 27300,
    originalPrice: 35000,
    endsAt: Date.now() + 10 * 3600 * 1000,
    label: "Weekend Deal",
  },
  {
    productId: "p13",
    discountPercent: 31,
    salePrice: 31050,
    originalPrice: 45000,
    endsAt: Date.now() + 6 * 3600 * 1000,
    label: "Super Deal",
  },
];

export function getActiveFlashSales(products: Product[]): (FlashSale & { product: Product })[] {
  const now = Date.now();
  return FLASH_SALES
    .filter((f) => f.endsAt > now)
    .map((f) => {
      const product = products.find((p) => p.id === f.productId);
      return product ? { ...f, product } : null;
    })
    .filter((f): f is FlashSale & { product: Product } => f !== null);
}

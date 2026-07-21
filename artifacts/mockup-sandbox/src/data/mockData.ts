export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  vendorName: string;
  vendorId: string;
  category: string;
  description: string;
  stock: number;
  isDropshipping?: boolean;
  aiOptimized?: boolean;
  tags: string[];
  variants?: { label: string; options: string[] }[];
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  date: string;
  items: { title: string; qty: number; price: number; image: string }[];
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  paymentMethod: string;
  shippingFee?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Fashion", icon: "shirt", color: "#FF6B9D" },
  { id: "2", name: "Electronics", icon: "phone", color: "#5B4EFF" },
  { id: "3", name: "Shoes", icon: "footprints", color: "#FF6B35" },
  { id: "4", name: "Home", icon: "home", color: "#10B981" },
  { id: "5", name: "Beauty", icon: "sparkles", color: "#F59E0B" },
  { id: "6", name: "Sports", icon: "dumbbell", color: "#EF4444" },
  { id: "7", name: "Books", icon: "book", color: "#6366F1" },
  { id: "8", name: "Food", icon: "utensils-crossed", color: "#FF8C42" },
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
  "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400",
  "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=400",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
];

export const PRODUCTS: Product[] = [
  {
    id: "p1", title: "Nike Air Max 270", price: 85000, originalPrice: 105000,
    rating: 4.8, reviewCount: 128, image: PLACEHOLDER_IMAGES[2],
    vendorName: "Kicks Hub NG", vendorId: "v1", category: "Shoes",
    description: "Original Nike Air Max 270. Lightweight, breathable upper with Max Air cushioning for all-day comfort. Available in multiple sizes.",
    stock: 24, aiOptimized: true, tags: ["nike", "sneakers", "running"],
    variants: [{ label: "Size", options: ["39", "40", "41", "42", "43", "44", "45"] }],
  },
  {
    id: "p2", title: "iPhone 15 Pro Max 256GB", price: 950000, originalPrice: 1100000,
    rating: 4.9, reviewCount: 312, image: PLACEHOLDER_IMAGES[9],
    vendorName: "TechMall NG", vendorId: "v2", category: "Electronics",
    description: "Apple iPhone 15 Pro Max, 256GB, Titanium finish. A17 Pro chip, 48MP camera system, USB-C charging. Sealed in box with full warranty.",
    stock: 8, aiOptimized: true, tags: ["apple", "iphone", "smartphone"],
    variants: [{ label: "Color", options: ["Natural Titanium", "Black Titanium", "Blue Titanium"] }],
  },
  {
    id: "p3", title: "Adidas Floral Summer Dress", price: 18500, originalPrice: 25000,
    rating: 4.5, reviewCount: 67, image: PLACEHOLDER_IMAGES[0],
    vendorName: "Adaeze Fashion Hub", vendorId: "u2", category: "Fashion",
    description: "Lightweight floral sundress perfect for the Lagos heat. Breathable cotton blend, adjustable straps, flattering A-line silhouette.",
    stock: 45, tags: ["dress", "fashion", "summer"],
    variants: [
      { label: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { label: "Color", options: ["Blue Floral", "Pink Floral", "Yellow Floral"] },
    ],
  },
  {
    id: "p4", title: 'Samsung 55" 4K Smart TV', price: 320000, originalPrice: 380000,
    rating: 4.7, reviewCount: 89, image: PLACEHOLDER_IMAGES[11],
    vendorName: "TechMall NG", vendorId: "v2", category: "Electronics",
    description: "Samsung 55-inch Crystal UHD 4K Smart TV. Alexa built-in, 3 HDMI ports, WiFi. Crystal Processor 4K for brilliant picture.",
    stock: 12, isDropshipping: true, aiOptimized: true, tags: ["samsung", "tv", "4k"],
    variants: [],
  },
  {
    id: "p5", title: "Luxury Face Serum Set", price: 12500,
    rating: 4.6, reviewCount: 203, image: PLACEHOLDER_IMAGES[1],
    vendorName: "GlowUp Beauty", vendorId: "v3", category: "Beauty",
    description: "Premium anti-aging face serum set with Vitamin C, Retinol, and Hyaluronic Acid. 3-piece set for complete skincare.",
    stock: 60, tags: ["skincare", "beauty", "serum"],
    variants: [],
  },
  {
    id: "p6", title: "Jordan 1 Retro High OG", price: 120000, originalPrice: 145000,
    rating: 4.9, reviewCount: 445, image: PLACEHOLDER_IMAGES[3],
    vendorName: "Kicks Hub NG", vendorId: "v1", category: "Shoes",
    description: "Air Jordan 1 Retro High OG. Authentic Nike product. Leather upper, Air-Sole unit, rubber outsole.",
    stock: 5, tags: ["jordan", "nike", "sneakers"],
    variants: [{ label: "Size", options: ["40", "41", "42", "43", "44", "45"] }],
  },
  {
    id: "p7", title: "Stainless Steel Water Bottle 1L", price: 5800,
    rating: 4.4, reviewCount: 178, image: PLACEHOLDER_IMAGES[6],
    vendorName: "HomeGoods NG", vendorId: "v4", category: "Home",
    description: "Double-walled vacuum insulated stainless steel water bottle. BPA-free, leak-proof lid.",
    stock: 150, isDropshipping: true, tags: ["bottle", "water", "fitness"],
    variants: [{ label: "Color", options: ["Silver", "Black", "Rose Gold", "Navy"] }],
  },
  {
    id: "p8", title: "Portable Bluetooth Speaker", price: 28000, originalPrice: 35000,
    rating: 4.6, reviewCount: 134, image: PLACEHOLDER_IMAGES[4],
    vendorName: "TechMall NG", vendorId: "v2", category: "Electronics",
    description: "360° surround sound, 20hr battery life, waterproof IPX7. Multicolor LED lighting.",
    stock: 33, aiOptimized: true, tags: ["speaker", "bluetooth", "music"],
    variants: [{ label: "Color", options: ["Black", "Red", "Blue"] }],
  },
  {
    id: "p9", title: "Men's Classic Agbada Set", price: 45000,
    rating: 4.7, reviewCount: 56, image: PLACEHOLDER_IMAGES[7],
    vendorName: "Adaeze Fashion Hub", vendorId: "u2", category: "Fashion",
    description: "Premium hand-embroidered Nigerian Agbada set. Made with high-quality ASO-OKE fabric.",
    stock: 20, tags: ["agbada", "fashion", "traditional"],
    variants: [
      { label: "Size", options: ["M", "L", "XL", "XXL"] },
      { label: "Color", options: ["Royal Blue", "Wine", "White", "Gold"] },
    ],
  },
  {
    id: "p10", title: "Smart Watch Series 8", price: 75000, originalPrice: 95000,
    rating: 4.5, reviewCount: 221, image: PLACEHOLDER_IMAGES[0],
    vendorName: "TechMall NG", vendorId: "v2", category: "Electronics",
    description: "Full health monitoring: heart rate, SpO2, sleep tracking. GPS, NFC payments.",
    stock: 15, isDropshipping: true, aiOptimized: true, tags: ["smartwatch", "fitness", "wearable"],
    variants: [{ label: "Color", options: ["Midnight", "Starlight", "Red", "Blue"] }],
  },
  {
    id: "p11", title: "Ankara Print Handbag", price: 14000,
    rating: 4.3, reviewCount: 88, image: PLACEHOLDER_IMAGES[8],
    vendorName: "Adaeze Fashion Hub", vendorId: "u2", category: "Fashion",
    description: "Handcrafted genuine leather handbag with vibrant Ankara fabric lining.",
    stock: 35, tags: ["handbag", "ankara", "fashion"],
    variants: [{ label: "Pattern", options: ["Blue Geometric", "Red Kente", "Green Wax"] }],
  },
  {
    id: "p12", title: "Protein Powder 2kg (Chocolate)", price: 32000,
    rating: 4.6, reviewCount: 309, image: PLACEHOLDER_IMAGES[5],
    vendorName: "FitLife Store", vendorId: "v5", category: "Sports",
    description: "Premium whey protein isolate, 25g protein per serving. Lab-tested.",
    stock: 80, isDropshipping: true, tags: ["protein", "fitness", "sports"],
    variants: [{ label: "Flavor", options: ["Chocolate", "Vanilla", "Strawberry"] }],
  },
];

export const TRENDING_PRODUCTS = PRODUCTS.filter((_, i) => [0, 1, 5, 9].includes(i));
export const FEATURED_PRODUCTS = PRODUCTS.filter((_, i) => [2, 4, 7, 10].includes(i));

const ORDER_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=400",
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-001", status: "shipped", total: 85000, date: "2026-05-10",
    items: [{ title: "Nike Air Max 270", qty: 1, price: 85000, image: ORDER_IMAGES[0] }],
    trackingNumber: "DHL9876543210NG", carrier: "DHL Express",
    estimatedDelivery: "May 14, 2026",
    shippingAddress: "15 Banana Island Road, Ikoyi, Lagos",
    paymentMethod: "Paystack",
  },
  {
    id: "ord-002", status: "delivered", total: 63500, date: "2026-04-28",
    items: [
      { title: "Adidas Floral Summer Dress", qty: 2, price: 18500, image: ORDER_IMAGES[1] },
      { title: "Stainless Steel Water Bottle", qty: 1, price: 5800, image: ORDER_IMAGES[2] },
    ],
    trackingNumber: "GIG8834729017NG", carrier: "GIG Logistics",
    shippingAddress: "15 Banana Island Road, Ikoyi, Lagos",
    paymentMethod: "Wallet",
  },
  {
    id: "ord-003", status: "processing", total: 75000, date: "2026-05-12",
    items: [{ title: "Smart Watch Series 8", qty: 1, price: 75000, image: ORDER_IMAGES[3] }],
    estimatedDelivery: "May 17, 2026",
    shippingAddress: "15 Banana Island Road, Ikoyi, Lagos",
    paymentMethod: "Paystack",
  },
  {
    id: "ord-004", status: "pending", total: 28000, date: "2026-05-12",
    items: [{ title: "Portable Bluetooth Speaker", qty: 1, price: 28000, image: ORDER_IMAGES[2] }],
    shippingAddress: "15 Banana Island Road, Ikoyi, Lagos",
    paymentMethod: "Pay on Delivery",
  },
];

export function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export const VENDOR_STATS = {
  totalRevenue: 1247500,
  totalOrders: 148,
  totalProducts: 24,
  pendingOrders: 5,
  avgRating: 4.7,
  walletBalance: 84500,
  withdrawable: 62000,
  monthlyRevenue: [42000, 58000, 71000, 95000, 88000, 134000],
  topProducts: ["Adidas Floral Summer Dress", "Ankara Print Handbag", "Men's Classic Agbada Set"],
};

export const ADMIN_STATS = {
  totalRevenue: 12475000,
  totalVendors: 48,
  totalUsers: 12400,
  totalOrders: 3820,
  pendingVendors: 3,
  activeDisputes: 7,
  pendingReturns: 12,
  monthlyRevenue: [820000, 950000, 1100000, 980000, 1200000, 1450000],
  recentUsers: [
    { name: "Chidi Okafor", email: "chidi@email.com", date: "2026-05-12", type: "customer" },
    { name: "Blessing Tech Store", email: "blessing@email.com", date: "2026-05-11", type: "vendor" },
    { name: "Ahmed Bello", email: "ahmed@email.com", date: "2026-05-10", type: "customer" },
    { name: "Lagos Fashion Hub", email: "lagos@email.com", date: "2026-05-10", type: "vendor" },
  ],
};

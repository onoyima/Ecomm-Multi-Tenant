import { useQuery } from "@tanstack/react-query";
import { products, categories, orders, vendor, wallet as walletApi, admin } from "@workspace/api-client-react";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  image: string;
  vendorName: string;
  vendorId: string;
  category: string;
  description: string;
  stock: number;
  freeShipping?: boolean;
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
  imageUrl: string;
}

export function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ─── Mapping helpers ────────────────────────────────────────────────────────

function mapApiProduct(p: any): Product {
  const images = p.images ?? [];
  const firstImg = Array.isArray(images)
    ? (typeof images[0] === "string" ? images[0] : images[0]?.url ?? "")
    : "";
  return {
    id: p.id,
    title: p.title,
    price: Number(p.price),
    originalPrice: p.originalPrice ?? p.original_price ? Number(p.originalPrice ?? p.original_price) : undefined,
    rating: Number(p.rating),
    reviewCount: p.reviewCount ?? p.review_count ?? 0,
    soldCount: p.soldCount ?? p.sold_count ?? 0,
    image: p.image ?? firstImg,
    vendorName: p.vendorName ?? p.vendor_name ?? p.vendor?.shopName ?? p.vendor?.shop_name ?? "",
    vendorId: p.vendorId ?? p.vendor_id ?? "",
    category: p.category,
    description: p.description ?? "",
    stock: p.stock ?? 0,
    freeShipping: p.freeShipping ?? p.free_shipping,
    isDropshipping: p.isDropshipping ?? p.is_dropshipping,
    aiOptimized: p.aiOptimized ?? p.ai_optimized,
    tags: p.tags ?? [],
    variants: p.variants ?? [],
  };
}

function mapApiOrder(o: any): Order {
  return {
    id: o.id,
    status: o.status ?? "pending",
    total: Number(o.total),
    date: o.date ?? o.createdAt ?? o.created_at ?? "",
    items: (o.items ?? []).map((i: any) => ({
      title: i.title,
      qty: i.qty ?? i.quantity ?? 1,
      price: Number(i.price),
      image: i.image ?? "",
    })),
    trackingNumber: o.trackingNumber ?? o.tracking_number,
    carrier: o.carrier,
    estimatedDelivery: o.estimatedDelivery ?? o.estimated_delivery,
    shippingAddress: o.shippingAddress ?? o.shipping_address,
    paymentMethod: o.paymentMethod ?? o.payment_method,
    shippingFee: o.shippingFee ?? o.shipping_fee ? Number(o.shippingFee ?? o.shipping_fee) : undefined,
  };
}

const CATEGORY_META: Record<string, { icon: string; color: string; imageUrl: string }> = {
  Fashion: { icon: "shirt", color: "#FF6B9D", imageUrl: "/assets/fashion.png" },
  Electronics: { icon: "phone", color: "#5B4EFF", imageUrl: "/assets/tech.png" },
  Shoes: { icon: "footprints", color: "#FF6B35", imageUrl: "/assets/footware.png" },
  Home: { icon: "home", color: "#10B981", imageUrl: "/assets/furniture.png" },
  Beauty: { icon: "sparkles", color: "#F59E0B", imageUrl: "/assets/cosmetics.png" },
  Sports: { icon: "dumbbell", color: "#EF4444", imageUrl: "/assets/GYM.png" },
  Books: { icon: "book", color: "#6366F1", imageUrl: "/assets/studio.png" },
  Food: { icon: "utensils-crossed", color: "#FF8C42", imageUrl: "/assets/food.png" },
};

// ─── React Query hooks ──────────────────────────────────────────────────────

export function useProducts(params?: {
  page?: number;
  perPage?: number;
  category?: string;
  q?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await products.list(params ?? {});
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map(mapApiProduct);
    },
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await products.get(id);
      return mapApiProduct((res as any).data ?? res);
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories_web"],
    queryFn: async () => {
      const res = await categories.list();
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: CATEGORY_META[c.name]?.icon ?? "circle",
        color: CATEGORY_META[c.name]?.color ?? "#6366F1",
        imageUrl: c.imageUrl ?? c.image_url ?? CATEGORY_META[c.name]?.imageUrl ?? "",
      }));
    },
    staleTime: 60_000,
  });
}

export function useOrders(params?: { status?: string }) {
  return useQuery({
    queryKey: ["orders_web", params],
    queryFn: async () => {
      const res = await orders.list(params ?? {});
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map(mapApiOrder);
    },
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ["vendorStats_web"],
    queryFn: async () => {
      const [statsRes, walletRes] = await Promise.all([
        vendor.stats().catch(() => null),
        walletApi.balance().catch(() => null),
      ]);
      const s = (statsRes ?? {}) as Record<string, any>;
      const w = (walletRes ?? {}) as Record<string, any>;
      return {
        totalRevenue: Number(s.totalRevenue ?? s.total_revenue ?? 0),
        totalOrders: Number(s.totalOrders ?? s.total_orders ?? 0),
        totalProducts: Number(s.totalProducts ?? s.total_products ?? 0),
        pendingOrders: Number(s.pendingOrders ?? s.pending_orders ?? 0),
        avgRating: Number(s.avgRating ?? s.average_rating ?? s.rating ?? 0),
        walletBalance: Number(w.balance ?? w.walletBalance ?? 0),
        withdrawable: Number(w.withdrawable ?? w.pendingBalance ?? 0),
        monthlyRevenue: (s.monthlyRevenue ?? s.monthly_revenue ?? []).map((m: any) => Number(m.revenue ?? m)),
        topProducts: (s.topProducts ?? s.top_products ?? []).map((t: any) =>
          typeof t === "string" ? t : t.title ?? t.name ?? ""
        ),
      };
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["adminStats_web"],
    queryFn: async () => {
      const [dashboardRes, revenueRes] = await Promise.all([
        admin.dashboard().catch(() => null),
        admin.revenue().catch(() => null),
      ]);
      const d = (dashboardRes ?? {}) as Record<string, any>;
      const r = (revenueRes ?? {}) as Record<string, any>;
      return {
        totalRevenue: Number(d.totalRevenue ?? d.total_revenue ?? 0),
        totalVendors: Number(d.totalVendors ?? d.total_vendors ?? 0),
        totalUsers: Number(d.totalUsers ?? d.total_users ?? 0),
        totalOrders: Number(d.totalOrders ?? d.total_orders ?? 0),
        pendingVendors: Number(d.pendingVendors ?? d.pending_vendors ?? 0),
        activeDisputes: Number(d.activeDisputes ?? d.active_disputes ?? 0),
        pendingReturns: Number(d.pendingReturns ?? d.pending_returns ?? 0),
        monthlyRevenue: (r.monthlyRevenue ?? r.monthly_revenue ?? d.monthlyRevenue ?? d.monthly_revenue ?? []).map(
          (m: any) => Number(m.revenue ?? m)
        ),
        recentUsers: (d.recentUsers ?? d.recent_users ?? []).map((u: any) => ({
          name: u.name,
          email: u.email ?? "",
          date: u.date ?? u.createdAt ?? u.created_at ?? "",
          type: u.type ?? u.role ?? "customer",
        })),
      };
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  products, categories, orders, vendor, auth, wallet,
  addresses, cart, wishlist, notifications, ai,
  payments, reviews, disputes, coupons, commissions,
  payouts, escrow, search as searchApi, shipping,
  recentlyViewed, flashSales, returnRequests,
  recommendations, currenciesApi, kyc,
  suppliers, subscriptionPlans, fraud, dropshipping,
} from "@workspace/api-client-react";

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

// ─── Helpers ────────────────────────────────────────────────────────────────

export const formatPrice = (n: number): string =>
  "₦" + n.toLocaleString("en-US");

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
    image: p.image ?? firstImg,
    vendorName: p.vendorName ?? p.vendor_name ?? p.vendor?.shopName ?? p.vendor?.shop_name ?? "",
    vendorId: p.vendorId ?? p.vendor_id ?? "",
    category: p.category,
    description: p.description ?? "",
    stock: p.stock ?? 0,
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

function mapApiCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon ?? "cart",
    color: c.color ?? "#6366F1",
  };
}

// ─── Static category icons/colors (API doesn't have these) ─────────────────

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  Fashion: { icon: "shirt", color: "#FF6B9D" },
  Electronics: { icon: "phone-portrait", color: "#5B4EFF" },
  Shoes: { icon: "footsteps", color: "#FF6B35" },
  Home: { icon: "home", color: "#10B981" },
  Beauty: { icon: "sparkles", color: "#F59E0B" },
  Sports: { icon: "fitness", color: "#EF4444" },
  Books: { icon: "book", color: "#6366F1" },
  Food: { icon: "restaurant", color: "#FF8C42" },
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
      return mapApiProduct(res);
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categories.list();
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map((c: any) => ({
        ...mapApiCategory(c),
        icon: CATEGORY_META[c.name]?.icon ?? "cart",
        color: CATEGORY_META[c.name]?.color ?? "#6366F1",
      }));
    },
    staleTime: 60_000,
  });
}

export function useOrders(params?: { status?: string }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const res = await orders.list(params ?? {});
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map(mapApiOrder);
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await orders.get(id);
      return mapApiOrder(res);
    },
    enabled: !!id,
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ["vendorStats"],
    queryFn: async () => {
      const [statsRes, walletRes] = await Promise.all([
        vendor.stats().catch(() => null) as Promise<Record<string, any> | null>,
        wallet.balance().catch(() => null) as Promise<Record<string, any> | null>,
      ]);
      const s: Record<string, any> = statsRes ?? {};
      const w: Record<string, any> = walletRes ?? {};
      return {
        totalRevenue: Number(s.totalRevenue ?? s.total_revenue ?? 0),
        totalOrders: Number(s.totalOrders ?? s.total_orders ?? 0),
        totalProducts: Number(s.totalProducts ?? s.total_products ?? 0),
        pendingOrders: Number(s.pendingOrders ?? s.pending_orders ?? 0),
        avgRating: Number(s.avgRating ?? s.average_rating ?? s.rating ?? 0),
        walletBalance: Number(w.balance ?? w.walletBalance ?? 0),
        withdrawable: Number(w.withdrawable ?? w.pendingBalance ?? 0),
        monthlyRevenue: (s.monthlyRevenue ?? s.monthly_revenue ?? []).map((m: any) => ({
          month: m.month ?? "",
          year: m.year ?? 0,
          revenue: Number(m.revenue ?? 0),
        })),
        topProducts: (s.topProducts ?? s.top_products ?? []).map((t: any) =>
          typeof t === "string" ? t : t.title ?? t.name ?? ""
        ),
      };
    },
  });
}

export function useVendorProducts() {
  return useQuery({
    queryKey: ["vendorProducts"],
    queryFn: async () => {
      const res = await vendor.products.list();
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map(mapApiProduct);
    },
  });
}

export function useVendorOrders(params?: { status?: string }) {
  return useQuery({
    queryKey: ["vendorOrders", params],
    queryFn: async () => {
      const res = await vendor.orders.list(params ?? {});
      const list = Array.isArray(res) ? res : res.data ?? [];
      return list.map(mapApiOrder);
    },
  });
}

// ─── Address hooks ──────────────────────────────────────────────────────────

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await addresses.list();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useAddress(id: string) {
  return useQuery({
    queryKey: ["address", id],
    queryFn: async () => {
      const res = await addresses.get(id);
      return res;
    },
    enabled: !!id,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addresses.create>[0]) => addresses.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof addresses.update>[1] }) =>
      addresses.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addresses.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

// ─── Cart hooks ─────────────────────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cart.get();
      return res;
    },
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof cart.addItem>[0]) => cart.addItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Parameters<typeof cart.updateItem>[1] }) =>
      cart.updateItem(itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cart.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cart.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

// ─── Wishlist hooks ─────────────────────────────────────────────────────────

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await wishlist.list();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string }) => wishlist.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => wishlist.remove(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── Notification hooks ─────────────────────────────────────────────────────

export function useNotifications(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const res = await notifications.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notifications.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notifications.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── AI Chat hook ───────────────────────────────────────────────────────────

export function useAiChat() {
  return useMutation({
    mutationFn: (message: string) => ai.chat({ message }),
  });
}

// ─── Wallet transaction hooks ──────────────────────────────────────────────

export function useWalletTransactions(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["walletTransactions", params],
    queryFn: async () => {
      const res = await wallet.transactions(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useWalletTopUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => wallet.topUp({ amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["walletTransactions"] }),
  });
}

export function useWalletWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof wallet.withdraw>[0]) => wallet.withdraw(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["walletTransactions"] }),
  });
}

// ─── Payment hooks ──────────────────────────────────────────────────────────

export function useInitializePayment() {
  return useMutation({
    mutationFn: (data: Parameters<typeof payments.initialize>[0]) => payments.initialize(data),
  });
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ["verifyPayment", reference],
    queryFn: () => payments.verify(reference),
    enabled: !!reference,
  });
}

// ─── Review hooks ───────────────────────────────────────────────────────────

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const res = await reviews.forProduct(productId);
      return Array.isArray(res) ? res : res.data ?? [];
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof reviews.create>[0]) => reviews.create(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["reviews", vars.productId] }),
  });
}

// ─── Dispute hooks ──────────────────────────────────────────────────────────

export function useDisputes(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["disputes", params],
    queryFn: async () => {
      const res = await disputes.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useCreateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof disputes.create>[0]) => disputes.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disputes"] }),
  });
}

// ─── Coupon hooks ───────────────────────────────────────────────────────────

export function useCoupons(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: async () => {
      const res = await coupons.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: Parameters<typeof coupons.validate>[0]) => coupons.validate(data),
  });
}

// ─── Commission hooks ───────────────────────────────────────────────────────

export function useCommissions(params?: { page?: number; perPage?: number; status?: string }) {
  return useQuery({
    queryKey: ["commissions", params],
    queryFn: async () => {
      const res = await commissions.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useCommissionTiers() {
  return useQuery({
    queryKey: ["commissionTiers"],
    queryFn: async () => {
      const res = await commissions.tiers();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

// ─── Payout hooks ───────────────────────────────────────────────────────────

export function usePayouts(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["payouts", params],
    queryFn: async () => {
      const res = await payouts.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useCreatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof payouts.create>[0]) => payouts.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payouts"] }),
  });
}

// ─── Escrow hooks ───────────────────────────────────────────────────────────

export function useEscrows(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["escrows", params],
    queryFn: async () => {
      const res = await escrow.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useEscrow(id: string) {
  return useQuery({
    queryKey: ["escrow", id],
    queryFn: async () => {
      const res = await escrow.get(id);
      return res;
    },
    enabled: !!id,
  });
}

export function useReleaseEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => escrow.release(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["escrows"] }),
  });
}

// ─── Shipping hooks ─────────────────────────────────────────────────────────

export function useShippingZones() {
  return useQuery({
    queryKey: ["shippingZones"],
    queryFn: async () => {
      const res = await shipping.zones();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

// ─── Search hook ────────────────────────────────────────────────────────────

export function useSearchSuggestions(q?: string) {
  return useQuery({
    queryKey: ["searchSuggestions", q],
    queryFn: async () => {
      const res = await searchApi.suggestions(q);
      return Array.isArray(res) ? res : res.data ?? [];
    },
    enabled: !!q && q.length > 1,
  });
}

// ─── Recently Viewed hooks ─────────────────────────────────────────────────

export function useRecentlyViewed() {
  return useQuery({
    queryKey: ["recentlyViewed"],
    queryFn: async () => {
      const res = await recentlyViewed.list();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useRecordView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => recentlyViewed.store({ productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recentlyViewed"] }),
  });
}

// ─── Flash Sale hooks ──────────────────────────────────────────────────────

export function useFlashSales(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["flashSales", params],
    queryFn: async () => {
      const res = await flashSales.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useFlashSale(id: string) {
  return useQuery({
    queryKey: ["flashSale", id],
    queryFn: async () => {
      const res = await flashSales.get(id);
      return res;
    },
    enabled: !!id,
  });
}

// ─── Return Request hooks ──────────────────────────────────────────────────

export function useReturnRequests(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["returnRequests", params],
    queryFn: async () => {
      const res = await returnRequests.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useCreateReturnRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof returnRequests.create>[0]) => returnRequests.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["returnRequests"] }),
  });
}

// ─── Recommendation hooks ──────────────────────────────────────────────────

export function useTrendingProducts(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["trendingProducts", params],
    queryFn: async () => {
      const res = await recommendations.trending(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useRecommendedForMe() {
  return useQuery({
    queryKey: ["recommendedForMe"],
    queryFn: async () => {
      const res = await recommendations.forMe();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ["relatedProducts", productId],
    queryFn: async () => {
      const res = await recommendations.related(productId);
      return Array.isArray(res) ? res : res.data ?? [];
    },
    enabled: !!productId,
  });
}

export function useAlsoBought(productId: string) {
  return useQuery({
    queryKey: ["alsoBought", productId],
    queryFn: async () => {
      const res = await recommendations.alsoBought(productId);
      return Array.isArray(res) ? res : res.data ?? [];
    },
    enabled: !!productId,
  });
}

// ─── Currency hooks ────────────────────────────────────────────────────────

export function useCurrencies() {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await currenciesApi.list();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

// ─── KYC hooks ─────────────────────────────────────────────────────────────

export function useKycStatus() {
  return useQuery({
    queryKey: ["kycStatus"],
    queryFn: async () => {
      const res = await kyc.status();
      return res;
    },
  });
}

export function useVerifyBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof kyc.verifyBank>[0]) => kyc.verifyBank(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kycStatus"] }),
  });
}

// ─── Supplier hooks (admin) ────────────────────────────────────────────────

export function useSuppliers(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: async () => {
      const res = await suppliers.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

// ─── Subscription Plan hooks ───────────────────────────────────────────────

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      const res = await subscriptionPlans.list();
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

// ─── Fraud Alert hooks ────────────────────────────────────────────────────

export function useFraudAlerts(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["fraudAlerts", params],
    queryFn: async () => {
      const res = await fraud.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useFraudStats() {
  return useQuery({
    queryKey: ["fraudStats"],
    queryFn: async () => {
      const res = await fraud.stats();
      return (res as any).data ?? res;
    },
  });
}

export function useApproveFraudAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fraud.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fraudAlerts"] }),
  });
}

export function useBlockFraudAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fraud.block(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fraudAlerts"] }),
  });
}

export function useReviewFraudAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fraud.review(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fraudAlerts"] }),
  });
}

// ─── Dropshipping hooks ───────────────────────────────────────────────────

export function useDropshipRequests(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["dropshipRequests", params],
    queryFn: async () => {
      const res = await dropshipping.list(params);
      return Array.isArray(res) ? res : res.data ?? [];
    },
  });
}

export function useDropshipRequest(id: string) {
  return useQuery({
    queryKey: ["dropshipRequest", id],
    queryFn: async () => {
      const res = await dropshipping.get(id);
      return (res as any).data ?? res;
    },
    enabled: !!id,
  });
}

export function useCreateDropshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { supplierUrl: string; markup?: number }) => dropshipping.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dropshipRequests"] }),
  });
}

export function useUpdateDropshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Record<string, unknown>> }) => dropshipping.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dropshipRequests"] }),
  });
}

export function useDeleteDropshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dropshipping.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dropshipRequests"] }),
  });
}

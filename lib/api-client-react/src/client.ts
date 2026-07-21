import { customFetch } from "./custom-fetch";
import type { CustomFetchOptions } from "./custom-fetch";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function queryString(params: object): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

// ---------------------------------------------------------------------------
// Shared response wrappers
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiMessageResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Auth types
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Profile types
// ---------------------------------------------------------------------------

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

// ---------------------------------------------------------------------------
// Address types
// ---------------------------------------------------------------------------

export interface Address {
  id: number;
  userId: number;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

// ---------------------------------------------------------------------------
// Product types
// ---------------------------------------------------------------------------

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
  thumbnail?: string;
  category?: Category;
  vendor?: Vendor;
  averageRating?: number;
  reviewCount?: number;
  tags?: string[];
  attributes?: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  position: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductQueryParams {
  page?: number;
  perPage?: number;
  category?: string | number;
  q?: string;
  sort?: string;
  vendorId?: number;
}

// ---------------------------------------------------------------------------
// Category types
// ---------------------------------------------------------------------------

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Vendor types
// ---------------------------------------------------------------------------

export interface Vendor {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorApplicationRequest {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
}

export interface VendorAnalyticsDashboard {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  recentOrders: Order[];
}

export interface VendorTopProduct {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface VendorMonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
}

// ---------------------------------------------------------------------------
// Review types
// ---------------------------------------------------------------------------

export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId?: number;
  rating: number;
  title?: string;
  body: string;
  user?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body: string;
}

export type UpdateReviewRequest = Partial<CreateReviewRequest>;

// ---------------------------------------------------------------------------
// Cart types
// ---------------------------------------------------------------------------

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ---------------------------------------------------------------------------
// Wishlist types
// ---------------------------------------------------------------------------

export interface WishlistItem {
  id: number;
  productId: number;
  product: Product;
  createdAt: string;
}

export interface AddToWishlistRequest {
  productId: string;
}

// ---------------------------------------------------------------------------
// Order types
// ---------------------------------------------------------------------------

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateOrderRequest {
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethod?: string;
  notes?: string;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// ---------------------------------------------------------------------------
// Wallet types
// ---------------------------------------------------------------------------

export interface WalletBalance {
  balance: number;
  ledgerBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  fee?: number;
  reference: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface TopUpRequest {
  amount: number;
  paymentMethod?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccount?: string;
}

// ---------------------------------------------------------------------------
// Payment types
// ---------------------------------------------------------------------------

export interface PaymentInitializeRequest {
  amount: number;
  currency?: string;
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitializeResponse {
  authorizationUrl: string;
  reference: string;
  accessCode?: string;
}

export interface PaymentVerification {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paidAt: string;
  channel?: string;
}

// ---------------------------------------------------------------------------
// Dispute types
// ---------------------------------------------------------------------------

export interface Dispute {
  id: number;
  userId: number;
  orderId: number;
  subject: string;
  description: string;
  status: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  orderId: number;
  subject: string;
  description: string;
}

export interface ResolveDisputeRequest {
  resolution: string;
}

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export interface Notification {
  id: number;
  type: string;
  notifiableType: string;
  notifiableId: number;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// AI types
// ---------------------------------------------------------------------------

export interface AiChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

export interface AiChatResponse {
  reply: string;
  conversationId?: string;
}

// ---------------------------------------------------------------------------
// Payout types
// ---------------------------------------------------------------------------

export interface Payout {
  id: number;
  vendorId: number;
  amount: number;
  fee?: number;
  reference: string;
  status: string;
  bankAccount?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRequest {
  amount: number;
  bankAccount?: string;
}

// ---------------------------------------------------------------------------
// Escrow types
// ---------------------------------------------------------------------------

export interface Escrow {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  reference: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestEscrowRelease {
  orderId: number;
}

// ---------------------------------------------------------------------------
// Coupon types
// ---------------------------------------------------------------------------

export interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export type UpdateCouponRequest = Partial<CreateCouponRequest>;

export interface ValidateCouponRequest {
  code: string;
  cartTotal?: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Commission types
// ---------------------------------------------------------------------------

export interface Commission {
  id: number;
  orderId: number;
  vendorId: number;
  amount: number;
  rate: number;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface CommissionTier {
  id: number;
  name: string;
  rate: number;
  minSales?: number;
  maxSales?: number;
}

// ---------------------------------------------------------------------------
// Shipping types
// ---------------------------------------------------------------------------

export interface ShippingZone {
  id: number;
  name: string;
  countries: string[];
  rates: ShippingRate[];
  createdAt: string;
}

export interface ShippingRate {
  id: number;
  name: string;
  price: number;
  minWeight?: number;
  maxWeight?: number;
  estimatedDays?: string;
}

// ---------------------------------------------------------------------------
// Search types
// ---------------------------------------------------------------------------

export interface SearchSuggestion {
  text: string;
  type?: string;
}

// ---------------------------------------------------------------------------
// Admin types
// ---------------------------------------------------------------------------

export interface AdminDashboard {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDisputes: number;
  recentOrders: Order[];
}

export interface AdminRevenue {
  total: number;
  monthly: { month: string; year: number; revenue: number }[];
  byVendor: { vendorId: number; vendorName: string; revenue: number }[];
}

export interface AdminUserQueryParams {
  page?: number;
  perPage?: number;
  role?: string;
  q?: string;
}

export interface AdminVendorQueryParams {
  page?: number;
  perPage?: number;
  status?: string;
  q?: string;
}

export interface UpdateUserStatusRequest {
  status: string;
}

export interface UpdateVendorStatusRequest {
  status: string;
}

// ---------------------------------------------------------------------------
// Upload types
// ---------------------------------------------------------------------------

export interface UploadResponse {
  url: string;
  path: string;
  name: string;
}

// ===========================================================================
// API Functions
// ===========================================================================

async function get<T>(url: string, options?: CustomFetchOptions): Promise<T> {
  return customFetch<T>(url, { ...options, method: "GET" });
}

async function post<T>(
  url: string,
  body?: unknown,
  options?: CustomFetchOptions,
): Promise<T> {
  return customFetch<T>(url, {
    ...options,
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

async function put<T>(
  url: string,
  body?: unknown,
  options?: CustomFetchOptions,
): Promise<T> {
  return customFetch<T>(url, {
    ...options,
    method: "PUT",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

async function patch<T>(
  url: string,
  body?: unknown,
  options?: CustomFetchOptions,
): Promise<T> {
  return customFetch<T>(url, {
    ...options,
    method: "PATCH",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

async function del<T>(
  url: string,
  options?: CustomFetchOptions,
): Promise<T> {
  return customFetch<T>(url, { ...options, method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  register: (data: RegisterRequest) =>
    post<{ data: AuthTokenResponse }>("/api/v1/auth/register", data),

  login: (data: LoginRequest) =>
    post<{ data: AuthTokenResponse }>("/api/v1/auth/login", data),

  logout: () => post<ApiMessageResponse>("/api/v1/auth/logout"),

  me: () => get<{ data: User }>("/api/v1/auth/me"),
};

// ---------------------------------------------------------------------------
// Social Auth
// ---------------------------------------------------------------------------

export const socialAuth = {
  login: (provider: string, token: string) =>
    post<{ data: { user: any; token: string } }>(`/api/v1/auth/social/${provider}`, { token }),
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profile = {
  get: () => get<{ data: User }>("/api/v1/profile"),

  update: (data: UpdateProfileRequest) =>
    put<{ data: User; message: string }>("/api/v1/profile", data),

  updatePassword: (data: UpdatePasswordRequest) =>
    put<ApiMessageResponse>("/api/v1/profile/password", data),
};

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export const addresses = {
  list: () => get<{ data: Address[] }>("/api/v1/addresses"),

  get: (id: string) => get<{ data: Address }>(`/api/v1/addresses/${id}`),

  create: (data: CreateAddressRequest) =>
    post<{ data: Address; message: string }>("/api/v1/addresses", data),

  update: (id: string, data: UpdateAddressRequest) =>
    put<{ data: Address; message: string }>(`/api/v1/addresses/${id}`, data),

  delete: (id: string) =>
    del<ApiMessageResponse>(`/api/v1/addresses/${id}`),
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const products = {
  list: (params?: ProductQueryParams) =>
    get<PaginatedResponse<Product>>(`/api/v1/products${queryString(params ?? {})}`),

  get: (id: string) => get<{ data: Product }>(`/api/v1/products/${id}`),

  compare: (ids: string[]) =>
    get<{ success: boolean; data: { products: Product[]; attributes: Record<string, Record<string, unknown>> } }>(
      `/api/v1/products/compare${queryString({ ids })}`,
    ),
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = {
  list: () => get<{ data: Category[] }>("/api/v1/categories"),

  get: (id: string) => get<{ data: Category }>(`/api/v1/categories/${id}`),
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviews = {
  forProduct: (productId: string) =>
    get<PaginatedResponse<Review>>(`/api/v1/reviews/product/${productId}`),

  create: (data: CreateReviewRequest) =>
    post<{ data: Review; message: string }>("/api/v1/reviews", data),

  update: (id: string, data: UpdateReviewRequest) =>
    put<{ data: Review; message: string }>(`/api/v1/reviews/${id}`, data),

  delete: (id: string) =>
    del<ApiMessageResponse>(`/api/v1/reviews/${id}`),
};

// ---------------------------------------------------------------------------
// Vendors (public)
// ---------------------------------------------------------------------------

export const vendors = {
  get: (id: string) => get<{ data: Vendor }>(`/api/v1/vendors/${id}`),
};

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const search = {
  suggestions: (q?: string) =>
    get<{ data: SearchSuggestion[] }>(
      `/api/v1/search/suggestions${queryString({ q })}`,
    ),
};

// ---------------------------------------------------------------------------
// Shipping
// ---------------------------------------------------------------------------

export const shipping = {
  zones: () => get<{ data: ShippingZone[] }>("/api/v1/shipping/zones"),
};

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const cart = {
  get: () => get<{ data: Cart }>("/api/v1/cart"),

  addItem: (data: AddToCartRequest) =>
    post<{ data: Cart; message: string }>("/api/v1/cart/add", data),

  updateItem: (itemId: string, data: UpdateCartItemRequest) =>
    put<{ data: Cart; message: string }>(
      `/api/v1/cart/items/${itemId}`,
      data,
    ),

  removeItem: (itemId: string) =>
    del<ApiMessageResponse>(`/api/v1/cart/items/${itemId}`),

  clear: () => del<ApiMessageResponse>("/api/v1/cart"),
};

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export const wishlist = {
  list: () => get<{ data: WishlistItem[] }>("/api/v1/wishlist"),

  add: (data: AddToWishlistRequest) =>
    post<{ data: WishlistItem; message: string }>("/api/v1/wishlist", data),

  remove: (itemId: string) =>
    del<ApiMessageResponse>(`/api/v1/wishlist/${itemId}`),
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = {
  list: (params?: { page?: number; perPage?: number; status?: string }) =>
    get<PaginatedResponse<Order>>(
      `/api/v1/orders${queryString(params ?? {})}`,
    ),

  create: (data?: CreateOrderRequest) =>
    post<{ data: Order; message: string }>("/api/v1/orders", data),

  get: (id: string) => get<{ data: Order }>(`/api/v1/orders/${id}`),

  updateStatus: (id: string, data: UpdateOrderStatusRequest) =>
    patch<{ data: Order; message: string }>(
      `/api/v1/orders/${id}/status`,
      data,
    ),

  cancel: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/orders/${id}/cancel`),
};

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export const wallet = {
  balance: () =>
    get<{ data: WalletBalance }>("/api/v1/wallet/balance"),

  transactions: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<WalletTransaction>>(
      `/api/v1/wallet/transactions${queryString(params ?? {})}`,
    ),

  topUp: (data: TopUpRequest) =>
    post<{ data: WalletTransaction; message: string }>(
      "/api/v1/wallet/topup",
      data,
    ),

  withdraw: (data: WithdrawRequest) =>
    post<{ data: WalletTransaction; message: string }>(
      "/api/v1/wallet/withdraw",
      data,
    ),
};

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const payments = {
  initialize: (data: PaymentInitializeRequest) =>
    post<{ data: PaymentInitializeResponse }>(
      "/api/v1/payments/initialize",
      data,
    ),

  verify: (reference: string) =>
    get<{ data: PaymentVerification }>(
      `/api/v1/payments/verify/${reference}`,
    ),
};

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

export const disputes = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Dispute>>(
      `/api/v1/disputes${queryString(params ?? {})}`,
    ),

  get: (id: string) => get<{ data: Dispute }>(`/api/v1/disputes/${id}`),

  create: (data: CreateDisputeRequest) =>
    post<{ data: Dispute; message: string }>("/api/v1/disputes", data),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Notification>>(
      `/api/v1/notifications${queryString(params ?? {})}`,
    ),

  markRead: (id: string) =>
    patch<ApiMessageResponse>(`/api/v1/notifications/${id}/read`),

  markAllRead: () =>
    patch<ApiMessageResponse>("/api/v1/notifications/read-all"),

  delete: (id: string) =>
    del<ApiMessageResponse>(`/api/v1/notifications/${id}`),
};

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export const ai = {
  chat: (data: AiChatRequest) =>
    post<{ data: AiChatResponse }>("/api/v1/ai/chat", data),
};

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

export const uploads = {
  upload: (formData: FormData) =>
    post<{ data: UploadResponse; message: string }>("/api/v1/uploads", undefined, {
      body: formData,
    }),
};

// ---------------------------------------------------------------------------
// Vendors (authenticated)
// ---------------------------------------------------------------------------

export const vendor = {
  getMe: () => get<{ data: Vendor }>("/api/v1/vendors/me"),

  updateMe: (data: Partial<VendorApplicationRequest>) =>
    put<{ data: Vendor; message: string }>("/api/v1/vendors/me", data),

  apply: (data: VendorApplicationRequest) =>
    post<{ data: Vendor; message: string }>("/api/v1/vendors/apply", data),

  stats: () => get<{ data: VendorStats }>("/api/v1/vendors/stats"),

  products: {
    list: (params?: ProductQueryParams) =>
      get<PaginatedResponse<Product>>(
        `/api/v1/vendors/products${queryString(params ?? {})}`,
      ),

    get: (id: string) =>
      get<{ data: Product }>(`/api/v1/vendors/products/${id}`),

    create: (data: Record<string, unknown>) =>
      post<{ data: Product; message: string }>(
        "/api/v1/vendors/products",
        data,
      ),

    update: (id: string, data: Record<string, unknown>) =>
      put<{ data: Product; message: string }>(
        `/api/v1/vendors/products/${id}`,
        data,
      ),

    delete: (id: string) =>
      del<ApiMessageResponse>(`/api/v1/vendors/products/${id}`),
  },

  orders: {
    list: (params?: { page?: number; perPage?: number; status?: string }) =>
      get<PaginatedResponse<Order>>(
        `/api/v1/vendors/orders${queryString(params ?? {})}`,
      ),

    get: (id: string) =>
      get<{ data: Order }>(`/api/v1/vendors/orders/${id}`),

    updateStatus: (id: string, data: UpdateOrderStatusRequest) =>
      patch<{ data: Order; message: string }>(
        `/api/v1/vendors/orders/${id}/status`,
        data,
      ),
  },

  analytics: {
    dashboard: () =>
      get<{ data: VendorAnalyticsDashboard }>(
        "/api/v1/vendors/analytics/dashboard",
      ),

    topProducts: (params?: { limit?: number }) =>
      get<{ data: VendorTopProduct[] }>(
        `/api/v1/vendors/analytics/top-products${queryString(params ?? {})}`,
      ),

    monthlyRevenue: (params?: { year?: number }) =>
      get<{ data: VendorMonthlyRevenue[] }>(
        `/api/v1/vendors/analytics/monthly-revenue${queryString(params ?? {})}`,
      ),
  },
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const admin = {
  dashboard: () =>
    get<{ data: AdminDashboard }>("/api/v1/admin/dashboard"),

  revenue: () =>
    get<{ data: AdminRevenue }>("/api/v1/admin/revenue"),

  users: {
    list: (params?: AdminUserQueryParams) =>
      get<PaginatedResponse<User>>(
        `/api/v1/admin/users${queryString(params ?? {})}`,
      ),

    suspend: (id: string) =>
      patch<ApiMessageResponse>(`/api/v1/admin/users/${id}/suspend`),

    activate: (id: string) =>
      patch<ApiMessageResponse>(`/api/v1/admin/users/${id}/activate`),
  },

  vendors: {
    list: (params?: AdminVendorQueryParams) =>
      get<PaginatedResponse<Vendor>>(
        `/api/v1/admin/vendors${queryString(params ?? {})}`,
      ),

    updateStatus: (id: string, data: UpdateVendorStatusRequest) =>
      patch<{ data: Vendor; message: string }>(
        `/api/v1/admin/vendors/${id}/status`,
        data,
      ),
  },

  disputes: {
    list: (params?: { page?: number; perPage?: number; status?: string }) =>
      get<PaginatedResponse<Dispute>>(
        `/api/v1/admin/disputes${queryString(params ?? {})}`,
      ),

    resolve: (id: string, data: ResolveDisputeRequest) =>
      post<ApiMessageResponse>(
        `/api/v1/admin/disputes/${id}/resolve`,
        data,
      ),

    escalate: (id: string) =>
      post<ApiMessageResponse>(`/api/v1/admin/disputes/${id}/escalate`),
  },

  // Admin products (moderation)
  products: {
    list: (params?: { page?: number; perPage?: number; status?: string; q?: string }) =>
      get<PaginatedResponse<Product>>(
        `/api/v1/admin/products${queryString(params ?? {})}`,
      ),

    get: (id: string) =>
      get<{ data: Product }>(`/api/v1/admin/products/${id}`),

    approve: (id: string) =>
      post<{ data: Product; message: string }>(
        `/api/v1/admin/products/${id}/approve`,
      ),

    reject: (id: string) =>
      post<{ data: Product; message: string }>(
        `/api/v1/admin/products/${id}/reject`,
      ),
  },
};

// ---------------------------------------------------------------------------
// Payouts
// ---------------------------------------------------------------------------

export const payouts = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Payout>>(
      `/api/v1/payouts${queryString(params ?? {})}`,
    ),

  get: (id: string) => get<{ data: Payout }>(`/api/v1/payouts/${id}`),

  create: (data: CreatePayoutRequest) =>
    post<{ data: Payout; message: string }>("/api/v1/payouts", data),

  process: (id: string, data: { status: string; transaction_reference?: string; notes?: string }) =>
    post<{ data: Payout; message: string }>(`/api/v1/payouts/${id}/process`, data),

  cancel: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/payouts/${id}/cancel`),
};

// ---------------------------------------------------------------------------
// Escrow
// ---------------------------------------------------------------------------

export const escrow = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Escrow>>(
      `/api/v1/escrow${queryString(params ?? {})}`,
    ),

  get: (id: string) => get<{ data: Escrow }>(`/api/v1/escrow/${id}`),

  create: (data: RequestEscrowRelease) =>
    post<{ data: Escrow; message: string }>("/api/v1/escrow", data),

  release: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/escrow/${id}/release`),
};

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const coupons = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Coupon>>(
      `/api/v1/coupons${queryString(params ?? {})}`,
    ),

  get: (id: string) => get<{ data: Coupon }>(`/api/v1/coupons/${id}`),

  create: (data: CreateCouponRequest) =>
    post<{ data: Coupon; message: string }>("/api/v1/coupons", data),

  update: (id: string, data: UpdateCouponRequest) =>
    put<{ data: Coupon; message: string }>(`/api/v1/coupons/${id}`, data),

  delete: (id: string) =>
    del<ApiMessageResponse>(`/api/v1/coupons/${id}`),

  validate: (data: ValidateCouponRequest) =>
    post<{ data: ValidateCouponResponse }>(
      "/api/v1/coupons/validate",
      data,
    ),
};

// ---------------------------------------------------------------------------
// Commissions
// ---------------------------------------------------------------------------

export const commissions = {
  list: (params?: { page?: number; perPage?: number; status?: string }) =>
    get<PaginatedResponse<Commission>>(
      `/api/v1/commissions${queryString(params ?? {})}`,
    ),

  tiers: () =>
    get<{ data: CommissionTier[] }>("/api/v1/commissions/tiers"),
};

// ---------------------------------------------------------------------------
// Recently Viewed
// ---------------------------------------------------------------------------

export const recentlyViewed = {
  list: () => get<{ data: Product[] }>("/api/v1/recently-viewed"),

  store: (data: { productId: string }) =>
    post<ApiMessageResponse>("/api/v1/recently-viewed", data),
};

// ---------------------------------------------------------------------------
// Flash Sale types
// ---------------------------------------------------------------------------

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  products: FlashSaleProduct[];
  createdAt: string;
}

export interface FlashSaleProduct {
  id: string;
  flashSaleId: string;
  productId: string;
  product: Product;
  salePrice: number;
  quantityLimit: number;
  soldCount: number;
}

// ---------------------------------------------------------------------------
// Flash Sales
// ---------------------------------------------------------------------------

export const flashSales = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<FlashSale>>(
      `/api/v1/flash-sales${queryString(params ?? {})}`,
    ),

  get: (id: string) =>
    get<{ data: FlashSale }>(`/api/v1/flash-sales/${id}`),
};

// ---------------------------------------------------------------------------
// Return Request types
// ---------------------------------------------------------------------------

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  vendorId: string;
  reason: string;
  status: string;
  refundAmount?: number;
  notes?: string;
  product?: Product;
  order?: Order;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnRequestData {
  orderId: string;
  productId: string;
  reason: string;
}

export interface UpdateReturnRequestData {
  status: string;
  vendorNotes?: string;
}

// ---------------------------------------------------------------------------
// Return Requests
// ---------------------------------------------------------------------------

export const returnRequests = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<ReturnRequest>>(
      `/api/v1/return-requests${queryString(params ?? {})}`,
    ),

  create: (data: CreateReturnRequestData) =>
    post<{ data: ReturnRequest; message: string }>(
      "/api/v1/return-requests",
      data,
    ),

  updateStatus: (id: string, data: UpdateReturnRequestData) =>
    patch<{ data: ReturnRequest; message: string }>(
      `/api/v1/return-requests/${id}/status`,
      data,
    ),
};

// ---------------------------------------------------------------------------
// Guest Checkout
// ---------------------------------------------------------------------------

export const guestCheckout = {
  initiate: (data: { guestName?: string; guestEmail?: string; guestPhone?: string; shippingAddress: string; items: { productId: string; quantity: number }[]; paymentMethod?: string }) =>
    post<{ data: { orderId?: string; guestToken: string; order?: any }; message: string }>("/api/v1/guest-checkout", {
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      guest_phone: data.guestPhone,
      shipping_address: data.shippingAddress,
      items: data.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      payment_method: data.paymentMethod,
    }),

  complete: (id: string) =>
    post<{ data: { order: any }; message: string }>(`/api/v1/guest-checkout/${id}/complete`),
};

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export const recommendations = {
  trending: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Product>>(`/api/v1/recommendations/trending${queryString(params ?? {})}`),

  forMe: () => get<{ data: Product[] }>("/api/v1/recommendations/for-me"),

  related: (productId: string) =>
    get<{ data: Product[] }>(`/api/v1/recommendations/related/${productId}`),

  alsoBought: (productId: string) =>
    get<{ data: Product[] }>(`/api/v1/recommendations/also-bought/${productId}`),
};

// ---------------------------------------------------------------------------
// Currencies
// ---------------------------------------------------------------------------

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRateToNgn: number;
}

export const currenciesApi = {
  list: () => get<{ data: Currency[] }>("/api/v1/currencies"),

  set: (data: { currency: string }) =>
    post<ApiMessageResponse>("/api/v1/currencies/set", data),
};

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export const seo = {
  sitemap: () => get<string>("/api/v1/seo/sitemap.xml"),
  robots: () => get<string>("/api/v1/seo/robots.txt"),
  meta: (type: string, id: string) =>
    get<{ data: any }>(`/api/v1/seo/meta/${type}/${id}`),
  updateMeta: (data: { metaableType: string; metaableId: string; title?: string; description?: string; keywords?: string; canonicalUrl?: string; ogImage?: string }) =>
    post<{ data: any; message: string }>("/api/v1/seo/meta", data),
};

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export const kyc = {
  uploadDocument: (formData: FormData) =>
    post<{ data: { url: string }; message: string }>("/api/v1/kyc/upload", undefined, { body: formData }),

  verifyBank: (data: { bankCode: string; accountNumber: string; bankName: string }) =>
    post<{ data: any; message: string }>("/api/v1/kyc/verify-bank", data),

  status: () => get<{ data: { status: string; documents: any[]; bankVerified: boolean } }>("/api/v1/kyc/status"),
};

// ---------------------------------------------------------------------------
// Platform Wallet
// ---------------------------------------------------------------------------

export const platformWallet = {
  balance: () => get<{ data: { balance: number; totalFees: number } }>("/api/v1/platform-wallet/balance"),
  transactions: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<any>>(`/api/v1/platform-wallet/transactions${queryString(params ?? {})}`),
  transferToVendor: (data: { vendorId: string; amount: number }) =>
    post<{ data: any; message: string }>("/api/v1/platform-wallet/transfer-to-vendor", data),
};

// ---------------------------------------------------------------------------
// Referral types
// ---------------------------------------------------------------------------

export interface Referral {
  id: string;
  referrerId: string;
  referredId?: string;
  referralCode: string;
  status: string;
  rewardAmount: number;
  rewardCurrency: string;
  completedAt?: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedCount: number;
  totalEarned: number;
}

// ---------------------------------------------------------------------------
// Loyalty Point types
// ---------------------------------------------------------------------------

export interface LoyaltyPoint {
  id: string;
  userId: string;
  points: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface LoyaltyBalance {
  balance: number;
}

// ---------------------------------------------------------------------------
// Referrals
// ---------------------------------------------------------------------------

export const referrals = {
  list: () => get<{ data: Referral[] }>("/api/v1/referrals"),
  store: () => post<{ data: Referral; message: string }>("/api/v1/referrals"),
  stats: () => get<{ data: ReferralStats }>("/api/v1/referrals/stats"),
  redeem: (data: { code: string }) =>
    post<{ data: Referral; message: string }>("/api/v1/referrals/redeem", data),
};

// ---------------------------------------------------------------------------
// Loyalty Points
// ---------------------------------------------------------------------------

export const loyaltyPoints = {
  list: () => get<{ data: LoyaltyPoint[] }>("/api/v1/loyalty-points"),
  balance: () => get<{ data: LoyaltyBalance }>("/api/v1/loyalty-points/balance"),
  redeem: (data: { points: number }) =>
    post<{ data: LoyaltyPoint; message: string }>("/api/v1/loyalty-points/redeem", data),
};

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  reliabilityScore: number;
  totalOrders: number;
  successfulOrders: number;
  status: string;
}

export const suppliers = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<Supplier>>(`/api/v1/suppliers${queryString(params ?? {})}`),
  get: (id: string) => get<{ data: Supplier }>(`/api/v1/suppliers/${id}`),
  create: (data: Partial<Supplier>) => post<{ data: Supplier; message: string }>("/api/v1/suppliers", data),
  update: (id: string, data: Partial<Supplier>) => put<{ data: Supplier; message: string }>(`/api/v1/suppliers/${id}`, data),
};

// ---------------------------------------------------------------------------
// Subscription Plans
// ---------------------------------------------------------------------------

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  commissionRate: number;
  maxProducts: number;
  featuredListing: boolean;
  aiOptimization: boolean;
  dropshipping: boolean;
  analytics: boolean;
  isActive: boolean;
}

export const subscriptionPlans = {
  list: () => get<{ data: SubscriptionPlan[] }>("/api/v1/subscription-plans"),
  get: (id: string) => get<{ data: SubscriptionPlan }>(`/api/v1/subscription-plans/${id}`),
};

// ---------------------------------------------------------------------------
// Low Stock Alert types
// ---------------------------------------------------------------------------

export interface LowStockAlert {
  id: string;
  productId: string;
  vendorId: string;
  currentStock: number;
  threshold: number;
  notified: boolean;
  resolvedAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Low Stock Alerts
// ---------------------------------------------------------------------------

export const lowStockAlerts = {
  list: (params?: { vendorId?: string; resolved?: string; page?: number; perPage?: number }) =>
    get<PaginatedResponse<LowStockAlert>>(`/api/v1/low-stock-alerts${queryString(params ?? {})}`),
  create: (data: { productId: string; threshold?: number }) =>
    post<{ data: LowStockAlert; message: string }>("/api/v1/low-stock-alerts", data),
  resolve: (id: string) =>
    post<{ data: LowStockAlert; message: string }>(`/api/v1/low-stock-alerts/${id}/resolve`),
};

// ---------------------------------------------------------------------------
// Global Discount types
// ---------------------------------------------------------------------------

export interface GlobalDiscount {
  id: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Global Discounts
// ---------------------------------------------------------------------------

export const globalDiscounts = {
  list: () => get<{ data: GlobalDiscount[] }>("/api/v1/admin/discounts"),
  create: (data: Partial<GlobalDiscount>) =>
    post<{ data: GlobalDiscount; message: string }>("/api/v1/admin/discounts", data),
  delete: (id: string) =>
    del<{ message: string }>(`/api/v1/admin/discounts/${id}`),
};

// ---------------------------------------------------------------------------
// Cashback types
// ---------------------------------------------------------------------------

export interface Cashback {
  id: string;
  userId: string;
  orderId?: string;
  amount: number;
  type: string;
  status: string;
  creditedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cashbacks
// ---------------------------------------------------------------------------

export const cashbacks = {
  list: () => get<PaginatedResponse<Cashback>>("/api/v1/cashbacks"),
  balance: () => get<{ data: { balance: number } }>("/api/v1/cashbacks/balance"),
};

// ---------------------------------------------------------------------------
// Order Template types
// ---------------------------------------------------------------------------

export interface OrderTemplate {
  id: string;
  userId: string;
  name: string;
  items: { productId: string; quantity: number; variant?: string }[];
  totalEstimate: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Order Templates
// ---------------------------------------------------------------------------

export const orderTemplates = {
  list: () => get<{ data: OrderTemplate[] }>("/api/v1/order-templates"),
  create: (data: { name: string; items: { product_id: string; quantity: number }[]; total_estimate?: number }) =>
    post<{ data: OrderTemplate; message: string }>("/api/v1/order-templates", data),
  delete: (id: string) => del<{ message: string }>(`/api/v1/order-templates/${id}`),
};

// ---------------------------------------------------------------------------
// Vendor Performance
// ---------------------------------------------------------------------------

export const vendorPerformance = {
  list: () => get<{ data: { vendorId: string; shopName: string; score: number }[] }>("/api/v1/admin/vendor-performance"),
  score: (id: string) => get<{ data: { vendorId: string; score: number; avgRating: number; fulfillmentRate: number; totalOrders: number; completedOrders: number } }>(`/api/v1/admin/vendor-performance/${id}`),
};

// ---------------------------------------------------------------------------
// Health types
// ---------------------------------------------------------------------------

export interface HealthMetrics {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  pendingDisputes: number;
  ordersToday: number;
  revenueToday: number;
  serverTime: string;
  phpVersion: string;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export const health = {
  get: () => get<{ data: HealthMetrics }>("/api/v1/health"),
};

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

export const refunds = {
  toWallet: (orderId: string) =>
    post<{ data: { balance: number }; message: string }>(`/api/v1/refunds/${orderId}/wallet`),
  toBank: (orderId: string) =>
    post<{ message: string }>(`/api/v1/refunds/${orderId}/bank`),
};

// ---------------------------------------------------------------------------
// Fraud Alert types
// ---------------------------------------------------------------------------

export interface FraudAlert {
  id: string;
  transactionId: string;
  amount: number;
  riskLevel: "high" | "medium" | "low";
  reason: string;
  timestamp: string;
  customerName: string;
  status: string;
}

export interface FraudStats {
  flagged: number;
  review: number;
  blocked: number;
  falsePositive: number;
}

// ---------------------------------------------------------------------------
// Fraud Alerts (admin)
// ---------------------------------------------------------------------------

export const fraud = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<FraudAlert>>(`/api/v1/fraud${queryString(params ?? {})}`),
  stats: () =>
    get<{ data: FraudStats }>("/api/v1/fraud/stats"),
  approve: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/fraud/${id}/approve`),
  block: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/fraud/${id}/block`),
  review: (id: string) =>
    post<ApiMessageResponse>(`/api/v1/fraud/${id}/review`),
};

// ---------------------------------------------------------------------------
// Dropshipping types
// ---------------------------------------------------------------------------

export interface DropshipRequest {
  id: string;
  vendorId: string;
  productId?: string;
  supplierUrl: string;
  supplierName?: string;
  supplierPrice?: number;
  markup?: number;
  status: string;
  aiScore?: number;
  aiNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Dropshipping API
// ---------------------------------------------------------------------------

export const dropshipping = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<DropshipRequest>>(`/api/v1/dropshipping/requests${queryString(params ?? {})}`),
  get: (id: string) =>
    get<{ data: DropshipRequest }>(`/api/v1/dropshipping/requests/${id}`),
  create: (data: { supplierUrl: string; markup?: number }) =>
    post<{ data: DropshipRequest; message: string }>("/api/v1/dropshipping/requests", data),
  update: (id: string, data: Partial<DropshipRequest>) =>
    put<{ data: DropshipRequest; message: string }>(`/api/v1/dropshipping/requests/${id}`, data),
  delete: (id: string) =>
    del<ApiMessageResponse>(`/api/v1/dropshipping/requests/${id}`),
};

// ---------------------------------------------------------------------------
// Chargebacks
// ---------------------------------------------------------------------------

export const chargebacks = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<any>>(`/api/v1/chargebacks${queryString(params ?? {})}`),
  create: (data: { orderId: string; reason: string; evidenceUrls?: string[] }) =>
    post<{ data: any; message: string }>("/api/v1/chargebacks", data),
  resolve: (id: string, data: { resolution: string }) =>
    post<{ message: string }>(`/api/v1/chargebacks/${id}/resolve`, data),
};

// ---------------------------------------------------------------------------
// Partial Refunds
// ---------------------------------------------------------------------------

export const partialRefunds = {
  create: (data: { orderId: string; amount: number; reason: string }) =>
    post<{ data: any; message: string }>("/api/v1/partial-refunds", data),
};

// ---------------------------------------------------------------------------
// Top Rated Products
// ---------------------------------------------------------------------------

export const topRated = {
  list: (params?: { page?: number; perPage?: number }) =>
    get<PaginatedResponse<any>>(`/api/v1/products/top-rated${queryString(params ?? {})}`),
};

// ---------------------------------------------------------------------------
// Frequently Bought Together
// ---------------------------------------------------------------------------

export const frequentlyBought = {
  get: (productId: string) =>
    get<{ data: any[] }>(`/api/v1/products/frequently-bought/${productId}`),
};

// ---------------------------------------------------------------------------
// AI Size / Fit Recommendations
// ---------------------------------------------------------------------------

export const aiSizeFit = {
  recommend: (data: { height: number; weight: number; productId: string }) =>
    post<{ data: { recommendedSize: string; confidence: number; notes?: string } }>("/api/v1/ai/size-fit", data),
};

// ---------------------------------------------------------------------------
// Bulk Product Import
// ---------------------------------------------------------------------------

export const bulkImport = {
  import: (formData: FormData) =>
    post<{ data: { imported: number; failed: number; errors?: string[] }; message: string }>("/api/v1/vendors/products/bulk-import", undefined, {
      body: formData,
    }),
};

// ---------------------------------------------------------------------------
// A/B Testing (admin)
// ---------------------------------------------------------------------------

export const abTesting = {
  list: () => get<{ data: any[] }>("/api/v1/admin/ab-tests"),
  create: (data: any) => post<{ data: any; message: string }>("/api/v1/admin/ab-tests", data),
  results: (id: string) => get<{ data: any }>(`/api/v1/admin/ab-tests/${id}/results`),
};



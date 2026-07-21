import { pgTable, text, integer, boolean, timestamp, uuid, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["customer", "vendor", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "submitted", "verified", "rejected"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "investigating", "resolved", "closed"]);
export const vendorStatusEnum = pgEnum("vendor_status", ["pending", "approved", "suspended"]);

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  avatar: text("avatar"),
  walletBalance: integer("wallet_balance").notNull().default(0),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
  kycDocType: text("kyc_doc_type"),
  kycDocUrl: text("kyc_doc_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ─── Vendor Profiles ─────────────────────────────────────────────────────────
export const vendorProfilesTable = pgTable("vendor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  shopName: text("shop_name").notNull(),
  shopDescription: text("shop_description"),
  shopLogo: text("shop_logo"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  status: vendorStatusEnum("status").notNull().default("pending"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  totalRevenue: integer("total_revenue").notNull().default(0),
  totalOrders: integer("total_orders").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVendorProfileSchema = createInsertSchema(vendorProfilesTable).omit({ id: true, createdAt: true });
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type VendorProfile = typeof vendorProfilesTable.$inferSelect;

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addressesTable = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAddressSchema = createInsertSchema(addressesTable).omit({ id: true, createdAt: true });
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addressesTable.$inferSelect;

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  color: text("color"),
  imageUrl: text("image_url"),
});

// ─── Products ────────────────────────────────────────────────────────────────
export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  images: text("images").array(),
  tags: text("tags").array(),
  isDropshipping: boolean("is_dropshipping").notNull().default(false),
  supplierUrl: text("supplier_url"),
  supplierPrice: integer("supplier_price"),
  markupPercent: integer("markup_percent").default(30),
  aiOptimized: boolean("ai_optimized").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0.00"),
  reviewCount: integer("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => usersTable.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("paystack"),
  paystackReference: text("paystack_reference"),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(2500),
  total: integer("total").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  estimatedDelivery: text("estimated_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

// ─── Order Items ─────────────────────────────────────────────────────────────
export const orderItemsTable = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => productsTable.id),
  vendorId: uuid("vendor_id").references(() => usersTable.id),
  title: text("title").notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  qty: integer("qty").notNull().default(1),
  isDropshipping: boolean("is_dropshipping").notNull().default(false),
});

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;

// ─── Transactions (Wallet) ───────────────────────────────────────────────────
export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  balanceBefore: integer("balance_before").notNull().default(0),
  balanceAfter: integer("balance_after").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsTable = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => productsTable.id),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  orderId: uuid("order_id").references(() => ordersTable.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  images: text("images").array(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

// ─── Disputes ────────────────────────────────────────────────────────────────
export const disputesTable = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  customerId: uuid("customer_id").notNull().references(() => usersTable.id),
  vendorId: uuid("vendor_id").references(() => usersTable.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: disputeStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDisputeSchema = createInsertSchema(disputesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputesTable.$inferSelect;

// ─── Wishlist ────────────────────────────────────────────────────────────────
export const wishlistTable = pgTable("wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Return Requests ─────────────────────────────────────────────────────────
export const returnRequestsTable = pgTable("return_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  customerId: uuid("customer_id").notNull().references(() => usersTable.id),
  reason: text("reason").notNull(),
  description: text("description"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  status: text("status").notNull().default("pending"),
  refundAmount: integer("refund_amount"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReturnRequestSchema = createInsertSchema(returnRequestsTable).omit({ id: true, createdAt: true });
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type ReturnRequest = typeof returnRequestsTable.$inferSelect;

// ─── Carts ────────────────────────────────────────────────────────────────────
export const cartsTable = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => cartsTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  qty: integer("qty").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("info"),
  title: text("title").notNull(),
  body: text("body"),
  isRead: boolean("is_read").notNull().default(false),
  data: text("data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Payouts ─────────────────────────────────────────────────────────────────
export const payoutsTable = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull().references(() => usersTable.id),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  reference: text("reference"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Escrows ─────────────────────────────────────────────────────────────────
export const escrowsTable = pgTable("escrows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  vendorId: uuid("vendor_id").notNull().references(() => usersTable.id),
  customerId: uuid("customer_id").notNull().references(() => usersTable.id),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("held"),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponsTable = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percentage"),
  value: integer("value").notNull(),
  minPurchase: integer("min_purchase").default(0),
  maxUsage: integer("max_usage").default(100),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Commissions ─────────────────────────────────────────────────────────────
export const commissionsTable = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  vendorId: uuid("vendor_id").notNull().references(() => usersTable.id),
  amount: integer("amount").notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commissionTiersTable = pgTable("commission_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  minOrders: integer("min_orders").notNull().default(0),
  maxOrders: integer("max_orders"),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

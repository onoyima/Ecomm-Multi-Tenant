import { db, pool } from "./index";
import {
  usersTable, vendorProfilesTable, addressesTable, categoriesTable,
  productsTable, ordersTable, orderItemsTable, transactionsTable,
  reviewsTable, disputesTable, wishlistTable, returnRequestsTable,
} from "./schema";

const PASSWORD_HASH = "$2b$10$aBIMnFU6r30iDasTCQYuP.RJlqUKBwhshbkeffVWsCcsuJop1GolK";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(returnRequestsTable);
  await db.delete(wishlistTable);
  await db.delete(disputesTable);
  await db.delete(reviewsTable);
  await db.delete(orderItemsTable);
  await db.delete(ordersTable);
  await db.delete(transactionsTable);
  await db.delete(productsTable);
  await db.delete(addressesTable);
  await db.delete(vendorProfilesTable);
  await db.delete(categoriesTable);
  await db.delete(usersTable);

  // ── Users ───────────────────────────────────────────────────
  const [customer] = await db.insert(usersTable).values({
    name: "John Doe",
    email: "customer@demo.com",
    passwordHash: PASSWORD_HASH,
    role: "customer",
    phone: "+2348012345678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
    walletBalance: 50000,
    isActive: true,
  }).returning();

  const [vendor] = await db.insert(usersTable).values({
    name: "Jane Vendor",
    email: "vendor@demo.com",
    passwordHash: PASSWORD_HASH,
    role: "vendor",
    phone: "+2348023456789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vendor",
    walletBalance: 250000,
    isActive: true,
  }).returning();

  const [vendor2] = await db.insert(usersTable).values({
    name: "Bob Supplier",
    email: "vendor2@demo.com",
    passwordHash: PASSWORD_HASH,
    role: "vendor",
    phone: "+2348034567890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vendor2",
    walletBalance: 100000,
    isActive: true,
  }).returning();

  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@demo.com",
    passwordHash: PASSWORD_HASH,
    role: "admin",
    phone: "+2348045678901",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    walletBalance: 0,
    isActive: true,
  }).returning();

  console.log(`Created ${4} users`);

  // ── Vendor Profiles ─────────────────────────────────────────
  await db.insert(vendorProfilesTable).values([
    {
      userId: vendor.id,
      shopName: "TechVibe Store",
      shopDescription: "Premium electronics and gadgets at affordable prices. We source directly from manufacturers.",
      shopLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=techvibe",
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "Jane Vendor",
      status: "approved",
      commissionRate: "10.00",
      totalRevenue: 1250000,
      totalOrders: 89,
      rating: "4.5",
    },
    {
      userId: vendor2.id,
      shopName: "FashionHub NG",
      shopDescription: "Trendy fashion and accessories for men and women. Fast delivery across Nigeria.",
      shopLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=fashionhub",
      bankName: "Access Bank",
      accountNumber: "9876543210",
      accountName: "Bob Supplier",
      status: "approved",
      commissionRate: "8.00",
      totalRevenue: 890000,
      totalOrders: 67,
      rating: "4.2",
    },
  ]);

  console.log("Created vendor profiles");

  // ── Categories ──────────────────────────────────────────────
  await db.insert(categoriesTable).values([
    { name: "Electronics", icon: "Smartphone", color: "#6366f1", imageUrl: "https://picsum.photos/seed/electronics/400/300" },
    { name: "Fashion", icon: "Shirt", color: "#ec4899", imageUrl: "https://picsum.photos/seed/fashion/400/300" },
    { name: "Home & Kitchen", icon: "Home", color: "#f59e0b", imageUrl: "https://picsum.photos/seed/home/400/300" },
    { name: "Beauty", icon: "Sparkles", color: "#a855f7", imageUrl: "https://picsum.photos/seed/beauty/400/300" },
    { name: "Sports", icon: "Trophy", color: "#10b981", imageUrl: "https://picsum.photos/seed/sports/400/300" },
    { name: "Books", icon: "BookOpen", color: "#3b82f6", imageUrl: "https://picsum.photos/seed/books/400/300" },
    { name: "Automotive", icon: "Car", color: "#ef4444", imageUrl: "https://picsum.photos/seed/automotive/400/300" },
    { name: "Health", icon: "Heart", color: "#14b8a6", imageUrl: "https://picsum.photos/seed/health/400/300" },
  ]);

  console.log("Created categories");

  // ── Products ────────────────────────────────────────────────
  const products = await db.insert(productsTable).values([
    {
      vendorId: vendor.id, title: "Wireless Bluetooth Earbuds", description: "High-quality wireless earbuds with noise cancellation, 24hr battery life, and IPX5 water resistance.", price: 15000, originalPrice: 25000, stock: 50,
      category: "Electronics", images: ["https://picsum.photos/seed/earbuds1/400/400", "https://picsum.photos/seed/earbuds2/400/400"],
      tags: ["bluetooth", "wireless", "earbuds", "audio"], rating: "4.5", reviewCount: 24, isActive: true,
    },
    {
      vendorId: vendor.id, title: "Smart Watch Pro Max", description: "Advanced smartwatch with health monitoring, GPS, 7-day battery, and AMOLED display.", price: 45000, originalPrice: 65000, stock: 30,
      category: "Electronics", images: ["https://picsum.photos/seed/watch1/400/400", "https://picsum.photos/seed/watch2/400/400"],
      tags: ["smartwatch", "fitness", "wearable"], rating: "4.3", reviewCount: 18, isActive: true,
    },
    {
      vendorId: vendor.id, title: "USB-C Hub 7-in-1", description: "Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and PD 100W charging.", price: 8500, originalPrice: 12000, stock: 100,
      category: "Electronics", images: ["https://picsum.photos/seed/usbhub1/400/400"], tags: ["usb-c", "hub", "accessories"], rating: "4.7", reviewCount: 42, isActive: true,
    },
    {
      vendorId: vendor.id, title: "Mechanical Keyboard RGB", description: "Full-size mechanical keyboard with hot-swappable switches, per-key RGB, and aluminum frame.", price: 35000, originalPrice: 50000, stock: 25,
      category: "Electronics", images: ["https://picsum.photos/seed/keyboard1/400/400", "https://picsum.photos/seed/keyboard2/400/400"],
      tags: ["keyboard", "mechanical", "rgb", "gaming"], rating: "4.8", reviewCount: 36, isActive: true,
    },
    {
      vendorId: vendor2.id, title: "Premium Cotton T-Shirt", description: "100% organic cotton t-shirt, pre-shrunk, available in multiple colors. Comfortable and durable.", price: 4500, originalPrice: 6500, stock: 200,
      category: "Fashion", images: ["https://picsum.photos/seed/tshirt1/400/400", "https://picsum.photos/seed/tshirt2/400/400"],
      tags: ["t-shirt", "cotton", "casual", "organic"], rating: "4.1", reviewCount: 56, isActive: true,
    },
    {
      vendorId: vendor2.id, title: "Classic Denim Jacket", description: "Timeless denim jacket with modern fit. Features button closure, chest pockets, and adjustable waist.", price: 25000, originalPrice: 35000, stock: 40,
      category: "Fashion", images: ["https://picsum.photos/seed/denim1/400/400", "https://picsum.photos/seed/denim2/400/400"],
      tags: ["denim", "jacket", "classic", "fashion"], rating: "4.4", reviewCount: 29, isActive: true,
    },
    {
      vendorId: vendor2.id, title: "Running Sneakers Ultra", description: "Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable outsole.", price: 32000, originalPrice: 45000, stock: 60,
      category: "Sports", images: ["https://picsum.photos/seed/sneakers1/400/400", "https://picsum.photos/seed/sneakers2/400/400"],
      tags: ["sneakers", "running", "sports", "athletic"], rating: "4.6", reviewCount: 33, isActive: true,
    },
    {
      vendorId: vendor2.id, title: "Stainless Steel Water Bottle", description: "Double-wall vacuum insulated, keeps drinks cold 24hr or hot 12hr. BPA-free, 750ml capacity.", price: 6500, originalPrice: 9500, stock: 150,
      category: "Home & Kitchen", images: ["https://picsum.photos/seed/bottle1/400/400"], tags: ["bottle", "stainless", "insulated", "eco-friendly"], rating: "4.9", reviewCount: 71, isActive: true,
    },
    {
      vendorId: vendor.id, title: "LED Desk Lamp", description: "Touch-controlled LED desk lamp with 5 brightness levels, 3 color modes, USB charging port.", price: 7500, originalPrice: 11000, stock: 80,
      category: "Home & Kitchen", images: ["https://picsum.photos/seed/lamp1/400/400"], tags: ["lamp", "led", "desk", "office"], rating: "4.2", reviewCount: 15, isActive: true,
    },
    {
      vendorId: vendor2.id, title: "Natural Shea Butter Set", description: "Organic shea butter skincare set with body cream, lip balm, and hand lotion. Cruelty-free.", price: 8500, originalPrice: 12000, stock: 90,
      category: "Beauty", images: ["https://picsum.photos/seed/shea1/400/400"], tags: ["shea butter", "skincare", "natural", "organic"], rating: "4.3", reviewCount: 48, isActive: true,
    },
  ]).returning();

  console.log(`Created ${products.length} products`);

  // ── Addresses ───────────────────────────────────────────────
  await db.insert(addressesTable).values([
    {
      userId: customer.id, label: "Home", fullName: "John Doe", phone: "+2348012345678",
      street: "42 Awolowo Road", city: "Ikeja", state: "Lagos", isDefault: true,
    },
    {
      userId: customer.id, label: "Office", fullName: "John Doe", phone: "+2348012345678",
      street: "15 Marina Street", city: "Lagos Island", state: "Lagos", isDefault: false,
    },
  ]);

  console.log("Created addresses");

  // ── Orders ──────────────────────────────────────────────────
  const [order1] = await db.insert(ordersTable).values({
    customerId: customer.id,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackReference: "PSK_REF_001",
    subtotal: 23500,
    shippingFee: 2500,
    total: 26000,
    shippingAddress: "42 Awolowo Road, Ikeja, Lagos",
    trackingNumber: "SEND-123456789",
    carrier: "Sendbox",
    estimatedDelivery: "May 20, 2026",
    notes: "Leave at gate if no one is home",
  }).returning();

  const [order2] = await db.insert(ordersTable).values({
    customerId: customer.id,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackReference: "PSK_REF_002",
    subtotal: 45000,
    shippingFee: 2500,
    total: 47500,
    shippingAddress: "42 Awolowo Road, Ikeja, Lagos",
    trackingNumber: "SEND-987654321",
    carrier: "Sendbox",
    estimatedDelivery: "May 25, 2026",
  }).returning();

  const [order3] = await db.insert(ordersTable).values({
    customerId: customer.id,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "paystack",
    paystackReference: "PSK_REF_003",
    subtotal: 32000,
    shippingFee: 2500,
    total: 34500,
    shippingAddress: "42 Awolowo Road, Ikeja, Lagos",
  }).returning();

  console.log("Created orders");

  // ── Order Items ─────────────────────────────────────────────
  const [item1] = await db.insert(orderItemsTable).values({
    orderId: order1.id, productId: products[0].id, vendorId: vendor.id,
    title: products[0].title, image: products[0].images![0], price: 15000, qty: 1,
  }).returning();

  const [item2] = await db.insert(orderItemsTable).values({
    orderId: order1.id, productId: products[2].id, vendorId: vendor.id,
    title: products[2].title, image: products[2].images![0], price: 8500, qty: 1,
  }).returning();

  await db.insert(orderItemsTable).values({
    orderId: order2.id, productId: products[3].id, vendorId: vendor.id,
    title: products[3].title, image: products[3].images![0], price: 45000, qty: 1,
  });

  await db.insert(orderItemsTable).values({
    orderId: order3.id, productId: products[4].id, vendorId: vendor2.id,
    title: products[4].title, image: products[4].images![0], price: 32000, qty: 1,
  });

  console.log("Created order items");

  // ── Transactions ────────────────────────────────────────────
  await db.insert(transactionsTable).values([
    { userId: customer.id, type: "deposit", amount: 100000, description: "Wallet top-up via Paystack", reference: "PSK_TOPUP_001", balanceBefore: 0, balanceAfter: 100000 },
    { userId: customer.id, type: "withdrawal", amount: 26000, description: "Payment for order #ORD-001", reference: "PSK_REF_001", balanceBefore: 100000, balanceAfter: 74000 },
    { userId: customer.id, type: "withdrawal", amount: 47500, description: "Payment for order #ORD-002", reference: "PSK_REF_002", balanceBefore: 74000, balanceAfter: 26500 },
    { userId: vendor.id, type: "deposit", amount: 23500, description: "Order payout - ORD-001", reference: "PAYOUT_001", balanceBefore: 250000, balanceAfter: 273500 },
    { userId: vendor.id, type: "deposit", amount: 45000, description: "Order payout - ORD-002", reference: "PAYOUT_002", balanceBefore: 273500, balanceAfter: 318500 },
  ]);

  console.log("Created transactions");

  // ── Reviews ─────────────────────────────────────────────────
  await db.insert(reviewsTable).values([
    { productId: products[0].id, userId: customer.id, orderId: order1.id, rating: 5, title: "Great earbuds!", body: "Excellent sound quality and battery life. Very comfortable for long use. Highly recommended!", isVerified: true },
    { productId: products[2].id, userId: customer.id, orderId: order1.id, rating: 4, title: "Good hub, works well", body: "Works perfectly with my MacBook. All ports function as expected. Build quality is decent.", isVerified: true },
    { productId: products[0].id, userId: vendor.id, rating: 5, title: "Top quality", body: "Amazing product for the price. The noise cancellation is surprisingly good.", isVerified: false },
  ]);

  console.log("Created reviews");

  // ── Disputes ────────────────────────────────────────────────
  await db.insert(disputesTable).values([
    {
      orderId: order1.id, customerId: customer.id, vendorId: vendor.id,
      subject: "Item not as described",
      description: "The earbuds charging case was slightly scratched on arrival. Requesting partial refund.",
      status: "open",
    },
  ]);

  console.log("Created disputes");

  // ── Wishlist ────────────────────────────────────────────────
  await db.insert(wishlistTable).values([
    { userId: customer.id, productId: products[3].id },
    { userId: customer.id, productId: products[5].id },
    { userId: customer.id, productId: products[7].id },
  ]);

  console.log("Created wishlist items");

  console.log("\n✅ Seeding complete!");
  console.log("Demo credentials:");
  console.log("  Customer: customer@demo.com / password123");
  console.log("  Vendor:   vendor@demo.com   / password123");
  console.log("  Admin:    admin@demo.com    / password123");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => pool.end());

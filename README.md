# ShopDrop — Multi-Tenant E-Commerce Platform

> **Nigeria's AI-Powered Marketplace** — A multi-tenant e-commerce and dropshipping platform targeting the Nigerian market, built with TypeScript, Express 5, Expo (React Native), and React 19 (Web).

---

## Project Structure

```
Ecomm-Multi-Tenant/
├── artifacts/
│   ├── api-server/              # Express 5 REST API backend
│   ├── mobile/                  # Expo (React Native) mobile app
│   └── mockup-sandbox/          # Vite + React 19 web app (responsive)
├── lib/
│   ├── db/                      # Drizzle ORM schema + DB connection
│   ├── api-spec/                # OpenAPI 3.1 spec + Orval codegen
│   ├── api-zod/                 # Zod schemas (auto-generated)
│   └── api-client-react/        # React Query hooks (auto-generated)
├── assets/                      # Static images and animations
├── scripts/                     # Utility scripts
├── package.json                 # Root workspace config
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.9 (strict, ES2022) |
| **Runtime** | Node.js 24 |
| **Package Manager** | npm (workspace monorepo) |
| **API Framework** | Express 5 |
| **Mobile App** | Expo 54 (React Native 0.81) |
| **Web App** | React 19 + Vite 7 + Tailwind CSS 4 |
| **Database ORM** | Drizzle ORM + PostgreSQL |
| **Validation** | Zod v4/v3, drizzle-zod |
| **API Codegen** | Orval (OpenAPI → Zod + React Query) |
| **Payments** | Paystack |
| **AI** | Google Gemini |
| **UI (Web)** | shadcn/ui + Radix UI + Lucide Icons |
| **Charts** | Recharts |

---

## Getting Started

### Prerequisites
- Node.js 24+
- npm 10+

### Install
```bash
npm install
```

### Run Mobile App (Expo)
```bash
npm run dev -w artifacts/mobile
```

### Run Web App (Desktop-Optimized)
```bash
# PowerShell
$env:PORT=5001; $env:BASE_PATH="/"; npm run dev -w artifacts/mockup-sandbox

# Or on Linux/Mac
PORT=5001 BASE_PATH=/ npm run dev -w artifacts/mockup-sandbox
```

Open [http://localhost:5001](http://localhost:5001)

### Run API Server
```bash
npm run dev -w artifacts/api-server
```

### TypeCheck
```bash
npm run typecheck
```

### Build All
```bash
npm run build
```

---

## Features

### Marketplace (Web & Mobile)
- Product browsing with category filters
- Product detail with variant selection
- Shopping cart with quantity management
- Multi-vendor product grid
- Search and sort functionality
- Responsive design (desktop-first web, native mobile)

### Multi-Vendor
- Role-based access (customer / vendor / admin)
- Vendor dashboard with revenue analytics
- Product management
- Order fulfillment with tracking
- Wallet system with deposits and withdrawals

### Admin
- Platform dashboard with revenue trends
- Vendor management and approval
- User management
- Dispute resolution
- Fraud monitoring dashboard

### Dropshipping
- Product import from supplier URL
- AI-powered product optimization
- Markup pricing engine
- Supplier management

### AI Features
- AI shopping assistant (chat)
- Product description optimization
- Product recommendations
- Visual search

### Payments & Wallet
- Paystack integration
- Wallet system (top up, withdraw, transfer)
- Pay on Delivery option
- Commission tracking

---

## Web App Architecture

The web application is built as a **responsive SPA** using:

- **Layout**: Sticky header with search bar + collapsible sidebar with role-based navigation
- **Pages**: Landing, Login/Register, Marketplace, Product Detail, Cart, Orders, Wallet, Vendor Dashboard, Admin Dashboard
- **State**: React Context for auth and cart
- **Data**: Mock data layer (ready for backend integration)
- **Styling**: Tailwind CSS v4 with CSS variables for light/dark themes matching the ShopDrop brand colors

The web app is **desktop-first** with responsive breakpoints for tablet and mobile, unlike the mobile app which is mobile-native via Expo.

### Key Web Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/landing` | Hero section with product showcase |
| Marketplace | `/marketplace` | Product grid with categories, trending, featured |
| Product Detail | `/product/:id` | Full product view with variants and add-to-cart |
| Cart | `/cart` | Shopping cart with order summary |
| Orders | `/orders` | Order history with status tabs |
| Wallet | `/wallet` | Balance, top-up, transaction history |
| Vendor Dashboard | `/vendor` | Revenue charts, products, stock alerts |
| Admin Dashboard | `/admin` | Platform stats, vendor management, disputes |

---

## Mobile App

The mobile app is built with **Expo Router** (file-based routing) and shares the same mock data patterns as the web app. It includes:

- Role-specific route groups: `(customer)/`, `(vendor)/`, `(admin)/`
- Auth flow with guest checkout
- Recently viewed products tracking
- Flash sales with countdown timer
- Low stock alerts
- Currency selector (NGN/USD/GBP/EUR)
- Shipping zones management
- Delivery confirmation (camera + signature)
- Product comparison
- Referral program
- Loyalty rewards
- AI chat assistant

---

## Multi-Tenancy Model

The platform uses a **vendor-as-a-tenant** model:

- Users have roles: `customer`, `vendor`, `admin`
- `vendor_id` is the tenant discriminator on `products`, `order_items`, and `vendor_profiles`
- Role-based route isolation in both web and mobile apps
- Vendor application → admin approval workflow

---

## Database Schema (12 Tables)

Users, Vendor Profiles, Addresses, Categories, Products, Orders, Order Items, Transactions, Reviews, Disputes, Wishlist, Return Requests

---

## Blueprint Coverage

| Phase | Status |
|-------|--------|
| **Phase 1** (MVP — Single vendor, basic products, Paystack, basic AI) | ~80% complete |
| **Phase 2** (Multi-vendor, wallet, dropshipping, vendor dashboard) | ~60% complete |
| **Phase 3** (Advanced AI, POD, full dropshipping automation, real-time) | ~10% complete |
| **Phase 4** (Mobile apps, fraud detection, international, API marketplace) | ~20% complete |

---

## Demo Credentials

| Role | Email |
|------|-------|
| Customer | customer@demo.com |
| Vendor | vendor@demo.com |
| Admin | admin@demo.com |
| Guest | (click "Continue as Guest") |

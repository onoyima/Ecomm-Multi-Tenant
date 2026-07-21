# ShopDrop — Multi-Tenant E-Commerce Platform

## Overview

**ShopDrop** is a multi-tenant e-commerce and dropshipping platform targeting the Nigerian market. It is a TypeScript monorepo (npm workspaces) with three deployable artifacts and three shared internal libraries.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.9 (strict, ES2022) |
| Runtime | Node.js 24 |
| Package Manager | npm (workspace monorepo) |
| API Framework | Express 5 |
| Mobile App | Expo 54 (React Native 0.81.5) |
| Database ORM | Drizzle ORM 0.45 + PostgreSQL |
| Validation | Zod v4/v3, drizzle-zod |
| API Codegen | Orval 8.5 (OpenAPI → Zod + React Query) |
| Payments | Paystack |
| AI | Google Gemini |
| Build Tools | esbuild (API), Vite 7 (web preview) |

---

## Project Structure

```
Ecomm-Multi-Tenant/
├── artifacts/
│   ├── api-server/          # Express 5 REST API backend
│   ├── mobile/              # Expo (React Native) mobile app
│   └── mockup-sandbox/      # Vite + React component preview server
├── lib/
│   ├── db/                  # Drizzle ORM schema + DB connection
│   ├── api-spec/            # OpenAPI 3.1 spec + Orval codegen
│   ├── api-zod/             # Zod schemas (auto-generated from OpenAPI)
│   └── api-client-react/    # React Query hooks (auto-generated from OpenAPI)
├── assets/                  # Static images and animations
├── attached_assets/         # Design docs and screenshots
├── scripts/                 # Utility scripts
└── config files             # tsconfig*.json, etc.
```

---

## Architecture

### Monorepo with Shared Libs

The project is organized as an **npm workspace** with 7 packages. Shared logic lives in `lib/` and is consumed by the deployable artifacts in `artifacts/`.

### API-First with Codegen

The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth. Orval generates:

- **Zod validation schemas** → `@workspace/api-zod`
- **React Query hooks + fetch client** → `@workspace/api-client-react`

### Mock-Driven Development

The API server currently uses **in-memory mock data** (users, products, orders) to enable rapid development without a live PostgreSQL instance. The database schema is fully defined in Drizzle ORM and ready for production.

---

## Database Schema (12 Tables)

6 enums: `role`, `kyc_status`, `order_status`, `payment_status`, `dispute_status`, `vendor_status`

| Table | Purpose |
|---|---|
| **users** | Core user entity with wallet balance and KYC |
| **vendor_profiles** | Vendor-specific data (shop info, bank details, commission, revenue) |
| **addresses** | User shipping addresses |
| **categories** | Product categories |
| **products** | Core product with dropshipping support (supplier_url, markup_percent) |
| **orders** | Order with payment, shipping, and tracking info |
| **order_items** | Line items per order (vendor-aware) |
| **transactions** | Wallet transactions ledger |
| **reviews** | Product reviews |
| **disputes** | Order disputes and resolution |
| **wishlist** | User wishlist |
| **return_requests** | Return/refund requests |

---

## API Endpoints

All routes are mounted under `/api`. Key groups:

- **Auth** — register, login, me, logout (JWT-based)
- **Products** — CRUD, listing with filters/pagination, AI optimization
- **Orders** — CRUD, status updates, cancellation, tracking timeline
- **Payments** — Paystack initialize, verify, webhook
- **Wallet** — balance, transactions, topup, withdraw, transfer
- **Vendors** — apply, approve/reject/suspend, stats
- **Admin** — dashboard, users, disputes, revenue analytics
- **Shipping** — rates, tracking, zones (Nigeria)
- **Reviews** — list by product, submit
- **AI** — chat assistant, product recommendations, optimize listing

---

## Multi-Tenancy Model

The platform uses a **vendor-as-a-tenant** model:

- Users have roles: `customer`, `vendor`, `admin`
- `vendor_id` (FK to `users.id`) is the tenant discriminator on `products`, `order_items`, and `vendor_profiles`
- Vendor application → admin approval flow with commission rate configuration
- Role-based route isolation in the mobile app via Expo Router file groups: `(customer)/`, `(vendor)/`, `(admin)/`

---

## Auth & Authorization

- **JWT tokens** signed with `jsonwebtoken`, payload: `{ userId, email, role }`
- **Middleware**: `authenticate` (verifies Bearer token), `requireRole(...)` (role gate)
- **Mobile**: `AuthContext` manages state, tokens in AsyncStorage, auto-injected into API calls

---

## Mobile App (Expo/React Native)

- **Routing**: Expo Router (file-based in `app/` directory)
- **State**: React Context for auth/cart, React Query for server data
- **Styling**: Custom 24-token theme with light/dark mode
- **Role-Specific Screens**:
  - Customer: home, search, cart, wishlist, checkout, wallet, AI chat
  - Vendor: dashboard, products management, dropshipping import, orders, earnings
  - Admin: platform dashboard, vendor/user management, dispute resolution

---

## Component Preview Server

A Vite + React + Tailwind CSS 4 + Radix UI environment (`mockup-sandbox`) that renders isolated component previews at `/preview/ComponentName`. Used as a design playground with 60+ UI primitives.

---

## Key Features

- **Dropshipping**: Products can be flagged with supplier URL, cost, and vendor markup
- **AI Integration**: Google Gemini for product description optimization, recommendations, and customer chat
- **Paystack Payments**: Initialize, verify, and webhook handling for Nigerian payments
- **Wallet System**: Internal wallet with topup, withdraw, and transfer between users
- **Dispute Resolution**: Customer → vendor dispute flow with admin escalation
- **KYC**: Document upload and verification for vendors

# ShopDrop — Multi-Tenant Ecommerce Platform

Multi-tenant ecommerce platform with marketplace, dropshipping, escrow, and AI-powered features.

## Run & Operate

- `cd artifacts/backend && php artisan serve --port=8000` — run the Laravel API server
- `php artisan migrate --seed` — run migrations and seed database
- `php artisan route:list` — view all registered API routes
- Required env: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — or `DATABASE_URL`

## Stack

- Frontend: React (webapp) + React Native (mobile), TypeScript
- Backend: Laravel 11, PHP 8.2+
- Database: PostgreSQL + Eloquent ORM
- Auth: Laravel Sanctum (token-based)
- API: RESTful under `/api/v1/...`
- Middleware: CamelCase response transformation, tenant isolation, role-based access

## Where things live

- `artifacts/backend/` — Laravel application (API controllers, models, migrations, seeders)
- `artifacts/webapp/` — React web frontend
- `artifacts/mobile/` — React Native mobile app
- `lib/api-client-react/` — shared API client (`client.ts` + Orval-generated types)
- `lib/db/` — Drizzle ORM schema (legacy, see Laravel migrations for source of truth)

## Architecture decisions

- **Laravel backend**: Laravel is the sole API server. All API logic lives in controllers under `artifacts/backend/`. The Express server (`artifacts/api-server/`) has been removed.
- **Sanctum token auth**: Both web and mobile frontends store bearer tokens and attach via `setAuthTokenGetter` — compatible with Laravel Sanctum.
- **CamelCase responses**: `CamelCaseResponse` middleware converts snake_case DB columns to camelCase in all JSON responses.
- **Seeders are the source of truth**: 9 seeders produce comprehensive demo data (35 products, orders, escrows, fraud alerts, etc.) matching frontend mock expectations.

## Product

- Multi-vendor marketplace with vendor onboarding
- Shopping cart, wishlist, orders with full lifecycle
- Wallet system with topup, withdraw, and transfer
- Escrow service for secure transactions
- Dropshipping request management
- AI-powered product optimization and fraud scoring
- Role-based access (customer, vendor, admin)

## Gotchas

- The Drizzle ORM schema (`lib/db/`) is abandoned — Laravel migrations are the source of truth
- Passwords in seeders use bcrypt hash of "password" — all demo accounts share this password
- Cart route in Laravel is `POST /api/v1/cart/add` (not `/cart/items`)
- The old Express server (`artifacts/api-server/`) has been removed entirely

## Pointers

- See `artifacts/backend/routes/api.php` for all registered API routes
- See `artifacts/backend/database/seeders/` for demo data

# Hybrid Ethiopian Restaurant Ordering System

A dependency-light Next.js App Router restaurant ordering app for an Ethiopian restaurant. The UI supports direct pickup ordering, dine-in table ordering, admin menu/settings controls, and a kitchen display preview. The backend uses MongoDB/Mongoose models and Stripe Checkout.

## Features

- TypeScript + Tailwind CSS App Router application
- Customer ordering UI in `app/page.tsx`
- MongoDB/Mongoose models for menu items, settings, and orders
- Stripe Checkout for pickup prepaid orders (`mode: payment`)
- Stripe Checkout for dine-in pay-later orders (`mode: setup`) so restaurants can keep a card on file and collect later
- Stripe webhook to update order payment status
- Admin menu, settings, and order APIs
- Seed endpoint for default Ethiopian menu and restaurant settings

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

3. Fill in `.env.local`:

   - `MONGODB_URI`: MongoDB connection string.
   - `MONGODB_DB`: Optional database name.
   - `STRIPE_SECRET_KEY`: Stripe secret key.
   - `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
   - `ADMIN_API_TOKEN`: Shared token for admin routes. Send it as `x-admin-token` or `Authorization: Bearer <token>`.
   - `NEXT_PUBLIC_BASE_URL`: Local or production URL used by Stripe success/cancel redirects.

4. Run the app:

   ```bash
   npm run dev
   ```

5. Seed the database:

   ```bash
   curl -X POST http://localhost:3000/api/seed \
     -H "x-admin-token: replace-with-a-long-random-admin-token"
   ```

6. Refresh the home page after seeding. Checkout buttons use database-backed menu item IDs once `/api/menu` returns seeded menu items.

## Stripe webhook setup

For local development, forward Stripe events to the App Router webhook route:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

Relevant events:

- `checkout.session.completed`: marks prepaid pickup orders as `paid`; keeps dine-in setup/pay-later orders as `unpaid`.
- `checkout.session.expired`: marks pending checkout orders as `failed`.

## API overview

### Public

- `GET /api/menu` — available menu items.
- `POST /api/orders` — creates an order without Stripe redirect.
- `POST /api/checkout` — creates an order and Stripe Checkout session.

### Admin

All admin endpoints require `ADMIN_API_TOKEN` when configured.

- `GET /api/admin/menu` — list all menu items.
- `POST /api/admin/menu` — create a menu item.
- `PATCH /api/admin/menu/:id` — update menu item fields.
- `DELETE /api/admin/menu/:id` — delete a menu item.
- `GET /api/admin/settings` — read restaurant settings.
- `PUT /api/admin/settings` — update restaurant settings.
- `GET /api/admin/orders` — list recent orders.
- `PATCH /api/admin/orders/:id` — update order/payment status.
- `POST /api/seed` — create default settings and sample Ethiopian menu items.

## Checkout payload example

```json
{
  "orderType": "pickup",
  "paymentMode": "prepaid",
  "customerName": "Aster",
  "customerEmail": "aster@example.com",
  "pickupTime": "ASAP",
  "items": [
    { "menuItemId": "662000000000000000000001", "quantity": 2 }
  ]
}
```

Use `orderType: "dine-in"`, `paymentMode: "pay-later"`, and `tableNumber` for dine-in tabs.

## Production notes

- Configure Stripe webhook signing in production and keep the webhook route on the Node.js runtime.
- Set a strong `ADMIN_API_TOKEN`; for a full production admin dashboard, replace this shared token with proper user auth and roles.
- Keep menu item prices in MongoDB as the source of truth. The checkout route rebuilds totals from database menu prices rather than trusting client totals.

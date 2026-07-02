# ShopSphere — Smart E-Commerce Admin & Order Management System

ShopSphere is a full-stack e-commerce management platform built with Next.js (App Router, TypeScript, Tailwind CSS) and Supabase. It features a dual-portal architecture separating the customer-facing storefront from the secure administrator dashboard, supported by real-time inventory management, transactional shopping cart checkout, and dynamic business metrics tracking.

---

## 🚀 Key Features

### 🛒 Customer Storefront Portal (`/store`)
* **Live Product Catalog:** Displays active items with titles, categories, pricing, ratings, and real-time stock levels.
* **Persistent Shopping Cart:** An interactive slide-over cart drawer that maintains item quantities using browser local storage.
* **Database Checkout Integration:** Deducts product stock levels on order placement and creates corresponding entries in the admin order database.
* **User Accounts:** A unified sign-in/sign-up screen with automatic database synchronization to client profiles.

### 🛡️ Administrator Portal (`/`)
* **KPI Metrics Board:** Aggregates live gross revenue, total orders placed, product catalog sizes, and critical stock alarms.
* **Chronological Analytics:** Displays charts representing sales volume (via Recharts).
* **Inventory Control:** Lists products running low (stock $\le$ 5) with quick routes to update details.
* **Order Management Dashboard:** Enables order status transitions (`Pending` $\rightarrow$ `Packed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`) with stock verification checks.

---

## 📁 Directory Structure

```
shopsphere/
├── frontend/                   # Next.js Frontend & API Project
│   ├── app/                    # Routing page templates and layouts
│   │   ├── (dashboard)/        # Protected admin panels
│   │   ├── api/                # Invoice generation endpoints
│   │   ├── store/              # Client storefront pages
│   │   └── login/              # Unified gateway routes
│   ├── components/             # Reusable UI controls (Input, Button, Select)
│   ├── hooks/                  # Custom utility wrappers (e.g. useDebounce)
│   ├── lib/                    # Supabase Client & Server initializations
│   ├── types/                  # TypeScript interface definitions
│   └── .env.local              # Local environment credentials
├── backend/                    # Relational Database Assets
│   ├── database/               # SQL migration schema & RLS policy files
│   └── scripts/                # Database seed and confirmation utilities
├── package.json                # Root CLI runner (Delegates to frontend/)
└── README.md                   # Setup & running instructions manual
```

---

## 🛠️ Local Development & Setup Guide

### 1. Prerequisites
* **Node.js:** Ensure Node.js ($\ge$ v18.0) is installed.
* **Supabase Account:** Create a project at [supabase.com](https://supabase.com).

### 2. Configure Environment Variables
Inside the `frontend/` directory, create a `.env.local` file containing the following variables:

```env
# Supabase API Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct PostgreSQL connection (used for migrations)
DATABASE_URL=postgresql://postgres.your-project-id:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### 3. Provision Database Tables
Go to your **Supabase Dashboard** -> **SQL Editor**, and execute the SQL migration scripts in this order:
1. Paste and run the contents of [backend/database/schema.sql](file:///c:/Users/Lenovo/OneDrive/Documents/shopsphere%20project%202/backend/database/schema.sql) to initialize tables, relations, and indexes.
2. Paste and run [backend/database/add_ratings.sql](file:///c:/Users/Lenovo/OneDrive/Documents/shopsphere%20project%202/backend/database/add_ratings.sql) to apply catalog rating schemas.
3. Paste and run [backend/database/rls_policies.sql](file:///c:/Users/Lenovo/OneDrive/Documents/shopsphere%20project%202/backend/database/rls_policies.sql) to enable Row-Level Security.

### 4. Configure Authentication Options
To simplify local developer testing and bypass standard email verification:
1. Go to your **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Email**.
2. Toggle **OFF** the **"Confirm email"** option.
3. Click **Save**.

### 5. Install Dependencies & Build
Install all frontend dependencies directly from the root project directory:
```bash
npm install --prefix frontend
```

### 6. Run the Project
Start the Next.js development server from the root of the project:
```bash
# Windows PowerShell / CMD / Git Bash / Mac Terminal
npm run dev
```

* **Customer Storefront Portal:** [http://localhost:3000/store](http://localhost:3000/store)
* **Administrator Portal:** [http://localhost:3000/](http://localhost:3000/)

---

## 🗄️ Database Seeding Scripts

We have provided REST API-based node scripts in `backend/scripts/` to seed testing data without requiring direct TCP socket database exposure (ideal for restricted networks):

* **Create Default Accounts:** Creates verified admin (`admin@shopsphere.com` / `admin123`) and customer (`customer@example.com` / `customer123`) credentials.
  ```bash
  node backend/scripts/create_users.js
  ```
* **Seed Product Images:** Uploads premium, high-resolution visual listings to the products catalog.
  ```bash
  node backend/scripts/insert_via_api.js
  ```
* **Manually Confirm a User Email:** Auto-confirms any specific email registration (e.g. `tejakarthi65@gmail.com`) instantly.
  ```bash
  node backend/scripts/confirm_user.js
  ```

---

## 🌐 Production Deployment (Vercel)

When deploying to Vercel:
1. Link your GitHub repository.
2. Under **Project Settings**, configure:
   * **Root Directory:** Set this to `frontend`.
   * **Framework Preset:** Next.js.
3. Copy all keys from your local `frontend/.env.local` to Vercel's **Environment Variables** panel.
4. Click **Deploy**.

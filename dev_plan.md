# ShopSphere – Development Plan

This document outlines the step-by-step development roadmap for ShopSphere. It divides the project into sequential phases, ensuring dependencies are resolved in the correct build order (database & auth first, then catalog management, order processing, and finally analytics and security hardening).

---

## Phase 0: Project Setup & Environment Initialization
- **Objective**: Establish the repository framework, setup libraries, configure environment variables, and verify local build runs.
- **Features to Implement**:
  - Initialize Next.js 14+ app (App Router, Tailwind CSS, TypeScript).
  - Install core packages (`@supabase/supabase-js`, Lucide React for icons, Recharts for dashboard analytics).
  - Set up configuration profiles (`.env.local` containing Supabase URL, anon key, and service role key).
  - Configure the base layouts and font variables (Inter font family).
- **Dependencies**: None.

---

## Phase 1: Database Schema & Supabase Provisioning
- **Objective**: Deploy the relational PostgreSQL schema and provision file storage buckets in Supabase.
- **Features to Implement**:
  - Run database migration scripts to create tables: `products`, `customers`, and `orders`.
  - Apply table constraints, unique keys (e.g. customer email), and performance indexes.
  - Create the `product-images` storage bucket in Supabase and set public access configurations.
- **Dependencies**: Phase 0.

---

## Phase 2: Authentication & Route Protection
- **Objective**: Construct the authentication gateway and protect internal routes using middleware check tokens.
- **Features to Implement**:
  - Login page layout (`/login`) with responsive styling.
  - Integration with Supabase Auth (`signInWithPassword` client call).
  - Next.js Edge Middleware route guarding to intercept requests targeting `/` (dashboard), `/products`, `/orders`, and `/customers`, redirecting unauthorized users to `/login`.
  - Sign-out button trigger on layout components.
- **Dependencies**: Phase 1 (database setup).

---

## Phase 3: Core Catalog & Product Management
- **Objective**: Construct catalog views and support CRUD actions, including image media uploads.
- **Features to Implement**:
  - Main product management grid (`/products`) showing name, status, categories, prices, and stock counters.
  - Client-side search and category filtering with input debouncing.
  - Create product form with dynamic upload of images to Supabase storage.
  - Edit product interface pre-populating fields.
  - Delete operation with warning check.
- **Dependencies**: Phase 2 (requires login verification and sidebar layouts).

---

## Phase 4: Customer Directory & Detail Tracking
- **Objective**: Enable access to client profiles and purchase history records.
- **Features to Implement**:
  - Customer directory page (`/customers`) displaying basic demographic details.
  - Search bar query matching database records.
  - Details slider drawer that pulls total customer purchases, total expenditures (LTV), and detailed order log.
- **Dependencies**: Phase 2.

---

## Phase 5: Order Processing & Invoice Fulfillment
- **Objective**: Track, fulfill, and output financial records for orders.
- **Features to Implement**:
  - Orders overview console (`/orders`) showcasing transactions, costs, dates, and status.
  - Dynamic order status progression logic (`Pending` -> `Packed` -> `Shipped` -> `Delivered`).
  - Next.js API Route generating invoice PDFs.
- **Dependencies**: Phase 3 (products) and Phase 4 (customers).

---

## Phase 6: Admin Dashboard & Business Analytics
- **Objective**: Aggregate sales statistics, highlight stock warnings, and output interactive data charts.
- **Features to Implement**:
  - Dashboard analytics view (`/`) displaying KPI summary cards (Revenue, Orders, Products, Alerts).
  - Chronological revenue charts (Recharts) filterable by intervals (7 days, 30 days, 1 year).
  - Low stock visual list table tracking critical inventory items.
  - AI predictions card UI element (preparing data payload interfaces).
- **Dependencies**: Phase 3, Phase 4, and Phase 5.

---

## Phase 7: Row-Level Security (RLS) & Production Readiness
- **Objective**: Restrict database direct tables access and configure production deployments.
- **Features to Implement**:
  - Write SQL migrations enabling Row-Level Security (RLS) policies on all tables, limiting read/write access strictly to authenticated admins.
  - Configure production variables and build configurations.
  - Deploy frontend to Vercel and backend configurations to production Supabase instances.
- **Dependencies**: Phase 6.

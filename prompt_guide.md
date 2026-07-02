# ShopSphere – AI Coding Agent Prompt Guide

This document contains a set of structured developer prompts designed to guide an AI coding agent to implement ShopSphere step-by-step. It covers all development phases, outlining precise technical requirements, rules, and common mistakes to avoid.

---

## General Rules for the Coding Agent

When executing any of the phase prompts, you must adhere to the following rules:

1. **Keep Code Clean & Self-Documented**: Use TypeScript interfaces, write descriptive variable and function names, and document complex logical operations.
2. **Prioritize Reusability**: Extract shared layout elements, UI elements (buttons, inputs, select panels, tables), and hooks into modular files under `/components/ui/` or `/hooks/`.
3. **Ensure Full Responsiveness**: Implement mobile-first layouts using Tailwind CSS. UI must look stunning on mobile screens up to wide desktops.
4. **Use Premium Aesthetics**: Dark mode by default using slate-900 backgrounds, glowing neon borders/accents, and semi-transparent cards with smooth backdrop filters (glassmorphism).
5. **No Placeholders**: Build fully functioning code. If database functions, endpoints, or mock datasets are needed, write working implementations.
6. **Integrate Sequentially**: Do not skip phases. Each phase must verify that it fits into and utilizes the code written in preceding phases.

---

## Common Mistakes to Avoid

1. **Hardcoding Mock Data in Production**: Avoid leaving mock items in production files. Mock data should be segregated or seeded into Postgres.
2. **Ignoring Database Constraints**: Do not perform client-side math that overwrites DB constraints. Ensure backend schema is the single source of truth (e.g. price calculations, stock updates).
3. **State Sync Discrepancies**: Ensure database changes (like changing order status or adding products) dynamically refresh parent components without requiring full page reloads. Use React State, Next.js Server Actions revalidation, or React Query.
4. **Weak Error Handling**: Avoid empty `catch` blocks. All failures (network, query, validation) must trigger a toast notification or display an error state.
5. **Bypassing Route Guards**: Ensure middleware checks are robust and cannot be skipped by manually editing local storage or browser cookies.

---

## Phase Prompts

### Phase 0 Prompt: Project Setup & Environment Initialization
```text
Context: You are building "ShopSphere", a premium full-stack e-commerce admin and order management system. The stack is Next.js (App Router, Tailwind CSS, TypeScript) and Supabase.

Task: Set up the initial codebase, folders, dependencies, and environment configurations.

Requirements:
1. Initialize the project directory with Next.js 14+ using TypeScript and Tailwind CSS.
2. Structure folders as follows:
   - /app: Routing and pages
   - /components: Shared components and ui controls
   - /lib: Config variables and client providers
   - /types: TypeScript declarations
3. Install dependencies: @supabase/supabase-js, lucide-react, recharts.
4. Create the config files:
   - Set up `.env.local` to store:
     NEXT_PUBLIC_SUPABASE_URL=
     NEXT_PUBLIC_SUPABASE_ANON_KEY=
     SUPABASE_SERVICE_ROLE_KEY=
5. Initialize the main design system in `app/globals.css` with a sleek dark theme (slate-900 background, glassmorphic card overlays, custom scrollbars, and vibrant accents). Ensure standard fonts (Inter) are imported and defined.
6. Verify local development configuration builds without errors.
```

### Phase 1 Prompt: Database Schema & Supabase Provisioning
```text
Context: You are working on ShopSphere. Phase 0 (Next.js & configuration) is successfully initialized.

Task: Provision the Postgres database tables, relationships, and the static assets storage bucket on Supabase.

Requirements:
1. Create the relational database tables with exact fields, primary/foreign keys, and constraints:
   - `products`: product_id (UUID PK), name (text), price (numeric >= 0), category (text), stock (int >= 0), status (text: Active/Draft/Out of Stock), image_url (text), created_at (timestamp).
   - `customers`: customer_id (UUID PK), name (text), email (text, unique), phone (text), address (text), created_at (timestamp).
   - `orders`: order_id (UUID PK), customer_id (FK -> customers), product_id (FK -> products), quantity (int > 0), status (text: Pending/Packed/Shipped/Delivered), total_amount (numeric >= 0), order_date (timestamp).
2. Write SQL scripts to apply database performance indexes on commonly queried fields: `products(category)`, `products(status)`, `orders(customer_id)`, and `orders(status)`.
3. Create a Supabase Storage bucket named `product-images` and configure it to allow public read access for serving static files.
4. Write down the SQL scripts and verify they run against the Supabase SQL editor. Export a DB schema overview or typescript interfaces matching the database tables.
```

### Phase 2 Prompt: Authentication & Route Protection
```text
Context: ShopSphere database and basic layout are ready (Phases 0-1).

Task: Implement the Admin Login screen and secure internal dashboard routes.

Requirements:
1. Design a premium, fully responsive login page at `/login`. Use glassmorphism layouts, clean inputs, and focus effects.
2. Set up the client-side Supabase authentication config in `lib/supabase/client.ts`.
3. Implement credentials login logic calling `supabase.auth.signInWithPassword()`. If login fails, display descriptive toast warnings.
4. Implement a Next.js Edge Middleware file (`middleware.ts`) at the root level:
   - Check user session cookies on every request.
   - Guard all dashboard paths: `/`, `/products`, `/orders`, `/customers`.
   - If no valid session token exists, redirect the browser instantly to `/login`.
5. Create a universal layout header dashboard element containing a functional "Logout" button. Clicking logout terminates the Supabase session and redirects the browser back to `/login`.
```

### Phase 3 Prompt: Core Catalog & Product Management
```text
Context: ShopSphere has database, authentication, and layout routes secured (Phases 0-2).

Task: Build the Product Listing catalog and CRUD operations.

Requirements:
1. Create `/products/page.tsx` displaying products inside a responsive grid or modern data table:
   - Columns: Image, Name, Price, Category, Stock count, Status badge, Actions (Edit/Delete).
2. Build real-time search inputs and category filters. Implement a custom debounce hook to avoid excessive API requests.
3. Build the "Add Product" form:
   - Input fields: Name, Price, Category, Stock, Status.
   - File selector: Captures images, uploads them to the `product-images` bucket using Supabase Storage client, generates a public URL, and saves it in the database row.
4. Build the "Edit Product" modal, loading product data and saving changes back to the server.
5. Build the "Delete Product" utility:
   - Prompt the user with a warning dialog box.
   - Catch foreign key conflict exceptions (if the product is in an order) and output a clean UI message warning the user to change status to "Draft/Out of Stock" instead of hard deletion.
```

### Phase 4 Prompt: Customer Directory & Detail Tracking
```text
Context: Products CRUD and login guard are deployed (Phases 0-3).

Task: Build the Customer Registry directory and profile detail views.

Requirements:
1. Create `/customers/page.tsx` displaying registered users in a responsive table (Name, Email, Phone, Signup Date).
2. Implement search matching user queries against client names, emails, and phone numbers.
3. Build a sliding slide-out detail drawer component:
   - When a row is clicked, open the drawer.
   - Fetch customer aggregate stats: Total orders placed, Lifetime spend (LTV).
   - Render a list containing all past orders placed by this customer (order ID, date, status, value). Make each order clickable to direct to the order details.
4. Ensure data loading is lazy and paginated if the customer has large purchase counts.
```

### Phase 5 Prompt: Order Processing & Invoice Fulfillment
```text
Context: Products and Customers systems are operational (Phases 0-4).

Task: Build the Orders dashboard console, fulfillment triggers, and invoice generator.

Requirements:
1. Build `/orders/page.tsx` displaying current transactions (Order ID, Customer Name, Items, Value, Date, Status Badge).
2. Implement order fulfillment updates:
   - Status badge dropdown (Pending -> Packed -> Shipped -> Delivered).
   - Enforce linear stage progressions; display alert verification on deviations.
   - Verify stock levels before advancing status to Shipped, raising warning dialogs if inventory is insufficient.
3. Build a Next.js backend endpoint (`/api/invoice/[orderId]`) using a PDF layout library (like PDFKit, Puppeteer, or canvas generation) to compile dynamic order details, prices, tax breakdowns, and generate a downloadable PDF.
4. Provide a "Download Invoice" button on the UI that downloads the generated PDF with format `Invoice_ORDERID.pdf`.
```

### Phase 6 Prompt: Admin Dashboard & Business Analytics
```text
Context: CRUD tables and Order fulfillment are completed (Phases 0-5).

Task: Build the Dashboard analytics view with metric charts and low stock warning alerts.

Requirements:
1. Design the main landing page `/` (dashboard home) with metric visual indicator cards:
   - Total Gross Revenue (Sum of all completed orders value)
   - Total Orders (Count of database entries)
   - Product Catalog Size (Count of products)
   - Active low stock alarms
2. Create an interactive sales performance chart (using Recharts line/area charts):
   - Toggle options: Last 7 Days, Last 30 Days, Year-to-Date.
   - Include tooltips showing date, revenue amount, and transaction counts.
3. Build the "Low Stock alerts" widget listing items with stock levels <= 5. Provide direct links next to each item routing to that product's edit page.
4. Add an AI forecasting UI template section showcasing stock-out predictions based on average order velocities.
```

### Phase 7 Prompt: Row-Level Security (RLS) & Production Readiness
```text
Context: All functional pages are implemented (Phases 0-6).

Task: Apply Row-Level Security (RLS) policies and deploy the application.

Requirements:
1. Set up SQL migrations applying database restrictions:
   - Enable Row-Level Security (RLS) on `products`, `customers`, and `orders`.
   - Implement policies restricting read, create, update, and delete access strictly to authenticated admin users (`auth.role() = 'authenticated'`).
2. Implement global error boundary catch pages handling network crashes or server timeouts gracefully.
3. Verify production building processes (`npm run build`) runs without warnings or type checking errors.
4. Deploy the frontend framework to Vercel and production databases to Supabase, validating environment configurations.
```

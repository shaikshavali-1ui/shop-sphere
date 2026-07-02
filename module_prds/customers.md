# Module 4: Customer Management

## 1. Module Overview
The Customer Management module provides store admins with visibility into customer demographics, contact information, and customer lifetime value (LTV). It displays comprehensive purchase histories, supporting client query resolution and marketing analysis.

## 2. Features in this Module
- **Customer Directory Grid**: Dashboard listing customer name, email address, contact numbers, and location details.
- **Customer Details Drawer**: Expandable profile viewport detailing customer history, including a record of all orders placed, aggregate expenditure, and date of first purchase.
- **Search & Query Capabilities**: Multi-attribute query index searching client records via matching name, email, or telephone.

## 3. User Interactions
- **Browse Customers**: Admin navigates to `/customers`, browsing list. Standard sorting enables sorting by signup date or alphabetical names.
- **Look up Client Profile**:
  1. Admin typing "John" inside filter bar dynamically filters customer registry.
  2. Clicks on John Doe's row entry.
  3. Visual side-drawer shifts into screen from the right.
  4. Drawer exhibits:
     - Name, email, phone number, address.
     - Metrics cards: Total lifetime orders (e.g. 5 orders), Total spend (e.g. $450.00).
     - Sub-table containing order IDs, dates, and fulfillment status, with links redirecting directly to each order.

## 4. Data Requirements
- **Customers Schema Fields**:
  - `customer_id` (UUID, primary key, auto-generated)
  - `name` (string, max 255, required)
  - `email` (string, unique check, standard format, required)
  - `phone` (string, optional, standard regex check)
  - `address` (text block containing street, state, zip/postcode, country, optional)
  - `created_at` (timestamp with timezone, auto-now)

## 5. API Requirements (High Level)
- **Supabase DB Calls**:
  - `GET /customers`: Returns array of customer entries matching text queries.
  - `GET /orders?customer_id=eq.[id]`: Queries relational database schema to fetch order history corresponding to specified customer.
  - `GET /customers/metrics/[id]`: Computes aggregate sum values of completed transactions for selected user (optional, can be resolved using client aggregates or sql views).

## 6. Edge Cases
- **Duplicate Customer Register Attempts**: System intercepts and blocks duplicate email insertion during admin manual creation, prompting "A customer with this email is already registered."
- **Incomplete / Poorly Formatted Addresses**: Customer registers with unstructured, empty, or illegible shipping details -> Order detail cards highlight "Warning: Customer address is missing or incomplete" during checkout processing.
- **Massive Purchase Histories**: Customer with 1,000+ purchases -> Customer drawer paginates purchase records or loads them lazily on scroll to avoid slowing down dashboard responsiveness.
- **Information Deletion (GDPR/Privacy Rights)**: Admin requests deletion of a customer -> Handle database cascading rules. Order records must anonymize customer details rather than hard-deleting the entire transaction history, which would skew business accounting and revenue tracking.

# Module 3: Order & Fulfillment Management

## 1. Module Overview
The Order & Fulfillment Management module provides interface and control systems for processing customer transactions. Admins view, sort, update progress status of purchases, and generate downloadable invoices.

## 2. Features in this Module
- **Order Management Console**: Comprehensive grid listing order UUID, customer identification, items purchased, aggregate cost, status indicators, and transaction date.
- **Order Status Update Trigger**: Easy dropdown elements on table rows or details cards to advance orders along the processing pipeline (`Pending` -> `Packed` -> `Shipped` -> `Delivered`).
- **Invoice Generation Utility**: Automatic compilation of dynamic invoice PDFs containing customer information, purchase tallies, tax calculations, and payment summaries.

## 3. User Interactions
- **View Orders**: Admin opens `/orders` screen, sees all recent orders. Can filter by status or search by customer name/email.
- **Update Fulfillment Status**:
  1. Admin clicks status badge dropdown (currently showing "Pending").
  2. Selects "Packed".
  3. Status updates instantly in the list; database state synchronizes.
  4. Visual indicators color code stages (e.g. Amber for Pending, Indigo for Shipped, Emerald for Delivered).
- **Download Invoice**:
  1. Admin clicks "Invoice" button on order row.
  2. API generates invoice PDF dynamically.
  3. PDF downloads to client's local system with standard naming format (e.g. `Invoice_ORDERID.pdf`).

## 4. Data Requirements
- **Orders Schema Fields**:
  - `order_id` (UUID, primary key, auto-generated)
  - `customer_id` (UUID, foreign key referencing customers table)
  - `product_id` (UUID, foreign key referencing products table)
  - `quantity` (integer, check `> 0`, required)
  - `status` (string, enum: `'Pending' | 'Packed' | 'Shipped' | 'Delivered'`)
  - `total_amount` (numeric, calculated at transaction check as product price * quantity, check `>= 0.00`)
  - `order_date` (timestamp with timezone, defaults to current time)

## 5. API Requirements (High Level)
- **Supabase DB Calls**:
  - `GET /orders`: Queries transaction rows, joining corresponding details from `customers` and `products` tables.
  - `PATCH /orders/[id]`: Updates order status field.
- **Invoice API (Next.js Route handler)**:
  - `GET /api/invoice/[orderId]`: Fetches snapshot data for order, formats details using a template engine, generates PDF binary stream, and returns it to browser with `content-disposition: attachment`.

## 6. Edge Cases
- **Fulfillment with Empty Stock**: Order is initialized or status updated but stock was modified in parallel to 0 -> UI displays stock validation alert warning admin that physical inventory levels are critical before status is set to Shipped.
- **Invoice Generation for Deleted Items**: Product listed in order is deleted from the catalog -> Invoices must read snapshot metrics (`total_amount`, `quantity`) directly from order row rather than joining name/price dynamically from product catalog which may no longer exist.
- **Out of Sequence Status Transition**: Admin tries to move order from "Pending" directly to "Delivered" -> Prompt asks for confirmation or restricts paths to enforce correct chronological steps (Pending -> Packed -> Shipped -> Delivered).
- **Bulk Status Modification**: Updating 100+ orders at once -> Enforce batch APIs to prevent UI latency and network throttling.

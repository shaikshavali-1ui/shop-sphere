# Module 5: Business Dashboard & Analytics

## 1. Module Overview
The Business Dashboard & Analytics module acts as the control center of ShopSphere. It provides an immediate overview of business health, tracking sales metrics, visual revenue trends, product counts, stock levels, and alert conditions.

## 2. Features in this Module
- **KPI Metrics Ribbon**: Clean, visual metric cards demonstrating crucial metrics (Gross Revenue, Total Placed Orders, Inventory Count, Active Stock Alarms).
- **Historical Sales Revenue Chart**: Interactive chart mapping daily/weekly/monthly sales, detailing financial performance.
- **Low Stock Notification Console**: Critical listing highlighting items whose stock quantity has dropped below threshold criteria (e.g. stock <= 5) for immediate reorder.
- **Predictive Inventory Alert Dashboard (AI Enhancement)**: Integrates statistical analytics showing predictive stock depletion estimates based on average order velocities.

## 3. User Interactions
- **Dashboard Load**: Admin enters system, landing page automatically loads summaries, populates the stock warning queue, and renders the sales chart.
- **Filter Charts**: Admin selects time toggle buttons (e.g. `7 Days`, `30 Days`, `12 Months`) -> sales charts update lines instantly.
- **Investigate Stock Alert**:
  1. Admin reviews "Low Stock Alerts" table on dashboard.
  2. Spotting an item with "0 left", admin clicks product name link.
  3. System redirects user directly to product edit form to input fresh stock delivery.
- **AI Analytics Report**: Admin clicks "Predict Stock Depletion" -> visual overlays show approximate days remaining before stock runs dry.

## 4. Data Requirements
- **Calculated Dashboard Aggregates**:
  - `Revenue`: Sum of `total_amount` for orders where status is not cancelled.
  - `Total Orders`: Count of all entries in orders table.
  - `Product Count`: Count of all entries in products table.
  - `Low Stock Threshold`: Products where `stock <= 5`.
- **Chart Data Series**:
  - Array of objects containing `{ date: string, revenue: number, orderCount: number }` sorted chronologically.

## 5. API Requirements (High Level)
- **Aggregated Analytics API (RPC or Server Action)**:
  - `GET /api/dashboard/summary`: Executes optimized SQL queries returning aggregated store metrics.
  - `GET /api/dashboard/chart-series?range=[7d|30d|12m]`: Returns dataset arrays formatted for client charting libraries (e.g., Recharts, Chart.js).
- **AI Forecasting Engine Edge Route (Optional / Future)**:
  - `POST /api/analytics/forecast`: Analyses historic order frequencies against current catalog counts to calculate days-to-zero stock predictions.

## 6. Edge Cases
- **Cold-Start Store (Empty Database)**: 0 database rows exists -> UI displays standard metric layouts with `$0.00` and `0` values rather than crash errors or incomplete charts.
- **Timezone Offsets**: Dates logged in database UTC timestamps vs Admin browser local timezone offset -> Ensure grouping calculations convert database dates to correct target timezone before analytics consolidation.
- **Outlier Purchases**: A single massive corporate order changes scale of charts -> Apply logarithmic scaling options or dynamic y-axis calculation caps to keep charts legible.
- **Real-time Synchronization**: Product is edited or order placed in background -> Dashboard should receive events to automatically update metrics without requiring a manual page refresh.

-- -------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) POLICIES MIGRATION
-- -------------------------------------------------------------

-- Ensure RLS is active on all core tables
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- Drop legacy policies if they exist
drop policy if exists "Allow read/write access to authenticated users" on public.products;
drop policy if exists "Allow read/write access to authenticated users" on public.customers;
drop policy if exists "Allow read/write access to authenticated users" on public.orders;

drop policy if exists "Products Admin Policy" on public.products;
drop policy if exists "Customers Admin Policy" on public.customers;
drop policy if exists "Orders Admin Policy" on public.orders;

-- Implement explicit policies restricting ALL operations to authenticated admin users
create policy "Products Admin Policy"
on public.products
for all
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Customers Admin Policy"
on public.customers
for all
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Orders Admin Policy"
on public.orders
for all
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

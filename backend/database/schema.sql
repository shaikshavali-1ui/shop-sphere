-- -------------------------------------------------------------
-- SHOPSPHERE DATABASE SCHEMA MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor to initialize tables
-- -------------------------------------------------------------

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop tables if they exist to allow clean redeployments (caution: will clear existing data)
drop table if exists public.orders cascade;
drop table if exists public.customers cascade;
drop table if exists public.products cascade;

-- 1. PRODUCTS TABLE
create table public.products (
    product_id uuid default gen_random_uuid() primary key,
    name varchar(255) not null,
    price numeric(10, 2) not null check (price >= 0),
    category varchar(100) not null,
    stock integer not null default 0 check (stock >= 0),
    status varchar(50) not null default 'Draft' check (status in ('Active', 'Draft', 'Out of Stock')),
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CUSTOMERS TABLE
create table public.customers (
    customer_id uuid default gen_random_uuid() primary key,
    name varchar(255) not null,
    email varchar(255) unique not null,
    phone varchar(50),
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS TABLE
create table public.orders (
    order_id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(customer_id) on delete restrict not null, -- restrict cascade so accounting data is not silently deleted
    product_id uuid references public.products(product_id) on delete restrict not null,
    quantity integer not null check (quantity > 0),
    status varchar(50) not null default 'Pending' check (status in ('Pending', 'Packed', 'Shipped', 'Delivered')),
    total_amount numeric(10, 2) not null check (total_amount >= 0), -- calculated as snapshot quantity * unit price at purchase time
    order_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------
-- PERFORMANCE OPTIMIZING INDEXES
-- -------------------------------------------------------------
create index idx_products_category on public.products(category);
create index idx_products_status on public.products(status);
create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_status on public.orders(status);

-- -------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) INITIAL SYSTEM CONTEXT
-- -------------------------------------------------------------
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- Admin policies (requires active session)
create policy "Allow read/write access to authenticated users"
on public.products
to authenticated
using (true)
with check (true);

create policy "Allow read/write access to authenticated users"
on public.customers
to authenticated
using (true)
with check (true);

create policy "Allow read/write access to authenticated users"
on public.orders
to authenticated
using (true)
with check (true);

-- -------------------------------------------------------------
-- MOCK SEEDING DATA
-- -------------------------------------------------------------
-- Insert products
insert into public.products (name, price, category, stock, status, image_url) values
('Wireless Gaming Mouse', 59.99, 'Electronics', 15, 'Active', null),
('Mechanical Keyboard Pro', 129.99, 'Electronics', 8, 'Active', null),
('USB-C Hub Multiport', 34.99, 'Electronics', 0, 'Out of Stock', null),
('Ergonomic Office Chair', 249.99, 'Furniture', 4, 'Active', null),
('Noise Cancelling Headphones', 199.99, 'Electronics', 12, 'Active', null);

-- Insert customers
insert into public.customers (name, email, phone, address) values
('John Doe', 'john.doe@example.com', '+15550199', '123 Main St, New York, NY 10001'),
('Jane Smith', 'jane.smith@example.com', '+15550244', '456 Oak Ave, Los Angeles, CA 90001'),
('Robert Johnson', 'robert.j@example.com', '+15550388', '789 Pine Rd, Chicago, IL 60601');

-- Insert orders
insert into public.orders (customer_id, product_id, quantity, status, total_amount)
select 
  c.customer_id, 
  p.product_id, 
  2 as quantity, 
  'Pending' as status, 
  (p.price * 2) as total_amount
from public.customers c, public.products p
where c.email = 'john.doe@example.com' and p.name = 'Wireless Gaming Mouse'
limit 1;

insert into public.orders (customer_id, product_id, quantity, status, total_amount)
select 
  c.customer_id, 
  p.product_id, 
  1 as quantity, 
  'Delivered' as status, 
  p.price as total_amount
from public.customers c, public.products p
where c.email = 'jane.smith@example.com' and p.name = 'Mechanical Keyboard Pro'
limit 1;

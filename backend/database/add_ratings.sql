-- -------------------------------------------------------------
-- ADD PRODUCT RATINGS SCHEMA MIGRATION
-- -------------------------------------------------------------

-- Add rating column to products if not exists
alter table public.products add column if not exists rating numeric(2, 1) default 4.5 check (rating >= 0.0 and rating <= 5.0);

-- Update seed products with premium rating values
update public.products set rating = 4.8 where name = 'Mechanical Keyboard Pro';
update public.products set rating = 4.5 where name = 'Wireless Gaming Mouse';
update public.products set rating = 4.2 where name = 'USB-C Hub Multiport';
update public.products set rating = 4.7 where name = 'Ergonomic Office Chair';
update public.products set rating = 4.6 where name = 'Noise Cancelling Headphones';

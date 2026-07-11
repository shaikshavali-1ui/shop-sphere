-- Alter orders check constraint to include 'Return Requested' and 'Returned'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'));

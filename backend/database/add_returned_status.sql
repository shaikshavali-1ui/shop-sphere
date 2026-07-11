-- Alter orders check constraint to include 'Returned'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'));

-- Add return_reason column if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS return_reason varchar(255);

export interface Product {
  product_id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  image_url?: string;
  rating?: number;
  created_at: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered';
  total_amount: number;
  order_date: string;
}

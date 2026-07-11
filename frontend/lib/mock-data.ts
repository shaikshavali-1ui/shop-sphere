import { Product, Customer, Order } from '@/types/database.types';

export const CATEGORY_DATA: Record<string, { descriptors: string[]; nouns: string[]; images: string[] }> = {
  'Fashion': {
    descriptors: ['Classic', 'Modern', 'Premium', 'Urban', 'Designer', 'Vintage', 'Casual', 'Elegant', 'Sporty', 'Luxury', 'Minimalist', 'Retro', 'Athletic', 'Smart', 'Cozy'],
    nouns: ['Cotton T-Shirt', 'Denim Jacket', 'Sneakers', 'Leather Belt', 'Sunglasses', 'Chronograph Watch', 'Woolen Scarf', 'Polo Shirt', 'Chino Pants', 'Windbreaker', 'Hoodie', 'Loafers', 'Backpack', 'Socks Set', 'Beanie'],
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Mobiles': {
    descriptors: ['Apex', 'Nexus', 'Quantum', 'Horizon', 'Stellar', 'Nomad', 'Element', 'Vertex', 'Infinity', 'Vortex', 'Vibe', 'Nova', 'Edge', 'Pro', 'Prime'],
    nouns: ['Smartphone 5G', 'Max Phone', 'Lite Mobile', 'Foldable Phone', 'Ultra Handset', 'Mini Device', 'Gaming Phone', 'Camera Pro Mobile', 'Carbon Edition', 'Titanium Mobile'],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565849904461-09a7df70055d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Beauty': {
    descriptors: ['Glow', 'Radiance', 'Pure', 'Velvet', 'Silk', 'Nectar', 'Elixir', 'Organic', 'Hydra', 'Luxe', 'Dewy', 'Matte', 'Shimmer', 'Satin', 'Blossom'],
    nouns: ['Face Serum', 'Moisturizing Cream', 'Matte Lipstick', 'Fragrance Eau de Parfum', 'Cleansing Oil', 'Eye Shadow Palette', 'Sunscreen SPF 50', 'Clay Mask', 'Body Lotion', 'Nail Lacquer'],
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Electronics': {
    descriptors: ['Acoustic', 'Cyber', 'Pulse', 'Precision', 'Turbo', 'Wireless', 'Noise-Cancelling', 'Dynamic', 'HD', 'Studio', 'Smart', 'Quantum', 'Pro'],
    nouns: ['Bluetooth Headphones', 'Gaming Mouse', 'Mechanical Keyboard', 'USB-C Hub', 'Webcam 4K', 'Desk Microphone', 'Portable Speaker', 'Smart Watch', 'Active Earbuds', 'Dual Charger'],
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Home': {
    descriptors: ['Cozy', 'Nordic', 'Boho', 'Rustic', 'Zen', 'Modern', 'Ambient', 'Artisan', 'Chic', 'Luxe', 'Minimalist', 'Warm', 'Serene', 'Eco', 'Calm'],
    nouns: ['Scented Candle', 'Ceramic Vase', 'Fairy Lights', 'Desk Organizer', 'Wall Clock', 'Diffuser', 'Picture Frame', 'Storage Basket', 'Succulent Pot', 'Throw Pillow'],
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Appliances': {
    descriptors: ['Instant', 'Turbo', 'Quiet', 'Smart', 'Compact', 'Chef', 'Multi', 'Eco', 'Pro', 'Rapid', 'Precision', 'Digital', 'Cyclonic'],
    nouns: ['Hand Blender', 'Electric Toaster', 'Coffee Maker', 'Air Fryer', 'Rice Cooker', 'Electric Kettle', 'Handheld Vacuum', 'Juicer Extractor', 'Food Processor', 'Garment Steamer'],
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Toys, Kids': {
    descriptors: ['Playful', 'Creative', 'Soft', 'Happy', 'Junior', 'Educational', 'Fun', 'Bright', 'Interactive', 'Wonder', 'Magic', 'Active'],
    nouns: ['Teddy Bear', 'Building Blocks Set', 'Wooden Puzzle', 'Remote Control Car', 'Art Supplies Kit', 'Board Game', 'Dinosaur Figure', 'Plush Toy', 'Clay Modeling Set', 'Bubbles Maker'],
    images: [
      'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1537758061216-049a6e191edd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58def7a608f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Food & Grocery': {
    descriptors: ['Fresh', 'Organic', 'Sweet', 'Natural', 'Crispy', 'Healthy', 'Gourmet', 'Pure', 'Sun-Ripened', 'Whole', 'Raw', 'Premium'],
    nouns: ['Apple Pack', 'Fruit Granola', 'Almond Milk', 'Dark Chocolate', 'Green Tea Pack', 'Avocado Oil', 'Peanut Butter', 'Raw Honey Jar', 'Mixed Nuts Pack', 'Whole Wheat Crackers'],
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Auto Acc': {
    descriptors: ['Secure', 'Heavy-Duty', 'Heavy-Duty', 'Ultra', 'Safe', 'Stealth', 'Comfort', 'Weatherproof', 'Compact', 'Pro', 'Universal'],
    nouns: ['Car Charger', 'Phone Mount', 'Cleaning Gel Kit', 'Leather Key Fob', 'Steering Wheel Cover', 'Seat Organizer', 'LED Strip Lights', 'Emergency Tool Kit', 'Tire Pressure Gauge', 'Air Freshener Pack'],
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1605558158359-001d2ec75630?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Sports': {
    descriptors: ['Pro', 'Athletic', 'Performance', 'Fit', 'Speed', 'Elite', 'Power', 'Endurance', 'Dynamic', 'Active', 'Thermal', 'Grip'],
    nouns: ['Yoga Mat', 'Water Bottle', 'Resistance Bands', 'Dumbbell Set', 'Jump Rope', 'Running Waist Pack', 'Sports Gym Bag', 'Tennis Racket', 'Cycling Gloves', 'Foam Roller'],
    images: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Books': {
    descriptors: ['Inspiring', 'Best-Seller', 'Essential', 'Classic', 'Classic Edition', 'Complete Guide', 'Anthology', 'Saga', 'Volume I', 'Insightful'],
    nouns: ['Novel Book', 'Self-Help Guide', 'Science Fiction Paperback', 'Biography Hardcover', 'Cooking Recipe Book', 'Startup Journal', 'Mystery Thriller Novel', 'History Paperback', 'Poetry Collection'],
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'
    ]
  },
  'Furniture': {
    descriptors: ['Ergonomic', 'Wood', 'Rustic', 'Modern', 'Minimalist', 'Premium', 'Executive', 'Comfort', 'Plush', 'Designer'],
    nouns: ['Office Chair', 'Wood Monitor Stand', 'Valet Tray', 'Desk Mat', 'End Table', 'Bookshelf Cabinet', 'Sofa Lounge', 'Coffee Table', 'Shoe Rack Organizer'],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'
    ]
  }
};

export const generateMockProducts = (): Product[] => {
  const products: Product[] = [];
  const categories = Object.keys(CATEGORY_DATA);

  for (const category of categories) {
    const data = CATEGORY_DATA[category];
    for (let i = 1; i <= 100; i++) {
      const desc = data.descriptors[i % data.descriptors.length];
      const noun = data.nouns[i % data.nouns.length];
      const name = `${desc} ${noun} #${i}`;
      const price = Math.round(((i * 3.5) % 220 + 8.99) * 100) / 100;
      const stock = (i * 7) % 75 + 6;

      products.push({
        product_id: `demo-prod-${category.toLowerCase().replace(/[^a-z]/g, '')}-${i}`,
        name,
        price,
        category,
        stock,
        status: 'Active',
        image_url: data.images[i % data.images.length],
        created_at: new Date(Date.now() - i * 3600000).toISOString()
      });
    }
  }
  return products;
};

export const initialCustomers: Customer[] = [
  {
    customer_id: '00000000-0000-0000-0000-000000000002',
    name: 'Demo Customer',
    email: 'customer@example.com',
    phone: '+1 555-0199',
    address: '123 Main St, New York, NY 10001',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    customer_id: 'demo-cust-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-0244',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    customer_id: 'demo-cust-3',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 555-0388',
    address: '789 Pine Rd, Chicago, IL 60601',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

export const initialOrders: any[] = [
  {
    order_id: 'demo-ord-1',
    customer_id: '00000000-0000-0000-0000-000000000002',
    product_id: 'demo-prod-electronics-1',
    quantity: 1,
    total_amount: 59.99,
    status: 'Pending',
    order_date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    customers: {
      name: 'Demo Customer',
      email: 'customer@example.com'
    },
    products: {
      name: 'Wireless Gaming Mouse',
      stock: 14,
      price: 59.99
    }
  },
  {
    order_id: 'demo-ord-2',
    customer_id: 'demo-cust-2',
    product_id: 'demo-prod-electronics-2',
    quantity: 1,
    total_amount: 129.99,
    status: 'Delivered',
    order_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    customers: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    products: {
      name: 'Mechanical Keyboard Pro',
      stock: 7,
      price: 129.99
    }
  }
];

export const initializeMockDataInLocalStorage = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('shopsphere_mock_products')) {
      localStorage.setItem('shopsphere_mock_products', JSON.stringify(generateMockProducts()));
    }
    if (!localStorage.getItem('shopsphere_mock_customers')) {
      localStorage.setItem('shopsphere_mock_customers', JSON.stringify(initialCustomers));
    }
    if (!localStorage.getItem('shopsphere_mock_orders')) {
      localStorage.setItem('shopsphere_mock_orders', JSON.stringify(initialOrders));
    }
  }
};

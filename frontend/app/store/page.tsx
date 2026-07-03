'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types/database.types';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  ShoppingBag, Search, LogIn, LogOut, Shield, 
  Image as ImageIcon, Loader2, Star, Check,
  X, Plus, Minus, Trash2, AlertCircle, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Storefront() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Client auth state
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopsphere_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart data:', err);
      }
    }
  }, []);

  // Save cart to LocalStorage on changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('shopsphere_cart', JSON.stringify(newCart));
  };

  // Check customer session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCustomerSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomerSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch active products
  const fetchStoreProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'Active') // Customers should only see active products
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching storefront products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  // Sign out customer
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSuccessMsg('Logged out successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      setErrorMsg('This product is currently out of stock.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product.product_id === product.product_id);
    const currentQuantity = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQuantity >= product.stock) {
      setErrorMsg(`Cannot add more. Only ${product.stock} units available in stock.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ product, quantity: 1 });
    }
    saveCart(newCart);
    
    setSuccessMsg(`Added "${product.name}" to cart.`);
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const existingIndex = cart.findIndex(item => item.product.product_id === productId);
    if (existingIndex === -1) return;

    const item = cart[existingIndex];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.product.stock) {
      setErrorMsg(`Only ${item.product.stock} units are available.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const newCart = [...cart];
    newCart[existingIndex].quantity = newQty;
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.product_id !== productId);
    saveCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Place Order Checkout Flow
  const handleCheckout = async () => {
    if (!customerSession) {
      setErrorMsg('You must sign in to place an order.');
      setIsCartOpen(false);
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/store/login');
      }, 1500);
      return;
    }

    if (cart.length === 0) return;

    setIsCheckoutLoading(true);
    setErrorMsg(null);

    try {
      // Loop through cart items to double check stock before writing orders
      for (const item of cart) {
        const { data: dbProduct, error: fetchErr } = await supabase
          .from('products')
          .select('stock, status')
          .eq('product_id', item.product.product_id)
          .single();

        if (fetchErr || !dbProduct) {
          throw new Error(`Failed to check stock for ${item.product.name}`);
        }

        if (dbProduct.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product.name}". Only ${dbProduct.stock} available.`);
        }
      }

      // Process orders and decrement stocks
      for (const item of cart) {
        // 1. Insert order record
        const { error: orderErr } = await supabase
          .from('orders')
          .insert({
            customer_id: customerSession.user.id,
            product_id: item.product.product_id,
            quantity: item.quantity,
            status: 'Pending',
            total_amount: item.product.price * item.quantity
          });

        if (orderErr) throw orderErr;

        // 2. Calculate new stock
        const newStock = Math.max(0, item.product.stock - item.quantity);
        const newStatus = newStock === 0 ? 'Out of Stock' : 'Active';

        // 3. Update products table
        const { error: prodUpdateErr } = await supabase
          .from('products')
          .update({
            stock: newStock,
            status: newStatus
          })
          .eq('product_id', item.product.product_id);

        if (prodUpdateErr) throw prodUpdateErr;
      }

      // Success
      setSuccessMsg('Thank you! Your order has been placed successfully.');
      saveCart([]);
      setIsCartOpen(false);
      fetchStoreProducts(); // Refresh storefront catalog
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Render gold rating stars
  const renderStars = (rating: number = 4.5) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-3.5 w-3.5 ${
            i <= roundedRating 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-slate-650 fill-slate-950/40'
          }`} 
        />
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">{stars}</div>
        <span className="text-[10px] text-slate-400 font-mono font-bold">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Toast Alert Messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 px-4 py-3 rounded-lg text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-350">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-rose-500/15 border border-rose-500/35 text-rose-450 px-4 py-3 rounded-lg text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-350">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Store Navbar Header */}
      <header className="border-b border-white/5 bg-slate-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/store" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-105 transition-all">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-wider text-slate-100">
              SHOPSPHERE <span className="text-emerald-400 font-normal">STORE</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search store products..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-xs text-slate-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User controls */}
          <div className="flex items-center gap-5 text-xs font-semibold">
            {/* Shopping Cart Button Toggle */}
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2.5 bg-slate-800/80 border border-slate-750 hover:bg-slate-750 text-slate-200 rounded-xl transition-all hover:scale-105 active:scale-95"
              aria-label="Toggle Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold h-4 w-4 flex items-center justify-center rounded-full border border-slate-950 shadow-md">
                  {getCartCount()}
                </span>
              )}
            </button>

            {customerSession ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-400 truncate max-w-[150px] hidden md:inline">
                  Hi, <span className="text-emerald-400 font-bold">{customerSession.user?.email}</span>
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/50 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/store/login"
                className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors border border-emerald-500/20"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main product display grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Intro banners */}
        <div className="space-y-1.5 text-left border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            Catalog Collections
          </h2>
          <p className="text-slate-400 text-sm">
            Discover and purchase premium technology products and ergonomic desk setups.
          </p>
        </div>

        {/* Load indicators */}
        {loading && products.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Syncing store items...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-2">
            <ShoppingBag className="h-12 w-12 text-slate-700 mb-2" />
            <span className="font-semibold text-slate-200">No Products Available</span>
            <span className="text-xs">Adjust search text or check back later!</span>
          </div>
        ) : (
          /* Products catalog responsive card grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.product_id}
                className="glass-panel overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300 rounded-xl bg-slate-900/40"
              >
                {/* Product Image top */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-750" />
                  )}
                  {/* Category tag */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/90 border border-white/5 text-[9px] font-extrabold uppercase tracking-wide rounded">
                    {product.category}
                  </span>
                </div>

                {/* Details middle */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Star rating display */}
                    {renderStars(product.rating || 4.5)}

                    {/* Stock indicator */}
                    <div className="text-[10px] text-slate-400 font-medium">
                      Stock: <span className={product.stock <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{product.stock} units</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart footer */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-mono font-black text-slate-100">
                      ${product.price.toFixed(2)}
                    </span>

                    <button 
                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-emerald-500/20 shadow-md"
                      onClick={() => addToCart(product)}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer Slide-out panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-slate-900 border-l border-white/5 h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-100 tracking-wider">
                  SHOPPING CART
                </h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close Cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <ShoppingCart className="h-10 w-10 text-slate-700" />
                  <span className="text-sm font-semibold">Your cart is empty</span>
                  <span className="text-xs">Browse the catalog to add items!</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.product.product_id}
                    className="flex gap-4 p-3 bg-slate-950/50 border border-white/5 rounded-xl text-left"
                  >
                    {/* Small product image */}
                    <div className="h-16 w-16 bg-slate-900 border border-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name} 
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-slate-750" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">
                          {item.product.name}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.product.product_id)}
                          className="text-slate-500 hover:text-rose-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Quantity adjusting and price */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Selector */}
                        <div className="flex items-center bg-slate-900 border border-white/5 rounded-lg p-0.5">
                          <button 
                            onClick={() => updateQuantity(item.product.product_id, -1)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-200">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.product.product_id, 1)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-mono font-bold text-slate-100">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-slate-950/30 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-xl font-mono font-black text-slate-100">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-xs border border-emerald-500/20 shadow-lg hover:scale-102 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'PLACE ORDER'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="border-t border-white/5 py-8 text-center text-[10px] text-slate-600 bg-slate-950">
        &copy; {new Date().getFullYear()} ShopSphere Store. Powered by Supabase. All rights reserved.
      </footer>
    </div>
  );
}

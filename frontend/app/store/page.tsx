'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types/database.types';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  ShoppingBag, Search, LogIn, LogOut, Shield, 
  Image as ImageIcon, Loader2, Star, Check,
  X, Plus, Minus, Trash2, AlertCircle, ShoppingCart,
  MapPin, Percent, ChevronDown, User, Sparkles, Shirt, 
  Smartphone, Heart, Monitor, Lamp, Tv, ToyBrick, 
  Carrot, Wrench, Trophy, BookOpen, Sofa, Tag, Plane,
  Home, Share2, Send, ArrowLeft, Calendar, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  'Fashion': [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80'
  ],
  'Mobiles': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80'
  ],
  'Electronics': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'
  ],
  'Home': [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80'
  ],
  'Appliances': [
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'
  ],
  'Toys, Kids': [
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1537758061216-049a6e191edd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  ],
  'Food & Grocery': [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
  ],
  'Auto Acc': [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80'
  ],
  'Books': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80'
  ],
  'Furniture': [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
  ]
};

export default function Storefront() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'cod'>('cod');
  const [useGiftCard, setUseGiftCard] = useState<boolean>(false);
  const [giftCardBalance] = useState<number>(54);

  // Orders view states
  const [isOrdersViewActive, setIsOrdersViewActive] = useState<boolean>(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(false);

  // Location States
  const [locationInfo, setLocationInfo] = useState<{
    houseNumber: string;
    pincode: string;
    village: string;
    town: string;
    city: string;
    state: string;
  } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locHouseNumber, setLocHouseNumber] = useState('');
  const [locPincode, setLocPincode] = useState('');
  const [locVillage, setLocVillage] = useState('');
  const [locTown, setLocTown] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Load location from LocalStorage on mount
  useEffect(() => {
    const savedLoc = localStorage.getItem('shopsphere_location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        setLocationInfo(parsed);
        setLocHouseNumber(parsed.houseNumber || parsed.homeNumber || '');
        setLocPincode(parsed.pincode || '');
        setLocVillage(parsed.village || '');
        setLocTown(parsed.town || '');
        setLocCity(parsed.city || '');
        setLocState(parsed.state || '');
      } catch (e) {
        console.error("Failed to parse saved location info:", e);
      }
    }
  }, []);

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoc = {
      houseNumber: locHouseNumber.trim(),
      pincode: locPincode.trim(),
      village: locVillage.trim(),
      town: locTown.trim(),
      city: locCity.trim(),
      state: locState.trim()
    };
    setLocationInfo(newLoc);
    localStorage.setItem('shopsphere_location', JSON.stringify(newLoc));
    setIsLocationModalOpen(false);
    setSuccessMsg("Delivery location updated successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          
          if (data && data.address) {
            const addr = data.address;
            setLocHouseNumber(addr.house_number || '14-765');
            setLocPincode(addr.postcode || '517350');
            setLocVillage(addr.village || addr.suburb || addr.neighbourhood || 'RMB Colony Angullu');
            setLocTown(addr.road || addr.suburb || 'madanapalle');
            setLocCity(addr.city || addr.town || addr.county || 'chittor');
            const stateVal = addr.state || 'andhra pradesh';
            setLocState(stateVal.toLowerCase());
          }
        } catch (err) {
          console.error("Error fetching location details:", err);
          alert("Could not fetch address details automatically. Please enter manually.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Geolocation permission denied or timed out. Please enter address details manually.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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
      if (session) {
        setCustomerSession(session);
      } else {
        const demoSession = localStorage.getItem('shopsphere_demo_session');
        if (demoSession) {
          setCustomerSession(JSON.parse(demoSession));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCustomerSession(session);
      } else {
        const demoSession = localStorage.getItem('shopsphere_demo_session');
        if (demoSession) {
          setCustomerSession(JSON.parse(demoSession));
        } else {
          setCustomerSession(null);
        }
      }
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

      if (selectedCategory) {
        const dbCategory = selectedCategory === 'Toys, Kids' ? '%Toys%' 
                         : selectedCategory === 'Food & Grocery' ? '%Food%' 
                         : selectedCategory === 'Auto Acc' ? '%Auto%' 
                         : selectedCategory;
        query = query.ilike('category', dbCategory);
      }

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
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  const fetchCustomerOrders = async () => {
    if (!customerSession) return;
    setIsOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_date,
          quantity,
          status,
          total_amount,
          product_id,
          products (
            name,
            image_url,
            price,
            category
          )
        `)
        .eq('customer_id', customerSession.user.id)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load order history.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isOrdersViewActive && customerSession) {
      fetchCustomerOrders();
    }
  }, [isOrdersViewActive, customerSession]);

  // Sign out customer
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('shopsphere_demo_session');
    setCustomerSession(null);
    setIsOrdersViewActive(false);
    setCustomerOrders([]);
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
        router.push('/login');
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
      window.scrollTo(0, 0); // Scroll catalog back to top
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleSingleCheckout = async (
    product: Product, 
    quantity: number, 
    paymentMethod: 'upi' | 'card' | 'cod' = 'cod', 
    applyGiftCard: boolean = false
  ) => {
    if (!customerSession) {
      setErrorMsg('You must sign in to place an order.');
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    if (quantity <= 0) return;

    // Calculate dynamic pricing details
    const sellingPrice = Math.round(product.price * 100);
    const baseTotal = sellingPrice * quantity;
    const packagingFee = 9;
    
    // Gift Card Deduction
    const giftCardDeduction = applyGiftCard ? Math.min(baseTotal + packagingFee, 54) : 0;
    
    // COD Fee
    const codFee = paymentMethod === 'cod' ? 6 : 0;
    
    // Final Amount in INR
    const finalINR = baseTotal + packagingFee + codFee - giftCardDeduction;
    
    // Convert final amount back to USD (or standard DB currency format)
    const finalDB = (product.price * quantity) + 0.09 + (paymentMethod === 'cod' ? 0.06 : 0) - (applyGiftCard ? Math.min((product.price * quantity) + 0.09, 0.54) : 0);

    setIsCheckoutLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch current stock
      const { data: dbProduct, error: fetchErr } = await supabase
        .from('products')
        .select('stock, status')
        .eq('product_id', product.product_id)
        .single();

      if (fetchErr || !dbProduct) {
        throw new Error(`Failed to check stock for ${product.name}`);
      }

      if (dbProduct.stock < quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Only ${dbProduct.stock} available.`);
      }

      // 2. Insert order record
      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: customerSession.user.id,
          product_id: product.product_id,
          quantity: quantity,
          status: 'Pending',
          total_amount: parseFloat(finalDB.toFixed(2))
        });

      if (orderErr) throw orderErr;

      // 3. Update stock
      const newStock = Math.max(0, dbProduct.stock - quantity);
      const newStatus = newStock === 0 ? 'Out of Stock' : 'Active';

      const { error: prodUpdateErr } = await supabase
        .from('products')
        .update({
          stock: newStock,
          status: newStatus
        })
        .eq('product_id', product.product_id);

      if (prodUpdateErr) throw prodUpdateErr;

      // Success
      setSuccessMsg(`Thank you! Your order for "${product.name}" has been placed successfully via ${paymentMethod.toUpperCase()}. A confirmation email has been sent to ${customerSession.user.email}.`);
      setCheckoutProduct(null);
      setCheckoutStep('details');
      setUseGiftCard(false);
      fetchStoreProducts(); // Refresh storefront catalog
      window.scrollTo(0, 0); // Scroll catalog back to top
      setTimeout(() => setSuccessMsg(null), 6000);
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
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 flex flex-col relative overflow-x-hidden">
      {/* Toast Alert Messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 text-emerald-650 px-4 py-3 rounded-lg text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-350 font-bold">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-rose-500/15 border border-rose-500/35 text-rose-600 px-4 py-3 rounded-lg text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-350 font-bold">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Store Navbar Header (Flipkart Style) */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            {/* Flipkart-Style Logo capsule */}
            <Link 
              href="/store" 
              onClick={() => {
                setCheckoutProduct(null);
                setIsOrdersViewActive(false);
                window.scrollTo(0, 0); // Scroll back to top of catalog
              }}
              className="flex flex-col items-start gap-0.5 group shrink-0"
            >
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold italic tracking-tight text-[#172554] flex items-center">
                  <span className="text-blue-600 mr-0.5 font-black">S</span>hop<span className="text-[#fb641b]">Sphere</span>
                </span>
              </div>
              <span className="text-[9px] italic text-slate-450 font-bold hover:underline flex items-center gap-0.5">
                Explore <span className="text-[#fb641b] font-black">Plus</span>
                <span className="text-yellow-500 font-extrabold">★</span>
              </span>
            </Link>

            {/* Custom Flipkart-Style Badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-250/30 rounded-full text-amber-805 text-[9.5px] font-bold shadow-sm">
                <Percent className="h-3 w-3 text-amber-600" />
                <span>Deals</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-800 text-[9.5px] font-bold shadow-sm">
                <Plane className="h-3 w-3 text-blue-600" />
                <span>Express</span>
              </div>
            </div>

            {/* Location Selector */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-650 font-medium text-left outline-none cursor-pointer group"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div className="leading-tight">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                  {locationInfo ? 'Deliver to' : 'Location not set'}
                </span>
                <span className="text-blue-600 hover:underline font-bold">
                  {locationInfo 
                    ? `${locationInfo.village || locationInfo.town || locationInfo.city} >` 
                    : 'Select location >'}
                </span>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              className="w-full bg-[#f0f5ff]/70 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User controls */}
          <div className="flex items-center gap-6 text-xs font-bold text-slate-700 w-full md:w-auto justify-end">
            {customerSession ? (
              <div className="relative group cursor-pointer py-1.5 flex items-center gap-1 hover:text-blue-600 transition-colors">
                <User className="h-4 w-4 text-slate-500" />
                <span className="max-w-[100px] truncate text-slate-800 font-bold">
                  {customerSession.user?.user_metadata?.name || customerSession.user?.email?.split('@')[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-40 z-50 animate-in fade-in duration-150">
                  <div className="bg-white border border-slate-150 rounded-xl shadow-xl py-1 text-slate-800 text-left">
                    <div className="px-3.5 py-2 border-b border-slate-100 text-[10px] text-slate-400 truncate font-semibold">
                      {customerSession.user?.email}
                    </div>
                    <button 
                      onClick={() => {
                        setCheckoutProduct(null);
                        setIsOrdersViewActive(true);
                        window.scrollTo(0, 0); // Scroll back to top of orders page
                      }}
                      className="w-full text-left block px-3.5 py-2 hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700 transition-colors border-t border-slate-100 flex items-center gap-1.5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors border border-blue-500/20 shadow-md"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative py-2 px-3 hover:text-blue-600 transition-all flex items-center gap-1.5"
              aria-label="Toggle Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <span>Cart</span>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-extrabold h-4.5 w-4.5 flex items-center justify-center rounded-full border border-white shadow">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {checkoutProduct ? (
        checkoutStep === 'payment' ? (
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-24 lg:pb-8 text-left animate-in fade-in duration-200">
            {/* Back button */}
            <button 
              onClick={() => {
                setCheckoutStep('details');
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Price Details</span>
            </button>

            {/* Heading */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
                Complete Payment
              </h2>
            </div>

            {/* Gift Card Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="giftcard"
                  className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-350 cursor-pointer"
                  checked={useGiftCard}
                  onChange={(e) => setUseGiftCard(e.target.checked)}
                />
                <label htmlFor="giftcard" className="cursor-pointer text-left select-none">
                  <span className="block text-sm font-extrabold text-slate-800">Use Gift Card</span>
                  <span className="text-xs text-slate-450 font-bold">Available Balance: ₹{giftCardBalance}</span>
                </label>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-extrabold hover:underline cursor-pointer">
                Add Gift Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Column: Recommended for You Payment Methods Menu */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-150">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 text-left">
                    Recommended for You
                  </h3>
                </div>

                {/* UPI Option */}
                <div 
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`flex gap-3 items-center p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedPaymentMethod === 'upi' ? 'bg-blue-50/40 border-r-4 border-r-blue-600' : 'hover:bg-slate-50/50'}`}
                >
                  <span className="border border-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide text-slate-700 font-sans select-none">UPI</span>
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-slate-800">UPI</span>
                    <span className="text-[10px] text-slate-450 font-semibold block">Pay by any UPI app</span>
                  </div>
                </div>

                {/* Card Option */}
                <div 
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`flex gap-3 items-center p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedPaymentMethod === 'card' ? 'bg-blue-50/40 border-r-4 border-r-blue-600' : 'hover:bg-slate-50/50'}`}
                >
                  <span className="border border-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide text-slate-700 font-sans select-none">CARD</span>
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-slate-800">Credit / Debit / ATM Card</span>
                    <span className="text-[10px] text-slate-455 font-medium block">Add and secure cards as per RBI guidelines</span>
                  </div>
                </div>

                {/* COD Option */}
                <div 
                  onClick={() => setSelectedPaymentMethod('cod')}
                  className={`flex gap-3 items-center p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedPaymentMethod === 'cod' ? 'bg-blue-50/40 border-r-4 border-r-blue-600' : 'hover:bg-slate-50/50'}`}
                >
                  <span className="border border-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide text-slate-700 font-sans select-none">COD</span>
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-slate-800">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-455 font-medium block">Cash or Card on Delivery</span>
                  </div>
                </div>

                {/* EMI Option (Disabled) */}
                <div className="flex gap-3 items-center p-4 opacity-50 bg-slate-50/80 cursor-not-allowed">
                  <span className="border border-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide text-slate-400 font-sans select-none">EMI</span>
                  <div className="text-left flex-1 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-extrabold text-slate-400">EMI</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Unavailable</span>
                    </div>
                    <span className="text-[10px] text-slate-400 select-none cursor-help" title="EMI payment is currently unavailable">ⓘ</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Panel Details for selected payment */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left">
                  {selectedPaymentMethod === 'cod' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Cash on Delivery
                      </h3>
                      <div className="bg-amber-50 border border-amber-200/50 text-amber-805 rounded-lg p-4 text-xs font-semibold leading-relaxed">
                        Due to handling costs, a nominal fee of ₹6 will be charged for orders placed using this option. Avoid this fee by paying online now.
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'upi' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Pay using UPI
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1.5">Enter UPI ID</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. mobile@upi"
                              className="flex-1 bg-slate-55 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800"
                            />
                            <button className="py-2.5 px-4 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">Verify</button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">Or select a preferred app:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                            <button key={app} className="p-2 border border-slate-200 rounded-lg text-xs font-extrabold hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer">
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Credit / Debit / ATM Card
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-455 uppercase font-black tracking-wider mb-1.5">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-slate-55 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-455 uppercase font-black tracking-wider mb-1.5">Expiry Date</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full bg-slate-55 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-455 uppercase font-black tracking-wider mb-1.5">CVV</label>
                            <input 
                              type="password" 
                              maxLength={3}
                              placeholder="***"
                              className="w-full bg-slate-55 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Order Price Summary on Payment Screen */}
                {(() => {
                  const sellingPrice = Math.round(checkoutProduct.price * 100);
                  const originalPrice = Math.round(sellingPrice * 1.25);
                  const mrpTotal = originalPrice * checkoutQuantity;
                  const discountTotal = (originalPrice - sellingPrice) * checkoutQuantity;
                  const packagingFee = 9;
                  
                  // COD Fee
                  const codFee = selectedPaymentMethod === 'cod' ? 6 : 0;
                  // Gift Card
                  const giftCardDeduction = useGiftCard ? Math.min((sellingPrice * checkoutQuantity) + packagingFee + codFee, 54) : 0;
                  
                  const finalAmount = (sellingPrice * checkoutQuantity) + packagingFee + codFee - giftCardDeduction;

                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Payment Breakdown</span>
                        <span className="text-xs text-slate-450 font-bold">{checkoutQuantity}x item(s)</span>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-655">
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-bold text-slate-850">₹{(sellingPrice * checkoutQuantity).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Packaging & Secure Delivery:</span>
                          <span className="font-bold text-slate-850">₹{packagingFee}</span>
                        </div>
                        {codFee > 0 && (
                          <div className="flex justify-between text-amber-700 font-bold">
                            <span>COD Handling Charge:</span>
                            <span className="font-extrabold">₹{codFee}</span>
                          </div>
                        )}
                        {giftCardDeduction > 0 && (
                          <div className="flex justify-between text-[#0f8a5f] font-bold">
                            <span>Gift Card Applied:</span>
                            <span className="font-extrabold">-₹{giftCardDeduction}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-black text-slate-900">
                          <span>Total Payable Amount:</span>
                          <span>₹{finalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSingleCheckout(checkoutProduct, checkoutQuantity, selectedPaymentMethod, useGiftCard)}
                        disabled={isCheckoutLoading}
                        className="w-full py-4 bg-[#fbbf24] hover:bg-[#e2a917] disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 shadow-md cursor-pointer border border-[#f5b30c]/30"
                      >
                        {isCheckoutLoading ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin text-slate-950" />
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <span>{selectedPaymentMethod === 'cod' ? 'Place Order' : 'Pay & Place Order'}</span>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-24 lg:pb-8 text-left animate-in fade-in duration-200">
            {/* Back button */}
            <button 
              onClick={() => {
                setSelectedProduct(checkoutProduct);
                setCheckoutProduct(null);
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Product Details</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Product Info, Address, Delivery */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Product Summary Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left flex gap-5">
                  {/* Product image */}
                  <div className="h-24 w-24 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 p-2">
                    {checkoutProduct.image_url ? (
                      <img 
                        src={checkoutProduct.image_url.includes(',') ? checkoutProduct.image_url.split(',')[0].trim() : checkoutProduct.image_url} 
                        alt={checkoutProduct.name} 
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        {checkoutProduct.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1.5 leading-snug">
                        {checkoutProduct.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">
                        Brand: {checkoutProduct.name.split(' ')[0] || 'ShopSphere'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity adjust */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-455 uppercase font-black tracking-wider">Qty:</span>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button 
                            onClick={() => setCheckoutQuantity(prev => Math.max(1, prev - 1))}
                            disabled={checkoutQuantity <= 1}
                            className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-650 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3.5 text-xs font-mono font-extrabold text-slate-800">
                            {checkoutQuantity}
                          </span>
                          <button 
                            onClick={() => setCheckoutQuantity(prev => Math.min(checkoutProduct.stock, prev + 1))}
                            disabled={checkoutQuantity >= checkoutProduct.stock}
                            className="p-1 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-650 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* Stock indicator */}
                      <span className={`text-[10.5px] font-bold ${checkoutProduct.stock <= 5 ? 'text-rose-650' : 'text-emerald-650'}`}>
                        {checkoutProduct.stock <= 5 ? `Only ${checkoutProduct.stock} left!` : 'In Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h4 className="text-xs font-black uppercase text-slate-850 tracking-wider">
                        Delivery Address
                      </h4>
                    </div>
                    <button 
                      onClick={() => setIsLocationModalOpen(true)}
                      className="text-[10.5px] text-blue-605 hover:text-blue-800 font-extrabold hover:underline cursor-pointer"
                    >
                      {locationInfo ? 'Change Address' : 'Set Address'}
                    </button>
                  </div>
                  {locationInfo ? (
                    <div className="text-xs space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <p className="font-extrabold text-slate-800">
                        HOUSE NO: {locationInfo.houseNumber}
                      </p>
                      <p className="text-slate-600 font-semibold leading-relaxed">
                        {locationInfo.village && `${locationInfo.village}, `}
                        {locationInfo.town && `${locationInfo.town}, `}
                        {locationInfo.city}, {locationInfo.state} - <span className="font-mono font-extrabold text-slate-855">{locationInfo.pincode}</span>
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black uppercase">
                        <Check className="h-3 w-3" />
                        Free Delivery Eligible
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
                      <p className="text-xs text-amber-655 font-bold mb-3">No delivery address set. Please specify where to deliver.</p>
                      <button 
                        onClick={() => setIsLocationModalOpen(true)}
                        className="py-2 px-4 border border-blue-650 text-blue-650 rounded-lg text-xs font-extrabold hover:bg-blue-50 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Configure Delivery Location
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Price Details & Continue Card */}
              <div className="space-y-6">
                {(() => {
                  const sellingPrice = Math.round(checkoutProduct.price * 100);
                  const originalPrice = Math.round(sellingPrice * 1.25);
                  const mrpTotal = originalPrice * checkoutQuantity;
                  const discountTotal = (originalPrice - sellingPrice) * checkoutQuantity;
                  const fees = 9;
                  const totalAmount = (sellingPrice * checkoutQuantity) + fees;
                  const savingsTotal = mrpTotal - totalAmount;

                  return (
                    <>
                      {/* The Price Details Card itself */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-left">
                        <div className="bg-slate-55 px-4 py-3.5 border-b border-slate-150">
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">
                            Price Details
                          </h3>
                        </div>
                        <div className="p-5 space-y-4 text-xs text-slate-650">
                          {/* MRP Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-550 border-b border-dashed border-slate-300 pb-0.5 cursor-help" title="Maximum Retail Price">
                              MRP (incl. of all taxes)
                            </span>
                            <span className="font-extrabold text-slate-800">
                              ₹{mrpTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Fees Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-550 flex items-center gap-0.5 cursor-pointer hover:text-slate-850">
                              Fees <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </span>
                            <span className="font-extrabold text-slate-800">
                              ₹{fees}
                            </span>
                          </div>

                          {/* Discounts Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-550 flex items-center gap-0.5 cursor-pointer hover:text-slate-850">
                              Discounts <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </span>
                            <span className="font-black text-emerald-655">
                              -₹{discountTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Dotted Separator */}
                          <div className="border-t border-dashed border-slate-200 pt-4">
                            <div className="flex items-center justify-between text-sm font-extrabold text-slate-800">
                              <span>Total Amount</span>
                              <span className="text-base font-black text-slate-900">
                                ₹{totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Savings Alert Badge */}
                          <div className="bg-[#e8f7f1] text-[#0f8a5f] rounded-lg p-3 flex items-center gap-2 border border-[#d2efe2] text-[11px] font-bold">
                            <Percent className="h-4 w-4 bg-[#0f8a5f] text-white p-0.5 rounded-full shrink-0" />
                            <span>You'll save ₹{savingsTotal.toLocaleString('en-IN')} on this order!</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom/Checkout Bar */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-md flex items-center justify-between gap-4 fixed bottom-0 left-0 right-0 lg:static z-40 lg:shadow-sm">
                        <div className="text-left leading-tight">
                          <span className="text-[10px] text-slate-400 line-through block font-medium">
                            ₹{mrpTotal.toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-slate-900">
                              ₹{totalAmount.toLocaleString('en-IN')}
                            </span>
                            <button className="text-slate-450 hover:text-slate-655 select-none p-0.5 transition-colors cursor-pointer" title="Price Breakup Info">
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-400 text-[10px] text-slate-455 font-bold font-serif leading-none">i</span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!customerSession) {
                              setErrorMsg('You must sign in to place an order.');
                              setTimeout(() => {
                                router.push('/login');
                              }, 1500);
                              return;
                            }
                            setCheckoutStep('payment');
                            setSelectedPaymentMethod('cod');
                            window.scrollTo(0, 0); // Scroll back to top of payment page
                          }}
                          disabled={!locationInfo}
                          className="flex-1 max-w-[200px] py-3.5 bg-[#fbbf24] hover:bg-[#e2a917] disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 rounded-xl font-black text-[12px] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed cursor-pointer border border-[#f5b30c]/30"
                        >
                          <span>Continue</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </main>
        )
      ) : isOrdersViewActive ? (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-24 lg:pb-8 text-left animate-in fade-in duration-200">
          {/* Back button */}
          <button 
            onClick={() => {
              setIsOrdersViewActive(false);
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Catalog</span>
          </button>

          {/* Heading */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase animate-pulse">
              My Orders
            </h2>
            <span className="text-xs text-slate-450 font-bold">
              Total Orders: {customerOrders.length}
            </span>
          </div>

          {isOrdersLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-605" />
              <span className="text-xs text-slate-500 font-bold">Loading your order history...</span>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-350">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-805">No Orders Found</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
                  Looks like you haven't placed any orders yet. Explore our awesome catalog to find great deals!
                </p>
              </div>
              <button 
                onClick={() => setIsOrdersViewActive(false)}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => {
                const product = order.products || {};
                const sellingPrice = Math.round((product.price || 0) * 100);
                const orderAmountINR = Math.round(order.total_amount * 100);
                const orderDate = new Date(order.order_date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                // Status mapping to color and progress value
                const statusSteps = ['Pending', 'Packed', 'Shipped', 'Delivered'];
                const currentStatusIndex = statusSteps.indexOf(order.status || 'Pending');

                return (
                  <div key={order.order_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5 flex flex-col md:flex-row gap-5">
                      {/* Left: Product Image */}
                      <div className="h-20 w-20 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 p-1.5 mx-auto md:mx-0">
                        {product.image_url ? (
                          <img 
                            src={product.image_url.includes(',') ? product.image_url.split(',')[0].trim() : product.image_url} 
                            alt={product.name || 'Product'} 
                            className="object-contain h-full w-full"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-300" />
                        )}
                      </div>

                      {/* Middle: Order info */}
                      <div className="flex-1 text-left space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div>
                            <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              {product.category || 'General'}
                            </span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                              {product.name || 'Unknown Product'}
                            </h3>
                          </div>
                          <div className="text-right sm:text-right">
                            <span className="text-sm font-black text-slate-900 block">
                              ₹{orderAmountINR.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block">
                              Qty: {order.quantity} | {order.quantity > 1 ? `₹${sellingPrice}/unit` : 'Single Item'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] text-slate-455 font-bold pt-1.5 border-t border-slate-100">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-405" />
                            <span>Ordered on: {orderDate}</span>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="font-mono text-slate-400">ID: #{order.order_id.slice(0, 8)}</span>
                        </div>

                        {/* Status tracker visual progression */}
                        <div className="pt-4 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-extrabold tracking-wider uppercase text-slate-455">
                            <span>Status: <span className={`normal-case font-black ${
                              order.status === 'Delivered' ? 'text-emerald-650' : 
                              order.status === 'Shipped' ? 'text-indigo-650' :
                              order.status === 'Packed' ? 'text-blue-600' : 'text-amber-600'
                            }`}>{order.status || 'Pending'}</span></span>
                          </div>
                          
                          {/* Visual progress bar */}
                          <div className="relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                            <div 
                              className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500 ${
                                order.status === 'Delivered' ? 'bg-emerald-500' :
                                order.status === 'Shipped' ? 'bg-indigo-500' :
                                order.status === 'Packed' ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%` }}
                            />
                            <div className="relative flex justify-between">
                              {statusSteps.map((step, idx) => {
                                const isPassed = idx <= currentStatusIndex;
                                const isActive = idx === currentStatusIndex;
                                return (
                                  <div key={step} className="flex flex-col items-center">
                                    <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                                      isActive ? 'bg-white border-blue-600 ring-2 ring-blue-100' :
                                      isPassed ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                    }`} />
                                    <span className={`text-[8.5px] mt-1 font-bold ${
                                      isActive ? 'text-blue-600 font-extrabold' :
                                      isPassed ? 'text-slate-700' : 'text-slate-400'
                                    }`}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom: Order Actions */}
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Need help with your order? <span className="text-blue-600 hover:underline cursor-pointer">Contact Support</span>
                      </span>
                      <a 
                        href={`/api/invoice/${order.order_id}`} 
                        download={`invoice-${order.order_id.slice(0, 8)}.pdf`}
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[10.5px] font-extrabold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Download Invoice</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        <>
          {/* Category Navigation Bar (Flipkart Style) */}
          <div className="bg-white border-b border-slate-200 py-3.5 shadow-sm overflow-x-auto scrollbar-none z-20">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 md:gap-8 min-w-[950px] md:min-w-0">
              {[
                { label: 'For You', icon: Sparkles, color: 'text-amber-500 bg-amber-50' },
                { label: 'Fashion', icon: Shirt, color: 'text-blue-500 bg-blue-50' },
                { label: 'Mobiles', icon: Smartphone, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Beauty', icon: Heart, color: 'text-pink-500 bg-pink-50' },
                { label: 'Electronics', icon: Monitor, color: 'text-indigo-500 bg-indigo-50' },
                { label: 'Home', icon: Lamp, color: 'text-orange-500 bg-orange-50' },
                { label: 'Appliances', icon: Tv, color: 'text-purple-500 bg-purple-50' },
                { label: 'Toys, Kids', icon: ToyBrick, color: 'text-teal-500 bg-teal-50' },
                { label: 'Food & Grocery', icon: Carrot, color: 'text-red-500 bg-red-50' },
                { label: 'Auto Acc', icon: Wrench, color: 'text-slate-650 bg-slate-55 animate-pulse' },
                { label: 'Sports', icon: Trophy, color: 'text-yellow-650 bg-yellow-50' },
                { label: 'Books', icon: BookOpen, color: 'text-cyan-600 bg-cyan-50' },
                { label: 'Furniture', icon: Sofa, color: 'text-amber-700 bg-amber-50' },
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSelectedCategory(cat.label === 'For You' ? null : cat.label);
                  }}
                  className={`flex flex-col items-center gap-1 group hover:scale-[1.05] active:scale-[0.98] transition-all cursor-pointer`}
                >
                  <div className={`p-2.5 rounded-2xl ${cat.color} group-hover:shadow-md transition-all ${
                    (cat.label === 'For You' && !selectedCategory) || selectedCategory === cat.label
                      ? 'ring-2 ring-blue-500 shadow-md scale-105'
                      : ''
                  }`}>
                    <cat.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[10px] font-bold transition-colors uppercase tracking-wider ${
                    (cat.label === 'For You' && !selectedCategory) || selectedCategory === cat.label
                      ? 'text-blue-600 font-extrabold'
                      : 'text-slate-600 group-hover:text-blue-600'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main product display grid */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
            
            {/* Intro banners */}
            <div className="space-y-1.5 text-left border-b border-slate-200 pb-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Catalog Collections
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                Discover and purchase premium technology products and ergonomic desk setups.
              </p>
            </div>

            {/* Load indicators */}
            {loading && products.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-sm font-medium">Syncing store items...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-slate-450 gap-2">
                <ShoppingBag className="h-12 w-12 text-slate-300 mb-2" />
                <span className="font-bold text-slate-700">No Products Available</span>
                <span className="text-xs">Adjust search text or check back later!</span>
              </div>
            ) : (
              /* Products catalog responsive card grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const sellingPrice = Math.round(product.price * 100);
                  const originalPrice = Math.round(sellingPrice * 1.25);
                  const bankOfferPrice = Math.round(sellingPrice * 0.95);
                  return (
                    <div 
                      key={product.product_id}
                      onClick={() => setSelectedProduct(product)}
                      className="overflow-hidden border border-slate-100 flex flex-col justify-between group hover:shadow-lg transition-all duration-300 rounded-xl bg-white shadow-sm cursor-pointer"
                    >
                      {/* Product Image top */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-50 flex items-center justify-center border-b border-slate-100">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-slate-300" />
                        )}
                        {/* Category tag */}
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 text-white text-[9px] font-extrabold uppercase tracking-wide rounded">
                          {product.category}
                        </span>

                        {/* Rating pill overlay bottom-left */}
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white border border-slate-150 rounded shadow-sm flex items-center gap-0.5 text-[10px] font-bold text-slate-805">
                          <span>{product.rating || '4.2'}</span>
                          <span className="text-emerald-600 font-extrabold text-[9px]">★</span>
                        </div>
                      </div>

                      {/* Details middle */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold text-slate-805 group-hover:text-blue-600 transition-colors line-clamp-1 font-sans text-xs">
                            {product.name}
                          </h3>
                          
                          {/* Stock indicator */}
                          <div className="text-[10px] text-slate-500 font-medium">
                            Stock: <span className={product.stock <= 5 ? 'text-rose-650 font-bold' : 'text-slate-500'}>{product.stock} units</span>
                          </div>
                        </div>

                        {/* Pricing info */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-400 line-through font-medium">
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              ₹{sellingPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-650 uppercase">
                              20% off
                            </span>
                          </div>
                          <div className="text-[10.5px] text-blue-650 font-extrabold flex items-center gap-0.5">
                            <span>₹{bankOfferPrice.toLocaleString('en-IN')}</span>
                            <span className="text-slate-400 font-normal">with Bank offer</span>
                          </div>
                        </div>

                        {/* Footer add to cart */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9.5px] text-slate-400 font-bold">Free Delivery</span>
                          <button 
                            className="py-1.5 px-3 bg-[#fb641b] hover:bg-[#e15310] text-white rounded text-[11px] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            Add To Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* Product Details Modal popup */}
      {selectedProduct && (() => {
        const sellingPrice = Math.round(selectedProduct.price * 100);
        const originalPrice = Math.round(sellingPrice * 1.25);
        const bankOfferPrice = Math.round(sellingPrice * 0.95);
        const axisDiscount = Math.round(sellingPrice * 0.057);
        const sbiDiscount = Math.round(sellingPrice * 0.05);
        const discountAmount = originalPrice - sellingPrice;

        // Extract brand name from first word of product name
        const brand = selectedProduct.name.split(' ')[0] || 'ShopSphere';
        const color = selectedProduct.category === 'Fashion' ? 'Crimson Red / Obsidian Blue' 
                    : selectedProduct.category === 'Mobiles' ? 'Space Obsidian / Metallic Silver' 
                    : selectedProduct.category === 'Electronics' ? 'Matte Slate / Charcoal Gray' 
                    : 'Classic White / Walnut Wood';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-150 flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">
              
              {/* Close Button top right */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-900 rounded-full transition-all z-10"
                aria-label="Close details"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Left Column: Product Image Carousel */}
              <div className="w-full md:w-1/2 p-6 flex flex-col items-center gap-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                {(() => {
                  const imagesList = selectedProduct.image_url
                    ? (selectedProduct.image_url.includes(',')
                        ? selectedProduct.image_url.split(',').map(s => s.trim()).filter(Boolean)
                        : [selectedProduct.image_url])
                    : [];
                  const angleLabels = ["Front View", "Side View", "Back View"];
                  
                  // Ensure activeImageIndex stays within bounds of actual images list
                  const safeIndex = activeImageIndex < imagesList.length ? activeImageIndex : 0;
                  const activeImg = imagesList[safeIndex] || '';

                  return (
                    <div className="w-full flex flex-col items-center gap-4">
                      {/* Main active image preview */}
                      <div className="relative border border-slate-200 rounded-xl bg-white w-full aspect-video md:aspect-[4/3] flex items-center justify-center p-6 shadow-sm">
                        
                        {/* Wishlist & Share Float Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-full border border-slate-200 shadow-sm transition-colors">
                            <Heart className="h-4.5 w-4.5" />
                          </button>
                          <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-505 rounded-full border border-slate-200 shadow-sm transition-colors">
                            <Send className="h-4 w-4 rotate-45" />
                          </button>
                        </div>

                        {/* Image element */}
                        {activeImg ? (
                          <img 
                            src={activeImg} 
                            alt={`${selectedProduct.name} - View ${safeIndex}`}
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-16 w-16 text-slate-205" />
                        )}
                        {/* Overlay Category */}
                        <span className="absolute top-4 left-4 bg-[#2874f0] text-white text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                          {selectedProduct.category}
                        </span>
                      </div>

                      {/* 3-Angle thumbnail strip - Only shown if product actually has multiple images */}
                      {imagesList.length > 1 && (
                        <div className="flex gap-3 justify-center w-full">
                          {imagesList.map((img, idx) => (
                            <button
                              key={idx}
                              onMouseEnter={() => setActiveImageIndex(idx)}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`w-20 h-20 border rounded-xl overflow-hidden bg-white p-1.5 flex flex-col items-center justify-between transition-all shadow-sm ${
                                safeIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105' : 'border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <div className="h-12 w-full flex items-center justify-center">
                                <img src={img} className="max-h-full max-w-full object-contain" alt="" />
                              </div>
                              <span className="text-[7.5px] font-black uppercase text-slate-500 block tracking-wide pt-1">
                                {angleLabels[idx] || `View ${idx + 1}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Specifications & Pricing details */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  {/* Brand & Title */}
                  <div className="text-left">
                    <span className="text-[10px] text-blue-600 font-extrabold hover:underline cursor-pointer uppercase tracking-wider block">Visit {brand} Store</span>
                    <h2 className="text-lg font-black text-slate-900 leading-snug mt-1">
                      {selectedProduct.name}
                    </h2>
                    
                    {/* Stars and Reviews */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black flex items-center gap-0.5">
                        <span>{selectedProduct.rating || '4.2'}</span>
                        <span className="text-[9px]">★</span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">1,245 Ratings & 182 Reviews</span>
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="bg-[#f0f5ff]/50 border border-blue-100 p-4 rounded-xl text-left space-y-2.5">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-[18px] font-black text-emerald-650 flex items-center gap-0.5">
                        <span>↓</span>20% Off
                      </span>
                      <span className="text-xs text-slate-450 line-through font-semibold">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{sellingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    {/* Discount & Savings Info */}
                    <div className="text-[11px] text-slate-550 font-bold border-t border-blue-100/50 pt-2 flex justify-between">
                      <span>Total Savings:</span>
                      <span className="text-emerald-650 font-extrabold">₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Flipkart Bank Offers Box */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-blue-650 text-white px-3.5 py-2 text-[10px] font-black flex items-center justify-between">
                      <span>APPLY OFFERS FOR MAXIMUM SAVINGS</span>
                      <span>▲</span>
                    </div>
                    
                    <div className="p-3.5 bg-white space-y-2.5 text-left text-[10px] leading-relaxed">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase">Best</span>
                          <span className="font-extrabold text-slate-800 ml-1.5">₹{axisDiscount.toLocaleString('en-IN')} off</span>
                          <span className="text-slate-455 block text-[8.5px] mt-0.5">Flipkart Axis Credit Card cashback & discounts</span>
                        </div>
                        <button className="text-blue-600 font-extrabold hover:underline">Apply</button>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase">Bank</span>
                          <span className="font-extrabold text-slate-800 ml-1.5">₹{sbiDiscount.toLocaleString('en-IN')} off</span>
                          <span className="text-slate-455 block text-[8.5px] mt-0.5">Flipkart SBI Credit Card + 5% Instant Discount</span>
                        </div>
                        <button className="text-blue-600 font-extrabold hover:underline">Apply</button>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="text-left space-y-2">
                    <span className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold block">Product Specifications</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      {[
                        { key: "Brand", val: brand },
                        { key: "Category", val: selectedProduct.category },
                        { key: "Color", val: color },
                        { key: "Cost Price", val: `₹${originalPrice.toLocaleString('en-IN')}` },
                        { key: "Discount Cost", val: `₹${sellingPrice.toLocaleString('en-IN')} (20% Off)` },
                        { 
                          key: "Delivery Status", 
                          val: locationInfo
                            ? `HOUSE NO: ${locationInfo.houseNumber}, ${locationInfo.village || locationInfo.town}, ${locationInfo.city}, ${locationInfo.state} - ${locationInfo.pincode} (Free Delivery)`
                            : "Delivery by Wednesday, 15 Jul (Free Delivery)"
                        },
                        { key: "Stock Available", val: `${selectedProduct.stock} units left` },
                        { key: "Warranty Info", val: "1 Year Onsite Support" }
                      ].map((spec, idx) => (
                        <div 
                          key={spec.key} 
                          className={`flex items-center p-2.5 ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'} border-b border-slate-100 last:border-b-0`}
                        >
                          <span className="w-1/3 text-slate-450 font-bold">{spec.key}</span>
                          <span className="w-2/3 text-slate-750 font-extrabold">{spec.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom buy buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3.5 bg-[#ffc200] hover:bg-[#e0ab00] text-slate-900 rounded-xl font-extrabold text-[12px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>ADD TO CART</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setCheckoutProduct(selectedProduct);
                      setCheckoutQuantity(1);
                      setCheckoutStep('details');
                      setSelectedProduct(null);
                      window.scrollTo(0, 0); // Scroll back to top of checkout details page
                    }}
                    className="flex-1 py-3.5 bg-[#fb641b] hover:bg-[#e15310] text-white rounded-xl font-extrabold text-[12px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>BUY NOW</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-150 relative animate-in zoom-in-95 duration-200 text-left">
            {/* Close icon */}
            <button 
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Setup Delivery Location
                </h3>
              </div>
              <button 
                type="button"
                onClick={handleDetectLocation}
                className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1 shadow-sm shrink-0"
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>Use Live Location</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-5 leading-normal font-semibold">
              Enter your address details to customize your shipping schedule. If not set, delivery defaults to Madanapalle.
            </p>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">House Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 14-765"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locHouseNumber}
                    onChange={(e) => setLocHouseNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">Pin Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 517350"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locPincode}
                    onChange={(e) => setLocPincode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">Village</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Angallu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locVillage}
                    onChange={(e) => setLocVillage(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">Town</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kadiri Highway"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locTown}
                    onChange={(e) => setLocTown(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Madanapalle"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locCity}
                    onChange={(e) => setLocCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">State</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Andhra Pradesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={locState}
                    onChange={(e) => setLocState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-50 font-extrabold text-[11px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-extrabold text-[11px] transition-colors shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

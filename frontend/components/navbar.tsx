'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { User, Bell, AlertTriangle, ShoppingBag, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface NotificationItem {
  id: string;
  type: 'stock' | 'order';
  title: string;
  message: string;
  time: string;
}

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      // 1. Fetch low stock products (<= 5 units remaining, excluding Draft products)
      const { data: lowStockProds } = await supabase
        .from('products')
        .select('product_id, name, stock')
        .lte('stock', 5)
        .neq('status', 'Draft');

      // 2. Fetch pending customer order requests
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select(`
          order_id,
          quantity,
          order_date,
          products (
            name
          )
        `)
        .eq('status', 'Pending')
        .order('order_date', { ascending: false });

      const list: NotificationItem[] = [];

      if (lowStockProds) {
        lowStockProds.forEach(p => {
          list.push({
            id: `stock-${p.product_id}`,
            type: 'stock',
            title: 'Inventory Alert',
            message: `${p.name} is running low (Stock: ${p.stock})`,
            time: 'Low Stock',
          });
        });
      }

      if (pendingOrders) {
        pendingOrders.forEach((o: any) => {
          list.push({
            id: `order-${o.order_id}`,
            type: 'order',
            title: 'New Order',
            message: `Order of ${o.quantity}x ${o.products?.name || 'Product'} is pending fulfillment`,
            time: new Date(o.order_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          });
        });
      }

      setNotifications(list);
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications list every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-md font-black tracking-wider uppercase text-slate-800">
          Admin Panel
        </h2>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Notifications indicator */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors relative cursor-pointer select-none"
          aria-label="Toggle notifications menu"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-36 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Notifications ({notifications.length})
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-slate-500 font-medium">
                  All quiet! No notifications.
                </div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50/50 flex gap-3 text-left transition-colors">
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'stock' ? (
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold text-slate-800 mb-0.5">
                        {item.title}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed break-words">
                        {item.message}
                      </p>
                      <span className="block text-[9px] text-slate-400 font-mono mt-1">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* User profile details */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-extrabold text-slate-800">
              Admin Account
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              {user?.email || 'authenticating...'}
            </span>
          </div>

          <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

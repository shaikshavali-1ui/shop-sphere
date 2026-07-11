'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Customer, Order, Product } from '@/types/database.types';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Users, Search, X, Loader2, Calendar, Mail, 
  Phone, MapPin, ShoppingCart, IndianRupee, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Detailed order type with product title join
interface CustomerOrderDetails extends Order {
  products: {
    name: string;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Selected customer state for the drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // 1. Fetch customer list
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        // Match search query against name, email, or phone
        query = query.or(
          `name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-8rem)]">
      {/* Page Title */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-605" />
          Customer Directory
        </h1>
        <p className="text-slate-500 text-sm">
          Browse customer profile details, locations, order logs, and total store expenditures.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-lg">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
          <Search className="h-4.5 w-4.5" />
        </span>
        <input
          type="text"
          className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          placeholder="Search by name, email, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <div className="glass-panel overflow-hidden border border-slate-200 bg-white shadow-sm">
        {loading && customers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-605" />
            <span>Loading customer list...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-550 gap-2">
            <Users className="h-10 w-10 text-slate-400 mb-2" />
            <span className="font-semibold text-slate-700">No Customers Found</span>
            <span className="text-xs text-slate-450">Verify your search term or add a user in Supabase.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-55 text-slate-600 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                {customers.map((cust) => (
                  <tr
                    key={cust.customer_id}
                    onClick={() => setSelectedCustomerId(cust.customer_id)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 px-6 font-bold text-slate-805">
                      {cust.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        {cust.email}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {cust.phone ? (
                        <span className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-500" />
                          {cust.phone}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 truncate max-w-xs">
                      {cust.address ? (
                        <span className="flex items-center gap-2 text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          {cust.address}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-xs text-slate-400">
                      {new Date(cust.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Drawer Panel overlay */}
      <CustomerDrawer
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onUpdate={fetchCustomers}
      />
    </div>
  );
}

// -------------------------------------------------------------
// PROFILE SLIDE-OUT DRAWER PANEL (LAZY & PAGINATED)
// -------------------------------------------------------------
interface DrawerProps {
  customerId: string | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const CustomerDrawer: React.FC<DrawerProps> = ({ customerId, onClose, onUpdate }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrderDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  // Aggregated Stats
  const [totalOrders, setTotalOrders] = useState(0);
  const [lifetimeSpend, setLifetimeSpend] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const ordersPerPage = 5;

  const fetchCustomerDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // 1. Fetch customer demographic data
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', id)
        .single();
      if (error) throw error;
      setCustomer(data);
      if (data) {
        setEditedName(data.name || '');
        setEditedPhone(data.phone || '');
        setEditedAddress(data.address || '');
      }

      // 2. Fetch customer aggregated statistics
      const { data: statsData, error: statsError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', id);
      if (statsError) throw statsError;

      if (statsData) {
        setTotalOrders(statsData.length);
        const sum = statsData.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
        setLifetimeSpend(sum);
      }
    } catch (err) {
      console.error('Error fetching customer profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save changes to database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editedName,
          phone: editedPhone,
          address: editedAddress
        })
        .eq('customer_id', customer.customer_id);

      if (error) throw error;

      // Update local state details
      setCustomer({
        ...customer,
        name: editedName,
        phone: editedPhone,
        address: editedAddress
      });

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error saving customer profile details:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Fetch paginated customer orders
  const fetchCustomerOrders = useCallback(async (id: string, currentPage: number, clearPrevious = false) => {
    setLoadingOrders(true);
    try {
      const from = currentPage * ordersPerPage;
      const to = from + ordersPerPage - 1;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name
          )
        `)
        .eq('customer_id', id)
        .order('order_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const typedData = (data || []) as unknown as CustomerOrderDetails[];

      if (clearPrevious) {
        setOrders(typedData);
      } else {
        setOrders(prev => [...prev, ...typedData]);
      }

      // Check if there are more orders remaining
      setHasMore(typedData.length === ordersPerPage);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load details and first page when customerId changes
  useEffect(() => {
    if (customerId) {
      setIsEditing(false);
      fetchCustomerDetails(customerId);
      setPage(0);
      fetchCustomerOrders(customerId, 0, true);
    } else {
      setCustomer(null);
      setOrders([]);
      setIsEditing(false);
    }
  }, [customerId, fetchCustomerDetails, fetchCustomerOrders]);

  const loadMoreOrders = () => {
    if (customerId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomerOrders(customerId, nextPage, false);
    }
  };

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
      {/* Overlay background */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer content body */}
      <div className="w-full max-w-md bg-white border-l border-slate-205 shadow-2xl relative z-50 flex flex-col h-full overflow-hidden animate-slide-in">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-150 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Customer Profile
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-slate-450 hover:text-slate-805 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Fetching profile...</span>
            </div>
          ) : (
            customer && (
              <>
                {/* Demographic card */}
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-left bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Edit Profile Details</span>
                    </div>

                    <Input
                      id="edit-cust-name"
                      label="Full Name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />

                    <Input
                      id="edit-cust-phone"
                      label="Phone Number"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="e.g. +91 99999 99999"
                    />

                    <Input
                      id="edit-cust-address"
                      label="Street Address"
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      placeholder="e.g. House No, Street, City, State"
                    />

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
                        disabled={updating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                        disabled={updating}
                      >
                        {updating && <Loader2 className="h-3 w-3 animate-spin" />}
                        Save Details
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-xl font-black text-slate-805 leading-tight">
                        {customer.name}
                      </h4>
                      <button
                        onClick={() => {
                          setEditedName(customer.name || '');
                          setEditedPhone(customer.phone || '');
                          setEditedAddress(customer.address || '');
                          setIsEditing(true);
                        }}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-750 hover:text-slate-900 rounded text-xs font-bold transition-all cursor-pointer"
                      >
                        Edit Info
                      </button>
                    </div>

                    <div className="space-y-2.5 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="font-mono text-xs">
                          {customer.phone || <span className="text-slate-400 italic">No phone provided</span>}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          {customer.address || <span className="text-slate-400 italic">No address provided</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>Member since {new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance stats ribbons */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-1.5 text-blue-600">
                      <ShoppingCart className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                      Total Orders
                    </span>
                    <span className="text-xl font-bold text-slate-800">
                      {totalOrders}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-1.5 text-emerald-600">
                      <IndianRupee className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                      Lifetime Spend
                    </span>
                    <span className="text-xl font-bold text-slate-800">
                      ₹{Math.round(lifetimeSpend * 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Purchase Order History logs (paginated) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-150 pb-2">
                    Purchase History
                  </span>

                  {orders.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No purchase orders recorded.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => {
                        let statusStyles = '';
                        if (order.status === 'Delivered') {
                          statusStyles = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                        } else if (order.status === 'Pending') {
                          statusStyles = 'text-amber-700 bg-amber-50 border-amber-100';
                        } else {
                          statusStyles = 'text-blue-700 bg-blue-50 border-blue-105';
                        }

                        return (
                          <div 
                            key={order.order_id} 
                            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg p-3 transition-colors text-left flex justify-between items-start gap-4"
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">
                                {order.products?.name || 'Product deleted'}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span>Qty: {order.quantity}</span>
                                <span>•</span>
                                <span>{new Date(order.order_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-xs font-mono font-black text-slate-805">
                                ₹{Math.round(Number(order.total_amount) * 100).toLocaleString('en-IN')}
                              </span>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-semibold border ${statusStyles}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Load More pagination button */}
                      {hasMore && (
                        <button
                          onClick={loadMoreOrders}
                          disabled={loadingOrders}
                          className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          {loadingOrders ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                          ) : (
                            <>
                              Load More Orders
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

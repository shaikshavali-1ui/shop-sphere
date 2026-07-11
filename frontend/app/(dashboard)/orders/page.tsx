'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Order, Customer, Product } from '@/types/database.types';
import { 
  ShoppingCart, Loader2, Download, AlertTriangle, 
  CheckCircle, ArrowRight, ClipboardList, RefreshCw 
} from 'lucide-react';

interface OrderWithRelations extends Order {
  customers: {
    name: string;
    email: string;
  } | null;
  products: {
    name: string;
    stock: number;
    price: number;
  } | null;
}

const STATUS_STAGES: Order['status'][] = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [allOrders, setAllOrders] = useState<OrderWithRelations[]>([]); // Demo Mode full orders
  const [loading, setLoading] = useState(true);

  // Status transition states
  const [activeTransition, setActiveTransition] = useState<{
    orderId: string;
    targetStatus: Order['status'];
    productId: string;
    quantity: number;
    currentStatus: Order['status'];
  } | null>(null);

  // Dialog configurations
  const [stockAlert, setStockAlert] = useState<{
    required: number;
    available: number;
    productName: string;
  } | null>(null);
  const [sequenceAlert, setSequenceAlert] = useState<{
    message: string;
  } | null>(null);

  // Toast notices
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Orders from Supabase
  const fetchOrders = useCallback(async () => {
    const isDbConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id');
    if (typeof window !== 'undefined' && (localStorage.getItem('shopsphere_demo_session') || !isDbConfigured)) {
      setLoading(true);
      let baseOrders = allOrders;
      if (baseOrders.length === 0) {
        baseOrders = [
          {
            order_id: 'demo-ord-1',
            customer_id: 'demo-cust-1',
            product_id: 'demo-prod-electronics-1',
            quantity: 1,
            total_amount: 59.99,
            status: 'Pending',
            order_date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            customers: {
              name: 'John Doe',
              email: 'john.doe@example.com'
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
        setAllOrders(baseOrders);
      }
      setOrders(baseOrders);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name,
            email
          ),
          products (
            name,
            stock,
            price
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as unknown as OrderWithRelations[]);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setErrorMsg('Failed to load transaction orders.');
    } finally {
      setLoading(false);
    }
  }, [allOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // 2. Main Order Status transition trigger
  const handleStatusChangeAttempt = async (
    orderId: string, 
    targetStatus: Order['status'], 
    currentStatus: Order['status'],
    productId: string, 
    quantity: number
  ) => {
    setErrorMsg(null);
    setStockAlert(null);
    setSequenceAlert(null);

    // If no change, return
    if (targetStatus === currentStatus) return;

    // If target status is Cancelled, Return Requested, or Returned, skip sequence checking
    if (targetStatus === 'Cancelled' || targetStatus === 'Return Requested' || targetStatus === 'Returned') {
      executeUpdateStatus(orderId, targetStatus, currentStatus, productId, quantity);
      return;
    }

    const currentIndex = STATUS_STAGES.indexOf(currentStatus);
    const targetIndex = STATUS_STAGES.indexOf(targetStatus);

    // Enforce sequence check
    const isSequential = targetIndex === currentIndex + 1;
    const isGoingBackwards = targetIndex < currentIndex;

    // Save transition context
    const context = { orderId, targetStatus, productId, quantity, currentStatus };
    setActiveTransition(context);

    // A. Check for stock availability before marking as "Shipped" or "Delivered"
    if ((targetStatus === 'Shipped' || targetStatus === 'Delivered') && currentStatus !== 'Shipped' && currentStatus !== 'Delivered') {
      try {
        const isDbConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                               !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id');
        if (typeof window !== 'undefined' && (localStorage.getItem('shopsphere_demo_session') || !isDbConfigured)) {
          executeUpdateStatus(orderId, targetStatus, currentStatus, productId, quantity);
          return;
        }

        const { data: product, error } = await supabase
          .from('products')
          .select('name, stock')
          .eq('product_id', productId)
          .single();

        if (error || !product) {
          setErrorMsg('Failed to check product stock.');
          return;
        }

        if (product.stock < quantity) {
          setStockAlert({
            required: quantity,
            available: product.stock,
            productName: product.name
          });
          return;
        }
      } catch (err) {
        setErrorMsg('Error checking stock levels.');
        return;
      }
    }

    // B. Check for sequence deviation
    if (!isSequential) {
      let msg = '';
      if (isGoingBackwards) {
        msg = `You are moving the order state backward from "${currentStatus}" to "${targetStatus}". Is this override intended?`;
      } else {
        msg = `You are skipping stages from "${currentStatus}" to "${targetStatus}" (Skipped: ${STATUS_STAGES.slice(currentIndex + 1, targetIndex).join(', ')}). Proceed?`;
      }
      setSequenceAlert({ message: msg });
      return;
    }

    // C. All checks pass directly - execute update
    executeUpdateStatus(orderId, targetStatus, currentStatus, productId, quantity);
  };

  // Perform SQL Updates & decrement stock if shipped
  const executeUpdateStatus = async (
    orderId: string,
    targetStatus: Order['status'],
    currentStatus: Order['status'],
    productId: string,
    quantity: number
  ) => {
    setLoading(true);

    const isDbConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id');
    if (typeof window !== 'undefined' && (localStorage.getItem('shopsphere_demo_session') || !isDbConfigured)) {
      const updated = allOrders.map(ord => {
        if (ord.order_id === orderId) {
          return {
            ...ord,
            status: targetStatus
          };
        }
        return ord;
      });
      setAllOrders(updated);
      setOrders(updated);
      setSuccessMsg(`Order updated to status: ${targetStatus}`);
      setLoading(false);
      setActiveTransition(null);
      setStockAlert(null);
      setSequenceAlert(null);
      return;
    }

    try {
      // 1. If transitioning to "Shipped" or "Delivered" from a state where stock wasn't decremented, decrement stock
      if ((targetStatus === 'Shipped' || targetStatus === 'Delivered') && 
          (currentStatus !== 'Shipped' && currentStatus !== 'Delivered' && currentStatus !== 'Return Requested')) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('product_id', productId)
          .single();
        
        if (product) {
          const newStock = Math.max(0, product.stock - quantity);
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('product_id', productId);
        }
      }

      // 2. If transitioning to a stock-restored status (Pending/Packed/Cancelled/Returned) from a decremented status (Shipped/Delivered/Return Requested), restore stock
      const isStockRestoringTarget = ['Pending', 'Packed', 'Cancelled', 'Returned'].includes(targetStatus);
      const isStockDecrementedSource = ['Shipped', 'Delivered', 'Return Requested'].includes(currentStatus);

      if (isStockRestoringTarget && isStockDecrementedSource) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('product_id', productId)
          .single();
        
        if (product) {
          const newStock = product.stock + quantity;
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('product_id', productId);
        }
      }

      // 3. Update the order status
      const { error } = await supabase
        .from('orders')
        .update({ status: targetStatus })
        .eq('order_id', orderId);

      if (error) throw error;

      setSuccessMsg(`Order updated to status: ${targetStatus}`);
      fetchOrders();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
      setActiveTransition(null);
      setStockAlert(null);
      setSequenceAlert(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm shadow-lg backdrop-blur-md">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm shadow-lg backdrop-blur-md">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Fulfillment Orders
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor incoming client orders, progress shipping cycles, and export PDF invoice receipts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Orders Registry Console */}
      <div className="glass-panel overflow-hidden border border-slate-200 bg-white shadow-sm">
        {loading && orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-605" />
            <span>Loading database transactions...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
            <ClipboardList className="h-10 w-10 text-slate-400 mb-2" />
            <span className="font-semibold text-slate-700">No Orders Registered</span>
            <span className="text-xs text-slate-450">Once users purchase items, transactions will appear here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Quantity</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Order Date</th>
                  <th className="py-4 px-6">Fulfillment Stage</th>
                  <th className="py-4 px-6 text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                {orders.map((order) => {
                  let badgeColor = '';
                  if (order.status === 'Pending') badgeColor = 'border-amber-205 bg-amber-50 text-amber-700';
                  else if (order.status === 'Packed') badgeColor = 'border-blue-200 bg-blue-50 text-blue-700';
                  else if (order.status === 'Shipped') badgeColor = 'border-sky-200 bg-sky-50 text-sky-700';
                  else if (order.status === 'Cancelled') badgeColor = 'border-rose-200 bg-rose-50 text-rose-700';
                  else if (order.status === 'Return Requested') badgeColor = 'border-amber-200 bg-amber-50 text-amber-700';
                  else if (order.status === 'Returned') badgeColor = 'border-amber-200 bg-amber-50 text-amber-700';
                  else badgeColor = 'border-emerald-200 bg-emerald-50 text-emerald-700';

                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-blue-600">
                        #{order.order_id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{order.customers?.name || 'Deleted Account'}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{order.customers?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div>
                          {order.products?.name || <span className="text-slate-400 italic">Deleted Product</span>}
                          {(order.status === 'Return Requested' || order.status === 'Returned') && order.return_reason && (
                            <div className="text-[10px] text-amber-600 font-bold mt-1">
                              Reason: {order.return_reason}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-center font-bold">
                        {order.quantity}
                      </td>
                      <td className="py-4 px-6 font-mono font-black text-slate-900">
                        ₹{Math.round(Number(order.total_amount) * 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {new Date(order.order_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        {/* Dropdown status changer styled cleanly */}
                        <div className="relative inline-block w-32">
                          <select
                            className={`w-full bg-white border rounded-lg py-1.5 pl-3 pr-8 text-xs font-bold outline-none cursor-pointer appearance-none transition-all duration-200 ${badgeColor}`}
                            value={order.status}
                            onChange={(e) => handleStatusChangeAttempt(
                                order.order_id,
                                e.target.value as Order['status'],
                                order.status,
                                order.product_id,
                                order.quantity
                              )}
                          >
                            {STATUS_STAGES.map(stage => (
                              <option key={stage} value={stage} className="bg-white text-slate-800 font-bold">
                                {stage}
                              </option>
                              ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-550">
                            <ArrowRight className="h-3 w-3 rotate-90" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/api/invoice/${order.order_id}`}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRITICAL STOCK ALARM DIALOG */}
      {stockAlert && activeTransition && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-605 rounded-full animate-bounce">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-rose-700 mb-2">Insufficient Stock Alarm</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Cannot ship this order! The product **{stockAlert.productName}** does not have enough stock.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-left mb-6 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-450">Required Quantity:</span>
                <span className="text-slate-800 font-bold">{stockAlert.required}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Available Stock:</span>
                <span className="text-rose-600 font-bold">{stockAlert.available}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setStockAlert(null);
                  setActiveTransition(null);
                }}
                className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Close / Replenish Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEQUENCE DEVIATION WARNING DIALOG */}
      {sequenceAlert && activeTransition && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Fulfillment Sequence Override</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {sequenceAlert.message}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSequenceAlert(null);
                  setActiveTransition(null);
                }}
                className="py-2 px-5 bg-slate-105 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer animate-in fade-in duration-100"
              >
                Cancel Override
              </button>
              <button
                onClick={() => executeUpdateStatus(
                    activeTransition.orderId,
                    activeTransition.targetStatus,
                    activeTransition.currentStatus,
                    activeTransition.productId,
                    activeTransition.quantity
                  )}
                className="py-2 px-5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-amber-600/10 cursor-pointer"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

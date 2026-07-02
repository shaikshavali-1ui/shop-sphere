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

const STATUS_STAGES: Order['status'][] = ['Pending', 'Packed', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
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
  }, []);

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
    try {
      // 1. If transitioning to "Shipped" from a non-shipped state, decrement stock in database
      if ((targetStatus === 'Shipped' || targetStatus === 'Delivered') && currentStatus !== 'Shipped' && currentStatus !== 'Delivered') {
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

      // 2. If reversing from "Shipped"/"Delivered" back to "Pending"/"Packed", restore product stock
      if (currentStatus === 'Shipped' || currentStatus === 'Delivered') {
        if (targetStatus === 'Pending' || targetStatus === 'Packed') {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-indigo-500" />
            Fulfillment Orders
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor incoming client orders, progress shipping cycles, and export PDF invoice receipts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-slate-900/40 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Orders Registry Console */}
      <div className="glass-panel overflow-hidden border border-white/5">
        {loading && orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span>Loading database transactions...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <ClipboardList className="h-10 w-10 text-slate-600 mb-2" />
            <span className="font-semibold text-slate-300">No Orders Registered</span>
            <span className="text-xs">Once users purchase items, transactions will appear here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/30 text-slate-300 text-xs font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {orders.map((order) => {
                  let badgeColor = '';
                  if (order.status === 'Pending') badgeColor = 'border-amber-500/20 bg-amber-500/5 text-amber-400';
                  else if (order.status === 'Packed') badgeColor = 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400';
                  else if (order.status === 'Shipped') badgeColor = 'border-sky-500/20 bg-sky-500/5 text-sky-400';
                  else badgeColor = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';

                  return (
                    <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-400">
                        #{order.order_id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">{order.customers?.name || 'Deleted Account'}</span>
                          <span className="text-[10px] text-slate-500">{order.customers?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {order.products?.name || <span className="text-slate-600 italic">Deleted Product</span>}
                      </td>
                      <td className="py-4 px-6 font-mono text-center font-semibold">
                        {order.quantity}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-100">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
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
                            className={`w-full bg-slate-950/60 border rounded-lg py-1.5 pl-3 pr-8 text-xs font-bold outline-none cursor-pointer appearance-none transition-all duration-200 ${badgeColor}`}
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
                              <option key={stage} value={stage} className="bg-slate-950 text-slate-250 font-bold">
                                {stage}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <ArrowRight className="h-3 w-3 rotate-90" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/api/invoice/${order.order_id}`}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/50 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md p-6 text-center border border-rose-500/25 bg-rose-950/5 relative">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full glow-rose animate-bounce">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-rose-400 mb-2">Insufficient Stock Alarm</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Cannot ship this order! The product **{stockAlert.productName}** does not have enough stock.
            </p>

            <div className="bg-slate-950/50 border border-white/5 rounded-lg p-4 text-xs text-left mb-6 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Required Quantity:</span>
                <span className="text-slate-200 font-bold">{stockAlert.required}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available Stock:</span>
                <span className="text-rose-400 font-bold">{stockAlert.available}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setStockAlert(null);
                  setActiveTransition(null);
                }}
                className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700/50"
              >
                Close / Replenish Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEQUENCE DEVIATION WARNING DIALOG */}
      {sequenceAlert && activeTransition && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md p-6 text-center border border-amber-500/20 bg-slate-900 relative">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full glow-amber">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100 mb-2">Fulfillment Sequence Override</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {sequenceAlert.message}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSequenceAlert(null);
                  setActiveTransition(null);
                }}
                className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700/50"
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
                className="py-2 px-5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-amber-600/10"
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

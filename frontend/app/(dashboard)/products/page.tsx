'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types/database.types';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, Search, Plus, Edit2, Trash2, 
  X, Upload, Loader2, AlertTriangle, AlertCircle, 
  Image as ImageIcon, CheckCircle 
} from 'lucide-react';

export default function ProductsPage() {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Out of Stock'>('Draft');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // User notifications & warnings
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // 1. Fetch products & compile distinct categories list
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);

      // Pull unique categories for filtering list (on initial load or updates)
      if (data) {
        const uniqueCats = Array.from(new Set(data.map(p => p.category)));
        setCategories(uniqueCats);
      }
    } catch (err: any) {
      setErrorMsg('Failed to fetch product listing.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-open edit modal if "edit" query parameter is passed (for links from low stock alarms)
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) {
        const productToEdit = products.find(p => p.product_id === editId);
        if (productToEdit) {
          openModal('edit', productToEdit);
          // Clean history URL query param
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [products]);

  // Clear messages automatically after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 6000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Open modal helper
  const openModal = (mode: 'add' | 'edit', product: Product | null = null) => {
    setModalMode(mode);
    setErrorMsg(null);
    if (mode === 'edit' && product) {
      setCurrentProduct(product);
      setName(product.name);
      setPrice(Math.round(product.price * 100).toString());
      setStock(product.stock.toString());
      setCategory(product.category);
      setStatus(product.status);
      setImageUrl(product.image_url || '');
    } else {
      setCurrentProduct(null);
      setName('');
      setPrice('');
      setStock('');
      setCategory('');
      setStatus('Draft');
      setImageUrl('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      // Pre-fill image path with local name
      setImageUrl(URL.createObjectURL(file));
    }
  };

  // Perform upload to Supabase Storage bucket
  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.warn("Storage upload failed (possibly due to bucket RLS policies):", err.message);
      // If upload fails, alert user but allow saving product with a dummy/fallback avatar or raw URL
      throw new Error('Supabase Storage upload failed. Please verify RLS write permissions on your product-images bucket.');
    } finally {
      setUploading(false);
    }
  };

  // 2. Submit form (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMsg('Please enter a valid positive price.');
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg('Please enter a valid positive stock quantity.');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // Handle file upload if present
      if (imageFile) {
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (uploadErr: any) {
          setErrorMsg(uploadErr.message + " (Falling back to dummy/text URL if input)");
          // Fail gracefully and don't block form if they type a URL, else throw
          if (!imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
            throw uploadErr;
          }
        }
      }

      // Check stock logic to auto-toggle status
      const resolvedStatus = parsedStock === 0 ? 'Out of Stock' : status;

      const payload = {
        name,
        price: parsedPrice / 100, // Store inside DB in standard USD scale
        stock: parsedStock,
        category,
        status: resolvedStatus,
        image_url: finalImageUrl || null,
      };

      if (modalMode === 'add') {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Product added successfully!');
      } else if (modalMode === 'edit' && currentProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('product_id', currentProduct.product_id);
        if (error) throw error;
        setSuccessMsg('Product updated successfully!');
      }

      closeModal();
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product details.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Product (checks constraints)
  const handleDeleteProduct = async (id: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDeleteProductId(null);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', id);

      if (error) {
        // Trap foreign key restriction errors (Postgres code 23503)
        if (error.code === '23503') {
          setErrorMsg('Cannot delete this product because it is linked to existing customer orders. Try changing its status to "Out of Stock" or "Draft" instead.');
        } else {
          throw error;
        }
      } else {
        setSuccessMsg('Product deleted successfully!');
        fetchProducts();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm shadow-lg backdrop-blur-md">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm shadow-lg backdrop-blur-md max-w-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            Products Catalog
          </h1>
          <p className="text-slate-505 text-sm">
            Manage product inventory details, categories, pricing, and stock levels.
          </p>
        </div>

        <Button 
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 shadow-indigo/10"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Product
        </Button>
      </div>

      {/* Filters & Search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Search input */}
        <div className="relative col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <Select
          id="cat-filter"
          options={[
            { label: 'All Categories', value: 'All' },
            ...categories.map(cat => ({ label: cat, value: cat }))
          ]}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mb-0 py-2.5"
        />
      </div>

      {/* Products Table grid */}
      <div className="glass-panel overflow-hidden border border-slate-200 bg-white shadow-sm">
        {loading && products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-605" />
            <span>Fetching catalog items...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
            <ShoppingBag className="h-10 w-10 text-slate-400 mb-2" />
            <span className="font-semibold text-slate-700">No Products Found</span>
            <span className="text-xs text-slate-450">Try adjusting search filters or add a new product.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                {products.map((product) => {
                  let statusStyles = '';
                  if (product.status === 'Active') {
                    statusStyles = 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
                  } else if (product.status === 'Draft') {
                    statusStyles = 'text-slate-400 bg-slate-400/10 border-slate-500/15';
                  } else {
                    statusStyles = 'text-rose-400 bg-rose-400/10 border-rose-500/20';
                  }

                  return (
                    <tr key={product.product_id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <td className="py-4 px-6 shrink-0">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="h-10 w-10 object-cover rounded-lg border border-slate-200 bg-slate-50"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                            <ImageIcon className="h-4.5 w-4.5" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {product.name}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-805">
                        ₹{Math.round(product.price * 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        {product.category}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-medium">
                        {product.stock}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${statusStyles}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openModal('edit', product)}
                          className="p-1.5 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProductId(product.product_id)}
                          className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative border border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-850 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              {modalMode === 'add' ? 'Add New Product' : 'Edit Product Details'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="prod-name"
                label="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ergonomic Gaming Mouse"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="prod-price"
                  label="Price (₹)"
                  type="number"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2999"
                  required
                />

                <Input
                  id="prod-stock"
                  label="Stock Quantity"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="prod-category"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics"
                  required
                />

                <Select
                  id="prod-status"
                  label="Status"
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Draft', value: 'Draft' },
                    { label: 'Out of Stock', value: 'Out of Stock' }
                  ]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                />
              </div>

              {/* Image upload widget */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                  Product Image
                </label>

                {/* Upload selectors */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <label className="cursor-pointer flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-1.5 px-3 rounded text-xs transition-colors shrink-0">
                      <Upload className="h-3.5 w-3.5" />
                      Choose File
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageFileChange}
                      />
                    </label>
                    <span className="text-xs text-slate-500 truncate">
                      {imageFile ? imageFile.name : 'No file selected (Optional)'}
                    </span>
                  </div>

                  <div className="text-center text-xs text-slate-450 font-bold">
                    — OR PASTE IMAGE URL —
                  </div>

                  <Input
                    id="prod-url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageFile(null); // Reset file if they paste URL
                      setImageUrl(e.target.value);
                    }}
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={closeModal}
                  disabled={loading || uploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploading}
                  className="flex items-center gap-2"
                >
                  {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Warning Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this product from the catalog? This operation cannot be undone.
            </p>

            <div className="flex gap-4 justify-center">
              <Button 
                variant="secondary" 
                onClick={() => setDeleteProductId(null)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={() => handleDeleteProduct(deleteProductId)}
                disabled={loading}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

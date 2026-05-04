import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../../services/firebase';
import { Order, Product, Distributor, Testimonial } from '../../types';
import { Users, ShoppingBag, LayoutDashboard, Plus, Trash2, Package, X, LogOut, Upload, Image as ImageIcon, MessageSquare, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { compressImage } from '../../lib/imageUtils';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'distributors' | 'testimonials'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (s) => 
      setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as any as Order))));
    const unsubProducts = onSnapshot(collection(db, 'products'), (s) => 
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as any as Product))));
    const unsubDistributors = onSnapshot(collection(db, 'distributors'), (s) => 
      setDistributors(s.docs.map(d => ({ uid: d.id, ...d.data() } as any as Distributor))));
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (s) => 
      setTestimonials(s.docs.map(d => ({ id: d.id, ...d.data() } as any as Testimonial))));

    setActiveTab('orders');
    setLoading(false);
    return () => { unsubOrders(); unsubProducts(); unsubDistributors(); unsubTestimonials(); };
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg-primary relative">
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-accent transition-all animate-bounce"
      >
        {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 bottom-0 z-[55] w-64 border-r border-border flex flex-col bg-bg-secondary p-6 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-10 px-2">
           <span className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1 block">Management</span>
           <h2 className="text-xl font-serif font-bold text-primary">Wellness HQ</h2>
        </div>
        <div className="space-y-1">
          <TabButton id="orders" active={activeTab} set={setActiveTab} label="Order Registry" icon={<ShoppingBag size={16} />} closeSidebar={() => setIsSidebarOpen(false)} />
          <TabButton id="distributors" active={activeTab} set={setActiveTab} label="Partner Network" icon={<Users size={16} />} closeSidebar={() => setIsSidebarOpen(false)} />
          <TabButton id="products" active={activeTab} set={setActiveTab} label="Inventory" icon={<Package size={16} />} closeSidebar={() => setIsSidebarOpen(false)} />
          <TabButton id="testimonials" active={activeTab} set={setActiveTab} label="Buyer Feedback" icon={<MessageSquare size={16} />} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="mt-auto pt-10 border-t border-border space-y-4">
          <button 
            onClick={async () => {
              const confirmSeed = confirm('Initialize catalog with template products?');
              if (!confirmSeed) return;
              const templateProducts = [
                { name: 'Pure Vitamin C', price: 450, stock: 100, category: 'Vitamins', description: 'Premium immune support', imageUrl: 'https://images.unsplash.com/photo-1550573105-4584e777b062?auto=format&fit=crop&q=80&w=800' },
                { name: 'Green Tea Extract', price: 850, stock: 50, category: 'Supplements', description: 'Metabolism booster', imageUrl: 'https://images.unsplash.com/photo-1544473244-f6895e69ad93?auto=format&fit=crop&q=80&w=800' },
                { name: 'Elite Protein', price: 2200, stock: 30, category: 'Supplements', description: 'Post-workout recovery', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800' },
                { name: 'Energy Blast 500', price: 120, stock: 500, category: 'Energy Drinks', description: 'Clean energy with no crash', imageUrl: 'https://images.unsplash.com/photo-1622543953490-3b7bc5b20c26?auto=format&fit=crop&q=80&w=800' }
              ];
              for (const p of templateProducts) {
                await addDoc(collection(db, 'products'), p);
              }
              alert('Catalog initialized with template products.');
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Seed Catalog
          </button>
          <div className="p-4 bg-white border border-border rounded-2xl">
             <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2 font-bold">System Status</p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Cloud Connected</span>
             </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all rounded-xl mt-2"
          >
            <LogOut size={16} />
            <span className="text-[11px] uppercase tracking-wider font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-12 bg-bg-primary text-slate-800">
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && <OrdersList orders={orders} distributors={distributors} />}
          {activeTab === 'products' && <ProductsManagement products={products} />}
          {activeTab === 'distributors' && <DistributorsManagement distributors={distributors} />}
          {activeTab === 'testimonials' && <TestimonialsManagement testimonials={testimonials} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ id, active, set, label, icon, closeSidebar }: { id: any, active: string, set: any, label: string, icon: any, closeSidebar?: () => void }) {
  return (
    <button 
      onClick={() => {
        set(id);
        if (closeSidebar) closeSidebar();
      }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-all group overflow-hidden relative rounded-xl ${
        active === id ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-slate-500 hover:bg-slate-100 hover:text-primary'
      }`}
    >
      <span className={`${active === id ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
        {icon}
      </span>
      <span className="text-[11px] uppercase tracking-wider font-bold">{label}</span>
    </button>
  );
}

function StatsOverview({ orders, products, distributors }: { orders: Order[], products: Product[], distributors: Distributor[] }) {
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={<ShoppingBag size={20} />} />
        <StatCard title="Orders Placed" value={orders.length} icon={<Package size={20} />} />
        <StatCard title="Awaiting Processing" value={pendingOrders} icon={<LayoutDashboard size={20} />} />
        <StatCard title="Partner Density" value={distributors.length} icon={<Users size={20} />} />
      </div>

      <div className="bg-white border border-border rounded-[3rem] p-10 shadow-sm transition-all">
        <div className="flex items-baseline justify-between mb-8">
           <h3 className="text-2xl font-serif font-bold text-primary">Latest Orders</h3>
           <span className="text-[10px] uppercase tracking-widest font-bold text-accent">Active Feed</span>
        </div>
        <div className="divide-y divide-border">
           {orders.slice(0, 5).map(o => (
             <div key={o.id} className="flex items-center justify-between py-6 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-colors rounded-2xl px-2">
                <div className="flex items-center space-x-6">
                   <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-xs font-bold text-accent uppercase">
                      {o.customerName.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-primary mb-1">{o.customerName}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                        {o.createdAt ? (o.createdAt as any).toDate().toLocaleDateString() : 'Pending...'}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-bold text-primary mb-1">₱{o.totalAmount.toLocaleString()}</p>
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${o.status === 'completed' ? 'bg-accent/10 text-accent' : 'bg-orange-50 text-orange-500'}`}>{o.status}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: any }) {
  return (
    <div className="bg-white border border-border p-10 flex flex-col justify-between h-44 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex justify-between items-start">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function OrdersList({ orders, distributors }: { orders: Order[], distributors: Distributor[] }) {
  const updateDistributor = async (orderId: string, distId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        distributorId: distId,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this order record?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-10">
        <h3 className="text-3xl font-serif font-bold text-primary">Order Registry</h3>
        <span className="text-[11px] uppercase tracking-widest font-bold text-accent px-4 py-2 bg-accent/10 rounded-full">{orders.length} Total Records</span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Order ID</th>
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Customer</th>
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Value</th>
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Status</th>
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Agent</th>
              <th className="pb-6 text-[11px] uppercase tracking-widest font-bold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(o => (
              <tr key={o.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-6 font-mono text-[10px] text-slate-400">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="py-6">
                  <p className="text-sm font-bold text-primary mb-1">{o.customerName}</p>
                  <p className="text-[10px] font-medium text-slate-400">{o.customerEmail}</p>
                </td>
                <td className="py-6 font-bold text-slate-700">₱{o.totalAmount.toLocaleString()}</td>
                <td className="py-6">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    o.status === 'completed' ? 'bg-accent/10 text-accent' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-6">
                  <select 
                    value={o.distributorId || ''} 
                    onChange={(e) => updateDistributor(o.id, e.target.value)}
                    className="bg-slate-50 border border-border text-primary rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-accent transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {distributors.map(d => (
                      <option key={d.uid} value={d.uid}>{d.name}</option>
                    ))}
                  </select>
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteOrder(o.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Order"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ProductsManagement({ products }: { products: Product[] }) {
  const [showAdd, setShowAdd] = useState(false);

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the inventory?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex justify-between items-end border-b border-border pb-10">
         <div>
            <h3 className="text-3xl font-serif font-bold text-primary mb-2">Product Catalog</h3>
            <p className="text-sm text-slate-500 font-medium">Manage your wellness inventory and releases</p>
         </div>
         <button 
           onClick={() => setShowAdd(true)}
           className="px-8 py-4 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all flex items-center gap-3 shadow-lg shadow-primary/10"
         >
            <Plus size={18} />
            <span>Add New Product</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {products.map(p => (
           <div key={p.id} className="bg-white p-6 group relative rounded-[2rem] border border-border hover:shadow-xl transition-all shadow-sm">
              <div className="aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden relative border border-border">
                 <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <button onClick={() => deleteProduct(p.id)} className="w-10 h-10 bg-white shadow-xl text-slate-400 hover:text-red-500 transition-all flex items-center justify-center rounded-xl">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
              <div className="flex justify-between items-baseline mb-4">
                 <h4 className="text-sm font-bold text-primary uppercase tracking-wider">{p.name}</h4>
                 <span className="text-sm font-bold text-accent">₱{p.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</span>
                 <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-primary'}`}>{p.stock} units</span>
              </div>
           </div>
         ))}
      </div>

      <AnimatePresence>
         {showAdd && <ProductModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', price: 0, stock: 0, description: '', imageUrl: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Compress image before setting it to state
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: compressedImage }));
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to process image. Please try a different file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Please upload a product image.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
         ...formData,
         price: Number(formData.price),
         stock: Number(formData.stock),
         createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <motion.form 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
         onSubmit={handleSubmit}
         className="bg-white p-6 sm:p-10 max-w-2xl w-full shadow-2xl space-y-6 sm:space-y-8 rounded-[2rem] sm:rounded-[3rem] max-h-[90vh] overflow-y-auto"
       >
          <div className="flex justify-between items-baseline">
             <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">New Product</h3>
             <button type="button" onClick={onClose} className="text-slate-300 hover:text-primary transition-colors"><X size={24} /></button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Product Media</label>
            <div className="relative group aspect-video bg-slate-50 border-2 border-dashed border-border rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-accent">
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300">
                    {uploading ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <Upload size={20} />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {uploading ? 'Processing Image...' : 'Click to upload product photo'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
             <InputField label="Product Name" value={formData.name} set={(v:any) => setFormData({...formData, name: v})} />
             <InputField label="Price (₱)" type="number" value={formData.price} set={(v:any) => setFormData({...formData, price: v})} />
             <InputField label="Stock Amount" type="number" value={formData.stock} set={(v:any) => setFormData({...formData, stock: v})} />
             <InputField label="Classification" value={formData.category} set={(v:any) => setFormData({...formData, category: v})} />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Detailed Description</label>
            <textarea 
              placeholder="Health benefits, dosage instructions, and active ingredients..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 outline-none min-h-[100px] sm:min-h-[120px] text-sm text-primary focus:border-accent transition-all"
            />
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full py-4 sm:py-5 bg-primary text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest font-bold hover:bg-accent transition-all disabled:opacity-50 shadow-xl shadow-primary/20">
             {loading ? 'Adding Product...' : 'Publish to Catalog'}
          </button>
       </motion.form>
    </div>
  );
}

function InputField({ label, value, set, type = 'text' }: any) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
       <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">{label}</label>
       <input 
         type={type} 
         value={value} 
         onChange={(e) => set(e.target.value)}
         className="w-full bg-slate-50 border border-border rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 outline-none focus:border-accent transition-all text-sm font-medium text-primary"
       />
    </div>
  );
}

function TestimonialsManagement({ testimonials }: { testimonials: Testimonial[] }) {
  const [showAdd, setShowAdd] = useState(false);

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Permanently remove this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex justify-between items-end border-b border-border pb-10">
         <div>
            <h3 className="text-3xl font-serif font-bold text-primary mb-2">Buyer Testimonials</h3>
            <p className="text-sm text-slate-500 font-medium">Capture and display success stories from our community</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="px-8 py-4 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all flex items-center gap-3 shadow-lg shadow-primary/10">
            <Plus size={18} />
            <span>Add Testimony</span>
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {testimonials.map(t => (
           <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider truncate">{t.name}</h4>
                    <p className="text-[9px] font-bold text-accent uppercase tracking-widest truncate">{t.role}</p>
                 </div>
              </div>
              <div className="flex gap-1 mb-3 text-accent">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={10} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "" : "text-slate-200"} />
                 ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-3">"{t.text}"</p>
              
              <button 
                onClick={() => deleteTestimonial(t.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
           </div>
         ))}
      </div>

      <AnimatePresence>
         {showAdd && <TestimonialModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', role: 'Verified Buyer', text: '', imageUrl: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: compressedImage }));
    } catch (error) {
      console.error('Testimonial image compression failed:', error);
      alert('Failed to process image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Photo is required.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
         ...formData,
         createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'testimonials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <motion.form 
         initial={{ scale: 0.9, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }}
         onSubmit={handleSubmit}
         className="bg-white p-6 sm:p-10 max-w-lg w-full shadow-2xl space-y-6 sm:space-y-8 rounded-[2rem] sm:rounded-[3rem] max-h-[90vh] overflow-y-auto"
       >
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Add Testimony</h3>
            <button type="button" onClick={onClose} className="text-slate-300 hover:text-primary transition-colors"><X size={24} /></button>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Customer Portrait</label>
            <div className="relative group aspect-square w-32 mx-auto bg-slate-50 border-2 border-dashed border-border rounded-3xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-accent">
               {formData.imageUrl ? (
                 <img src={formData.imageUrl} className="w-full h-full object-cover" />
               ) : (
                 <label className="cursor-pointer flex flex-col items-center">
                    <Upload size={20} className="text-slate-300 mb-2" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
               )}
               {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Customer Name" value={formData.name} set={(v:any) => setFormData({...formData, name: v})} />
            <InputField label="User Role/Label" value={formData.role} set={(v:any) => setFormData({...formData, role: v})} />
            <div className="space-y-2">
               <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Rating</label>
               <select 
                 value={formData.rating} 
                 onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                 className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-primary outline-none focus:border-accent"
               >
                 {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
               </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Testimony Text</label>
            <textarea 
              required
              placeholder="What makes them come back?"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="w-full bg-slate-50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 outline-none min-h-[100px] text-sm text-primary focus:border-accent transition-all"
            />
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full py-4 sm:py-5 bg-primary text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
             {loading ? 'Adding...' : 'Post Testimony'}
          </button>
       </motion.form>
    </div>
  );
}

function DistributorsManagement({ distributors }: { distributors: Distributor[] }) {
  const [showAdd, setShowAdd] = useState(false);

  const deleteDist = async (id: string) => {
    if (!confirm('Remove this partner from the roster?')) return;
    try {
      await deleteDoc(doc(db, 'distributors', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `distributors/${id}`);
    }
  };

  const toggleDistStatus = async (dist: Distributor) => {
    const newStatus = dist.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'distributors', dist.uid), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `distributors/${dist.uid}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 text-slate-800">
      <div className="flex justify-between items-end border-b border-border pb-10">
         <div>
            <h3 className="text-3xl font-serif font-bold text-primary mb-2">Partner Network</h3>
            <p className="text-sm text-slate-500 font-medium">Manage regional wellness representatives</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="px-8 py-4 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all flex items-center gap-3 shadow-lg shadow-primary/10">
            <Plus size={18} />
            <span>Enlist New Partner</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {distributors.map(d => (
           <div key={d.uid} className="bg-white p-8 group relative rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-lg font-bold text-accent uppercase">
                    {d.name.charAt(0)}
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">{d.name}</h4>
                    <p className="text-[11px] font-medium text-slate-400">{d.email}</p>
                 </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-border">
                 <button 
                   onClick={() => toggleDistStatus(d)}
                   className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${
                     d.status === 'active' 
                       ? 'bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-white' 
                       : 'bg-slate-100 border-border text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                   }`}
                 >
                    {d.status || 'inactive'}
                 </button>
                 <button onClick={() => deleteDist(d.uid)} className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center rounded-xl">
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
         ))}
      </div>

      <AnimatePresence>
         {showAdd && <DistributorModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function DistributorModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ uid: '', name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'distributors', formData.uid), {
         ...formData,
         status: 'active',
         createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'distributors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <motion.form 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
         onSubmit={handleSubmit}
         className="bg-white p-6 sm:p-10 max-w-md w-full shadow-2xl space-y-6 sm:space-y-8 rounded-[2rem] sm:rounded-[3rem]"
       >
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">New Partner</h3>
            <button type="button" onClick={onClose} className="text-slate-300 hover:text-primary transition-colors"><X size={24} /></button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <InputField label="Username (Email)" value={formData.email} set={(v:any) => setFormData({...formData, email: v})} />
            <InputField label="Partner Name" value={formData.name} set={(v:any) => setFormData({...formData, name: v})} />
            <InputField label="Identifier (UID)" value={formData.uid} set={(v:any) => setFormData({...formData, uid: v})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 bg-primary text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest font-bold hover:bg-accent transition-all disabled:opacity-50 shadow-xl shadow-primary/20">
             {loading ? 'Processing...' : 'Register Partner'}
          </button>
       </motion.form>
    </div>
  );
}
